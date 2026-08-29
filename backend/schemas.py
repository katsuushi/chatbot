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
    sessionKey: str 
    currentleaf: str  # from this we will build context
    tempHistory: dict | None = None

class Reprompt(BaseModel):
    sessionKey: str
    iteration: int
    newPrompt: str
    tempHistory : dict | None = None


class RegeneratePrompt(BaseModel):
    sessionKey: str
    iteration: int
    tempHistory : dict | None = None


class InsertData(BaseModel):
    data: dict
