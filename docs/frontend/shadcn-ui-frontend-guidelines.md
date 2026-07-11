# 前端开发规范

## 适用范围

本文档适用于 Qike 项目的前端开发，重点覆盖 PC 管理后台 `console/`。

当前 Console 技术栈：

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Radix UI
- Zustand
- React Router

## 基本原则

- 优先沿用项目已有目录结构、组件风格和命名方式。
- 页面实现应服务于后台管理场景，保持信息密度、可扫描性和操作效率。
- 不为单个页面引入孤立的设计体系、状态管理方式或样式方案。
- 公共能力沉淀为组件、Hook、工具函数或 API 模块，避免在页面中重复实现。
- UI 组件优先使用 shadcn/ui 和 Radix UI，不重复造基础组件。

## 目录规范

Console 前端代码位于 `qike/console/`。

推荐目录职责：

```text
console/src/
├── api/              # API 请求模块
├── assets/           # 静态资源
├── components/       # 业务组件和通用组件
│   └── ui/           # shadcn/ui 生成组件
├── hooks/            # React Hooks
├── layouts/          # 页面布局
├── lib/              # 工具函数、基础封装
├── pages/            # 路由页面
├── routes/           # 路由配置
└── stores/           # Zustand 状态
```

约定：

- `components/ui/` 只放 shadcn/ui 组件或对其非常薄的项目化调整。
- 业务页面组件放在 `pages/`，可复用业务组件放在 `components/`。
- 路由级布局放在 `layouts/`，不要散落在页面文件中。
- API 访问统一放在 `api/`，页面不直接拼接请求细节。

## 命名规范

- React 组件使用 PascalCase。
- 变量、函数、Hook 使用 camelCase。
- Hook 以 `use` 开头。
- 常量使用 UPPER_SNAKE_CASE。
- 文件名优先使用 kebab-case，例如 `admin-layout.tsx`、`layout-store.ts`。
- shadcn/ui 生成文件保持其默认命名。

## TypeScript 规范

- 新增业务代码必须使用 TypeScript。
- 公共函数、API 返回值、组件 props 应显式声明类型。
- 避免使用 `any`。确实无法确定类型时，优先使用 `unknown` 并在使用处收窄。
- 类型只在当前文件使用时可就近声明；跨模块复用时应放到合适的模块中。
- 不在组件中维护复杂的匿名对象类型，复杂 props 应提取为命名类型。

示例：

```ts
type CustomerStatus = "active" | "pending" | "disabled"

type Customer = {
  id: string
  name: string
  status: CustomerStatus
}
```

## React 组件规范

- 优先使用函数组件和 Hooks。
- 页面组件负责组合，不承载过多业务细节。
- 组件 props 保持清晰、稳定，不传入过深的配置对象。
- 列表渲染必须使用稳定 key，不使用数组下标作为 key。
- 复杂条件渲染应提前拆分变量或子组件，避免 JSX 难以阅读。
- 表单、筛选、表格、弹窗等可复用交互应沉淀为业务组件。

组件文件推荐结构：

```tsx
type Props = {
  title: string
}

export function ExamplePanel({ title }: Props) {
  return <section>{title}</section>
}
```

## shadcn/ui 使用规范

Console 后台主布局必须基于 shadcn/ui 的 `sidebar-07`。

初始化命令：

```bash
npx shadcn@latest add sidebar-07
```

约束：

- 保留 `sidebar-07` 的主结构、交互方式和视觉基础。
- 可替换菜单、用户、团队、项目等业务数据。
- 不另起一套自定义侧边栏体系。
- 新增基础 UI 优先通过 shadcn/ui CLI 添加。
- 不直接大幅改写 `components/ui/` 中的基础组件行为。

推荐方式：

- 基础按钮、输入框、下拉菜单、面包屑、侧边栏、弹层等使用 `components/ui/`。
- 业务语义通过外层业务组件表达，例如 `CustomerStatusBadge`。
- 页面级布局使用 Tailwind 组合，不把布局逻辑塞进基础 UI 组件。

## 页面布局规范

后台页面应遵循清晰、紧凑、可扫描的布局。

要求：

- 页面主内容放在统一后台布局内。
- 顶部保留面包屑、用户菜单、快捷操作等后台常用区域。
- 主内容区优先使用标题区、筛选区、数据区、操作区的结构。
- 避免营销页式大标题、过大留白和装饰性内容。
- 卡片只用于承载独立信息块，不要把整个页面层层包成卡片。
- 表格、筛选、状态、操作入口要优先保证可读性和可操作性。

