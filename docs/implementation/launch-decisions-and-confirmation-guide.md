# 上线前决策与内容确认指南

## 0. 文档定位

本文用于补齐网站 MVP 上线前仍需要业务确认的事项，并解释每项决策的意义、影响和建议选择。

已确认事项：

- 对外联系方式以 Contact Form 和社交链接为主。
- Social Links 包含 X / Facebook / Instagram / LinkedIn，暂无账号的后续补充。
- Contact Form 提交后发送到 `sales@vibroabsorber.com`，并同步入库。
- 下载资料前需要用户登录，优先支持 Google 等欧美常用第三方快速登录。
- 工程师选型、采购筛选和产品详情中支持加入询盘产品，类似购物车但不涉及下单。
- 加入询盘、查看询盘清单、提交询盘前需要快速登录。
- 询盘清单下方复用联系我们表单，提交邮件中必须包含所选产品。
- 询盘提交记录需要与产品建立关联，方便未来后台管理展示。
- `zh-CN` 与英文版同步公开。
- `de` / `fr` / `it` 只预留架构，默认跳转或 fallback 到 `en`。
- SEO URL 决策需要实施，部分页面路径需要更新。

## 1. 产品数据字段决策说明

### 1.1 为什么需要 `typeCode`

当前产品目录类别不等于 Excel 产品库类别。Excel 里的产品库并不完整，且当前 calculator 公式只针对 Absorber 选型。

因此产品数据至少要区分三件事：

1. 这个产品在网站产品目录里属于哪个类别。
2. 这个产品数据来自哪里、是否完整。
3. 这个产品是否允许被 absorber calculator 推荐。

Excel 原始分类可能是中文值，例如：

- `固定型`
- `可调型`

如果直接用这些中文值做筛选、分组和多语言展示，会产生问题：

- 英文、德文、法文、意大利文页面都依赖中文原始值。
- 后续 Excel 文案变动会影响网站逻辑。
- 产品分组、SEO 页面和筛选逻辑难以稳定。

`typeCode` 的意义是建立一个稳定的系统内部分类值。

示例：

| Display category | 建议 catalogCategoryCode | calculatorEligibility |
| --- | --- | --- |
| Adjustable Shock Absorber | `ADJUSTABLE_SHOCK_ABSORBER` | `ABSORBER_CALCULATOR` |
| Heavy Duty Shock Absorber | `HEAVY_DUTY_SHOCK_ABSORBER` | `ABSORBER_CALCULATOR` |
| Wire Rope Vibration Isolator | `WIRE_ROPE_VIBRATION_ISOLATOR` | `CATALOG_ONLY` |
| Heavy Industry Buffer | `HEAVY_INDUSTRY_BUFFER` | `CATALOG_ONLY` unless confirmed |
| Anti Impact Compound Vibration Isolator | `ANTI_IMPACT_COMPOUND_VIBRATION_ISOLATOR` | `CATALOG_ONLY` |
| Non-Adjustable Shock Absorber | `NON_ADJUSTABLE_SHOCK_ABSORBER` | `ABSORBER_CALCULATOR` |
| Super Long Life Shock Absorber | `SUPER_LONG_LIFE_SHOCK_ABSORBER` | `ABSORBER_CALCULATOR` |
| Vibration Isolation Solution | `VIBRATION_ISOLATION_SOLUTION` | `SOLUTION_ONLY` |
| Special Vibration Isolator | `SPECIAL_VIBRATION_ISOLATOR` | `CATALOG_ONLY` |
| Friction Spring Damper | `FRICTION_SPRING_DAMPER` | `CATALOG_ONLY` |
| Locking Assemblies & Coupling | `LOCKING_ASSEMBLIES_COUPLING` | `CATALOG_ONLY` |

决策问题：

