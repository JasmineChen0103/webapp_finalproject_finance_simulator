from fastapi import APIRouter, HTTPException, status

try:
    from ..models.UserReq import UserLoginReq, UserRegisterReq
    from ..models.UserResp import UserLoginResp
    from ..services.UserService import user_login as login_user_service
    from ..services.UserService import user_register as register_user_service
except ImportError:  # Allow running without package context
    from models.UserReq import UserLoginReq, UserRegisterReq  # type: ignore
    from models.UserResp import UserLoginResp  # type: ignore
    from services.UserService import (  # type: ignore
        user_login as login_user_service,
        user_register as register_user_service,
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