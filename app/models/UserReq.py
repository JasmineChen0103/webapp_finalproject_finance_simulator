from pydantic import BaseModel

__all__ = [
    "UserRegisterReq",
    "UserLoginReq",
]

class UserRegisterReq(BaseModel):
    """User registration request model."""

    email: str
    password: str
    confirmPwd: str

class UserLoginReq(BaseModel):
    """User login request model."""

    email: str
    password: str