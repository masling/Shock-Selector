# 网站项目需求整理

## 0. 文档定位

本文根据 `docs/` 目录下现有资料整理当前网站项目需求，用作产品、设计、开发和后续 Codex 会话的快速入口。

主要来源：

- `docs/website-v1-requirements-and-plan.md`
- `docs/source-materials/PRD.md`
- `docs/source-materials/SCENARIO_DESIGN.md`
- `docs/source-materials/EKD_SEO_keyword_strategy_en_markets.md`
- `docs/implementation/multilingual-requirements.md`
- `docs/content/website-copy-sourcebook.md`
- `docs/content/product-taxonomy-and-naming.md`
- `docs/content/page-copy-drafts-en.md`
- `docs/README.md`

本文不是替代全部细节文档，而是把已确认需求收敛成执行视角的需求总览。

## 1. 当前阶段判断

当前项目不是从零定义产品，而是已有较完整资料后的需求汇总与执行对齐阶段。

已具备：

- 产品定位
- 用户角色
- MVP 范围
- 页面清单
- 选型工况架构
- 数据字段要求
- SEO 方向
- 多语言方向
- 内容与英文文案素材
- 联系方式、联系表单、下载登录和主语言发布策略
- 19 个底层工况 calculator 已在代码中注册实现

仍需要后续确认：

- `Non-adjustable Shock Absorbers` 是否在公开页面改为 `Self-compensating Shock Absorbers`
- 部分产品性能、专利数量、竞品替代等宣传语是否允许公开使用
- 产品数据 canonical 分类字段的最终业务含义和映射表
- 19 个 calculator variant 的 Excel 对照样例输入 / 输出和误差容忍标准

这些事项不阻塞 MVP 开发。

## 2. 产品定位

第一版网站定位为：

`EKD corporate website + product catalog + shock absorber sizing MVP`

对外英文主定位建议：

`EKD — Industrial Shock Absorber Selection and Sizing Platform`

网站不应是传统企业宣传站优先，而应是面向欧洲和北美客户的工业产品发现平台，核心包括：

1. 产品目录
2. 在线选型
3. 应用场景内容
4. 公司能力与信任背书
5. 资料下载与询盘转化

第一版优先服务“找到合适产品”，公司介绍作为信任辅助，不作为首屏主任务。

## 3. 目标用户

### 3.1 工程师

典型需求：

- 通过工况判断进入正确 calculator
- 输入完整工程参数
- 查看计算结果、中间量、筛选依据和推荐原因
- 能与 Excel 原始结果逐项核对

页面与内容要求：

- 字段名可以更专业
- 必须展示单位
- 必须展示关键计算明细
- 推荐产品要解释为什么匹配

### 3.2 采购 / sourcing 用户

典型需求：

- 不经过复杂工况计算，快速筛型号
- 按行程、能量、推力、总长度、螺纹等条件得到候选产品
- 对比型号基础参数
- 进入详情、下载资料或联系销售

页面与内容要求：

- 少输入
- 少公式术语
- 表格清晰
- 支持排序、清空、查看详情

### 3.3 新访客 / OEM 潜在客户

典型需求：

- 快速理解 EKD 做什么
- 判断产品线和应用行业是否匹配
- 看到质量、资质、经验和工程支持信号
- 找到产品、应用、下载和联系入口

## 4. MVP 目标

MVP 需要跑通最小价值闭环：

`进入网站 -> 选择产品发现路径 -> 获取产品列表或选型结果 -> 查看详情 / 下载资料 / 联系 EKD`

第一版必须实现：

- 可运行的 Next.js App Router 项目
- Prisma schema 与 PostgreSQL 数据结构
- Excel “数据库”sheet 产品导入脚本
- 产品目录与核心官网页面
- 采购快速筛选页
- 工程师选型页骨架
- scenario registry
- 19 个底层工况 calculator 已注册、可计算、可通过统一接口调用
- 产品详情页或可承接筛选结果的型号详情视图
- 下载与联系入口
- Contact Form 提交后发邮件到 `sales@vibroabsorber.com` 并入库
- 下载资料前要求用户登录，优先支持 Google 等欧美常用第三方快速登录
- 工程师选型和采购筛选结果支持“加入询盘产品”，形成类似购物车的轻量询盘清单
- 用户在加入询盘、查看询盘清单或提交询盘前需要快速登录；同一登录会话有效期内不重复打断
- 对外社交链接位：X / Facebook / Instagram / LinkedIn，暂无账号的先预留后补充

