from typing import Optional

try:
    from ..models.UserReq import UserLoginReq, UserRegisterReq
    from ..models.UserResp import UserLoginResp
    from ..database.UserDB import create, login
except ImportError:  # Allow running without package context
    from models.UserReq import UserLoginReq, UserRegisterReq  # type: ignore
    from models.UserResp import UserLoginResp  # type: ignore
    from database.UserDB import create, login  # type: ignore


def user_register(request: UserRegisterReq) -> bool:
    if request.password != request.confirmPwd:
        return False
    return create(request.email, request.password)


def user_login(request: UserLoginReq) -> Optional[UserLoginResp]:
    user_record = login(request.email)
    if not user_record:
        return None
    if user_record.get("password") != request.password:
        return None
    user_id = user_record.get("user_id")
    email = user_record.get("email")
    if user_id is None or email is None:
        return None
    return UserLoginResp(
        user_id=int(user_id),
        email=str(email),
    )