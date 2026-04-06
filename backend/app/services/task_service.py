from fastapi import HTTPException

from ..models import Task
from ..repositories.task_repo import TaskRepository
from ..schemas import TaskCreate, TaskUpdate


# タスクに関するビジネスロジックを担当するサービス
class TaskService:
    def __init__(self, repo: TaskRepository) -> None:
        # リポジトリインスタンスを保持する
        self.repo: TaskRepository = repo

    def get_all(self, status: str) -> list[Task]:
        # 条件に応じたタスク一覧を取得する
        return self.repo.get_all(status)

    def get_by_id(self, task_id: int) -> Task:
        # タスクを取得し、存在しなければ404を返す
        task: Task | None = self.repo.get_by_id(task_id)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        return task

    def create(self, data: TaskCreate) -> Task:
        # 入力データから新規タスクを作成する
        return self.repo.create(title=data.title, description=data.description)

    def update(self, task_id: int, data: TaskUpdate) -> Task:
        # 対象タスクを取得し、送信されたフィールドのみ更新する
        task: Task = self.get_by_id(task_id)
        fields: dict[str, object] = {
            key: getattr(data, key)
            for key in data.model_fields_set
        }
        return self.repo.update(task, **fields)

    def delete(self, task_id: int) -> None:
        # 対象タスクを取得して削除する
        task: Task = self.get_by_id(task_id)
        self.repo.delete(task)