第一版明确不做：

- CMS
- 完整会员系统、权限系统、经销商系统
- 报价、订单、审批流
- 新闻系统
- 复杂 BI 报表
- 复杂营销动画
- 竞品等效替代公开声明
- 超出 Excel 当前 19 个底层工况之外的新复杂工况

## 5. 信息架构与页面清单

### 5.1 顶层导航

建议主导航：

1. Products
2. Solutions
3. Sizing
4. Applications
5. Downloads
6. About
7. Contact

`Products` 和 `Solutions` 应排在前面。`Sizing` 可以在导航中高亮。

### 5.2 第一版页面

必须页面：

- `/`
- `/products`
- `/products/[familySlug]`
- `/products/[familySlug]/[modelId]` 或等价产品详情路径
- `/solutions`
- `/applications`
- `/selector/engineer`
- `/selector/buyer`
- `/downloads`
- `/about`
- `/contact`

SEO 资料中还建议未来扩展：

- `/shock-absorber-selector/`
- `/shock-absorber-calculator/`
- `/guides/how-to-size-a-shock-absorber/`
- `/guides/shock-absorber-energy-per-cycle/`
- 应用专题页，如 `/applications/conveyor-stop-shock-absorber/`

已确认：SEO URL 决策需要实施，部分页面路径需要更新。MVP 开发应把 SEO 友好路径纳入路由实施，而不是仅作为后续内容规划。

## 6. 页面级需求

### 6.1 首页 `/`

目标：

- 让用户最短路径进入找产品、按应用找产品或开始选型
- 首屏明确体现产品发现能力
- 强化 EKD 不是普通样册站，而是产品目录 + sizing 平台

核心模块：

- Hero：工业冲击吸收与选型定位
- Product Discovery Panel
- 三条快速路径：Browse by Product Family / Find by Application / Start Sizing
- Engineer Sizing / Buyer Quick Filter 两个明确入口
- 5 个运动工况入口概览
- 产品家族总览
- 应用行业入口
- Why EKD 信任模块
- 下载样册 CTA
- 联系销售 CTA

首屏优先 CTA：

1. Browse Products 或 Find Your Product
2. Start Sizing
3. Buyer Quick Filter

### 6.2 Products `/products`

目标：

- 让用户按产品家族快速理解产品范围
- 支持从产品类别进入详情和筛选路径

第一版重点产品家族：

- Adjustable Shock Absorber
- Heavy Duty Shock Absorber
- Wire Rope Vibration Isolator
- Heavy Industry Buffer
- Anti Impact Compound Vibration Isolator
- Non-Adjustable Shock Absorber
- Super Long Life Shock Absorber
- Vibration Isolation Solution
- Special Vibration Isolator
- Friction Spring Damper
- Locking Assemblies & Coupling

关键边界：

- 以上是网站产品目录范围。
- 当前 xls 里的产品库不完整，不能代表全部产品类别。
- 当前 calculator 公式只针对 Absorber 选型，不能默认用于所有产品类别。
- 产品数据需要字段区分“目录类别”和“是否支持 calculator 选型”。
- 产品类别图文介绍优先参考本地英文网站内容，主要来源为 `lib/products/catalog-master-data.ts` 和 `/en/products`、`/en/products/[familySlug]` 渲染页面。
- 本地英文站没有图片素材的类别，需要从 catalog/PDF/人工确认资料补图，不使用无关图库图替代。

产品页建议分组：

- Shock Absorbers
- Buffers
- Vibration Isolators
- Dampers
- Mechanical Components
- Solutions

### 6.3 产品家族页 `/products/[familySlug]`

目标：

- 说明该产品家族适合什么场景、不适合什么场景
- 展示代表型号或型号列表
- 承接筛选、下载和联系

核心模块：

- 家族定位
- Best Fit For
- Use Caution For
- 关键参数范围
- 典型应用
- 代表型号
- 下载 / 联系 CTA

内容来源要求：

- 家族页图文介绍优先参考本地英文网站。
- 文字来源优先为 `lib/products/catalog-master-data.ts` 的英文 `name`、`tag`、`summary`、`description`。
- 页面呈现参考 `/en/products/[familySlug]`。
- 图片优先使用本地英文站已有产品/类别素材；缺失时标记为待补，不用无关工业图库图替代。

### 6.4 产品详情页

目标：

- 展示单型号基础技术数据
- 承接 buyer 和 engineer 推荐结果

核心字段：

