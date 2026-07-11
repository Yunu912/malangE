from datetime import datetime
import hashlib
import hmac
import os
from pathlib import Path
from uuid import uuid4
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, select, text
from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from .models import ChatMessage, ChatRoom, Mallang, Trade, User
from .schemas import ChatRoomListOut, ChatRoomOut, MallangOut, MessageCreate, MessageOut, RegisterResponse, TradeOut, UserCredentials, UserOut

UPLOAD_DIR = Path(__file__).resolve().parent.parent / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)
Base.metadata.create_all(bind=engine)

def add_mallang_shop_column():
    columns = {column['name'] for column in inspect(engine).get_columns('mallangs')}
    if 'shop' not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE mallangs ADD COLUMN shop VARCHAR(120) NOT NULL DEFAULT ''"))

add_mallang_shop_column()

def migrate_legacy_chat_rooms():
    """게시글당 하나였던 기존 채팅방 제약을 (게시글, 요청자)별 제약으로 변경한다."""
    inspector = inspect(engine)
    if 'chat_rooms' not in inspector.get_table_names(): return
    legacy = any(item.get('name') == 'uq_chat_room_trade' for item in inspector.get_unique_constraints('chat_rooms'))
    if not legacy: return
    with engine.begin() as connection:
        connection.execute(text('PRAGMA foreign_keys=OFF'))
        connection.execute(text('ALTER TABLE chat_messages RENAME TO chat_messages_legacy'))
        connection.execute(text('ALTER TABLE chat_rooms RENAME TO chat_rooms_legacy'))
        connection.execute(text('CREATE TABLE chat_rooms (id INTEGER NOT NULL PRIMARY KEY, trade_id INTEGER NOT NULL, seller_id INTEGER NOT NULL, buyer_id INTEGER NOT NULL, created_at DATETIME NOT NULL, CONSTRAINT uq_chat_room_trade_buyer UNIQUE (trade_id, buyer_id), FOREIGN KEY(trade_id) REFERENCES trades (id))'))
        connection.execute(text('CREATE TABLE chat_messages (id INTEGER NOT NULL PRIMARY KEY, room_id INTEGER NOT NULL, sender_id INTEGER NOT NULL, message TEXT NOT NULL, created_at DATETIME NOT NULL, FOREIGN KEY(room_id) REFERENCES chat_rooms (id))'))
        connection.execute(text('INSERT INTO chat_rooms (id, trade_id, seller_id, buyer_id, created_at) SELECT id, trade_id, seller_id, buyer_id, created_at FROM chat_rooms_legacy'))
        connection.execute(text('INSERT INTO chat_messages (id, room_id, sender_id, message, created_at) SELECT id, room_id, sender_id, message, created_at FROM chat_messages_legacy'))
        connection.execute(text('DROP TABLE chat_messages_legacy'))
        connection.execute(text('DROP TABLE chat_rooms_legacy'))
        connection.execute(text('PRAGMA foreign_keys=ON'))

migrate_legacy_chat_rooms()
app = FastAPI(title='Mallang Exchange API')
app.add_middleware(CORSMiddleware, allow_origins=['http://localhost:5173', 'http://localhost:5174'], allow_methods=['*'], allow_headers=['*'])
app.mount('/uploads', StaticFiles(directory=UPLOAD_DIR), name='uploads')

def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 210_000)
    return f'{salt.hex()}${digest.hex()}'

def verify_password(password: str, stored: str) -> bool:
    try:
        salt_hex, digest_hex = stored.split('$', 1)
        candidate = hash_password(password, bytes.fromhex(salt_hex)).split('$', 1)[1]
        return hmac.compare_digest(candidate, digest_hex)
    except (ValueError, AttributeError):
        return False

@app.post('/user/register', response_model=RegisterResponse, status_code=201)
def register_user(payload: UserCredentials, db: Session = Depends(get_db)):
    nickname = payload.nickname.strip()
    if not nickname:
        raise HTTPException(422, '닉네임을 입력해 주세요.')
    if db.scalar(select(User).where(User.nickname == nickname)):
        raise HTTPException(409, '이미 존재하는 닉네임입니다.')
    db.add(User(nickname=nickname, password=hash_password(payload.password)))
    db.commit()
    return {'message': '회원가입 완료'}

