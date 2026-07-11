# 말랑 교환소 (Mallang Exchange)

말랑이(스퀴시) 정보를 기록하고 사용자끼리 교환 글과 채팅을 주고받을 수 있는 웹 애플리케이션입니다.

## 주요 기능

- 닉네임·비밀번호 기반 회원가입 및 로그인
- 말랑이 목록 조회·상세 조회·등록(이미지 포함)
- 교환 글 작성, 조회, 수정 및 삭제
- 교환 신청에 따른 채팅방 생성
- 채팅방 목록과 메시지 조회·전송
- 내 교환 글 조회

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 프론트엔드 | React, Vite, CSS |
| 백엔드 | Python, FastAPI, Uvicorn |
| ORM | SQLAlchemy |
| 데이터베이스 | SQLite |

## 프로젝트 구조

```text
.
├── src/                    # React 프론트엔드
│   ├── api/                # 백엔드 API 호출 모듈
│   ├── components/         # 화면 컴포넌트
│   └── pages/              # 페이지 컴포넌트
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI 엔드포인트 및 앱 설정
│   │   ├── models.py       # SQLAlchemy 모델
│   │   └── database.py     # SQLite 연결 설정
│   ├── requirements.txt    # Python 의존성
│   ├── mallang.db          # 로컬 SQLite DB (Git 제외)
│   └── uploads/            # 업로드 이미지 (Git 제외)
├── package.json
└── README.md
```

## 실행 방법

### 1. 프론트엔드 실행

```bash
npm install
npm run dev
```

기본적으로 Vite 개발 서버는 `http://localhost:5173`에서 실행됩니다.

### 2. 백엔드 실행

별도 터미널에서 다음을 실행합니다.

```bash
cd backend
python -m venv .venv
```

Windows PowerShell에서는 가상환경을 활성화한 뒤 의존성을 설치합니다.

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API 서버는 기본적으로 `http://localhost:8000`에서 실행됩니다. API 문서는 `http://localhost:8000/docs`에서 확인할 수 있습니다.

## 환경 변수

프론트엔드는 기본값으로 `http://localhost:8000`을 API 서버로 사용합니다. 다른 서버를 사용하려면 프로젝트 루트에 `.env` 파일을 만들고 다음처럼 설정합니다.

```env
VITE_API_URL=http://localhost:8000
```

## 데이터베이스

이 프로젝트는 서버 파일 기반의 **SQLite**를 사용합니다. SQLAlchemy가 `backend/mallang.db` 파일에 연결하며, 백엔드 시작 시 모델을 기준으로 테이블을 생성합니다.

주요 테이블은 다음과 같습니다.

- `users`: 사용자 닉네임과 비밀번호 해시
- `mallangs`: 말랑이 상품 정보
- `trades`: 교환 게시글
- `chat_rooms`: 교환 글·구매자 단위의 채팅방
- `chat_messages`: 채팅 메시지

`mallang.db`와 `backend/uploads/`에는 로컬 데이터 및 이미지가 들어가므로 Git에서 제외됩니다. 운영 환경에서는 PostgreSQL 같은 외부 DB와 오브젝트 스토리지로 교체하는 것을 권장합니다.

## API 개요

| 영역 | 주요 엔드포인트 |
| --- | --- |
| 사용자 | `POST /user/register`, `POST /user/login` |
| 말랑이 | `GET /mallang`, `GET /mallang/{id}`, `POST /mallang` |
| 교환 | `GET/POST /trade`, `GET/PUT/DELETE /trade/{id}`, `POST /trade/{id}/request` |
| 채팅 | `GET /chat/rooms/{user_id}`, `GET/POST /chat/{room_id}` |

## 참고 사항

- 현재 로그인 상태는 브라우저 `localStorage`에 저장됩니다.
- 이미지 업로드는 FastAPI의 `/uploads` 경로로 정적 제공됩니다.
- 비밀번호는 PBKDF2-HMAC-SHA256 방식으로 해시하여 저장합니다.
