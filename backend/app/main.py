from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models  # モデルをimportしてメタデータにテーブル定義を登録する
from .database import Base, engine
from .routers.tasks import router


# アプリ起動時にテーブルを自動作成するlifespanハンドラ
@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    Base.metadata.create_all(bind=engine)
    yield


# FastAPIアプリケーションを初期化する
app: FastAPI = FastAPI(
    title="Todo App API",
    version="0.1.0",
    lifespan=lifespan,
)

# フロントエンド連携のためCORSを設定する
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# タスク関連のルーターを登録する
app.include_router(router)