1. Excel 中所有产品类型原始值分别映射到哪个 `catalogCategoryCode`？
2. 哪些类别可以被 absorber calculator 推荐？
3. Heavy Industry Buffer 是否属于 absorber calculator 可推荐范围，还是只做 catalog / inquiry？
4. 每个类别的数据来源是否完整？
5. 公开英文名是否使用上述业务名称，还是使用 SEO 更强的行业名称？

建议默认：

- 保留 Excel 原始 `type` 作为溯源字段。
- 新增 `catalogCategoryCode` / `catalogCategorySlug` 作为目录分组和多语言展示依据。
- 新增 `calculatorEligibility` 明确是否可被当前 absorber calculator 推荐。
- 新增 `catalogCoverageStatus` 表示产品数据是否完整。
- UI 不直接展示中文 Excel 原始分类。

### 1.2 为什么需要 `familySlug`

`familySlug` 或 `catalogCategorySlug` 用于决定产品属于哪个公开产品家族页。

示例：

| series / typeCode | familySlug | 页面 |
| --- | --- | --- |
| EK / EKL | `adjustable-shock-absorbers` | `/products/adjustable-shock-absorbers` |
| EN | `non-adjustable-shock-absorbers` | `/products/non-adjustable-shock-absorbers` |
| ED | `heavy-duty-shock-absorbers` | `/products/heavy-duty-shock-absorbers` |
| ES | `super-long-life-shock-absorbers` | `/products/super-long-life-shock-absorbers` |
| EI | `heavy-industry-buffers` | `/products/heavy-industry-buffers` |

`familySlug` 的意义：

- 支持产品详情页归属到正确家族。
- 支持 SEO 友好 URL。
- 支持产品家族页自动列出代表型号。
- 支持筛选结果跳转到正确详情路径。

决策问题：

1. 是否以型号前缀作为家族映射依据？
2. 同一型号前缀是否可能跨多个产品家族？
3. `Non-adjustable` 是否保留为 slug，还是使用 `self-compensating-shock-absorbers`？
4. Excel 未覆盖的类别是否先用手动 catalog 内容创建家族页？

建议默认：

- 先按系列前缀映射 `familySlug`。
- 若 Excel 明确有类型字段，以类型字段优先、系列前缀兜底。
- `familySlug` 第一版保持英文稳定 slug，不做多语言 slug。
- 对不在 Excel 产品库中的类别，先用 `MANUAL_CONTENT` 或 `CATALOG_PDF` 作为数据来源，不进入 absorber calculator 推荐结果。

## 2. SEO URL 决策说明

### 2.1 为什么需要更新路径

当前功能路径如 `/selector/engineer` 和 `/selector/buyer` 适合产品内部结构，但不一定是最佳 SEO URL。

搜索用户更可能搜索：

- shock absorber selector
- shock absorber sizing tool
- hydraulic shock absorber selection
- industrial shock absorbers
- adjustable shock absorber
- rotary motion shock absorber sizing

因此需要增加或更新部分页面路径，让 URL 本身与搜索意图一致。

### 2.2 建议首批 SEO URL

核心入口：

| 页面意图 | 建议 URL | 说明 |
| --- | --- | --- |
| 首页 | `/en` | 默认英文首页 |
| 主选型入口 | `/en/shock-absorber-selector` | 承接 selector SEO |
| 计算器入口 | `/en/shock-absorber-calculator` | 可指向同一工具或解释页 |
| 工程师选型 | `/en/selector/engineer` | 工具型路径保留 |
| 采购快筛 | `/en/selector/buyer` | 工具型路径保留 |
| 产品目录 | `/en/products` | 产品目录 |
| 工业缓冲器目录 | `/en/industrial-shock-absorbers` | 可做 SEO landing page |
| 液压缓冲器目录 | `/en/hydraulic-shock-absorbers` | 可做 SEO landing page |

产品家族：

