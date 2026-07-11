from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nickname: Mapped[str] = mapped_column(String(60), unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)

class Mallang(Base):
    __tablename__ = 'mallangs'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    category: Mapped[str] = mapped_column(String(60))
    softness: Mapped[int] = mapped_column(Integer)
    sound: Mapped[str] = mapped_column(String(120), default='')
    review: Mapped[str] = mapped_column(Text, default='')
    shop: Mapped[str] = mapped_column(String(120), default='')
    price: Mapped[int] = mapped_column(Integer)
    image_path: Mapped[str | None] = mapped_column(String(300), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Trade(Base):
    __tablename__ = 'trades'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, default=1)
    mallang_name: Mapped[str] = mapped_column(String(120))
    category: Mapped[str] = mapped_column(String(60), default='기타')
    wanted_mallang: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default='')
    location: Mapped[str] = mapped_column(String(200))
    image_path: Mapped[str | None] = mapped_column(String(300), nullable=True)
    writer: Mapped[str] = mapped_column(String(60), default='몽글이')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String(20), default='모집중')
    rooms: Mapped[list['ChatRoom']] = relationship(back_populates='trade', cascade='all, delete-orphan')

class ChatRoom(Base):
    __tablename__ = 'chat_rooms'
    __table_args__ = (UniqueConstraint('trade_id', 'buyer_id', name='uq_chat_room_trade_buyer'),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trade_id: Mapped[int] = mapped_column(ForeignKey('trades.id'))
    seller_id: Mapped[int] = mapped_column(Integer)
    buyer_id: Mapped[int] = mapped_column(Integer, default=2)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    trade: Mapped[Trade] = relationship(back_populates='rooms')
    messages: Mapped[list['ChatMessage']] = relationship(back_populates='room', cascade='all, delete-orphan')

class ChatMessage(Base):
    __tablename__ = 'chat_messages'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    room_id: Mapped[int] = mapped_column(ForeignKey('chat_rooms.id'))
    sender_id: Mapped[int] = mapped_column(Integer)
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    room: Mapped[ChatRoom] = relationship(back_populates='messages')