- model
- type / typeCode
- strokeMm
- energyPerCycleNm
- energyPerHourNm
- maxImpactForceN
- maxThrustForceN
- totalLengthMm
- threadSize
- photoUrl
- rawDataJson

### 6.5 Solutions `/solutions`

目标：

- 服务“不知道型号，但知道应用、运动形式或驱动方式”的用户
- 作为按场景找产品的核心入口

入口方式：

- Find by Industry
- Find by Motion
- Find by Drive

最终应跳转到：

- 产品家族页
- 工程师选型页
- 采购筛选页
- 应用页面

### 6.6 Applications `/applications`

目标：

- 展示 EKD 适用行业和典型机器场景
- 支撑 SEO 和信任建立

第一版重点行业：

- PET blowing machinery
- Automotive manufacturing
- Tire machinery
- Port and lifting equipment
- Automated warehouse / stacker crane
- Railway safety
- Paper machinery
- General industrial automation

### 6.7 Engineer Sizing `/selector/engineer`

目标：

- 通过 5 个上层工况入口和向导问题匹配底层 variant
- 渲染动态表单
- 计算并推荐产品

流程：

1. 选择运动类型
2. 选择方向 / 旋转方式
3. 选择驱动方式或旋转对象
4. 垂直场景选择重力关系
5. 得到 `variantKey`
6. 展示对应输入表单
7. 提交计算
8. 展示计算明细、筛选条件、推荐型号、解释说明

结果展示要求：

- 不能只展示摘要卡片
- 必须展示与 Excel 对应的关键中间结果
- 至少包含动能、做功能量、总能量每次、总能量每小时、推进力
- 若工况有减速加速度、冲击速度、等效质量、重力修正等，也要展示

当前代码状态：

- 19 个底层工况已在 `lib/scenarios/registry.ts` 标记为 `isImplemented: true`
- 19 个对应 calculator 已在 `lib/calculators/calculator-registry.ts` 注册
- 后续重点不是继续补 calculator 实现，而是补齐 Excel 对照样例、自动化回归测试、UI 文案和结果解释覆盖

询盘产品要求：

- 推荐产品列表中每个产品需要提供 `Add to Inquiry` / `加入询盘` 操作
- 用户点击加入询盘前，如未登录，应先触发 Google 等第三方快速登录
- 加入询盘时应保留来源：`engineer`、`variantKey`、输入参数摘要、计算结果摘要、推荐原因或筛选条件
- 同一产品重复加入时不创建重复行，可更新数量、备注或保留最近来源
- 工程师结果页应提供进入询盘清单的入口

### 6.8 Buyer Quick Filter `/selector/buyer`

目标：

- 不经过工况计算，直接按已知参数筛型号

筛选字段：

- type / typeCode
- minStrokeMm
- minEnergyPerCycleNm
- minEnergyPerHourNm
- minMaxImpactForceN
- minMaxThrustForceN
- maxTotalLengthMm
- threadSize

页面模块：

- 顶部筛选区
- 结果表格
- 排序
- 清空筛选
- 空状态
- 跳转产品详情
- 结果行加入询盘产品
- 已加入状态和询盘清单入口

询盘产品要求：

- 表格每个产品提供 `Add to Inquiry` / `加入询盘`
- 未登录用户点击前触发快速登录
- 加入询盘时保留来源：`buyer`、筛选条件、排序条件、来源页面、locale
- 可从 buyer 页进入询盘清单并继续提交联系表单

### 6.9 Downloads `/downloads`

目标：

- 集中承接样册和技术资料

第一版资源：

- EKD Full Product Catalog
- Vibration Isolator Catalog 2024

下载规则：

- 下载资料前要求登录
- 登录优先支持 Google 等欧美常用第三方快速登录
- 登录后可下载公开资料
- 下载行为需要记录到日志，至少包含用户、资料、locale、来源页面和时间

未来资源分类：

- Catalog
- Drawing
- 3D
- CAD
- PDF

### 6.10 About `/about`

目标：

- 建立公司与工程能力信任

可使用信任信号：

- Jiangsu EKD Machinery Technical Co., Ltd.
- vibration control / noise reduction / shock absorption
- 30+ employees
- core team with 15+ years of industry experience
- ISO9001 / ROHS / CE
- engineering support for sizing review and application recommendations
- production equipment and test equipment

涉及专利、军工资质、客户、寿命、竞品等强声明时，需要发布前复核官方材料。

### 6.11 Contact `/contact`

目标：

- 形成询盘转化入口

内容：

