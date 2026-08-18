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
    InsertData,
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
    # "You are a helpful assistant, that's designed to assist the user in its problems."
    "Respond with as little tokens as possible while answering to a question / random thing."
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

        # Creating the session to the db
        chatsession = Session(
            data={"current_leaf": "m-1", "nodes": {}},
            sessionKey=session,
            owner_id=user.id,
            sessionName=prompt.prompt,
        )

        db.add(chatsession)
        rows = chatsession
    else:
        history = rows.data
        nodes = history["nodes"]
        reversednodes = dict(reversed(list(nodes.items())))
        llmhistoryparsed = []
        current_leaf = int(history["current_leaf"][1:])

        # We're starting at the current_leaf and go up, checking if there's anything past that leaf
        # Then we establish the highest descendant and iterate from reverse from that leaf
        i = 1
        temp = None
        temp2 = None

        # This logic doesn't care on what leaf we're currently at, it falls back to the current_leaf
        # Will need fixing but I'm too lazy for that
        while current_leaf + i <= len(nodes) - 1:
            print(f"{current_leaf}, {i}, {len(nodes)}")
            print(nodes[f"m{current_leaf + i}"])
            if nodes[f"m{current_leaf + i}"]["parent_id"] == f"m{current_leaf}":
                print("pass")
                temp = current_leaf + i + 1
                temp2 = current_leaf + i
                while temp <= len(nodes) - 1:
                    if nodes[f"m{temp}"]["parent_id"] == f"m{current_leaf}":
                        temp2 = temp
                    temp += 1
                current_leaf = temp2
                i = 1
            else:
                print("fail")
                i += 1
        # Creating the context
        s_node = int(nodes[f"m{current_leaf}"]["parent_id"][1:])
        for i in range(current_leaf, -1, -1):
            if (
                i == s_node
                or nodes[f"m{i}"]["parent_id"][1:] == None
                and nodes[f"m{i}"]["parent_id"] == "m0"
                or i == current_leaf
            ):
                node = {
                    "role": nodes[f"m{i}"]["role"],
                    "parts": [{"text": nodes[f"m{i}"]["text"]}],
                }
                llmhistoryparsed.append(node)
                if i != 0:
                    s_node = int(nodes[f"m{i}"]["parent_id"][1:])
            else:
                continue

        chat = gemini_client.aio.chats.create(
            model="gemini-3.1-flash-lite",
            config={"system_instruction": sysinstruct},
            history=llmhistoryparsed.reverse(),
        )
        # fix your backend you stupid fuck
        # i fixed it
    history = rows.data
    current_leaf = int(history["current_leaf"][1:])
    print(current_leaf)
    previous_nodes = history["nodes"]

    response = await chat.send_message(prompt.prompt)

    rows.data = {
        # We add all previous nodes
        "current_leaf": f"m{str(current_leaf + 2)}",
        "nodes": {
            node: {
                "parent_id": previous_nodes[node]["parent_id"],
                "role": previous_nodes[node]["role"],
                "text": previous_nodes[node]["text"],
            }
            for node in previous_nodes
        }
        | {
            # Then we add the user and model node from this prompt
            f"m{str(len(previous_nodes))}": {
                "parent_id": (
                    f"m{str(len(previous_nodes)-1)}"
                    if len(previous_nodes) != 0
                    else None
                ),
                "role": "user",
                "text": prompt.prompt,
            },
            f"m{str(len(previous_nodes)+1)}": {
                "parent_id": f"m{str(len(previous_nodes))}",
                "role": "model",
                "text": response.text,
            },
        },
    }

    await db.commit()
    return response.text


@app.post("/api/promptTemporary")
async def promptTemporary(
    schema: TemporaryPrompt,
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
    print("s " + str(schema.iteration))
    if session is None:
        raise HTTPException(
            status_code=404, detail="Couldn't find the requested session"
        )
    else:
        # Get the history via from session.data
        history = session.data
        nodes = history["nodes"]
        current_leaf = (
            int(nodes[f"m{schema.iteration}"]["parent_id"][1:])
            if nodes[f"m{schema.iteration}"]["parent_id"] != None
            else 0
        )
        branch = []
        it = schema.iteration

        i = 1
        temp = None
        temp2 = None

        print("current_leaf: ", current_leaf)

        if nodes[f"m{schema.iteration}"]["parent_id"] != None:

            s_node = current_leaf

            for j in range(current_leaf, -1, -1):
                if j == s_node:
                    node = {
                        "node": f"m{j}",
                        "parent_id": nodes[f"m{j}"]["parent_id"],
                        "role": nodes[f"m{j}"]["role"],
                        "text": nodes[f"m{j}"]["text"],
                    }
                    branch.append(node)
                    if nodes[f"m{j}"]["parent_id"] == None:
                        break
                    if j != 0:
                        s_node = int(nodes[f"m{j}"]["parent_id"][1:])

                else:
                    continue
        print("final it is: " + str(it))
        print("hehe")
        # print(branch)

        cutbranch = branch
        print(cutbranch)
        cutbranch.reverse()
        print(cutbranch)
        # return gemini_client.models.list()
        chat = gemini_client.aio.chats.create(
            model="gemini-3.1-flash-lite",
            config={"system_instruction": sysinstruct},
            history=[
                {"role": msg["role"], "parts": [{"text": msg["text"]}]}
                for msg in cutbranch
            ],
        )

        response = await chat.send_message(schema.newPrompt)

        newNodes = {
            # Then we add the user and model node from this prompt
            f"m{str(len(nodes))}": {
                "parent_id": nodes[f"m{schema.iteration}"]["parent_id"],
                "role": "user",
                "text": schema.newPrompt,
            },
            f"m{str(len(nodes)+1)}": {
                "parent_id": f"m{str(len(nodes))}",
                "role": "model",
                "text": response.text,
            },
        }

        session.data = {
            # We add all previous nodes
            "current_leaf": f"m{str(len(nodes) + 1)}",
            "nodes": {
                node: {
                    "parent_id": nodes[node]["parent_id"],
                    "role": nodes[node]["role"],
                    "text": nodes[node]["text"],
                }
                for node in nodes
            }
            | newNodes,
        }

        await db.commit()

        return newNodes

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
        history = row.data
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


@app.put("/debug/insertDataToASession")
async def insertDataToASession(
    schema: InsertData, session: uuid.UUID, db: AsyncSession = Depends(get_asyncsession)
):
    res = await db.execute(select(Session).where(Session.sessionKey == session))
    row = res.scalar_one_or_none()
    row.data = schema.data

    await db.commit()
    return row.data


@app.get("/debug/testUser")
async def testUser(user: User = Depends(current_active_verified_user)):
    return {"message": "Data", "username": user.email, "id": user.id}