## 样式规范

- 使用 Tailwind CSS 编写样式。
- 不新增其他 CSS-in-JS 或 UI 样式方案。
- 颜色、间距、圆角、阴影应优先使用 Tailwind token 和 shadcn/ui 变量。
- 避免内联 style，除非是动态计算且 Tailwind 难以表达。
- 不使用大量自定义颜色造成单页面风格割裂。
- 控件尺寸应稳定，避免 hover、loading、空状态导致布局跳动。
- 文案必须在移动和桌面宽度下不溢出、不重叠。

## 图标规范

- 图标优先使用 `lucide-react`。
- 工具类按钮优先使用图标，并在必要时提供可访问名称或 tooltip。
- 不为常见操作手写 SVG，例如保存、删除、编辑、返回、搜索。
- 图标只表达操作或状态，不作为无意义装饰堆叠。

## 路由规范

- 路由配置集中在 `src/routes/`。
- 页面文件放在 `src/pages/`。
- 默认访问 `/` 应跳转到主入口页面。
- 路由路径使用小写和短横线。
- 新增页面时同步更新 Sidebar 菜单。

示例：

```text
/dashboard
/customers
/customer-groups
```

## 状态管理规范

项目使用 Zustand 管理前端状态。

适合放入 Zustand 的状态：

- 跨组件共享的 UI 状态。
- 页面筛选条件。
- 当前用户偏好。
- 可被多个页面复用的轻量业务状态。

不适合放入 Zustand 的状态：

- 单个输入框临时值。
- 只在一个组件内部使用的弹窗开关。
- 可直接由 URL、接口结果或组件 props 推导出的状态。

Store 文件放在 `src/stores/`，命名示例：

```text
layout-store.ts
customer-filter-store.ts
```

## API 规范

- API 模块放在 `src/api/`。
- 页面不直接写 `fetch` 或拼接接口路径。
- 请求基础封装放在 `src/lib/`。
- API 函数命名应表达业务动作，例如 `getCustomers`、`updateCustomer`。
- 后端统一响应格式为：

```json
{ "code": 0, "message": "success", "data": {} }
```

接口尚未完成时，可以使用 mock 数据，但应保持返回结构接近真实接口。

## 表格和筛选规范

管理后台列表页通常应包含：

- 页面标题和主要操作。
- 搜索输入。
- 状态或类型筛选。
- 数据表格。
- 状态标识。
- 行内操作入口。
- 空状态和加载状态。

要求：

- 筛选条件应可读、可恢复，必要时同步到 URL。
- 表格列宽和操作区保持稳定。
- 空状态说明当前无数据，不写与功能无关的引导文案。
- 加载状态使用 skeleton 或明确的 loading 表达。

## 表单规范

- 表单字段 label 必须清晰。
- 必填、错误、禁用、提交中状态必须明确。
- 提交按钮在提交中应禁用，避免重复提交。
- 表单校验逻辑不要散落在 JSX 中。
- 复杂表单优先使用成熟表单库；简单表单可使用受控组件。

## 可访问性规范

- 交互元素必须使用语义化元素，例如 `button`、`a`、`input`。
- 图标按钮必须有可访问名称。
- 弹窗、下拉菜单、Tooltip 等优先使用 Radix 或 shadcn/ui 组件。
- 表单输入应关联 label。
- 不通过颜色作为唯一状态表达。

## 本地开发规范

Console 本地开发服务端口固定为 `8765`。

Vite 配置：

```ts
server: {
  port: 8765,
  strictPort: true,
}
```

启动：

```bash
cd qike/console
npm run dev
```

访问：

```text
http://localhost:8765
```

## 代码质量规范

- 提交前应运行 lint 和必要的构建验证。
- 不提交 `node_modules/`、`dist/`、`.env` 等文件。
- 不把临时调试代码、console 调试输出留在业务代码中。
- 不在一次变更中混入无关重构。
- 修改共享组件时必须检查受影响页面。

建议验证命令：

```bash
cd qike/console
npm run lint
npm run build
```

## 新页面开发检查清单

新增 Console 页面时至少检查：

- 路由已配置。
- Sidebar 菜单已同步。
- 页面放在统一后台布局中。
- 使用 shadcn/ui 基础组件。
- 筛选、加载、空状态、错误状态已考虑。
- API 调用已封装到 `api/`。
- 页面状态没有不必要地提升到全局。
- 桌面和窄屏下没有文字溢出或控件重叠。
- lint 和 build 可以通过。

