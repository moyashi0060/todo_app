// frontend/src/components/TaskList.tsx
import { Pencil, Trash2 } from "lucide-react";
import type { Task } from "../types/task";

type Props = {
  tasks: Task[];
  onToggle: (id: number, is_completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
};

export const TaskList = ({ tasks, onToggle, onEdit, onDelete }: Props) => {
  if (tasks.length === 0) {
    return <p className="text-center text-gray-500">タスクがありません</p>;
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <input
            type="checkbox"
            checked={task.is_completed}
            onChange={() => onToggle(task.id, !task.is_completed)}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="ml-4 flex-grow">
            <p
              className={`font-medium ${
                task.is_completed ? "line-through text-gray-500" : "text-gray-900"
              }`}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-sm text-gray-600">{task.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-gray-500 hover:text-blue-600"
              aria-label="編集"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-gray-500 hover:text-red-600"
              aria-label="削除"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};
