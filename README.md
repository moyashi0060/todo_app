# Todo App — Markdoor 面接前タスク

タスクの作成・表示・更新・削除を行うシンプルな管理アプリケーション。

> このREADMEはバックエンドの設計判断を中心に構成している。技術スタックのうち FastAPI・React・Docker は要件として指定されたものであり、選定理由の記載対象外とした。記載しているのは、要件の範囲内で自分が判断した設計上の選択のみである。

---

## 技術スタック

### 要件で指定されたもの

| 技術 | 備考 |
|---|---|
| Python 3.12 + FastAPI | 要件で指定 |
| React + TypeScript + Vite | 要件で指定 |
| Docker + docker-compose | 要件にオプションとして記載。セットアップの再現性確保のため実装 |

### 要件の範囲内で判断したもの

| 技術 | 判断の理由 |
|---|---|
| SQLite + SQLAlchemy ORM | 後述の比較検討を参照 |
| uv | 後述の比較検討を参照 |
| TailwindCSS + Radix UI | 要件は「最小限のフロントエンド」。習熟済みのため実装コストが最小で済み、その分をバックエンド設計に充てられる。削除確認ダイアログは `@radix-ui/react-dialog` を直接使用 |
| TanStack Query | 後述の比較検討を参照 |

---

## 設計判断（なぜそう実装したか）

### 1. レイヤードアーキテクチャ

```
Router      HTTP の関心事のみ（パス・メソッド・ステータスコード）
   ↓
Service     ビジネスルールのみ（「存在しないタスクは 404」など）
   ↓
Repository  データアクセスのみ（SQLAlchemy の操作を集約）
   ↓
Model       テーブル定義のみ
```

**なぜこの構造か。**

Router に SQL を直接書く構成（Fat Router）でも動作するが、変更が発生したときに影響範囲が読めなくなる。たとえば「DB を SQLite から PostgreSQL に切り替える」場合、Fat Router では全エンドポイントを修正する必要がある。Repository を分離すれば Repository の実装だけを変えればよく、Service・Router には手を入れない。

これは要件の「拡張やメンテナンスが容易な設計」に直接対応している。

### 2. PATCH を採用した理由（PUT ではない）

要件には「タイトルの更新」「詳細の更新」「完了状態の変更」が独立した操作として定義されている。

`PUT` は全フィールドの置き換えを意味する。「完了状態だけ変えたい」場合でも現在のタイトルと詳細を一緒に送らなければならず、GET と PUT の間に別の操作でタイトルが変わっていた場合、古い値で上書きされるデータ不整合が起きる。

`PATCH` は部分更新を意味するため、送ったフィールドだけを更新する。要件が「独立した部分更新」を前提にしている以上、`PATCH` が正しい選択である。

### 3. フィルタリングをサーバー側 SQL で処理した理由

全件取得してフロント側 JavaScript でフィルタリングする実装も動作する。しかしこの場合、タスク数が増えるにつれて通信量とフロントの処理コストが線形に増加する（O(n) の転送 + O(n) のフィルタ処理）。

SQL の WHERE 句を使えば `is_completed` カラムへのインデックスにより O(log n) でフィルタされ、転送するのは結果のみになる。

要件の非機能要件「一定数のタスクを扱ってもパフォーマンスが劣化しないこと」はこの判断に対応している。

### 4. Pydantic スキーマを 3 種類に分けた理由

```python
TaskCreate   # 作成時の入力（title 必須、id は含まない）
TaskUpdate   # 更新時の入力（全フィールドが Optional = 部分更新を型で表現）
TaskResponse # レスポンス（id・created_at を含む、外部に返す形）
```

1 つのスキーマを使い回すと「作成時に id を受け取ってしまう」「レスポンスに不要な内部フィールドが含まれる」という問題が起きる。入力と出力の契約を型で分離することで、誤った使い方を型チェック時に検出できる。

---

## 比較検討

### DB: SQLite + SQLAlchemy vs PostgreSQL vs JSON ファイル

**問題の核心**: 要件に対して適切なスコープの技術を選ぶこと。

要件には「マルチユーザーサポートは対象外」と明記されている。PostgreSQL のマルチ接続・並列書き込みの強みは、この要件では発揮されない。

| | SQLite | PostgreSQL | JSON ファイル |
|---|---|---|---|
| セットアップ | ファイル 1 つ、サーバー不要 | サーバー構築・設定が必要 | 不要 |
| 将来の移行（PostgreSQL へ） | SQLAlchemy 経由で `DATABASE_URL` 変更のみ | — | クエリを全て書き直す必要あり |
| フィルタリング | SQL WHERE 句（O(log n) with index） | SQL WHERE 句 | JS で全件走査（O(n)） |
| 適用スコープ | シングルユーザー向け ✅ 要件に合致 | マルチユーザー向け（オーバースペック） | 超小規模のみ |

JSON ファイルはフィルタリングを JavaScript で処理するため、要件の「パフォーマンスが劣化しないこと」に反する。PostgreSQL は今回の要件ではオーバースペックだが、SQLAlchemy ORM を使うことで将来の移行時は `DATABASE_URL` の変更のみで対応できる設計にした。

### パッケージ管理: uv vs pip vs Poetry

**問題の核心**: 環境の再現性。

`pip freeze` はシステムに入っている全パッケージを出力するため開発ツールが混入し、別環境での再現が汚染される。`uv.lock` は宣言した依存のみを決定論的に解決するため、`uv sync` で常に同じ環境が再現される。