| 家族 | 建议 URL |
| --- | --- |
| Adjustable Shock Absorbers | `/en/products/adjustable-shock-absorbers` |
| Non-adjustable Shock Absorbers | `/en/products/non-adjustable-shock-absorbers` |
| Heavy Duty Shock Absorbers | `/en/products/heavy-duty-shock-absorbers` |
| Super Long Life Shock Absorbers | `/en/products/super-long-life-shock-absorbers` |
| Heavy Industry Buffers | `/en/products/heavy-industry-buffers` |
| Wire Rope Vibration Isolators | `/en/products/wire-rope-vibration-isolators` |

选型场景：

| 场景 | 建议 URL |
| --- | --- |
| Linear free motion | `/en/selector/linear-free-motion` |
| Linear force driven | `/en/selector/linear-force-driven` |
| Linear motor driven | `/en/selector/linear-motor-driven` |
| Linear cylinder driven | `/en/selector/linear-cylinder-driven` |
| Rotary motion | `/en/selector/rotary-motion` |

### 2.3 Redirect 规则

如果已有页面路径被替换，不应该直接断开。

建议：

- 旧路径保留 redirect 到新路径。
- 工具型路径可保留，不一定全部替换。
- SEO landing page 可以作为入口页，再链接到工具页。

示例：

| 旧路径 | 新路径 |
| --- | --- |
| `/selector/engineer` | `/en/selector/engineer` |
| `/selector/buyer` | `/en/selector/buyer` |
| `/shock-absorber-selector` | `/en/shock-absorber-selector` |
| `/products/adjustable-shock-absorbers` | `/en/products/adjustable-shock-absorbers` |

## 3. 需要明确的内容清单

### 3.1 公司与联系方式

已确认：

- Contact Form
- X / Facebook / Instagram / LinkedIn
- Contact Form 发往 `sales@vibroabsorber.com`
- Contact Form 入库

仍需补充：

- X 账号 URL
- Facebook 账号 URL
- Instagram 账号 URL
- LinkedIn 公司页 URL
- 是否公开电话、地址、邮箱
- 是否保留 `office@ekdchina.com` 作为备用或历史邮箱

### 3.2 表单字段

建议 Contact Form 字段：

- name
- company
- email
- countryOrRegion
- phone
- inquiryType
- productOrModel
- application
- message
- sourcePage
- locale

从询盘清单提交时，表单还应隐式关联：

- inquiryId
- selectedProducts
- productModels
- itemQuantities
- itemNotes
- sourceType: engineer / buyer / product_detail
- scenarioVariantKey
- selectionLogId
- filterSnapshotJson
- calculationSnapshotJson

需要决策：

- 电话是否必填？
- 国家/地区是否必填？
- 是否需要附件上传？
- 是否需要用户勾选隐私政策？

已确认：

- 如果本次联系来自询盘清单，邮件中需要展示所选产品。
- 入库记录需要保留联系表单与所选产品的关联关系。

### 3.3 下载登录

已确认：

- 下载资料前需要登录。
- 优先支持 Google 等欧美常用第三方快速登录。

需要决策：

- 是否只支持 Google，还是同时支持 Microsoft / LinkedIn？
- 登录后是否允许立即下载，还是需要邮箱验证？
- 下载记录是否用于销售跟进？
- 是否需要用户同意订阅营销邮件？

建议默认：

- MVP 先支持 Google。
- 登录后可立即下载。
- 下载记录入库。
- 营销订阅必须单独勾选，不能默认同意。

### 3.4 询盘产品登录与提交

已确认：

- 工程师选型结果和采购筛选结果都可以把产品加入询盘。
- 询盘产品功能类似购物车，但目的只是联系销售，不涉及价格、订单、支付。
- 用户在加入询盘、查看询盘清单或提交询盘前需要快速登录。
- 询盘清单下方显示联系我们表单。
- 邮件中需要能看到本次联系我们所选产品。
- 数据库记录需要保留询盘与产品的关联关系，便于未来后台管理展示。

推荐交互：

