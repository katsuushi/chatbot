from collections.abc import AsyncGenerator
import uuid

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Table, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
from datetime import datetime
from fastapi import Depends
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase


DATABASE_URL="sqlite+aiosqlite:///./local.db"

class Base(DeclarativeBase):
    pass

class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "user"
    username = Column(String(32), unique=True, index=True)
    sessions = relationship("Session", back_populates="owner")

class Session(Base):
    __tablename__ = "session"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    data = Column(MutableDict.as_mutable(JSON))
    owner = relationship("User", back_populates="sessions")
    owner_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False) 
    sessionKey = Column(String(25))

dbengine = create_async_engine(DATABASE_URL)
asyncsessionmaker = async_sessionmaker(dbengine, expire_on_commit=False)
async def create_db_and_tables():
    async with dbengine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_asyncsession() -> AsyncGenerator[AsyncSession, None]:
    async with asyncsessionmaker() as session:
        yield session

async def get_user_db(db: AsyncSession = Depends(get_asyncsession)):
    yield SQLAlchemyUserDatabase(db, User)
