# Shock Selector

工业缓冲器在线选型与产品展示站点，基于 Next.js App Router、TypeScript、Prisma 和 PostgreSQL。

## 文档入口

如果要继续协作、扩展功能或让 Codex / oh-my-codex 接手，先看：

1. `AGENTS.md`
2. `docs/README.md`
3. `docs/implementation/omx-workspace-guide.md`
4. `docs/website-v1-requirements-and-plan.md`

## Quick Start

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

默认数据库连接：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shock_selector"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/shock_selector"
```

说明：

- `DATABASE_URL` 用于应用运行时连接；部署到 Neon 时建议填 pooled connection
- `DIRECT_URL` 用于 Prisma migrate / introspect / import；部署到 Neon 时建议填 direct connection

### 3. 启动 PostgreSQL

```bash
docker compose -f compose.yaml up -d
```

### 4. 生成 Prisma Client

```bash
pnpm prisma:generate
```

### 5. 启动开发环境

```bash
pnpm dev
```

默认访问地址：

```text
http://localhost:3000
```

## 常用命令

开发启动：

```bash
pnpm dev
```

生产构建：

```bash
pnpm build
```

生产启动：

```bash
pnpm start
```

类型检查：

```bash
pnpm typecheck
```

Excel 导入：

```bash
pnpm import:excel
```

Prisma 迁移：

```bash
pnpm prisma:migrate
```

## 本地开发建议顺序

```bash
pnpm install
cp .env.example .env
docker compose -f compose.yaml up -d
pnpm prisma:generate
pnpm dev
```
