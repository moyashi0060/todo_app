// frontend/src/components/TaskFilter.tsx
import type { TaskStatus } from "../types/task";

type Props = {
  status: TaskStatus;
  onChange: (status: TaskStatus) => void;
};

// フィルタリング条件の定義
const filterOptions: { label: string; value: TaskStatus }[] = [
  { label: "すべて", value: "all" },
  { label: "未完了", value: "pending" },
  { label: "完了済み", value: "completed" },
];

export const TaskFilter = ({ status, onChange }: Props) => {
  return (
    <div className="flex space-x-2">
      {filterOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${
              status === option.value
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
