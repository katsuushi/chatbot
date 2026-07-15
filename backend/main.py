import json
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi_users import FastAPIUsers
from google import genai
from sqlalchemy import select

from db import AsyncSession, Session, User, create_db_and_tables, get_asyncsession
from schemas import (
    UserCreate,
    UserRead,
    UserUpdate,
    Prompt,
    TemporaryPrompt,
    Reprompt,
    RepromptTemporary,
)
from users import (
    cookie_backend,
    bearer_backend,
    current_active_verified_user,
    fastapi_users,
    current_active_verified_user,
)
import uuid

load_dotenv()
gemini_key = os.getenv("GEMINI_API_KEY")

sysinstruct = (
    "You are a helpful assistant, that's designed to assist the user in its problems."
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)
gemini_client = genai.Client(api_key=gemini_key)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    fastapi_users.get_auth_router(cookie_backend), prefix="/auth/cookie", tags=["auth"]
)

app.include_router(
    fastapi_users.get_auth_router(bearer_backend), prefix="/auth/jwt", tags=["auth"]
)

app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)


@app.get("/api/ping")
def pong():
    return {"ping": "pong!"}


@app.post("/api/promptFlashLite")
async def promptFlashLite(
    prompt: Prompt,
    session: uuid.UUID,
    db: AsyncSession = Depends(get_asyncsession),
    user: User = Depends(current_active_verified_user),
):
    print(session)
    res = await db.execute(select(Session).where(Session.sessionKey == session))
    rows = res.scalar_one_or_none()
    if rows is None:

        chat = gemini_client.aio.chats.create(
            model="gemini-3.1-flash-lite",
            config={"system_instruction": sysinstruct},
        )

        chatsession = Session(
            data={"history": []},
            sessionKey=session,
            owner_id=user.id,
            sessionName=prompt.prompt,
        )

        db.add(chatsession)
        rows = chatsession
    else:
        history = json.loads(rows.data["history"])
        chat = gemini_client.aio.chats.create(
            model="gemini-3.1-flash-lite",
            config={"system_instruction": sysinstruct},
            history=[
                {"role": msg["role"], "parts": [{"text": msg["text"]}]}
                for msg in history
            ],
        )

    response = await chat.send_message(prompt.prompt)

    rows.data = {
        **rows.data,
        "history": json.dumps(
            [
                {"role": msg.role, "text": msg.parts[0].text}
                for msg in chat.get_history()
            ]
        ),
    }

    await db.commit()
    return response.text


@app.post("/api/promptTemporary")
async def promptTemporary(
    schema: TemporaryPrompt,
    db: AsyncSession = Depends(get_asyncsession),
    user: User = Depends(current_active_verified_user),
):
    # Because LLm handles the history dict a bit different than our frontend we convert it
    history = []
    for i in schema.history:
        history.append({"role": "user", "text": i["prompt"]})
        history.append({"role": "model", "text": i["response"]})

    chat = gemini_client.aio.chats.create(
        model="gemini-3.1-flash-lite",
        config={"system_instruction": sysinstruct},
        history=[
            {"role": msg["role"], "parts": [{"text": msg["text"]}]} for msg in history
        ],
    )

    response = await chat.send_message(schema.prompt)

    # convert the history into a frontend friendly format so we don't write more code in the frontend
    formatted = []
    for i in range(0, len(history), 2):
        formatted.append(
            {"prompt": history[i]["text"], "response": history[i + 1]["text"]}
        )

    formatted.append({"prompt": schema.prompt, "response": response.text})

    return response.text


@app.post("/api/reprompt")
async def reprompt(
    schema: Reprompt,
    user: User = Depends(current_active_verified_user),
    db: AsyncSession = Depends(get_asyncsession),
):
    # Get the session
    result = await db.execute(
        select(Session).where(Session.sessionKey == schema.sessionKey)
    )
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(
            status_code=404, detail="Couldn't find the requested session"
        )
    else:
        # Get the history via from session.data
        history = json.loads(session.data["history"])
        iteration = schema.iteration * 2
        newBranch = history[
            :iteration
        ]  # newBranch is history till the requested message (it * 2 because history alternates {user}, {model})

        # Send the request with the history being newBranch
        chat = gemini_client.aio.chats.create(
            model="gemini-2.5-flash",
            config={"system_instruction": sysinstruct},
            history=[
                {"role": msg["role"], "parts": [{"text": msg["text"]}]}
                for msg in newBranch
            ],
        )

        response = await chat.send_message(schema.newPrompt)

        # Because chat.get_history() already returns the new branch we don't have to change anything
        session.data = {
            **session.data,
            "history": json.dumps(
                [
                    {"role": msg.role, "text": msg.parts[0].text}
                    for msg in chat.get_history()
                ]
            ),
        }

        newBranchData = json.loads(session.data["history"])
        newBranch = []
        for i in range(0, len(newBranchData), 2):
            newBranch.append(
                {
                    "prompt": newBranchData[i]["text"],
                    "response": newBranchData[i + 1]["text"],
                }
            )

        await db.commit()

        return newBranch

        # This WILL need some readjustments when we are going to implement multiple conversation branch support


