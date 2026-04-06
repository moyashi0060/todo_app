from fastapi import APIRouter, Depends, HTTPException, Response, status as http_status
from sqlalchemy.orm import Session

from ..database import get_db
from ..repositories.task_repo import TaskRepository
from ..schemas import TaskCreate, TaskResponse, TaskUpdate
from ..services.task_service import TaskService

# タスク操作用のAPIルーター
router: APIRouter = APIRouter(prefix="/tasks")


# DBセッションからリポジトリとサービスを組み立てる依存関数
def get_task_service(db: Session = Depends(get_db)) -> TaskService:
    repo: TaskRepository = TaskRepository(db)
    return TaskService(repo)


@router.get("", response_model=list[TaskResponse], status_code=http_status.HTTP_200_OK)
def get_tasks(
    status: str = "all",
    service: TaskService = Depends(get_task_service),
) -> list[TaskResponse]:
    # statusクエリの許可値を検証する
    _ALLOWED_STATUSES: frozenset[str] = frozenset({"all", "completed", "pending"})
    if status not in _ALLOWED_STATUSES:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="status は all / completed / pending のいずれかを指定してください",
        )

    return service.get_all(status)


@router.post("", response_model=TaskResponse, status_code=http_status.HTTP_201_CREATED)
def create_task(
    data: TaskCreate,
    service: TaskService = Depends(get_task_service),
) -> TaskResponse:
    # 新規タスクを作成する
    return service.create(data)


@router.get("/{task_id}", response_model=TaskResponse, status_code=http_status.HTTP_200_OK)
def get_task(
    task_id: int,
    service: TaskService = Depends(get_task_service),
) -> TaskResponse:
    # 指定IDのタスクを取得する
    return service.get_by_id(task_id)


@router.patch("/{task_id}", response_model=TaskResponse, status_code=http_status.HTTP_200_OK)
def update_task(
    task_id: int,
    data: TaskUpdate,
    service: TaskService = Depends(get_task_service),
) -> TaskResponse:
    # 指定IDのタスクを部分更新する
    return service.update(task_id, data)


@router.delete("/{task_id}", status_code=http_status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    service: TaskService = Depends(get_task_service),
) -> Response:
    # 指定IDのタスクを削除し、空レスポンスを返す
    service.delete(task_id)
    return Response(status_code=http_status.HTTP_204_NO_CONTENT)
