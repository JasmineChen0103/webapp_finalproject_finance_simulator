from pydantic import BaseModel

class UserLoginResp(BaseModel):
    """User login response model."""

    user_id: int
    email: str
    username: str