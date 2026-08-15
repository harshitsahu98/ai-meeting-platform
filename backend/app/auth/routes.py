from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from fastapi.security import OAuth2PasswordRequestForm

from app.auth.hashing import (
    hash_password,
    verify_password
)

from app.auth.jwt import create_access_token

from app.auth.dependencies import get_current_user

from app.core.database import get_db

from app.modules.users.model import User

from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    UserUpdate,
    PasswordUpdate
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================
# Register
# =========================================

@router.post(
    "/register",
    response_model=UserResponse
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    hashed_password = hash_password(
        user.password
    )


    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password
    )


    db.add(new_user)
    db.commit()
    db.refresh(new_user)


    return new_user


# =========================================
# Login
# =========================================

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(
            User.email == form_data.username
        )
        .first()
    )


    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    if not verify_password(
        form_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    access_token = create_access_token(
        data={
            "sub": str(user.id)
        }
    )


    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# =========================================
# Get Current User
# =========================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_current_user_profile(
    current_user: User = Depends(
        get_current_user
    )
):

    return current_user


# =========================================
# Update Profile
# =========================================

@router.put(
    "/profile",
    response_model=UserResponse
)
def update_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    existing_user = (
        db.query(User)
        .filter(
            User.email == user_data.email,
            User.id != current_user.id
        )
        .first()
    )


    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    current_user.name = user_data.name
    current_user.email = user_data.email


    db.commit()
    db.refresh(current_user)


    return current_user


# =========================================
# Change Password
# =========================================

@router.put(
    "/password"
)
def update_password(
    password_data: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    if not verify_password(
        password_data.current_password,
        current_user.hashed_password
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )


    if (
        password_data.current_password
        == password_data.new_password
    ):
        raise HTTPException(
            status_code=400,
            detail="New password must be different"
        )


    current_user.hashed_password = hash_password(
        password_data.new_password
    )


    db.commit()


    return {
        "message": "Password updated successfully"
    }