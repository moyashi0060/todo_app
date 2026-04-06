// バックエンドの TaskResponse に対応する型定義
export type Task = {
  id: number
  title: string
  description: string | null
  is_completed: boolean
  created_at: string
}

export type TaskCreate = {
  title: string
  description?: string | null
}

export type TaskUpdate = {
  title?: string | null
  description?: string | null
  is_completed?: boolean | null
}

export type TaskStatus = 'all' | 'completed' | 'pending'