- 联系表单
- Social Links: X / Facebook / Instagram
- LinkedIn
- 暂无账号的社交平台先预留字段和 UI 位置，后续补充
- 应用说明输入提示
- 销售 / 技术支持说明

联系表单提交规则：

- 提交后发送邮件到 `sales@vibroabsorber.com`
- 同步写入数据库
- 入库内容至少包含姓名、公司、邮箱、国家/地区、电话、消息内容、来源页面、locale、提交时间、处理状态
- 如果用户从询盘清单提交联系表单，邮件正文必须包含本次选择的询盘产品列表
- 入库记录必须与本次询盘产品建立关联，便于未来后台管理展示
- 表单异常时应提示用户可稍后重试，并保留明确的失败状态

### 6.12 Inquiry Products `/inquiry` 或询盘抽屉

目标：

- 让用户在工程师选型或采购筛选过程中，把多个感兴趣型号加入同一询盘清单
- 用类似购物车的方式承接“产品选择 -> 联系销售”转化，但不涉及价格、下单或支付

入口：

- 工程师推荐产品列表
- 采购筛选结果表格
- 产品详情页
- Header 或浮动入口中的询盘数量提示

用户操作：

- 加入询盘产品
- 移除询盘产品
- 修改数量或备注
- 查看所选产品参数摘要
- 填写联系表单
- 提交询盘

登录要求：

- 加入询盘、查看询盘清单、提交询盘前需要快速登录
- 优先支持 Google 等欧美常用第三方登录
- 已登录用户在当前会话有效期内不重复要求登录

联系表单：

- 询盘清单下方显示联系我们表单
- 表单字段参考 Contact Form
- 提交后发送邮件到 `sales@vibroabsorber.com`
- 邮件中必须包含联系人信息、消息内容、所选产品列表、产品来源、数量/备注、locale、来源页面
- 提交后入库，并保存 inquiry 与 inquiry items 的关联关系

非目标：

- 不做购物车价格计算
- 不做在线下单
- 不做支付
- 不做库存承诺

## 7. 选型系统需求

### 7.1 前台入口

前台只暴露 5 个工况入口：

1. Linear Motion · Free Motion
2. Linear Motion · Force Driven
3. Linear Motion · Motor Driven
4. Linear Motion · Cylinder Driven
5. Rotary Motion

不得把 Excel 的 19 个 sheet 直接平铺给用户。

### 7.2 后台 calculator family

后台按 7 个 family 组织：

1. `linear_free_motion`
2. `linear_force_driven`
3. `linear_motor_driven`
4. `linear_cylinder_driven`
5. `rotary_load`
6. `rotary_beam_or_gate`
7. `rotary_table`

### 7.3 19 个底层 variant

建议 `variantKey`：

- `linear-free-horizontal`
- `linear-free-slope`
- `linear-free-vertical-drop`
- `linear-force-horizontal`
- `linear-force-vertical-assisting`
- `linear-force-vertical-opposing`
- `linear-motor-horizontal`
- `linear-motor-vertical-assisting`
- `linear-motor-vertical-opposing`
- `linear-cylinder-horizontal`
- `linear-cylinder-vertical-assisting`
- `linear-cylinder-vertical-opposing`
- `rotary-horizontal-table`
- `rotary-horizontal-beam-or-gate`
- `rotary-horizontal-load`
- `rotary-vertical-beam-or-gate-assisting`
- `rotary-vertical-beam-or-gate-opposing`
- `rotary-vertical-load-assisting`
- `rotary-vertical-load-opposing`

### 7.4 公式与输入约束

关键原则：

- 5 个入口和向导只负责帮用户选对工况
- 进入具体 `variantKey` 后，输入项必须回到 Excel sheet 原始条件
- 不允许为了减少字段而擅自把原始条件压缩为二次参数
- calculator 不能写在 React 页面组件里
- 统一通过 registry 注册
- 单位换算和参数清洗集中处理
- 同类工况优先复用 family calculator + variant 参数

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

## 8. 数据与模型需求

### 8.1 核心实体

必须或建议包含：

- `Product`
- `ProductFamily`
- `ScenarioFamily`
- `Scenario`
- `SelectionLog`
- `DownloadAsset`
- `User` 或第三方登录用户映射
- `Inquiry`
- `InquiryItem`
- `ContactSubmission`
- `ContactSubmissionProduct` 或等价关联表
- `ApplicationCategory` 或本地内容配置

### 8.2 Product 字段

