from typing import Any

from sqlalchemy import asc, select
from sqlalchemy.orm import Session

from ..models import Task

# 更新可能なフィールドを定義
_ALLOWED_FIELDS: frozenset[str] = frozenset(
    {"title", "description", "is_completed"}
)


# Taskテーブルに対するデータアクセスを担当するリポジトリ
class TaskRepository:
    def __init__(self, db: Session) -> None:
        # SQLAlchemyセッションを保持する
        self.db: Session = db

    def get_all(self, status: str) -> list[Task]:
        # ステータス条件に応じて取得クエリを組み立てる（作成日時順でソート）
        stmt = select(Task).order_by(asc(Task.created_at))
        if status == "completed":
            stmt = stmt.where(Task.is_completed.is_(True))
        elif status == "pending":
            stmt = stmt.where(Task.is_completed.is_(False))

        return list(self.db.scalars(stmt).all())

    def get_by_id(self, task_id: int) -> Task | None:
        # 主キーでタスクを1件取得する
        return self.db.get(Task, task_id)

    def create(self, title: str, description: str | None) -> Task:
        # 新規タスクを作成して永続化する
        task: Task = Task(title=title, description=description)
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update(self, task: Task, **fields: Any) -> Task:
        # 渡されたフィールドのみを動的に更新する
        for key, value in fields.items():
            if key not in _ALLOWED_FIELDS:
                raise ValueError(f"不正なフィールドです: {key}")
            setattr(task, key, value)

        self.db.commit()
        self.db.refresh(task)
        return task

    def delete(self, task: Task) -> None:
        # 対象タスクを削除して確定する
        self.db.delete(task)
        self.db.commit()
