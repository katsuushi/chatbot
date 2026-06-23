from fastapi_users.authentication import (
    BearerTransport,
    CookieTransport,
    AuthenticationBackend,
    JWTStrategy,
)
import uuid
from fastapi_users import FastAPIUsers, BaseUserManager, UUIDIDMixin
from fastapi import Depends, Request
from db import User, get_user_db

SECRET = "SECRETASFUCK"
bearer_transport = BearerTransport(tokenUrl="/auth/jwt/login")
cookie_transport = CookieTransport(
    cookie_name="cookieauth",
    cookie_max_age=36000000000,
    cookie_secure=True,
    cookie_httponly=True,
)


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Request | None = None):
        print(f"User: {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Request | None = None
    ):
        print(f"User: {user.id} has forgot their password. Reset Token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Request | None = None
    ):
        print(f"User: {user.id} requests verification. Verification Token: {token}")


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=7200)


bearer_backend = AuthenticationBackend(
    name="bearer", transport=bearer_transport, get_strategy=get_jwt_strategy
)
cookie_backend = AuthenticationBackend(
    name="cookie", transport=cookie_transport, get_strategy=get_jwt_strategy
)

fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager, [cookie_backend, bearer_backend]
)

current_active_user = fastapi_users.current_user(active=True)