产品表至少包含：

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
- catalogCategoryCode
- catalogCategorySlug
- catalogCategoryName
- calculatorEligibility
- selectionProductType
- catalogCoverageStatus
- dataSource

多语言和长期可维护性建议新增或保留：

- `typeCode`
- `seriesCode`
- `familySlug`

`type` 可继续保留 Excel 原始值用于溯源，但 UI 和筛选逻辑应逐步转向 canonical code。

分类与选型范围字段说明：

- `catalogCategoryCode`：产品目录类别稳定值，例如 `ADJUSTABLE_SHOCK_ABSORBER`
- `catalogCategorySlug`：公开产品分类 URL slug
- `catalogCategoryName`：默认英文展示名
- `calculatorEligibility`：是否可由当前 absorber calculator 推荐
- `selectionProductType`：选型系统内部产品类型，例如 `ABSORBER`、`CATALOG_ONLY`、`SOLUTION_ONLY`
- `catalogCoverageStatus`：数据完整性，例如 `EXCEL_IMPORTED_PARTIAL`、`CATALOG_COMPLETE`、`PLACEHOLDER`
- `dataSource`：数据来源，例如 `XLS_DATABASE`、`CATALOG_PDF`、`MANUAL_CONTENT`

建议 `calculatorEligibility`：

| 产品类别 | calculatorEligibility |
| --- | --- |
| Adjustable Shock Absorber | `ABSORBER_CALCULATOR` |
| Heavy Duty Shock Absorber | `ABSORBER_CALCULATOR` |
| Non-Adjustable Shock Absorber | `ABSORBER_CALCULATOR` |
| Super Long Life Shock Absorber | `ABSORBER_CALCULATOR` |
| Heavy Industry Buffer | `CATALOG_ONLY`，除非后续确认可由 absorber calculator 选型 |
| Wire Rope Vibration Isolator | `CATALOG_ONLY` |
| Anti Impact Compound Vibration Isolator | `CATALOG_ONLY` |
| Vibration Isolation Solution | `SOLUTION_ONLY` |
| Special Vibration Isolator | `CATALOG_ONLY` |
| Friction Spring Damper | `CATALOG_ONLY` |
| Locking Assemblies & Coupling | `CATALOG_ONLY` |

采购筛选可以覆盖更多目录产品；工程师 calculator 推荐必须只返回 `calculatorEligibility = ABSORBER_CALCULATOR` 的产品，除非后续为其他类别建立独立公式。

### 8.3 Scenario 字段

每个 scenario 至少包含：

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

### 8.4 Excel 导入

导入要求：

- 从 Excel 的“数据库”sheet 导入 products
- 保留原始字段映射
- 保存原始行到 `rawDataJson`
- 空值和异常行容错
- 单行异常不得中断全量导入
- 导入逻辑放在 `scripts/import-excel.ts`
- 未来将中文源值映射为 canonical `typeCode`

### 8.5 Inquiry / Contact 数据关系

建议数据关系：

- `User` 通过第三方登录识别用户，可保存 email、name、provider、providerUserId
- `Inquiry` 表示一次询盘清单或一次提交前的产品集合
- `InquiryItem` 关联 `Inquiry` 和 `Product`
- `ContactSubmission` 表示一次联系表单提交
- `ContactSubmission` 可关联一个 `Inquiry`
- 若未来需要一个联系表单关联多个产品，也可增加 `ContactSubmissionProduct`

`Inquiry` 建议字段：

- id
- userId
- status: `DRAFT | SUBMITTED | ARCHIVED`
- locale
- sourceType: `engineer | buyer | product_detail | contact`
- sourcePage
- createdAt
- updatedAt
- submittedAt

`InquiryItem` 建议字段：

- id
- inquiryId
- productId
- model
- quantity
- note
- sourceType
- sourcePage
- scenarioVariantKey
- selectionLogId
- filterSnapshotJson
- calculationSnapshotJson
- recommendationReasonJson
- createdAt

`ContactSubmission` 建议字段：

- id
- userId
- inquiryId
- name
- company
- email
- countryOrRegion
- phone
- inquiryType
- application
- message
- locale
- sourcePage
- emailTo
- emailSentAt
- emailStatus
- status
- createdAt

## 9. API 需求

### 9.1 `GET /api/scenarios`

返回：

- 5 个前台入口
- family 列表
- 向导问题与选项
- 已启用 variants

### 9.2 `POST /api/calculate`

请求：

- `familyKey`
- `variantKey`
- `input`

返回：

- parsed input
- calculation summary
- formula result details
- product search filter
- recommended products
- explanation