1. 用户在工程师推荐列表或采购结果表点击 `Add to Inquiry`。
2. 如果未登录，先弹出 Google 等第三方快速登录。
3. 登录成功后继续执行加入询盘动作。
4. 页面显示已加入状态和询盘数量。
5. 用户进入询盘清单。
6. 询盘清单下方显示 Contact Form。
7. 提交后发送邮件到 `sales@vibroabsorber.com`，并将联系表单、询盘、询盘产品一起入库。

建议数据关系：

- `User` 一对多 `Inquiry`
- `Inquiry` 一对多 `InquiryItem`
- `InquiryItem` 多对一 `Product`
- `Inquiry` 可关联一个 `ContactSubmission`
- `ContactSubmission` 可通过 `Inquiry` 展示本次所选产品

建议邮件内容：

- 联系人姓名、公司、邮箱、电话、国家/地区
- 用户留言
- 所选产品列表
- 每个产品的 model、family/type、核心参数、数量、备注
- 产品来源：engineer / buyer / product detail
- 如果来源是 engineer，包含 variantKey、关键输入、关键计算结果或推荐原因
- 如果来源是 buyer，包含筛选条件
- locale、sourcePage、提交时间

需要决策：

- 是否允许未登录用户先本地暂存询盘，提交前再登录？
- 询盘产品是否需要 quantity，还是只做型号列表？
- 同一产品重复加入时，是增加数量还是保持一条记录？
- 是否允许用户给每个产品写备注？
- 提交成功后是否清空询盘清单？

建议默认：

- MVP 要求加入前登录，减少匿名本地状态复杂度。
- 支持 quantity，默认 1。
- 同一产品重复加入时保持一条记录并可更新 quantity。
- 支持 item note。
- 提交成功后将 inquiry 状态改为 `SUBMITTED`，新建空草稿询盘。

### 3.5 产品分类与命名

需要确认：

- `Non-adjustable Shock Absorbers` 是否继续作为公开主名称？
- 是否在 SEO 页面使用 `Self-compensating Shock Absorbers`？
- 每个 Excel 产品类型如何映射到 `typeCode`？
- 每个系列前缀如何映射到 `familySlug`？

建议默认：

- 产品导航保留旧站名称 `Non-adjustable Shock Absorbers`。
- 文案中补充 `Self-compensating / non-adjustable models`。
- SEO landing page 可后续使用 `/self-compensating-shock-absorbers`，但需确认后实施。

### 3.6 产品类别图文介绍来源

已确认：

- 产品类别的图文介绍可以参考本地英文网站。

优先来源：

- `lib/products/catalog-master-data.ts`
- `/en/products`
- `/en/products/[familySlug]`

使用范围：

- category heading
- tag
- summary
- description
- intended-use guidance
- page section hierarchy

图片规则：

- 本地英文网站已有产品或类别图片时优先复用。
- 本地图片缺失时，从 official catalog、PDF、产品手册或人工确认素材补充。
- 没有确认图片时，记录为 `pending_image_source`，不要用无关工业图库图替代。

注意：

- 本地英文网站可作为图文内容来源。
- 但 calculator 适用范围仍由 `calculatorEligibility` 决定，不能因为产品在本地英文站出现就默认支持 calculator 选型。

### 3.7 公开宣传边界

以下内容发布前必须确认：

- 专利数量
- ISO9001 / ROHS / CE 证书是否有效
- 高新技术企业等资质是否可公开
- 军工、保密、特殊资质是否适合海外官网公开
- 具体客户名称是否可公开
- 生命周期、次数、故障率等性能数字
- “替代进口”或竞品替代声明
- “比竞品高 30%” 等对比性表达

建议默认：

- 未确认前不公开具体数字和竞品对比。
- 可使用更稳妥表达，例如 `engineering support`、`application review`、`quality and compliance references`。

### 3.8 图片和资料

需要确认：

- 产品图片是否允许公开使用？
- 应用场景图片是否为 EKD 自有或授权？
- PDF catalog 是否按语言区分？
- 旧 catalog 是否需要更新后再上线？
- 下载文件是否需要版本号和发布日期？

