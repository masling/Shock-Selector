# AGENTS.md

## 项目定位

这是一个工业产品在线选型及产品介绍网站，主要目标客户是欧洲及北美客户，当前产品先形为主要任务
目标是将本地 Excel 选型工具产品化为一个在线站点，面向工程师与采购人员。

## 第一原则

- 先做最小可运行版本
- 先保证结构正确，再补复杂公式
- 优先可维护性，不优先炫技
- 工况必须可扩展，不能把 19 个工况做成 19 个独立页面

## 用户视角要求

### 工程师视图

- 信息更完整
- 可看到计算值、筛选依据、推荐原因
- 可以接受更专业的字段名

### 采购视图

- 尽量少输入
- 尽量少公式术语
- 重点是筛出合适型号与基础对比

## 工况设计约束

前台不允许直接把 Excel 的 19 个工况 sheet 作为 19 个入口平铺出来。
前台只能暴露以下 5 个入口：

1. 直线运动 · 自由运动
2. 直线运动 · 外力驱动
3. 直线运动 · 电机驱动
4. 直线运动 · 气缸驱动
5. 旋转运动

系统必须通过向导式问题将用户路由到对应底层工况 variant。

## 后台 calculator 分组

优先按以下 7 组组织：

1. `linear_free_motion`
2. `linear_force_driven`
3. `linear_motor_driven`
4. `linear_cylinder_driven`
5. `rotary_load`
6. `rotary_beam_or_gate`
7. `rotary_table`

## 技术要求

- 使用 Next.js App Router
- 使用 TypeScript
- 使用 Prisma
- 使用 PostgreSQL
- 使用 Zod 进行输入校验
- 使用 Tailwind CSS + shadcn/ui
- API Route 放在 `app/api`

## 代码分层要求

必须分层，至少分为：

- 页面层：负责展示与交互
- 表单与视图组件层
- 应用服务层：编排 calculation / filtering
- calculator 层：只负责公式与结果生成
- repository / data access 层：负责 Prisma 查询

禁止把数据库查询、公式、UI 状态全部写在一个页面组件中。

## 公式实现要求

- 公式不能写死在 React 页面组件里
- 所有工况统一通过 registry 注册
- 每个 calculator 必须实现统一接口
- 单位换算与参数清洗必须集中处理
- 同类工况尽量复用一个 family calculator + variant 参数

建议接口：

```ts
export type ScenarioCalculator<I, O> = {
  key: string;
  familyKey: string;
  validateInput: (input: unknown) => I;
  calculate: (input: I) => O;
  buildFilter: (result: O) => ProductSearchFilter;
  explain?: (input: I, result: O) => string[];
};
```

## 数据要求

### Products

必须至少包含：

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

### Scenarios

每个 scenario 需要记录：

- familyKey
- variantKey
- name
- motionKind
- orientation
- driveType
- loadType
- gravityRelation
- inputSchemaJson
- outputSchemaJson
- formulaMetaJson

## 导入要求

- 先实现从 Excel 的“数据库”sheet 导入 products
- 导入时保留原始字段映射
- 对空值容错，不允许因单行异常中断全量导入
- 导入逻辑放在 `scripts/import-excel.ts`

## 页面要求

### 首页

- 两个明确入口：工程师选型 / 采购快速筛选
- 简短说明 5 个工况分类

### 工程师页

- 先显示工况向导
- 再渲染动态表单
- 再显示计算结果与推荐产品

### 采购页

- 顶部筛选
- 下方表格
- 支持排序与清空

## 命名规范

- 数据库字段使用英文 camelCase / Prisma 风格
- API 请求字段统一英文
- UI 文案可以中文
- 工况 key 使用英文 snake_case 或 kebab-case，但要统一

## 严禁事项

- 不要一次性实现全部 19 个复杂工况
- 不要先做 CMS、权限、登录
- 不要做营销首页动画
- 不要把筛选 SQL 分散在多个页面组件中
- 不要在前端直接复制 Excel 公式文本

## 优先级顺序

1. 项目初始化
2. Prisma schema 与迁移
3. Excel 导入 products
4. buyer 页面与 products search API
5. scenario registry
6. engineer 页面骨架
7. 3 个示例工况 calculator
8. selection logs

## 交付要求

交付结果必须包括：

- 可运行的 Next.js 项目
- Prisma schema
- 初始化 README
- 导入脚本
- 至少 3 个 calculator 样例
- 采购筛选页
- 工程师页骨架
