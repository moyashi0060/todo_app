from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# SQLiteファイル（backendディレクトリ配下のtodo.db）への接続URL
DATABASE_URL: str = "sqlite:///./todo.db"

# SQLiteのスレッド制約を緩和してFastAPIの並列アクセスに対応
engine: Engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# アプリ全体で使い回すDBセッションファクトリ
SessionLocal: sessionmaker[Session] = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    """SQLAlchemyモデルの基底クラス。"""


# FastAPI Dependency Injection用のDBセッション提供関数
def get_db() -> Generator[Session, None, None]:
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