@app.post('/user/login', response_model=UserOut)
def login_user(payload: UserCredentials, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.nickname == payload.nickname.strip()))
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(401, '닉네임 또는 비밀번호가 올바르지 않습니다.')
    return user

@app.get('/mallang', response_model=list[MallangOut])
def list_mallangs(db: Session = Depends(get_db)):
    return db.scalars(select(Mallang).order_by(Mallang.created_at.desc())).all()

@app.get('/mallang/{mallang_id}', response_model=MallangOut)
def get_mallang(mallang_id: int, db: Session = Depends(get_db)):
    mallang = db.get(Mallang, mallang_id)
    if not mallang: raise HTTPException(404, '말랑이 정보를 찾을 수 없습니다.')
    return mallang

@app.post('/mallang', response_model=MallangOut)
async def create_mallang(name: str = Form(...), category: str = Form(...), softness: int = Form(...), sound: str = Form(''), review: str = Form(''), shop: str = Form(''), price: int = Form(...), image: UploadFile | None = File(None), db: Session = Depends(get_db)):
    if category not in ('말랑이', '크런치', '왁뿌볼', '기타'): raise HTTPException(422, '올바른 말랑이 종류가 아닙니다.')
    if not 1 <= softness <= 5: raise HTTPException(422, '말랑도는 1~5 사이여야 합니다.')
    image_path = None
    if image and image.filename:
        suffix = Path(image.filename).suffix.lower() or '.jpg'; filename = f'{uuid4().hex}{suffix}'
        (UPLOAD_DIR / filename).write_bytes(await image.read()); image_path = f'/uploads/{filename}'
    mallang = Mallang(name=name, category=category, softness=softness, sound=sound, review=review, shop=shop, price=price, image_path=image_path)
    db.add(mallang); db.commit(); db.refresh(mallang)
    return mallang

@app.post('/trade', response_model=TradeOut)
async def create_trade(mallang_name: str = Form(...), category: str = Form(...), wanted_mallang: str = Form(...), description: str = Form(''), location: str = Form(...), writer: str = Form('몽글이'), user_id: int = Form(1), image: UploadFile | None = File(None), db: Session = Depends(get_db)):
    image_path = None
    if image and image.filename:
        suffix = Path(image.filename).suffix.lower() or '.jpg'
        filename = f'{uuid4().hex}{suffix}'
        (UPLOAD_DIR / filename).write_bytes(await image.read())
        image_path = f'/uploads/{filename}'
    trade = Trade(user_id=user_id, mallang_name=mallang_name, category=category, wanted_mallang=wanted_mallang, description=description, location=location, writer=writer, image_path=image_path, status='모집중')
    db.add(trade); db.commit(); db.refresh(trade)
    return trade

@app.get('/trade', response_model=list[TradeOut])
def list_trades(db: Session = Depends(get_db)):
    return db.scalars(select(Trade).order_by(Trade.created_at.desc())).all()

@app.get('/trade/{trade_id}', response_model=TradeOut)
def get_trade(trade_id: int, db: Session = Depends(get_db)):
    trade = db.get(Trade, trade_id)
    if not trade: raise HTTPException(404, '교환 글을 찾을 수 없습니다.')
    return trade

@app.get('/user/{user_id}/trades', response_model=list[TradeOut])
def get_user_trades(user_id: int, db: Session = Depends(get_db)):
    return db.scalars(select(Trade).where(Trade.user_id == user_id).order_by(Trade.created_at.desc())).all()

