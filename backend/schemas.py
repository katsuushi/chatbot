import uuid

from fastapi_users import schemas
from pydantic import BaseModel


class UserRead(schemas.BaseUser[uuid.UUID]):
    username: str


class UserCreate(schemas.BaseUserCreate):
    username: str


class UserUpdate(schemas.BaseUserUpdate):
    username: str


class Prompt(BaseModel):
    prompt: str


class TemporaryPrompt(BaseModel):
    prompt: str
    history: list

class Reprompt(BaseModel):
    sessionKey: uuid.UUID
    iteration: int
    newPrompt: str

class RepromptTemporary(BaseModel):
    iteration: int
    newPrompt: str
    history: list
