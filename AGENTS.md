# Qike 管理平台

## 项目简介

Qike 是一个多端管理平台，支持 PC 端和微信小程序。

## 技术栈

### Server（后端）

- **语言**: Python
- **框架**: FastAPI

### Console（PC 管理后台）

- **框架**: React + TypeScript
- **构建工具**: Vite
- **UI 组件库**: shadcn/ui (Tailwind CSS + Radix UI)
- **后台布局**: 必须基于 shadcn/ui 的 `sidebar-07` 样式实现，初始化命令为 `npx shadcn@latest add sidebar-07`
- **状态管理**: Zustand

### Mobile（微信小程序）

- **框架**: Taro (React 语法)
- **语言**: TypeScript

## 目录结构

```
qike/
├── server/            # Python 后端服务
├── console/           # PC 管理后台 (React)
├── mobile/            # 移动端 - 微信小程序 (Taro)
├── packages/          # 前端公共包（pnpm workspace）
│   ├── shared/        # 工具函数、类型定义、常量
│   ├── api-client/    # API 请求封装（请求/响应拦截、统一错误处理）
│   ├── hooks/         # 公共 React Hooks
│   └── ui/            # 跨端公共组件
├── docs/              # 技术文档（架构、API、开发指南）
│   └── frontend/      # 前端开发规范
├── spec/              # 功能规格文档（产品需求）
├── AGENTS.md          # 项目约定（主体）
└── CLAUDE.md          # -> AGENTS.md 软链
```

## 代码规范

### Python（Server）

- 遵循 PEP 8
- 格式化: ruff format
- Lint: ruff check
- 命名: 函数/变量 snake_case，类 PascalCase
- 类型注解: 所有公开函数必须有类型注解

### TypeScript（Console / Mobile）

- 格式化: Prettier
- Lint: ESLint
- 命名: 变量/函数 camelCase，组件 PascalCase，常量 UPPER_SNAKE_CASE
- 优先使用函数组件 + Hooks
- Console 的 PC 管理后台主布局必须沿用 shadcn/ui `sidebar-07` 的结构和交互，不另起一套自定义侧边栏风格
- Console 前端详细规范见 `docs/frontend/shadcn-ui-frontend-guidelines.md`

## Console 前端开发约定

### 目录和职责

- Console 前端代码位于 `console/`。
- `src/pages/` 放路由页面，`src/layouts/` 放页面布局，`src/routes/` 放路由配置。
- `src/components/ui/` 只放 shadcn/ui 组件或非常薄的项目化调整。
- 可复用业务组件放在 `src/components/`，不要把复杂业务逻辑堆在页面文件中。
- API 访问统一放在 `src/api/`，请求基础封装放在 `src/lib/`，页面不直接拼接请求细节。
- Zustand store 放在 `src/stores/`，仅用于跨组件共享状态、页面筛选状态和轻量业务状态。

### UI 和布局

- 管理后台页面应保持清晰、紧凑、可扫描，优先服务高频操作和信息密度。
- 页面必须放在统一后台布局内，主布局沿用 shadcn/ui `sidebar-07`。
- 顶部区域保留后台常用能力，如面包屑、用户菜单、快捷操作。
- 主内容区优先按标题区、筛选区、数据区、操作区组织。
- 避免营销页式大标题、过大留白、装饰性视觉和层层嵌套卡片。
- 基础按钮、输入框、下拉菜单、面包屑、侧边栏、弹层等优先使用 shadcn/ui / Radix UI。
- 图标优先使用 `lucide-react`，不要为常见操作手写 SVG。

### 样式

- 样式使用 Tailwind CSS，不新增其他 CSS-in-JS 或 UI 样式方案。
- 颜色、间距、圆角、阴影优先使用 Tailwind token 和 shadcn/ui 变量。
- 避免内联 style；仅在动态计算且 Tailwind 难以表达时使用。
- 控件尺寸应稳定，避免 hover、loading、空状态导致布局跳动。
- 页面在桌面和窄屏下都不能出现文字溢出、控件重叠或内容遮挡。

### 路由、列表和表单

- 路由路径使用小写和短横线，例如 `/customer-groups`。
- 新增页面时必须同步更新路由配置和 Sidebar 菜单。
- 列表页应考虑搜索、筛选、表格、状态标识、行内操作、加载状态和空状态。
- 筛选条件应可读、可恢复，必要时同步到 URL。
- 表单必须有清晰 label，并处理必填、错误、禁用和提交中状态。
- 图标按钮必须有可访问名称；不要只用颜色表达状态。

### 本地开发和验证

- Console 本地开发服务固定使用 `8765` 端口，Vite 配置应设置 `strictPort: true`。
- 开发启动命令:
  ```bash
  cd console
  npm run dev
  ```
- 提交前建议验证:
  ```bash
  cd console
  npm run lint
  npm run build
  ```

## Git 规范

### 分支策略

- `main` — 稳定分支，只接受 PR 合并
- `dev` — 开发分支，日常开发基于此分支
- 功能分支: `feat/<模块>-<描述>`，如 `feat/user-auth`
- 修复分支: `fix/<描述>`，如 `fix/login-redirect`

### Commit Message

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <description>

[body]
```

type 取值：
- `feat` — 新功能
- `fix` — 修复 Bug
- `docs` — 文档变更
- `style` — 代码格式（不影响逻辑）
- `refactor` — 重构
- `test` — 测试
- `chore` — 构建/工具变更

scope 取值: `server`、`console`、`mobile`、`spec`、`docs`

示例: `feat(server): add user authentication API`

## 文档规范

### Spec 文档（spec/）

- `spec/overview.md` — 全局文档：项目背景、目标、功能模块概览
- 每个功能一个独立文件，如 `spec/user-auth.md`
- 功能较多时按模块分目录，如 `spec/user/auth.md`
- 每个 spec 文件应包含：背景、用户场景、功能描述、数据模型、接口定义

### 技术文档（docs/）

- `docs/architecture.md` — 整体架构设计
- `docs/api.md` — 接口文档
- `docs/development.md` — 开发环境搭建指南
- 文档使用中文编写，代码和术语保留英文

## 开发约定

### API 设计

- RESTful 风格
- 路径命名: 小写 + 短横线，如 `/api/v1/user-roles`
- 统一响应格式:
  ```json
  { "code": 0, "message": "success", "data": {} }
  ```
- 使用 HTTP 状态码表达语义，业务错误码通过 code 字段区分

### 通用规则

- 不提交 `.env`、密钥等敏感文件
- 不提交 `node_modules/`、`__pycache__/`、`dist/` 等构建产物
- 每个子项目独立管理依赖（各自的 requirements.txt / package.json）
