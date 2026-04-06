from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from .database import Base


# タスクテーブルのORMモデル
class Task(Base):
    __tablename__: str = "tasks"

    # 主キー（自動採番）
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # タスクタイトル（必須、最大200文字）
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    # タスク詳細（任意）
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    # 完了状態（必須、既定値は未完了、検索効率化のためインデックス付与）
    is_completed: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, index=True
    )
    # 作成日時（UTC現在時刻を既定値として設定）
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
