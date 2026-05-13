from dotenv import load_dotenv
from pathlib import Path

# -----------------------------------------------------------------------------
# LOAD ENV
# -----------------------------------------------------------------------------

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# -----------------------------------------------------------------------------
# IMPORTS
# -----------------------------------------------------------------------------

import os
import uuid
import bcrypt
import jwt
import logging

from datetime import datetime, timedelta, timezone
from typing import Optional, Literal

from fastapi import (
    FastAPI,
    APIRouter,
    HTTPException,
    Depends
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from fastapi.middleware.cors import CORSMiddleware

from motor.motor_asyncio import AsyncIOMotorClient

from pydantic import BaseModel, EmailStr

from emergentintegrations.llm.chat import (
    LlmChat,
    UserMessage
)

# -----------------------------------------------------------------------------
# LOGGING
# -----------------------------------------------------------------------------

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger("rigs")

# -----------------------------------------------------------------------------
# DATABASE
# -----------------------------------------------------------------------------

MONGO_URL = os.getenv("MONGO_URL")

DB_NAME = os.getenv("DB_NAME", "rigs_ai")

client = AsyncIOMotorClient(MONGO_URL)

db = client[DB_NAME]

# -----------------------------------------------------------------------------
# ENV
# -----------------------------------------------------------------------------

EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY", "")

JWT_SECRET = os.getenv("JWT_SECRET", "secret")

JWT_ALG = "HS256"

JWT_EXPIRE_HOURS = 24 * 7

# -----------------------------------------------------------------------------
# APP
# -----------------------------------------------------------------------------

app = FastAPI(title="RIGS.AI")

api_router = APIRouter(prefix="/api")

security = HTTPBearer(auto_error=False)

# -----------------------------------------------------------------------------
# MODELS
# -----------------------------------------------------------------------------

class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class ChatIn(BaseModel):
    message: str
    session_id: Optional[str] = None
    model: Literal["claude", "gpt", "gemini"] = "claude"


class ChatMessageOut(BaseModel):
    id: str
    role: str
    content: str
    model: Optional[str] = None
    created_at: str


class ChatResponse(BaseModel):
    session_id: str
    reply: ChatMessageOut

# -----------------------------------------------------------------------------
# PASSWORD FUNCTIONS
# -----------------------------------------------------------------------------

def hash_password(password: str) -> str:

    hashed = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    return hashed.decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:

    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            hashed.encode("utf-8")
        )

    except Exception:
        return False

# -----------------------------------------------------------------------------
# JWT FUNCTIONS
# -----------------------------------------------------------------------------

def create_token(user_id: str, email: str):

    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc)
        + timedelta(hours=JWT_EXPIRE_HOURS)
    }

    token = jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALG
    )

    return token


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    try:

        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALG]
        )

    except jwt.ExpiredSignatureError:

        raise HTTPException(
            status_code=401,
            detail="Token expired"
        )

    except jwt.InvalidTokenError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = await db.users.find_one(
        {"id": payload["sub"]},
        {"_id": 0, "password_hash": 0}
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user

# -----------------------------------------------------------------------------
# AI MODELS
# -----------------------------------------------------------------------------

MODEL_MAP = {

    "claude": (
        "anthropic",
        "claude-sonnet-4-5-20250929"
    ),

    "gpt": (
        "openai",
        "gpt-5.2"
    ),

    "gemini": (
        "gemini",
        "gemini-3-flash-preview"
    )
}

SYSTEM_PROMPT = """
You are RIGS.AI.

You are an expert PC buying advisor.

Help users choose the best PC build.
"""

# -----------------------------------------------------------------------------
# AI CHAT FUNCTION
# -----------------------------------------------------------------------------

async def llm_send(
    model_key: str,
    session_id: str,
    system: str,
    text: str
):

    provider, model_name = MODEL_MAP.get(
        model_key,
        MODEL_MAP["claude"]
    )

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system
    ).with_model(
        provider,
        model_name
    )

    response = await chat.send_message(
        UserMessage(text=text)
    )

    if isinstance(response, str):
        return response

    return str(response)

# -----------------------------------------------------------------------------
# REGISTER
# -----------------------------------------------------------------------------

