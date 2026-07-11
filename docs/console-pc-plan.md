# Console PC 管理后台规划

## 目标

先实现 Qike 的 PC 管理后台基础页面，为客户管理业务提供统一入口。

## 技术栈

- React + TypeScript
- Vite
- shadcn/ui
- Tailwind CSS
- Radix UI
- Zustand
- React Router

## 本地开发端口

Console 前端本地开发服务使用 `8765` 端口。

Vite 配置要求：

```ts
server: {
  port: 8765,
  strictPort: true,
}
```

启动后访问：

```text
http://localhost:8765
```

## 布局约束

PC 管理后台必须使用 shadcn/ui 的 `sidebar-07` 样式作为主布局基础。

初始化组件命令：

```bash
npx shadcn@latest add sidebar-07
```

实现要求：

- 左侧 Sidebar 使用 `sidebar-07` 的组件结构、视觉风格和交互方式。
- 顶部区域保留面包屑、用户菜单、快捷操作等后台常用能力。
- 主内容区承载具体业务页面。
- 不另起一套自定义侧边栏样式。
- 业务菜单、用户信息、项目名称等内容可以替换 `sidebar-07` 的示例数据。

## 首版页面范围

### 工作台首页

- 路径：`/dashboard`
- 功能：核心指标卡片、快捷入口、最近动态占位。

### 客户管理

- 路径：`/customers`
- 功能：客户列表、搜索筛选、状态标识和操作入口占位。

## 推荐目录结构

```text
console/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   └── index.tsx
│   ├── layouts/
│   │   └── AdminLayout.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   └── Customers.tsx
│   ├── components/
│   │   ├── app-sidebar.tsx
│   │   └── app-header.tsx
│   ├── stores/
│   │   └── layout-store.ts
│   ├── api/
│   │   └── customers.ts
│   ├── lib/
│   │   ├── request.ts
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
```

## 状态管理

首版使用 Zustand 管理以下状态：

- 侧边栏折叠状态
- 客户管理页面筛选状态

## API 预留

首版先预留 API 层，不强依赖后端完成：

- `src/lib/request.ts`：统一请求封装
- `src/api/customers.ts`：客户列表、客户详情等客户管理接口占位

后续与 FastAPI 服务对接时，接口遵循项目统一响应格式：

```json
{ "code": 0, "message": "success", "data": {} }
```

## 实施顺序

1. 初始化 `console` 的 Vite React TypeScript 工程。
2. 配置 Tailwind CSS 和 shadcn/ui。
3. 执行 `npx shadcn@latest add sidebar-07`。
4. 引入 React Router，建立后台主布局路由。
5. 基于 `sidebar-07` 替换菜单、用户信息和项目名称。
6. 接入 Zustand，管理侧边栏和客户筛选状态。
7. 实现 Dashboard 和客户管理页面。
8. 使用 `8765` 端口启动本地开发服务并验证页面。
