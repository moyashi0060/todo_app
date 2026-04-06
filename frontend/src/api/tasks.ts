import axios from 'axios'
import type { Task, TaskCreate, TaskUpdate, TaskStatus } from '../types/task'

const client = axios.create({
  baseURL: 'http://localhost:8000',
})

// タスク一覧取得
export const fetchTasks = async (status: TaskStatus): Promise<Task[]> => {
  const { data } = await client.get<Task[]>('/tasks', { params: { status } })
  return data
}

// タスク作成
export const createTask = async (payload: TaskCreate): Promise<Task> => {
  const { data } = await client.post<Task>('/tasks', payload)
  return data
}

// タスク更新
export const updateTask = async (id: number, payload: TaskUpdate): Promise<Task> => {
  const { data } = await client.patch<Task>(`/tasks/${id}`, payload)
  return data
}

// タスク削除
export const deleteTask = async (id: number): Promise<void> => {
  await client.delete(`/tasks/${id}`)
}