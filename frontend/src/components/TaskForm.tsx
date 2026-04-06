// frontend/src/components/TaskForm.tsx
import { useState, useEffect } from "react";

type Props = {
  onSubmit: (title: string, description: string | null) => void;
  onCancel?: () => void;
  initialTitle?: string;
  initialDescription?: string | null;
  submitLabel?: string;
};

export const TaskForm = ({
  onSubmit,
  onCancel,
  initialTitle = "",
  initialDescription = null,
  submitLabel = "追加",
}: Props) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  // 初期値が変更された場合にフォームの状態を更新
  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
  }, [initialTitle, initialDescription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title, description);
    // 編集モードでない場合はフォームをリセット
    if (!onCancel) {
  setTitle("");
  setDescription(null);
  }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          タイトル
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="タスクのタイトル"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          詳細
        </label>
        <textarea
          id="description"
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value || null)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="タスクの詳細（任意）"
        />
      </div>
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};
