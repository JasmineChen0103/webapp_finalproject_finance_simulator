from typing import Optional

try:
    from ..models.UserReq import UserLoginReq, UserRegisterReq, UserModifyDataReq
    from ..models.UserResp import UserLoginResp
    from ..database.UserDB import create, login, modify_data
except ImportError:  # Allow running without package context
    from models.UserReq import UserLoginReq, UserRegisterReq, UserModifyDataReq  # type: ignore
    from models.UserResp import UserLoginResp  # type: ignore
    from database.UserDB import create, login, modify_data  # type: ignore


def user_register(request: UserRegisterReq) -> bool:
    if request.password != request.confirmPwd:
        return False
    return create(request.email, request.username, request.password)


def user_login(request: UserLoginReq) -> Optional[UserLoginResp]:
    user_record = login(request.email)
    if not user_record:
        return None
    if user_record.get("password") != request.password:
        return None
    user_id = user_record.get("user_id")
    email = user_record.get("email")
    username = user_record.get("username")
    if user_id is None or email is None or username is None:
        return None
    return UserLoginResp(
        user_id=int(user_id),
        email=str(email),
        username=str(username),
    )

def user_modify_data(request: UserModifyDataReq) -> bool:
    user_record = login(request.email)
    if not user_record:
        return False
    if user_record.get("password") != request.old_password:
        return False
    return modify_data(request.user_id, request.username, request.new_password)