建议默认：

- 使用已确认版权的真实产品图。
- 对不确定图片先用中性占位或不展示。
- PDF 资源记录 `title`、`locale`、`version`、`fileUrl`、`updatedAt`。

## 4. Calculator 验收方式

### 4.1 是否需要人工确认？

需要，但只需要在建立标准答案时人工确认，不应依赖每次人工复查。

推荐方式：

1. 从 Excel 中选出每个已实现 variant 的典型输入。
2. 由人工在 Excel 中确认对应输出结果。
3. 把输入和输出整理成 fixture。
4. 在代码中写自动化回归测试。
5. 后续每次改 calculator，自动测试判断是否仍与 Excel 标准答案一致。

也就是说：

- 第一次需要人工确认 Excel 是标准答案。
- 后续验证应自动化。

### 4.2 为什么不能只靠人工？

只靠人工的问题：

- 每次改公式都要重新检查，成本高。
- 容易漏掉边界情况。
- 不利于守护当前已实现的 19 个底层工况。

自动化测试的价值：

- 快速发现公式偏差。
- 保证 refactor 不改变已确认行为。
- 让新增工况有统一验收模板。

### 4.3 每个 calculator 建议准备的样例

当前 19 个底层工况已实现，验证重点应从“是否实现”转为“是否与 Excel 标准答案一致”。

最低要求：

- 每个 variant 至少准备 1 组 Excel 对照 fixture。
- 19 个 variant 至少需要 19 组基础样例。

推荐要求：

每个高频或高风险工况准备 3 类样例：

1. 正常典型工况
2. 边界工况，例如低速、低质量、单个 absorber
3. 高负载或高频工况，用于验证筛选条件和能量每小时

理想状态是 19 个 variant 都具备 3 类样例，即 57 组 fixture。MVP 上线前至少应先做到 19 组全量覆盖，并优先给工程师常用工况补到 3 组。

### 4.4 样例字段格式

建议记录：

```ts
type CalculatorFixture = {
  variantKey: string;
  description: string;
  input: Record<string, number | string>;
  expected: {
    kineticEnergyNm?: number;
    workEnergyNm?: number;
    totalEnergyPerCycleNm: number;
    totalEnergyPerHourNm: number;
    requiredStrokeMm?: number;
    propellingForceN?: number;
    impactVelocityMs?: number;
    decelerationMs2?: number;
  };
  tolerance: {
    relativePercent: number;
    absoluteValue?: number;
  };
  source: {
    workbook: string;
    sheetName: string;
    confirmedBy: string;
    confirmedAt: string;
  };
};
```

### 4.5 需要业务确认的问题

1. Excel 是否被视为第一版 calculator 的唯一标准答案？
2. 每个 variant 的典型输入由谁提供？
3. 输出误差容忍度是多少？例如 0.1%、1%、或按小数位取整。
4. Excel 中是否有隐藏单元格、人工修正或非公式值需要注意？
5. 产品推荐筛选也要完全对齐 Excel，还是 calculator 数值先对齐、筛选逻辑按线上产品库实现？

建议默认：

- Excel 是第一版公式标准答案。
- 计算结果允许极小浮点误差。
- 展示值可按 UI 规则四舍五入，但测试应使用未格式化数值。
- 产品筛选逻辑以线上 `ProductSearchFilter` 为准，但阈值来源必须来自 calculator 结果。

## 5. 推荐下一步

1. 先确认产品数据 `typeCode` / `familySlug` 映射表。
2. 决定首批 SEO URL 和 redirect 范围。
3. 确认社交账号 URL，没有的先置空并隐藏或显示占位。
4. 确认 Contact Form 必填字段。
5. 确认询盘产品默认规则：重复加入、quantity、item note、提交后是否清空。
6. 从 Excel 导出 19 个 calculator variant 的基础对照样例，至少每个 variant 1 组。
7. 确认哪些强宣传内容可公开，未确认的不上线。