@app.put('/trade/{trade_id}', response_model=TradeOut)
async def update_trade(trade_id: int, user_id: int = Form(...), mallang_name: str = Form(...), category: str = Form(...), wanted_mallang: str = Form(...), description: str = Form(''), location: str = Form(...), status: str = Form('모집중'), image: UploadFile | None = File(None), db: Session = Depends(get_db)):
    trade = db.get(Trade, trade_id)
    if not trade: raise HTTPException(404, '교환 글을 찾을 수 없습니다.')
    if trade.user_id != user_id: raise HTTPException(403, '작성자만 수정할 수 있습니다.')
    if status not in ('모집중', '거래중', '거래완료'): raise HTTPException(422, '올바른 거래 상태가 아닙니다.')
    for key, value in {'mallang_name': mallang_name, 'category': category, 'wanted_mallang': wanted_mallang, 'description': description, 'location': location, 'status': status}.items(): setattr(trade, key, value)
    if image and image.filename:
        suffix = Path(image.filename).suffix.lower() or '.jpg'; filename = f'{uuid4().hex}{suffix}'
        (UPLOAD_DIR / filename).write_bytes(await image.read()); trade.image_path = f'/uploads/{filename}'
    db.commit(); db.refresh(trade)
    return trade

@app.delete('/trade/{trade_id}', status_code=204)
def delete_trade(trade_id: int, user_id: int, db: Session = Depends(get_db)):
    trade = db.get(Trade, trade_id)
    if not trade: raise HTTPException(404, '교환 글을 찾을 수 없습니다.')
    if trade.user_id != user_id: raise HTTPException(403, '작성자만 삭제할 수 있습니다.')
    if trade.image_path:
        path = UPLOAD_DIR / Path(trade.image_path).name
        if path.exists(): path.unlink()
    db.delete(trade); db.commit()

@app.post('/trade/{trade_id}/request', response_model=ChatRoomOut)
def request_trade(trade_id: int, buyer_id: int = 2, db: Session = Depends(get_db)):
    trade = db.get(Trade, trade_id)
    if not trade: raise HTTPException(404, '교환 글을 찾을 수 없습니다.')
    room = db.scalar(select(ChatRoom).where(ChatRoom.trade_id == trade_id, ChatRoom.buyer_id == buyer_id))
    if not room:
        room = ChatRoom(trade_id=trade.id, seller_id=trade.user_id, buyer_id=buyer_id)
        db.add(room); trade.status = '거래중'; db.commit(); db.refresh(room)
    return room

@app.get('/chat/rooms/{user_id}', response_model=list[ChatRoomListOut])
def get_chat_rooms(user_id: int, db: Session = Depends(get_db)):
    rooms = db.scalars(select(ChatRoom).where((ChatRoom.seller_id == user_id) | (ChatRoom.buyer_id == user_id)).order_by(ChatRoom.created_at.desc())).all()
    result = []
    for room in rooms:
        trade = db.get(Trade, room.trade_id)
        other_id = room.buyer_id if room.seller_id == user_id else room.seller_id
        other_user = db.get(User, other_id)
        last_message = db.scalar(select(ChatMessage.message).where(ChatMessage.room_id == room.id).order_by(ChatMessage.created_at.desc()).limit(1))
        result.append({'id': room.id, 'trade_id': room.trade_id, 'seller_id': room.seller_id, 'buyer_id': room.buyer_id, 'created_at': room.created_at, 'trade_name': trade.mallang_name if trade else '삭제된 게시글', 'other_user': other_user.nickname if other_user else '교환 상대', 'last_message': last_message})
    return result

@app.get('/chat/{room_id}', response_model=list[MessageOut])
def get_messages(room_id: int, db: Session = Depends(get_db)):
    if not db.get(ChatRoom, room_id): raise HTTPException(404, '채팅방을 찾을 수 없습니다.')
    return db.scalars(select(ChatMessage).where(ChatMessage.room_id == room_id).order_by(ChatMessage.created_at.asc())).all()

@app.post('/chat/{room_id}', response_model=MessageOut)
def send_message(room_id: int, payload: MessageCreate, db: Session = Depends(get_db)):
    if not db.get(ChatRoom, room_id): raise HTTPException(404, '채팅방을 찾을 수 없습니다.')
    message = ChatMessage(room_id=room_id, sender_id=payload.sender_id, message=payload.message.strip(), created_at=datetime.utcnow())
    if not message.message: raise HTTPException(400, '메시지를 입력해 주세요.')
    db.add(message); db.commit(); db.refresh(message)
    return message
