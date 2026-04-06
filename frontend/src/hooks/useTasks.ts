import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { createTask, deleteTask, fetchTasks, updateTask } from "../api/tasks";
import type { TaskStatus, TaskUpdate } from "../types/task";

// タスク一覧を取得するカスタムフック
export const useTasks = (status: TaskStatus) => {
    return useQuery({
        queryKey: ["tasks", status],
        queryFn: () => fetchTasks(status),
    });
};

// タスクを作成するカスタムフック
export const useCreateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            // キャッシュを無効化して一覧を再取得する
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
};

// タスクを更新するカスタムフック
export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: TaskUpdate }) =>
            updateTask(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
};

// タスクを削除するカスタムフック
export const useDeleteTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
};
