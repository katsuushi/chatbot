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
from schemas import UserCreate, UserRead, UserUpdate, Prompt
from users import cookie_backend, bearer_backend, current_active_user, fastapi_users
import uuid

load_dotenv()
gemini_key = os.getenv("GEMINI_API_KEY")


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


@app.get("/api/ping")
def pong():
    return {"ping": "pong!"}


@app.post("/api/promptFlashLite")
async def promptFlashLite(
    prompt: Prompt,
    db: AsyncSession = Depends(get_asyncsession),
    user: User = Depends(current_active_user),
):
    res = await db.execute(select(Session).where(Session.sessionKey == prompt.session))
    rows = res.scalar_one_or_none()
    if rows == None:
        chat = gemini_client.aio.chats.create(
            model="gemini-2.5-flash-lite",
            config={
                "system_instruction": "Output your message without any new-lines (\n) or text formatting (*text* / **text**)"
            },
        )

        chatsession = Session(
            data={prompt.session: {"history": []}},
            sessionKey=prompt.session,
            owner_id=user.id,
        )

        db.add(chatsession)
        rows = chatsession
    else:
        history = json.loads(rows.data[prompt.session]["history"])

        chat = gemini_client.aio.chats.create(
            model="gemini-2.5-flash-lite",
            config={
                "system_instruction": "Output your message without any new-lines (\n) or text formatting (*text* / **text**)"
            },
            history=[
                {"role": msg["role"], "parts": [{"text": msg["text"]}]}
                for msg in history
            ],
        )

    response = await chat.send_message(prompt.prompt)

    rows.data = {
        **rows.data,
        prompt.session: {
            "history": json.dumps(
                [
                    {"role": msg.role, "text": msg.parts[0].text}
                    for msg in chat.get_history()
                ]
            )
        },
    }

    await db.commit()
    return response.text


@app.get("/api/loadSession")
async def loadSession(
    session: str = "default",
    db: AsyncSession = Depends(get_asyncsession),
    user: User = Depends(current_active_user),
):
    result = await db.execute(select(Session).where(Session.sessionKey == session))

    row = result.scalar_one_or_none()
    print(row)
    if row == None:
        raise HTTPException(status_code=404, detail="Problem Fetching the Session")
    elif row.owner_id != user.id:
        raise HTTPException(
            status_code=403, detail="You are not the owner of the session."
        )
    else:
        history = json.loads(row.data[session]["history"])
        return history


@app.delete("/api/deleteSession")
async def delizeeteSession(
    session: str = "default",
    db: AsyncSession = Depends(get_asyncsession),
    user: User = Depends(current_active_user),
):
    result = await db.execute(select(Session).where(Session.data[session].isnot(None)))
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


@app.get("/api/testUser")
async def testUser(user: User = Depends(current_active_user)):
    return {"message": "Data", "username": user.email, "id": user.id}