速度については Astral 公式ベンチマーク（[github.com/astral-sh/uv](https://github.com/astral-sh/uv#benchmarks)）および本プロジェクトの依存セット（約12パッケージ）での実測値。

| | pip | Poetry | uv |
|---|---|---|---|
| コールドインストール（本プロジェクト） | 約12〜18秒 | 約15〜20秒 | **約0.8〜1.2秒**（約15倍） |
| ロックファイル | なし（freeze は環境汚染あり） | あり | あり |
| `pyproject.toml` 準拠 | 非対応 | 独自拡張あり | PEP 準拠 |

Poetry は uv と機能的に近いが、依存解決が遅く `pyproject.toml` に独自拡張を含むため標準準拠とは言えない。速度は副次的なメリットであり、**再現性が主な採用理由**。

### TanStack Query vs useState + useEffect

**問題の核心**: サーバー状態とUI状態の混在を防ぐこと。

`useState + useEffect` でフェッチを管理する場合、操作後の再フェッチを手動で書く必要があり、追加・更新・削除の全操作で同じロジックが重複する。

```typescript
// useState + useEffect での手動管理
const addTask = async (data) => {
  await api.createTask(data);
  const updated = await api.getTasks(); // 手動で再フェッチ
  setTasks(updated);                    // 手動で状態更新
};
```

TanStack Query では `invalidateQueries` が再フェッチを自動化する。

```typescript
// TanStack Query での宣言的な管理
const { mutate: addTask } = useMutation({
  mutationFn: api.createTask,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
});
```

操作の種類に関わらず `onSuccess` で `invalidateQueries` を呼ぶだけでよく、手動の状態同期コードが不要になる。

---

## 実装済み機能

### バックエンド
- [x] タスクの CRUD（作成・取得・更新・削除）
- [x] タスクのフィルタリング（全件 / 完了済み / 未完了）をサーバー側 SQL で処理
- [x] 完了状態の切り替え（PATCH による部分更新）
- [x] 入力バリデーション（Pydantic：タイトル必須・最大 200 文字）
- [x] 適切な HTTP ステータスコードの返却（404 / 422 / 500）
- [x] Swagger UI による API ドキュメント自動生成（`/docs`）

### フロントエンド
- [x] タスク一覧表示（完了済みに取り消し線・色分け）
- [x] タスクの作成・編集フォーム
- [x] 完了状態の切り替え（チェックボックス）
- [x] 削除確認モーダル（誤操作防止）
- [x] フィルタリング UI（全件 / 完了済み / 未完了）
- [x] 操作時のフィードバック通知（成功・エラー）

### インフラ
- [x] Docker + docker-compose によるワンコマンド起動

## 未実装機能

| 機能 | 理由 |
|---|---|
| ユーザー認証 | 要件に「対象外」と明記 |
| タスクのエクスポート / インポート | 任意機能。フロント実装が主体となりバックエンド設計の評価に寄与しないと判断 |
| ページネーション | 要件に記載なし。ただし `GET /tasks` に `limit` / `offset` クエリパラメータを追加するだけで対応できる設計にしている |

---

## API エンドポイント

| メソッド | パス | 説明 |
|---|---|---|
| `GET` | `/tasks` | タスク一覧取得。`?status=all\|completed\|pending` でフィルタリング |
| `POST` | `/tasks` | タスク作成 |
| `GET` | `/tasks/{id}` | 単一タスク取得 |
| `PATCH` | `/tasks/{id}` | タスク部分更新（タイトル・説明・完了状態） |
| `DELETE` | `/tasks/{id}` | タスク削除 |

### リクエスト / レスポンス例

```bash
# タスク作成
curl -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "買い物", "description": "牛乳・卵・パン"}'

# 完了状態を切り替え
curl -X PATCH http://localhost:8000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"is_completed": true}'

# 未完了タスクのみ取得
curl http://localhost:8000/tasks?status=pending
```

---

## セットアップ

### 方法 1: Docker（推奨）

```bash
git clone https://github.com/moyashi0060/todo_app.git
cd todo_app
docker-compose up --build
```

| サービス | URL |
|---|---|
| フロントエンド | http://localhost:5173 |
| バックエンド API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

### 方法 2: ローカル実行

#### 前提条件

- Python 3.12+
- [uv](https://docs.astral.sh/uv/getting-started/installation/) (`curl -LsSf https://astral.sh/uv/install.sh | sh`)
- Node.js 20+

#### バックエンド

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

#### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

---

## プロジェクト構成

```
todo_app/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI アプリ本体・CORS 設定
│   │   ├── database.py          # SQLAlchemy エンジン・セッション
│   │   ├── models.py            # ORM モデル（Task テーブル定義）
│   │   ├── schemas.py           # Pydantic スキーマ（TaskCreate / TaskUpdate / TaskResponse）
│   │   ├── routers/
│   │   │   └── tasks.py         # エンドポイント定義（HTTP の関心事のみ）
│   │   ├── services/
│   │   │   └── task_service.py  # ビジネスロジック
│   │   └── repositories/
│   │       └── task_repo.py     # DB アクセス層
│   ├── pyproject.toml
│   └── uv.lock
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api/
│   │   │   └── tasks.ts         # fetch の定義（URL と型のみ）
│   │   ├── hooks/
│   │   │   └── useTasks.ts      # useQuery / useMutation を集約
│   │   ├── components/
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskFilter.tsx
│   │   │   └── DeleteDialog.tsx
│   │   └── types/
│   │       └── task.ts
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```