关键要求：

- `calculation` 不能只保留筛选所需摘要
- 必须返回可渲染的公式结果明细结构

### 9.3 `POST /api/products/search`

请求：

- buyer quick filter 参数

返回：

- products
- total
- sort result

### 9.4 预留 API

- `POST /api/contact`
- 开发期 Excel 导入接口或脚本命令

### 9.5 Inquiry API

建议 API：

- `GET /api/inquiry`：获取当前用户草稿询盘清单
- `POST /api/inquiry/items`：加入询盘产品
- `PATCH /api/inquiry/items/[id]`：更新数量或备注
- `DELETE /api/inquiry/items/[id]`：移除询盘产品
- `POST /api/inquiry/submit`：提交询盘，发送邮件并入库

认证要求：

- 所有 inquiry 写操作都要求用户已快速登录
- 未登录时前端应先触发第三方登录，再继续原操作

提交邮件内容：

- 联系人信息
- 留言内容
- 所选产品列表：model、type/family、stroke、energy、force、thread、quantity、note
- 产品来源：engineer / buyer / product detail
- 工程师来源需包含 variantKey、关键输入、关键计算结果
- 采购来源需包含筛选条件
- locale、sourcePage、提交时间

## 10. 技术与架构约束

技术栈：

- Next.js App Router
- TypeScript
- Prisma
- PostgreSQL
- Zod
- Tailwind CSS
- shadcn/ui

代码分层：

- 页面层：展示与交互
- 组件层：表单与视图组件
- 应用服务层：编排 calculation / filtering / content assembly
- calculator 层：公式与结果生成
- repository / data access 层：Prisma 查询

禁止：

- 数据库查询、公式、UI 状态全部写在页面组件
- 前端直接复制 Excel 公式文本
- 19 个工况做成 19 个独立入口页面
- 第一版先做 CMS、权限、登录
- 新增不必要依赖

## 11. 多语言需求

目标 locale：

- `en`
- `zh-CN`
- `de`
- `fr`
- `it`

交付优先级：

1. `en` 作为公开默认语言
2. `zh-CN` 与英文版同步公开
3. `de` 只预留架构，默认跳转或 fallback 到 `en`
4. `fr` 只预留架构，默认跳转或 fallback 到 `en`
5. `it` 只预留架构，默认跳转或 fallback 到 `en`

路由策略：

- `/en/...`
- `/zh-cn/...`
- `/de/...`
- `/fr/...`
- `/it/...`

第一阶段范围：

- shared navigation
- page copy
- CTA
- buyer labels and messages
- engineer scenario labels and messages
- metadata title / description
- `html lang`
- locale-aware internal links
- `hreflang`
- `de` / `fr` / `it` 路径存在时不展示未完成翻译内容，默认转向或回退到 `en`

不应翻译：

- API 字段名
- calculator keys
- scenario keys
- Prisma enum values
- product model numbers

建议使用文件型翻译资源：

- `messages/en/...`
- `messages/zh-CN/...`
- `messages/de/...`
- `messages/fr/...`
- `messages/it/...`

翻译 key 应基于稳定业务含义，不要直接拿英文整句当 key。

## 12. SEO 需求

英文是第一版主要 SEO 语言。

核心定位关键词：

- industrial shock absorber selector
- shock absorber sizing tool
- hydraulic shock absorber selection
- industrial shock absorbers
- hydraulic shock absorbers
- shock absorber calculator

页面策略：

- 首页承接 category + brand + selector intent
- selector 页面承接 selection intent
- 产品家族页承接 product type intent
- 应用页承接 scenario / machinery intent
- guide 页承接 technical explanation intent

已确认实施方向：

- SEO URL 需要作为实际路由实施
- `/selector/engineer` 和 `/selector/buyer` 可以保留为工具型路径，但需要增加 SEO 入口路径承接自然搜索
- 产品、selector、application、guide 类页面应优先使用清洁英文 slug
- 旧路径或内部路径更新时需要通过 redirect 保持可访问性

SEO 内容字段应预留：

- seoTitle
- seoDescription
- seoH1
- canonicalUrl
- robots
- openGraphTitle
- openGraphDescription

产品结构化字段应覆盖：

- series
- model
- type
- stroke
- energyPerCycle
- energyPerHour
- impactVelocity
- effectiveWeight
- threadSize
- totalLength
- maxImpactForce
- maxThrustForce
- mountingDirection
- applicationType
- pdfCatalogUrl
- cadUrl

避免：

