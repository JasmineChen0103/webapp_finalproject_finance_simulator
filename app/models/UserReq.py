from pydantic import BaseModel

__all__ = [
    "UserRegisterReq",
    "UserLoginReq",
    "UserModifyPasswordReq",
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

class UserModifyPasswordReq(BaseModel):
    """User modify password request model."""

    user_id: int
    email: str
    old_password: str
    new_password: str