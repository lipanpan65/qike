# Console PC 管理后台实施文档

## 实施目标

首版只实现 PC 管理后台的基础能力和客户管理入口：

- 工作台首页
- 客户管理页面
- 基于 shadcn/ui `sidebar-07` 的后台主布局

不包含角色管理、用户管理、内容管理、系统设置等其他业务模块。

## 技术选型

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Radix UI
- Zustand
- React Router

## 本地启动端口

Console 前端本地开发服务使用 `8765` 端口，避免与常见默认端口冲突。

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

## shadcn/ui 布局要求

PC 管理后台必须基于 shadcn/ui 的 `sidebar-07` 样式实现。

初始化组件命令：

```bash
npx shadcn@latest add sidebar-07
```

要求：

- 保留 `sidebar-07` 的主布局结构。
- 左侧导航只放首版需要的菜单。
- 示例用户、团队、项目等数据替换为 Qike 业务数据。
- 不单独实现另一套自定义侧边栏。

## 路由规划

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/dashboard` | 工作台首页 | 展示客户相关概览指标和快捷入口 |
| `/customers` | 客户管理 | 展示客户列表、搜索筛选、状态标识和操作入口 |

默认访问 `/` 时跳转到 `/dashboard`。

## 导航规划

首版 Sidebar 只保留两个主菜单：

- 工作台：`/dashboard`
- 客户管理：`/customers`

## 推荐目录结构

```text
console/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── components.json
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

## 页面要求

### 工作台首页

- 客户总数
- 今日新增客户
- 待跟进客户
- 最近客户动态占位
- 跳转客户管理的快捷入口

### 客户管理

- 客户列表表格
- 客户名称搜索
- 客户状态筛选
- 客户状态标识
- 查看、编辑等操作入口占位

首版可以使用前端 mock 数据，等后端 API 完成后再替换为真实请求。

## 状态管理

使用 Zustand 管理：

- 侧边栏折叠状态
- 客户管理页面筛选状态

## API 预留

首版预留 API 结构：

- `src/lib/request.ts`：统一请求封装
- `src/api/customers.ts`：客户列表、客户详情等客户管理接口占位

后续与 FastAPI 对接时，统一响应格式为：

```json
{ "code": 0, "message": "success", "data": {} }
```

## 实施步骤

1. 在 `console/` 初始化 Vite React TypeScript 工程。
2. 配置 Tailwind CSS。
3. 初始化 shadcn/ui。
4. 执行 `npx shadcn@latest add sidebar-07`。
5. 配置 Vite dev server 端口为 `8765`。
6. 引入 React Router，配置 `/dashboard`、`/customers`。
7. 基于 `sidebar-07` 改造后台主布局。
8. 接入 Zustand，管理侧边栏和客户筛选状态。
9. 实现 Dashboard 和客户管理页面。
10. 启动 `npm run dev`，访问 `http://localhost:8765` 验证。