- 混合中英文 slug
- `/tool1/`、`/calc-v2/`、`/category-01/` 这类临时路径
- 未经验证的竞品替代和等效型号声明

## 13. 内容与文案需求

英文文案原则：

- 直接
- 工业化
- 选择路径清晰
- 少空话
- 少内部技术术语
- 先说产品能做什么，再说公司是谁

优先术语：

- industrial shock absorber
- hydraulic shock absorber
- shock absorber selection
- shock absorber sizing
- heavy-duty shock absorber
- vibration isolator
- wire rope vibration isolator

慎用：

- industrial damper
- machine damper

客户可见文案避免：

- implementation
- registry
- database
- PostgreSQL
- imported products
- raw data
- prototype
- MVP

可复用英文 CTA：

- Browse Products
- Start Sizing
- Find by Application
- Download Catalog
- Contact EKD
- See Matching Models

## 14. 视觉与交互要求

整体风格：

- 专业、克制、可信
- 产品发现效率高
- 信息密度适中
- 面向欧美工业客户
- 像现代工业技术平台，而不是传统企业宣传站

首页要求：

- 首屏必须出现找产品入口
- 第一屏同时可见 `Find Your Product` / `Browse Products` 和 `Start Sizing`
- 产品发现面板比公司介绍更重要
- 优先真实产品图和真实应用图

应避免：

- 中文传统工厂站大横幅 + 多排宫格
- 大面积高饱和渐变
- 过多科技蓝发光边框
- 普通 SaaS 卡片拼贴风
- 首屏只有公司介绍

## 15. 核心闭环

### 15.1 工程师闭环

`首页 / Sizing -> Engineer Sizing -> 选择工况 -> 输入参数 -> 计算 -> 查看结果明细 -> 查看推荐产品 -> 快速登录 -> 加入询盘 -> 联系表单提交`

### 15.2 采购闭环

`首页 / Products / Sizing -> Buyer Quick Filter -> 输入已知参数 -> 筛选型号 -> 比较结果 -> 快速登录 -> 加入询盘 -> 联系表单提交`

### 15.3 新访客闭环

`首页 -> Products / Solutions / Applications -> 理解产品与应用 -> 下载资料 / 联系 EKD / Start Sizing`

### 15.4 询盘产品闭环

`产品发现 / 选型 / 快筛 -> Add to Inquiry -> 快速登录 -> 询盘清单 -> 联系表单 -> 邮件发送 + 入库 + 产品关联记录`

## 16. 验收标准

MVP 完成时至少满足：

1. 项目可本地启动。
2. 数据库迁移可执行。
3. Excel “数据库”sheet 可导入 products。
4. Buyer 快速筛选页可按核心参数筛选产品。
5. Engineer 页能通过 5 个入口 + 向导匹配具体 variant。
6. 19 个底层工况 calculator 均可通过统一 `POST /api/calculate` 完成计算与推荐。
7. 工程师结果页展示公式结果明细，不只是推荐型号。
8. 产品目录、产品家族、产品详情路径可浏览。
9. 首页明确提供 Products / Solutions / Sizing 路径。
10. Downloads 和 Contact 可承接转化。
11. 代码分层清晰，新增工况不需要重写页面。
12. UI 不直接暴露 19 个 Excel sheet 入口。
13. 工程师和采购结果均可加入询盘产品。
14. 加入询盘和提交询盘前会触发快速登录。
15. 询盘提交邮件包含所选产品列表和来源上下文。
16. 询盘记录与产品建立数据库关联，支持未来后台展示。

多语言第一阶段满足：

1. 至少 `en` 和 `zh-CN` 可通过 locale-prefixed routing 渲染。
2. 导航、主页面文案、核心 CTA 可本地化。
3. buyer 和 engineer 关键标签可本地化。
4. metadata 和 `html lang` 跟随 locale。
5. 未翻译内容有默认语言 fallback。

## 17. 埋点与日志建议

建议记录：

- `page_view`
- `product_family_view`
- `product_detail_view`
- `buyer_filter_submit`
- `buyer_filter_no_results`
- `engineer_sizing_start`
- `scenario_variant_selected`
- `calculate_submit`
- `calculate_success`
- `calculate_failed`
- `recommended_product_click`
- `inquiry_add_item`
- `inquiry_remove_item`
- `inquiry_view`
- `inquiry_submit`
- `inquiry_submit_success`
- `inquiry_submit_failed`
- `download_click`
- `contact_form_submit`

SelectionLog 建议记录：

