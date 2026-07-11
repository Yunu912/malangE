from datetime import datetime
from pydantic import BaseModel, Field

class UserCredentials(BaseModel):
    nickname: str = Field(min_length=1, max_length=60)
    password: str = Field(min_length=1, max_length=128)

class RegisterResponse(BaseModel):
    message: str

class UserOut(BaseModel):
    id: int
    nickname: str
    class Config: from_attributes = True

class MallangOut(BaseModel):
    id: int; name: str; category: str; softness: int; sound: str; review: str; shop: str; price: int; image_path: str | None; created_at: datetime
    class Config: from_attributes = True

class TradeOut(BaseModel):
    id: int; user_id: int; mallang_name: str; category: str; wanted_mallang: str; description: str; location: str; image_path: str | None; writer: str; created_at: datetime; status: str
    class Config: from_attributes = True

class ChatRoomOut(BaseModel):
    id: int; trade_id: int; seller_id: int; buyer_id: int; created_at: datetime
    class Config: from_attributes = True

class ChatRoomListOut(ChatRoomOut):
    trade_name: str
    other_user: str
    last_message: str | None = None

class MessageCreate(BaseModel):
    sender_id: int = 2
    message: str

class MessageOut(BaseModel):
    id: int; room_id: int; sender_id: int; message: str; created_at: datetime
    class Config: from_attributes = True
