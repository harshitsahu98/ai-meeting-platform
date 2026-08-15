from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

# Secret key used to sign JWTs.
# In production, this comes from environment variables.
SECRET_KEY = "change-this-to-a-long-random-secret"

# Algorithm used for signing.
ALGORITHM = "HS256"

# Token validity.
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def create_access_token(data: dict):
    """
    Create a signed JWT containing the supplied data.
    """
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


def verify_access_token(token: str):
    """
    Verify a JWT and return its payload.
    Raises an exception if the token is invalid or expired.
    """
    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )

    return payload