- locale
- user path type: engineer / buyer
- scenario family / variant
- normalized input
- calculation result
- generated filter
- matched product count
- selected product model
- no-match reason
- error reason

Inquiry / Contact 建议记录：

- userId
- inquiryId
- selected product ids and models
- sourceType: engineer / buyer / product_detail
- sourcePage
- scenarioVariantKey
- selectionLogId
- filterSnapshotJson
- calculationSnapshotJson
- message
- emailStatus

## 18. 分阶段交付计划

### Phase 1：项目与官网基础

- Next.js 项目可运行
- 全站 layout、header、footer
- 首页基础结构
- About / Products / Applications / Downloads / Contact 页面骨架
- 基础 SEO metadata

### Phase 2：内容模型与产品目录

- 产品家族内容配置
- 应用行业内容配置
- Products / family / detail 页面
- Solutions 页面
- 真实产品图或占位策略

### Phase 3：数据库与导入

- Prisma schema
- PostgreSQL
- Prisma Client
- `scripts/import-excel.ts`
- Excel 字段映射
- rawDataJson 保留
- row-level error log

### Phase 4：Buyer 快速筛选

- product repository
- product search service
- `POST /api/products/search`
- `/selector/buyer`
- 排序、清空、空状态、详情跳转

### Phase 5：Scenario Registry 与 Engineer 骨架

- 5 个前台入口
- 7 个 calculator family
- 19 个 variant 映射
- `GET /api/scenarios`
- Engineer 向导 UI
- 动态表单骨架

### Phase 6：全量 calculator 验证与加固

- calculator 接口
- 输入 Zod schema
- 单位换算与清洗
- 19 个底层工况 calculator 注册与实现
- `POST /api/calculate`
- 结果明细、筛选条件、推荐原因
- Excel 对照 fixture 与自动化回归测试补齐

### Phase 7：转化与本地化增强

- 产品详情完善
- 下载页资源接入
- 联系表单
- Contact Form 发邮件到 `sales@vibroabsorber.com` 并入库
- 下载资料前第三方快速登录
- 工程师和采购结果支持加入询盘产品
- 询盘清单下方复用 Contact Form
- 询盘提交邮件包含所选产品列表
- 询盘记录与产品建立关联关系
- 结果页 CTA
- `en` / `zh-CN` 同步公开
- `de` / `fr` / `it` 架构预留并默认 fallback 到 `en`
- SEO landing page 路由实施

## 19. 不阻塞但需要确认的问题

1. `Non-adjustable Shock Absorbers` 是否保留现名，还是公开主推 `Self-compensating Shock Absorbers`？
2. 产品照片和应用图片的最终素材来源是什么？
3. 可公开使用哪些专利、资质、寿命、客户和竞品替代声明？
4. 产品数据 canonical 分类字段的最终业务含义是什么？
5. Excel 中文字段到 Prisma 字段的完整映射表如何确定？
6. SEO URL 更新的首批页面范围和 redirect 规则。
7. PDF catalog 是否按语言区分？
8. 19 个 calculator variant 的 Excel 对照样例输入 / 输出和误差容忍标准。

## 20. 当前推荐决策

在未补充确认前，建议按以下默认决策推进：

- 英文为公开默认语言。
- `zh-CN` 与英文同步公开。
- 架构预留 `en`、`zh-CN`、`de`、`fr`、`it`，其中 `de` / `fr` / `it` 默认 fallback 到 `en`。
- 不做 CMS，使用静态内容配置 + PostgreSQL 产品数据。
- 不做完整会员系统和报价系统，但下载资料前需要第三方快速登录。
- Contact Form 提交后发邮件到 `sales@vibroabsorber.com` 并入库。
- 增加轻量询盘产品功能，类似购物车但不含价格、订单和支付。
- 工程师和采购流程中的加入询盘操作需要快速登录。
- 询盘提交时复用 Contact Form，并把所选产品写入邮件和数据库关联。
- 对外社交链接位为 X / Facebook / Instagram / LinkedIn，暂无账号先预留。
- SEO URL 作为实际路由实施，必要时保留旧路径 redirect。
- 产品发现优先于公司介绍。
- calculator 已按 19 个底层工况实现，后续优先补齐对照样例、回归测试和展示一致性。
- 所有 calculator 必须保持 Excel 原始输入与关键结果可核验。
- 产品分类逻辑逐步从 Excel 中文原始值转向 canonical code。
- calculator 验收采用“人工确认一次 Excel 标准答案 + 自动化回归测试长期守护”的方式。
