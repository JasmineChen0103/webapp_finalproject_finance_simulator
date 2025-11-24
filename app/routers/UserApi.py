from fastapi import APIRouter, HTTPException, status

try:
    from ..models.UserReq import UserLoginReq, UserRegisterReq, UserModifyPasswordReq
    from ..models.UserResp import UserLoginResp
    from ..services.UserService import (
        user_login as login_user_service,
        user_register as register_user_service,
        user_modify_password as modify_user_password_service,
    )
except ImportError:  # Allow running without package context
    from models.UserReq import UserLoginReq, UserRegisterReq, UserModifyPasswordReq  # type: ignore
    from models.UserResp import UserLoginResp  # type: ignore
    from services.UserService import (  # type: ignore
        user_login as login_user_service,
        user_register as register_user_service,
        user_modify_password as modify_user_password_service,
    )


router = APIRouter(tags=["user"], prefix="/user")


@router.post("/register")
def register_user(request: UserRegisterReq):
    success = register_user_service(request)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed.",
        )
    return {"message": "Registration successful."}


@router.post("/login", response_model=UserLoginResp)
def login_user(request: UserLoginReq) -> UserLoginResp:
    user = login_user_service(request)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
        )
    return user

@router.post("/modify-password")
def modify_user_password(request: UserModifyPasswordReq):
    success = modify_user_password_service(request)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password modification failed.",
        )
    return {"message": "Password modified successfully."}