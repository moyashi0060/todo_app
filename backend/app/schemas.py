from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


# タスク作成時の入力スキーマ
class TaskCreate(BaseModel):
    # タスクタイトル（必須、1〜200文字）
    title: str = Field(..., min_length=1, max_length=200)
    # タスク詳細（任意）
    description: str | None = None


# タスク更新時の入力スキーマ
class TaskUpdate(BaseModel):
    # タスクタイトル（任意、指定時は1〜200文字）
    title: str | None = Field(default=None, min_length=1, max_length=200)
    # タスク詳細（任意）
    description: str | None = None
    # 完了状態（任意）
    is_completed: bool | None = None

    # すべて未指定（None）の更新リクエストを拒否する
    @model_validator(mode="after")
    def validate_at_least_one_field(self) -> "TaskUpdate":
        if self.title is None and self.description is None and self.is_completed is None:
            raise ValueError("少なくとも1つのフィールドを指定してください")
        return self


# タスク取得時のレスポンススキーマ
class TaskResponse(BaseModel):
    # ORMオブジェクトからの変換を有効化
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    is_completed: bool
    created_at: datetime
