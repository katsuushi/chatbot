import uuid
from fastapi_users import schemas
from pydantic import BaseModel

class UserRead(schemas.BaseUser[uuid.UUID]):
    pass

class UserCreate(schemas.BaseUserCreate):
    pass

class UserUpdate(schemas.BaseUserUpdate):
    pass

class Prompt(BaseModel):
    prompt: str
    session: str