@api_router.post(
    "/auth/register",
    response_model=AuthResponse
)
async def register(payload: RegisterIn):

    email = payload.email.lower().strip()

    existing_user = await db.users.find_one(
        {"email": email}
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    user_id = str(uuid.uuid4())

    user_doc = {

        "id": user_id,

        "email": email,

        "name": payload.name,

        "password_hash": hash_password(
            payload.password
        ),

        "created_at":
            datetime.now(
                timezone.utc
            ).isoformat()
    }

    await db.users.insert_one(user_doc)

    token = create_token(
        user_id,
        email
    )

    return AuthResponse(

        token=token,

        user=UserOut(
            id=user_id,
            email=email,
            name=payload.name
        )
    )

# -----------------------------------------------------------------------------
# LOGIN
# -----------------------------------------------------------------------------

@api_router.post(
    "/auth/login",
    response_model=AuthResponse
)
async def login(payload: LoginIn):

    email = payload.email.lower().strip()

    user = await db.users.find_one(
        {"email": email}
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email"
        )

    valid = verify_password(
        payload.password,
        user["password_hash"]
    )

    if not valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_token(
        user["id"],
        email
    )

    return AuthResponse(

        token=token,

        user=UserOut(
            id=user["id"],
            email=user["email"],
            name=user["name"]
        )
    )

# -----------------------------------------------------------------------------
# CHAT
# -----------------------------------------------------------------------------

@api_router.post(
    "/chat",
    response_model=ChatResponse
)
async def chat(payload: ChatIn):

    session_id = (
        payload.session_id
        or str(uuid.uuid4())
    )

    history = await db.chat_messages.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort(
        "created_at",
        1
    ).to_list(100)

    user_message = {

        "id": str(uuid.uuid4()),

        "session_id": session_id,

        "role": "user",

        "content": payload.message,

        "model": payload.model,

        "created_at":
            datetime.now(
                timezone.utc
            ).isoformat()
    }

    await db.chat_messages.insert_one(
        user_message
    )

    context_text = payload.message

    if history:

        convo = "\n\n".join([

            f"{msg['role'].upper()}: "
            f"{msg['content']}"

            for msg in history
        ])

        context_text = (
            f"Previous conversation:\n"
            f"{convo}\n\n"
            f"USER: {payload.message}"
        )

    try:

        reply_text = await llm_send(
            payload.model,
            session_id,
            SYSTEM_PROMPT,
            context_text
        )

    except Exception as e:

        logger.exception(e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    assistant_message = {

        "id": str(uuid.uuid4()),

        "session_id": session_id,

        "role": "assistant",

        "content": reply_text,

        "model": payload.model,

        "created_at":
            datetime.now(
                timezone.utc
            ).isoformat()
    }

    await db.chat_messages.insert_one(
        assistant_message
    )

    return ChatResponse(

        session_id=session_id,

        reply=ChatMessageOut(
            id=assistant_message["id"],
            role="assistant",
            content=reply_text,
            model=payload.model,
            created_at=assistant_message["created_at"]
        )
    )

# -----------------------------------------------------------------------------
# CURRENT USER
# -----------------------------------------------------------------------------

@api_router.get(
    "/auth/me",
    response_model=UserOut
)
async def me(
    user=Depends(get_current_user)
):

    return UserOut(
        id=user["id"],
        email=user["email"],
        name=user["name"]
    )

# -----------------------------------------------------------------------------
# ROOT
# -----------------------------------------------------------------------------

@api_router.get("/")
async def root():

    return {
        "status": "ok",
        "service": "RIGS.AI"
    }

# -----------------------------------------------------------------------------
# STARTUP
# -----------------------------------------------------------------------------

@app.on_event("startup")
async def startup():

    await db.users.create_index(
        "email",
        unique=True
    )

    logger.info("RIGS.AI Started")

# -----------------------------------------------------------------------------
# SHUTDOWN
# -----------------------------------------------------------------------------

@app.on_event("shutdown")
async def shutdown():

    client.close()

# -----------------------------------------------------------------------------
# ROUTER
# -----------------------------------------------------------------------------

app.include_router(api_router)

# -----------------------------------------------------------------------------
# CORS
# -----------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,

    allow_credentials=True,

    allow_origins=["*"],

    allow_methods=["*"],

    allow_headers=["*"],
)