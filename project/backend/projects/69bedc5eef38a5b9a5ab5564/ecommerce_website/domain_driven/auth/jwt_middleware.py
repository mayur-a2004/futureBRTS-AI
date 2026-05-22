from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer
from jose import jwt

security = HTTPBearer()

async def validate_token(token: str = Depends(security)):
    try:
        payload = jwt.decode(
            token.credentials, 
            "NEON_CYBER_SECRET_KEY", 
            algorithms=["HS256"]
        )
        return payload
    except Exception as e:
        raise HTTPException(status_code=403, detail="Invalid credentials")


def role_check(required_role: str):
    def decorator(payload: dict = Depends(validate_token)):
        if payload.get("role") != required_role:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return payload
    return decorator