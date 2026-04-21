你现在是这个仓库的全栈开发代理，请基于当前目录内的 `PRD.md`、`AGENTS.md`、`schema.prisma` 和 `SCENARIO_DESIGN.md` 创建一个可运行的 MVP 项目。

# 项目名称
shock-selector-mvp

# 项目目标
把一个本地 Excel 工业产品选型工具做成在线站点。
原始 Excel 中包含 19 个工况 sheet 和 1 个产品数据库 sheet。用户输入工况参数后，系统先计算需求值，再从产品库中过滤出满足条件的型号。

# 开发边界
先完成最小可运行版本，不要过度设计。
不要一次性迁移全部 19 个复杂工况，只需要完成架构和 3 个示例工况。

# 技术栈要求
- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- PostgreSQL
- Zod
- xlsx 或 SheetJS

# 必须完成的内容

## 1. 初始化项目结构
创建以下核心目录：
- `app/`
- `components/`
- `lib/`
- `lib/calculators/`
- `lib/scenarios/`
- `lib/products/`
- `prisma/`
- `scripts/`
- `docs/`

## 2. 接入 Prisma
- 使用提供的 `schema.prisma`
- 完成 Prisma Client 初始化
- 准备数据库迁移说明

## 3. 导入 Excel 产品库
- 实现 `scripts/import-excel.ts`
- 从 `data/选型程序算法.xlsx` 的“数据库”sheet 导入数据
- 字段至少映射到：
  - model
  - type
  - strokeMm
  - energyPerCycleNm
  - energyPerHourNm
  - maxImpactForceN
  - maxThrustForceN
  - totalLengthMm
  - threadSize
  - photoUrl
  - rawDataJson
- 导入时对单行错误容错
- 输出导入结果统计

## 4. 创建两个核心页面
### `/selector/buyer`
实现采购快速筛选页：
- 按产品参数筛选
- 支持字段：type、strokeMm、energyPerCycleNm、energyPerHourNm、maxImpactForceN、maxThrustForceN、totalLengthMm、threadSize
- 页面上方是筛选条件，下方是结果表格

### `/selector/engineer`
实现工程师选型页骨架：
- 显示 5 个上层工况入口，不允许直接显示 19 个原始工况
- 用向导问题选择 variant
- 展示动态表单区域
- 展示计算结果区域
- 展示推荐产品区域

## 5. 创建 scenario registry
创建统一注册表，至少支持：
- familyKey
- variantKey
- name
- motionKind
- orientation
- driveType
- loadType
- gravityRelation
- inputSchema
- outputSchema

必须把 19 个底层工况映射到 5 个前台入口与 7 个 calculator family 的架构中。

## 6. 实现 3 个示例 calculator
先实现以下三个：
- `linear-free-horizontal`
- `linear-motor-horizontal`
- `linear-free-vertical-drop`

要求：
- 使用 Zod 校验输入
- calculator 只负责计算与构建筛选条件
- 页面组件不得直接写公式

## 7. 创建 API
- `GET /api/scenarios`
- `POST /api/products/search`
- `POST /api/calculate`

返回 JSON 结构清晰，便于后续前端接入。

## 8. 创建服务层
至少拆分为：
- `scenario-registry.ts`
- `calculator-service.ts`
- `product-search-service.ts`
- `product-repository.ts`

## 9. 创建基础 UI
页面风格要求：
- 工业品 / B 端工具风格
- 简洁、清晰、专业
- 不要营销官网风格
- 不要复杂动画

## 10. 创建 README
README 必须说明：
- 项目用途
- 启动方式
- 环境变量
- Prisma 迁移命令
- 导入命令
- 当前已实现工况
- 后续如何扩展更多工况

# 代码质量要求
- 所有输入必须校验
- 代码要有合理注释
- 类型定义完整
- 不要把 SQL / Prisma 查询散落在页面中
- 不要把 19 个工况做成 19 个页面
- 不要把 Excel 公式原样塞进前端

# 你的工作方式
请直接开始创建项目文件与代码。
优先保证项目结构、数据流、接口和 3 个示例工况可跑通。
完成后给出：
1. 已创建文件列表
2. 如何安装依赖
3. 如何配置环境变量
4. 如何执行 Prisma migration
5. 如何导入 Excel
6. 如何启动项目
7. 目前仍未完成的部分