@app.post("/api/repromptTemporary")
async def repromptTemporary(
    schema: RepromptTemporary,
    user: User = Depends(current_active_verified_user),
):
    history = schema.history
    iteration = (
        schema.iteration
    )  # Due to how frontend handles the sessions' conversation array we don't need to multiply by 2
    newBranch = history[:iteration]

    print(history)

    # Because LLm handles the history dict a bit different than our frontend we convert it
    history = []
    for i in newBranch:
        history.append({"role": "user", "text": i["prompt"]})
        history.append({"role": "model", "text": i["response"]})

    chat = gemini_client.aio.chats.create(
        model="gemini-3.1-flash-lite",
        config={"system_instruction": sysinstruct},
        history=[
            {"role": msg["role"], "parts": [{"text": msg["text"]}]} for msg in history
        ],
    )

    response = await chat.send_message(schema.newPrompt)

    # we can now convert it into a frontend friendly format so we don't write more code in the frontend
    newBranch = []
    for i in range(0, len(history), 2):
        newBranch.append(
            {"prompt": history[i]["text"], "response": history[i + 1]["text"]}
        )

    newBranch.append({"prompt": schema.newPrompt, "response": response.text})

    return newBranch


@app.get("/api/loadSession")
async def loadSession(
    session: uuid.UUID,
    db: AsyncSession = Depends(get_asyncsession),
    user: User = Depends(current_active_verified_user),
):

    result = await db.execute(select(Session).where(Session.sessionKey == session))

    row = result.scalar_one_or_none()
    if row == None:
        raise HTTPException(status_code=404, detail="Problem Fetching the Session")
    elif row.owner_id != user.id:
        raise HTTPException(
            status_code=403, detail="You are not the owner of the session."
        )
    else:
        history = json.loads(row.data["history"])
        return history


@app.delete("/api/deleteSession")
async def deleteSession(
    session: str = "default",
    db: AsyncSession = Depends(get_asyncsession),
    user: User = Depends(current_active_verified_user),
):
    result = await db.execute(
        select(Session).where(Session.sessionKey == uuid.UUID(session))
    )
    row = result.scalar_one_or_none()

    if row == None:
        raise HTTPException(
            status_code=404, detail="Couldn't find the selected session."
        )
    elif row.owner_id != user.id:
        raise HTTPException(
            status_code=403, detail="You are not the owner of the session."
        )
    else:
        await db.delete(row)
        await db.commit()
        return "200"


@app.delete("/api/deleteAllUserSessions")
async def deleteAllUserSessions(
    db: AsyncSession = Depends(get_asyncsession),
    user: User = Depends(current_active_verified_user),
):
    call = await db.execute(select(Session).where(Session.owner_id == user.id))
    rows = call.scalars().all()
    for i in rows:
        await db.delete(i)
    await db.commit()
    return rows


@app.get("/api/getUserSessions")
async def getUserSessions(
    db: AsyncSession = Depends(get_asyncsession),
    user: User = Depends(current_active_verified_user),
):
    call = await db.execute(select(Session).where(Session.owner_id == user.id))
    rows = call.scalars().all()
    sessions = []
    # return rows
    for i in rows:

        sessions.append({"sKey": i.sessionKey, "sName": i.sessionName})
    return sessions


@app.get("/api/searchSessions")
async def searchSessions(
    query: str,
    db: AsyncSession = Depends(get_asyncsession),
    user: User = Depends(current_active_verified_user),
):
    call = await db.execute(
        select(Session).where(
            Session.owner_id == user.id, Session.sessionName.ilike(f"%{query}%")
        )
    )
    rows = call.scalars().all()
    data = []
    for i in rows:
        data.append({"sKey": i.sessionKey, "sName": i.sessionName})
    return data


@app.get("/api/testUser")
async def testUser(user: User = Depends(current_active_verified_user)):
    return {"message": "Data", "username": user.email, "id": user.id}
