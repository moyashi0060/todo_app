import { useState } from "react";
import { Toaster, toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "./hooks/useTasks";
import { TaskFilter } from "./components/TaskFilter";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { DeleteDialog } from "./components/DeleteDialog";
import type { Task, TaskStatus, TaskUpdate } from "./types/task";

function App() {
  // フィルタリング条件の状態
  const [status, setStatus] = useState<TaskStatus>('all');
  // 編集中のタスクの状態
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  // 削除確認中のタスクIDの状態
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  // カスタムフックを使用してタスク関連の操作を取得
  const { data: tasks, isLoading, error } = useTasks(status);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  // タスク追加処理
  const handleCreateTask = (title: string, description: string | null) => {
    createTask.mutate(
      { title, description },
      {
        onSuccess: () => {
          toast.success("タスクを追加しました");
        },
        onError: () => {
          toast.error("追加に失敗しました");
        },
      }
    );
  };

  // タスクの完了状態切り替え処理
  const handleToggleTask = (id: number, is_completed: boolean) => {
    updateTask.mutate(
      { id, payload: { is_completed } },
      {
        onError: () => {
          toast.error("更新に失敗しました");
        },
      }
    );
  };

  // タスク編集処理
  const handleUpdateTask = (title: string, description: string | null) => {
    if (!editingTask) return;
    const payload: TaskUpdate = { title, description };
    updateTask.mutate(
      { id: editingTask.id, payload },
      {
        onSuccess: () => {
          setEditingTask(null);
          toast.success("タスクを更新しました");
        },
        onError: () => {
          toast.error("更新に失敗しました");
        },
      }
    );
  };

  // タスク削除処理
  const handleDeleteTask = () => {
    if (deletingTaskId === null) return;
    deleteTask.mutate(deletingTaskId, {
      onSuccess: () => {
        setDeletingTaskId(null);
        toast.success("タスクを削除しました");
      },
      onError: () => {
        toast.error("削除に失敗しました");
      },
    });
  };

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 font-sans">
        <header className="text-center my-8">
          <h1 className="text-4xl font-bold">Todo App</h1>
        </header>
        <main className="space-y-6">
          {/* タスク追加フォーム */}
          <TaskForm onSubmit={handleCreateTask} />

          {/* タスクフィルター */}
          <TaskFilter status={status} onChange={setStatus} />

          {/* タスク一覧 */}
          {isLoading && <p className="text-center">読み込み中...</p>}
          {error && <p className="text-center text-red-500">エラーが発生しました: {error.message}</p>}
          {!isLoading && !error && (
            <TaskList
              tasks={tasks || []}
              onToggle={handleToggleTask}
              onEdit={(task) => setEditingTask(task)}
              onDelete={(id) => setDeletingTaskId(id)}
            />
          )}
        </main>
      </div>

      {/* 削除確認ダイアログ */}
      <DeleteDialog
        open={deletingTaskId !== null}
        onCancel={() => setDeletingTaskId(null)}
        onConfirm={handleDeleteTask}
      />

      {/* 編集ダイアログ */}
      <Dialog.Root open={editingTask !== null} onOpenChange={(isOpen) => !isOpen && setEditingTask(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-md shadow-lg w-full max-w-md">
            <Dialog.Title className="text-lg font-bold mb-4">タスクを編集</Dialog.Title>
            {editingTask && (
              <TaskForm
                onSubmit={handleUpdateTask}
                onCancel={() => setEditingTask(null)}
                initialTitle={editingTask.title}
                initialDescription={editingTask.description}
                submitLabel="更新"
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Toasterコンポーネント */}
      <Toaster richColors />
    </>
  );
}

export default App;
