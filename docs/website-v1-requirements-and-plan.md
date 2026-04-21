# 网站第一版需求整理与开发计划

## 0. 文档定位与使用方式

这份文档是当前仓库的主计划文档，用于整合产品目标、信息架构、页面范围与分阶段交付顺序。

在 oh-my-codex / Codex 会话中，建议按下面顺序读取：

1. `AGENTS.md`
2. `docs/README.md`
3. `docs/implementation/omx-workspace-guide.md`
4. 当前这份文档
5. 再按任务需要补充读取 `docs/source-materials/*`、`docs/content/*`、`docs/implementation/multilingual-requirements.md`

文档分工约定：

- 原始需求源保留在 `docs/source-materials/`
- 当前执行和会话协作规则保留在 `docs/implementation/omx-workspace-guide.md`
- 内容与命名素材保留在 `docs/content/`
- 已失效或仅作追溯的资料移入 `docs/archive/`

## 1. 项目定位

第一版不是单纯的在线选型工具，而是一个面向欧洲与北美客户的工业官网 MVP，包含以下三类核心能力：

1. 公司与品牌介绍
2. 产品介绍与产品目录
3. 在线选型与快速筛选

建议第一版主语言使用英文，中文作为内部整理语言或后续多语言版本预留。原因如下：

- 目标客户主要是欧洲及北美客户
- 现有老站已经具备英文内容基础
- SEO 文档明确建议英文为首发主语言

第一版建议对外定位为：

`EKD corporate website + product catalog + shock absorber sizing MVP`

## 2. 需求来源整理

当前需求来源主要包括以下几类：

- `docs/README.md`
- `docs/implementation/omx-workspace-guide.md`
- `docs/source-materials/PRD.md`
- `AGENTS.md`
- `docs/source-materials/SCENARIO_DESIGN.md`
- `schema.prisma`
- `docs/content/website-copy-sourcebook.md`
- `docs/source-materials/EKD_SEO_keyword_strategy_en_markets.md`
- `data/选型程序算法.xlsx`
- `data/EKD全本样册.pdf`
- `data/隔振器综合样本2024.pdf`
- `data/EKD产品知识培训V1.pptx`
- `data/EKD产品知识培训V2.pptx`
- 老站 `http://ekdcn.com/`

这些资料共同指向一个统一方向：

- 网站不是展示型营销首页优先，而是“产品目录 + 选型工具 + 应用内容”优先
- 选型功能是差异化核心，但第一版必须同时具备完整官网表达能力
- 页面和数据结构要服务于后续逐步扩展，而不是只做一个临时 demo

历史启动提示稿和早期执行快照已经移入 `docs/archive/`，不再作为当前会话的优先阅读材料。

## 3. 第一版产品目标

第一版要解决四个核心问题：

1. 让海外客户快速理解 EKD 是做什么的、产品覆盖哪些方向、适合哪些行业
2. 让客户能浏览产品分类和基础技术参数
3. 让工程师和采购人员分别进入不同的选型路径
4. 让现有 Excel 选型逻辑开始迁移到线上架构中，并先跑通最小闭环

基于当前目标，第一版的真实优先级应调整为：

1. 让来找产品的用户尽快找到合适产品
2. 让用户理解不同产品之间的差异、参数范围和适用工况
3. 让工程师和采购人员进入不同的筛选和选型路径
4. 用公司介绍、资质、应用经验和服务能力建立信任

因此，第一版的信息架构不应沿用传统企业官网“公司介绍优先”的思路，而应采用“产品发现优先，品牌信任辅助”的结构。

## 4. 第一版用户角色

### 4.1 工程师

关注点：

- 工况判断是否正确
- 计算过程是否可信
- 推荐型号的依据是否清晰
- 参数和单位是否专业

需要看到：

- 向导式工况选择
- 动态输入表单
- 计算结果
- 筛选逻辑
- 推荐产品与推荐原因

### 4.2 采购人员

关注点：

- 是否能快速找到可采购型号
- 型号之间差异是否清晰
- 规格、尺寸、螺纹、能量参数是否方便对比

需要看到：

- 快速筛选入口
- 尽量少输入字段
- 清晰结果表格
- 便于联系销售或下载资料

### 4.3 新访客 / 潜在客户

关注点：

- 公司是否可靠
- 产品线是否完整
- 是否有相关行业经验
- 是否方便联系和索取资料

需要看到：

- 公司介绍
- 产品分类
- 应用行业
- 资质能力
- 下载与联系入口

## 5. 第一版站点结构

建议采用以下信息架构：

### 5.1 顶层导航

- Products
- Solutions
- Sizing
- Applications
- Downloads
- About
- Contact

`News` 可暂时不列入第一版必做页面，如需保留可仅作为后续扩展位。

导航建议按用户任务优先级排序，而不是按传统官网顺序排序：

1. Products
2. Solutions
3. Sizing
4. Applications
5. Downloads
6. About
7. Contact

`Home` 可以通过 Logo 返回，不一定要作为最高优先级导航项。

### 5.2 页面清单

- `/`
- `/about`
- `/products`
- `/products/[familySlug]`
- `/products/[id]`
- `/solutions`
- `/applications`
- `/selector/engineer`
- `/selector/buyer`
- `/downloads`
- `/contact`

## 6. 页面级需求

### 6.1 首页 `/`

目标：

- 让用户在进入首页后的最短时间内进入“找产品”路径
- 先帮助用户判断自己该从产品、应用、工况还是快速筛选进入
- 把“找到合适产品”作为首页第一优先级
- 把在线选型作为产品发现主引擎，而不是孤立功能页

内容模块：

- Hero 区：品牌定位语 + 主 CTA
- 首屏增加 Product Discovery Panel
- Hero 下方增加独立的 Sizing Entry Strip，直接承接工程师和采购用户
- 核心产品家族入口
- 增加按应用找产品入口
- 强化两类选型入口：Engineer Sizing / Buyer Quick Filter
- 五类工况分类说明
- 重点行业应用展示
- 产品比较优势与选型说明
- 公司能力与信任信息
- 下载样册 CTA
- 联系销售 CTA

首页建议把“找产品”与“在线选型”一起做成首屏主结构，而不是先讲公司介绍。

建议的首屏结构：

1. 左侧：品牌定位、核心产品能力、适用范围
2. 右侧：找产品入口面板
3. Hero 下方：三条快捷路径 + 5 个工况入口概览

三条快捷路径建议为：

- Browse by Product Family
- Find by Application
- Start Sizing

建议的 CTA 层级：

- Primary CTA：Find Your Product
- Secondary CTA：Start Sizing
- Tertiary CTA：Browse Products

首页首屏建议增加一个“从哪里开始”的入口面板，例如：

- I know the product type
- I know the application
- I know the motion scenario
- I just need a quick shortlist

对应跳转建议：

- 产品类型明确 -> `/products`
- 应用明确 -> `/solutions` 或 `/applications`
- 工况明确 -> `/selector/engineer`
- 只想快速筛选 -> `/selector/buyer`

建议新增首页重点模块：

- Selector Highlight Section
- Product Finder Section

`Product Finder Section` 应优先于公司介绍模块出现。

该模块用于明确告诉用户：

- Engineers can calculate sizing requirements
- Buyers can filter suitable models quickly
- The platform supports linear and rotary motion scenarios

如果导航里只有一个 `Sizing`，首页中仍然建议拆成两个清晰按钮：

- Engineer Sizing
- Buyer Quick Filter

同时建议在首页首屏增加一个简短说明：

- Not sure which model fits your motion scenario? Start with EKD sizing.

建议主文案方向：

- Industrial shock absorber selection and sizing platform
- Shock absorbers, heavy duty buffers and vibration isolation solutions

首页前两屏不建议大篇幅讲公司历史，建议把公司介绍压缩成一个较短的 “Why EKD” 模块即可。

### 6.2 公司介绍页 `/about`

目标：

- 建立信任，说明公司能力与技术背景

内容模块：

- Company Profile
- Main qualifications and achievements
- Production equipment
- Test equipment
- Services and engineering support
- Contact and response capability

可提炼信息来源：

- 老站 About 页
- 培训资料中的产品能力与行业背景

### 6.3 产品中心 `/products`

目标：

- 让用户以最快方式按产品类别和关键特性进入合适的产品范围

内容模块：

- 产品家族总览
- 每个家族的简介
- 典型应用
- 核心参数范围或选型提示
- 进入家族详情页

第一版优先展示以下家族：

- Adjustable Shock Absorber
- Non-adjustable Shock Absorber
- Heavy Duty Shock Absorber
- Super Long Life Shock Absorber
- Heavy Industry Buffer
- Wire Rope Vibration Isolator
- Special Vibration Isolator
- Vibration Isolation Solution

### 6.4 产品家族详情页 `/products/[familySlug]`

目标：

- 介绍一类产品的价值、特点、适用场景与代表型号

内容模块：

- 家族简介
- 核心特性
- 适用工况
- 重点参数
- 典型应用
- 代表型号或型号列表
- 下载资料 / 联系销售

### 6.5 产品详情页 `/products/[id]`

目标：

- 作为单型号技术信息页，同时承接筛选结果跳转

内容模块：

- 基础参数
- 应用说明
- 技术字段
- 原始数据映射
- 相关推荐

### 6.6 应用页 `/applications`

目标：

- 告诉用户 EKD 擅长哪些行业和使用场景

第一版建议做成聚合页，不必一次性拆很多独立子页。

`Applications` 更适合作为“展示我们懂行业和场景”的内容页；真正帮助用户找产品的主要入口建议通过首页和 `Solutions` 页承担。

优先展示的应用方向：

- PET blowing machine
- Automotive assembly / welding / stamping
- Tire machinery
- Port crane / lifting machinery
- Automated warehouse / stacker crane
- Railway end-stop safety
- Paper machinery
- Industrial automation

### 6.7 工程师选型页 `/selector/engineer`

目标：

- 通过向导选择正确工况，并完成计算与推荐

流程：

1. 选择 5 个上层工况入口之一
2. 回答向导问题
3. 自动匹配到底层 `variantKey`
4. 渲染对应动态表单
5. 执行计算
6. 返回计算值、筛选条件、推荐型号、推荐原因

第一版只实现 3 个示例工况：

- `linear-free-horizontal`
- `linear-motor-horizontal`
- `linear-free-vertical-drop`

### 6.8 采购筛选页 `/selector/buyer`

目标：

- 不经过复杂工况计算，直接按产品参数筛选型号

筛选字段：

- type
- strokeMm
- energyPerCycleNm
- energyPerHourNm
- maxImpactForceN
- maxThrustForceN
- totalLengthMm
- threadSize

页面结构：

- 顶部筛选区
- 中部结果表格
- 支持排序
- 支持清空
- 支持进入产品详情页

### 6.9 下载页 `/downloads`

目标：

- 集中承接样册、技术资料、产品资料下载

第一版可先挂载以下资料：

- 全本样册
- 隔振器样本
- 后续补更多产品 PDF

### 6.10 联系页 `/contact`

目标：

- 形成询盘转化入口

内容模块：

- 公司邮箱
- 销售邮箱
- 技术支持邮箱
- 联系表单
- 地区支持说明

### 6.11 Solutions 页 `/solutions`

目标：

- 作为“按场景找产品”的核心入口页
- 服务那些不知道具体型号、但知道应用和问题类型的用户

内容模块：

- 按行业找产品
- 按运动形式找产品
- 按驱动方式找产品
- 跳转到产品家族页或选型页

这个页面在第一版中应被视为高优先级页面，而不是可有可无的辅助页。

## 7. 选型功能范围

### 7.1 前台只暴露 5 个工况入口

1. Linear Motion · Free Motion
2. Linear Motion · Force Driven
3. Linear Motion · Motor Driven
4. Linear Motion · Cylinder Driven
5. Rotary Motion

### 7.2 后台按 7 个 calculator family 组织

1. `linear_free_motion`
2. `linear_force_driven`
3. `linear_motor_driven`
4. `linear_cylinder_driven`
5. `rotary_load`
6. `rotary_beam_or_gate`
7. `rotary_table`

### 7.3 第一版已实现目标

- 完整 registry 架构支持 19 个底层工况映射
- 只落地 3 个 calculator 样例

## 8. 数据与内容模型建议

### 8.1 必要数据实体

- `Product`
- `ProductFamily`
- `ScenarioFamily`
- `Scenario`
- `SelectionLog`
- `DownloadAsset`
- `ApplicationCategory` 或本地内容配置

### 8.2 产品字段

沿用现有 schema 中的核心字段：

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

### 8.3 内容管理策略

第一版不建议先做 CMS，建议采用“静态内容配置 + 数据库产品数据”的混合方案：

- 公司介绍、应用说明、产品家族文案、下载列表：使用本地内容配置文件维护
- 产品型号与筛选参数：使用 PostgreSQL + Prisma 管理
- 这样可最快上线，同时便于后续再接 CMS

## 9. 技术方案

技术栈保持不变：

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- PostgreSQL
- Zod

代码分层要求保持如下：

- 页面层：负责展示与交互
- 组件层：表单与视图组件
- 服务层：编排 calculation / filtering / content assembly
- calculator 层：只负责公式与结果生成
- repository 层：负责 Prisma 查询

禁止事项保持不变：

- 不把数据库查询、公式、UI 状态混写在页面组件
- 不直接平铺 19 个工况页面
- 不把 Excel 公式原样写入前端
- 不在第一版先做 CMS、权限、登录

## 10. 视觉与设计方向

第一版的视觉风格应面向欧洲和北美工业客户，而不是延续传统中文企业官网的表达方式。

整体设计目标：

- 专业、克制、可信
- 产品发现效率高
- 信息密度适中，但不拥挤
- 看起来像现代工业技术平台，而不是传统企业宣传页

### 10.1 视觉基调

- 偏现代工业风，不做花哨营销感
- 强调真实产品、应用场景、参数和路径清晰度
- 页面应给人“工程可靠、技术清楚、购买路径明确”的感受
- 首页首屏像一个产品发现入口，而不是公司庆典海报

### 10.2 欧美用户更偏好的表现方式

- 文案短、直、明确，少空话套话
- 先讲产品能做什么，再讲公司是谁
- 版式更重视留白、层级、对齐和节奏
- 少用密集边框、彩色模块堆叠和传统 banner 风格
- 多用大图、真实产品图、应用图和干净的参数结构
- CTA 明确，不要一个区域放过多按钮

### 10.3 首页风格要求

- 第一屏必须直接出现找产品入口
- 第一屏同时可见 `Find Your Product` 和 `Start Sizing`
- 视觉焦点应集中在产品发现面板，而不是公司介绍段落
- 使用大面积整洁留白和明确网格，不做卡片瀑布流
- 尽量用真实产品图或真实工业应用图作为视觉锚点

### 10.4 页面风格要求

- Products、Solutions、Sizing 页面优先考虑可扫描性
- 参数、标签、路径、入口要一眼可理解
- About 页保持简洁，更多承担信任背书作用，不要做成长篇文字墙
- Downloads 和 Contact 页保持实用，不做装饰性布局

### 10.5 排版建议

- 使用 1 到 2 套字体，不要过多变化
- 英文标题应简洁有力量，避免冗长句子
- 大标题负责传达方向，小字负责补充说明
- 每个 section 只做一件事，不要在同一区块同时讲产品、公司、应用、下载四件事

### 10.6 色彩建议

- 主色建议围绕深色中性、工业灰、金属感色系，再配 1 个明确品牌强调色
- 避免大面积高饱和渐变
- 避免紫色系 SaaS 风格
- 重点动作按钮和状态色要稳定统一

### 10.7 组件与布局建议

- 默认不要到处使用卡片
- 卡片只在确实需要点击选择或承载独立对象时使用
- 尽量使用分栏、列表、对比区、媒体区、参数表，而不是满屏卡片
- 表格、筛选器、参数区要比宣传组件更重要

### 10.8 图片与素材建议

- 优先使用真实产品图
- 优先使用真实应用场景图
- 避免廉价图库风格和假 3D 科技背景
- 避免图上带复杂文字和过多水印
- 如果首屏没有真实视觉锚点，页面高级感会明显下降

### 10.9 动效建议

- 动效要少，但要有存在感
- 适合做轻量级进入动画、滚动显现、hover 强化
- 不做复杂营销动画
- 动效主要用于强化层级和交互反馈，而不是制造热闹感

### 10.10 明确避免的风格

- 中文传统工厂站风格的大横幅加多排宫格入口
- 过多蓝色渐变、发光边框、科技网格背景
- 过于密集的“公司简介 + 资质 + 新闻 + 联系方式”首页堆叠
- 首屏只有公司介绍，没有产品发现入口
- 像通用 SaaS 模板那样的卡片拼贴首页

## 11. 内容提炼结果

### 11.1 可直接用于官网的公司信息

老站 About 页可直接提供这些基础信息：

- 公司名：Jiangsu EKD Machinery Technical Co., Ltd.
- 方向：vibration control / noise reduction / shock absorption
- 经验：军工与民用领域经验
- 团队：30+ employees，核心团队 15+ 年行业经验
- 资质：ISO9001、ROHS、CE
- 专利：发明专利、外观专利、实用新型专利、软件著作权

### 11.2 可直接用于官网的产品能力卖点

来自培训资料：

- 平稳减速曲线
- 低终端速度
- 适应高冲击重量、高冲击力、高驱动力工况
- 高频冲击与长寿命能力
- 支持特殊设计与定制
- 可提供结构计算与优化方案

### 11.3 可直接用于官网的行业应用

来自培训资料：

- PET blowing machine
- Automotive manufacturing
- Tire machinery
- Port machinery
- Automated warehouse
- Railway safety
- Paper machinery
- Industrial automation

## 12. 分阶段开发计划

### Phase 1：项目初始化与基础框架

目标：

- 完成可运行站点骨架和基础技术栈

任务：

- 初始化 Next.js 项目
- 接入 Tailwind、shadcn/ui、Prisma、Zod
- 建立基础目录结构
- 搭建全站 Layout、Header、Footer
- 配置基础 SEO metadata

交付：

- 首页基础框架可访问
- 顶层导航与全局样式可用

### Phase 2：内容模型与官网页面

目标：

- 让网站具备“官网可浏览”的基本能力

任务：

- 建立产品家族内容配置
- 建立应用行业内容配置
- 创建 About、Products、Applications、Downloads、Contact 页面
- 首页加入公司、产品、应用、选型入口内容

交付：

- 用户可完整浏览品牌、产品和应用内容

### Phase 3：数据库与产品导入

目标：

- 完成 Excel 数据到线上产品库的迁移

任务：

- 完成 Prisma schema 迁移
- 初始化 Prisma Client
- 编写 `scripts/import-excel.ts`
- 导入 Excel “数据库” sheet
- 记录失败行，不影响全量导入

交付：

- 产品数据可被查询和展示

### Phase 4：Buyer 快速筛选

目标：

- 打通采购用户路径

任务：

- 创建 `product-repository.ts`
- 创建 `product-search-service.ts`
- 实现 `POST /api/products/search`
- 完成 `/selector/buyer`

交付：

- 可按核心参数筛选产品并查看结果

### Phase 5：Scenario Registry 与工程师骨架

目标：

- 建立可扩展的工况路由架构

任务：

- 实现 `scenario-registry.ts`
- 录入 5 个前台入口
- 建立 7 个 family
- 映射 19 个底层 variant
- 实现 `GET /api/scenarios`
- 完成工程师页骨架

交付：

- 工程师可通过向导进入指定 variant

### Phase 6：3 个示例 calculator

目标：

- 打通最小计算闭环

任务：

- 实现统一 calculator 接口
- 实现 3 个样例 calculator
- 实现 `POST /api/calculate`
- 返回计算值、筛选条件、推荐产品、解释说明

交付：

- 选型流程可从输入走到推荐结果

### Phase 7：详情页、下载与转化增强

目标：

- 增强官网完整度与询盘转化能力

任务：

- 产品详情页完善
- 下载页接入文件
- 联系表单与 CTA 完善
- 结果页增加联系销售与下载资料入口

交付：

- 第一版具备内容浏览、产品筛选、工程师选型、资料下载、联系转化能力

## 13. 详细开发待办

以下待办适合作为实际开发时的执行清单。

### 13.1 信息架构与导航

- 确定站点英文主导航：Products / Solutions / Sizing / Applications / Downloads / About / Contact
- 让 `Products` 和 `Solutions` 成为最靠前的入口
- 在 Header 中突出 `Sizing`，建议使用按钮样式而不是普通文本链接
- 明确 `Sizing` 下分流到：
  - `/selector/engineer`
  - `/selector/buyer`
- Footer 中补充公司介绍摘要、产品入口、资料下载、联系信息

### 13.2 首页待办

- 设计首页 Hero，第一屏直接体现“找产品”能力
- 在 Hero 区放置主按钮 `Find Your Product`
- 在首屏加入 Product Discovery Panel
- 在首屏同时放两个快速入口：
  - `Engineer Sizing`
  - `Buyer Quick Filter`
- 增加 `Browse by Product Family`
- 增加 `Find by Application`
- 增加 5 个工况入口概览模块
- 增加“Why EKD”模块，突出技术、质量、交付、工程支持
- 增加行业应用模块
- 增加产品家族总览模块
- 增加下载样册和联系销售 CTA

首页交互优先级建议：

1. Find Your Product
2. Start Sizing
3. Browse Products
4. Download Catalog
5. Contact Sales

### 13.3 About 页待办

- 整理老站 About 文案为英文正式版
- 整理资质与专利条目
- 整理生产设备与测试设备图片占位
- 输出“Engineering support”说明
- 增加公司能力摘要区块

### 13.4 Products 页待办

- 整理产品家族清单和 slug
- 为每个家族编写简介、卖点、适用场景
- 为每个家族整理“适合什么场景 / 不适合什么场景”
- 增加家族间快速对比入口
- 配置产品家族封面图或占位图
- 生成产品家族总览页
- 生成产品家族详情页模板

### 13.5 Applications 页待办

- 提炼 6 到 8 个重点行业
- 为每个行业编写一句场景摘要
- 为每个行业配置对应产品和应用标签
- 先做聚合页，不强制拆独立详情页

### 13.6 Solutions 页待办

- 设计“按应用找产品”的入口页
- 建立 industry / motion / drive 三种切入方式
- 每种切入方式最终落到产品家族页或选型入口
- 让不懂型号的用户也能快速开始

### 13.7 Downloads 页待办

- 建立下载资源配置文件
- 接入现有 PDF 文件
- 增加下载说明与资料分类
- 为下载动作预留留资或询盘扩展位

### 13.8 Contact 页待办

- 整理公开邮箱与销售支持邮箱
- 创建联系表单 UI
- 预留表单提交 API
- 补充“Response / support”文案

### 13.9 产品数据待办

- 确认 Excel “数据库”sheet 字段名
- 建立 Excel 字段到 Prisma 字段映射表
- 处理空值、数值单位、异常行容错
- 保存 `rawDataJson`
- 输出导入统计日志

### 13.10 产品搜索待办

- 设计 buyer 搜索请求结构
- 实现 `product-repository.ts`
- 实现 `product-search-service.ts`
- 实现 `POST /api/products/search`
- 为结果表格加入排序字段
- 支持清空筛选和跳转详情页

### 13.11 Scenario Registry 待办

- 定义 family 元数据结构
- 定义 variant 元数据结构
- 整理 19 个底层工况映射
- 录入 5 个前台入口与向导问题
- 录入 7 个 calculator family
- 输出 `GET /api/scenarios`

### 13.12 Calculator 待办

- 定义统一 calculator 接口
- 建立输入校验 schema
- 建立单位换算与参数清洗模块
- 实现：
  - `linear-free-horizontal`
  - `linear-motor-horizontal`
  - `linear-free-vertical-drop`
- 实现 `buildFilter`
- 实现 `explain`

### 13.13 Engineer 页待办

- 设计向导式工况选择 UI
- 实现 5 个上层入口
- 实现问题分支与 `variantKey` 路由
- 渲染动态表单
- 调用 `POST /api/calculate`
- 展示计算结果
- 展示推荐产品
- 展示推荐原因和筛选依据

### 13.14 API 待办

- `GET /api/scenarios`
- `POST /api/products/search`
- `POST /api/calculate`
- 预留 `POST /api/contact`
- 预留开发期导入脚本接口或脚本命令

### 13.15 内容配置待办

- 创建公司介绍内容配置
- 创建产品家族内容配置
- 创建 solutions 内容配置
- 创建应用行业内容配置
- 创建下载资源内容配置
- 创建首页 Hero 与 CTA 内容配置

### 13.16 首批交付顺序

建议按下面顺序执行：

1. 项目初始化与全局布局
2. 首页与导航，先把 `Products / Solutions / Sizing` 做成重点入口
3. Products / Solutions / Applications / Contact / Downloads 静态内容页
4. Prisma + 产品导入
5. Buyer 快速筛选
6. Scenario registry
7. Engineer 选型骨架
8. 3 个示例 calculator
9. About 页与信任内容补强
10. 产品详情页与转化补强

### 13.17 首页重点强化建议

如果希望用户一进站就感知“这不是普通样册站”，建议首页做以下强化：

- 首屏先出现找产品入口，而不是公司介绍
- 顶部导航把 `Products` 和 `Solutions` 放在最前
- 顶部导航里的 `Sizing` 使用高亮按钮
- Hero 右侧直接放选择器入口卡片，而不是普通说明文案
- Hero 中增加按产品 / 按应用 / 按工况 / 快速筛选四种入口
- 在首屏以下立刻出现 5 个 motion scenario 入口
- 在产品家族模块上方再插入一条 `Need help choosing a model?` 的横向 CTA
- 首页任何一屏滚动区都至少保留一个进入选型的路径

### 13.18 需要补充确认但不阻塞开发的事项

- 第一版是否提供完整中英文切换
- 首页是否需要保留 `News`
- 联系页是否需要询盘表单直接发邮件
- 下载资料是否需要表单门槛

这些问题不会阻塞第一版开发，可以先按英文单语、无新闻、直接下载、基础联系表单推进。

## 14. 推荐里程碑

### Milestone 1

- 基础项目可运行
- 首页、About、Products、Applications、Contact 页面完成

### Milestone 2

- Prisma 迁移完成
- Excel 导入完成
- Buyer 筛选完成

### Milestone 3

- Scenario registry 完成
- Engineer 页面骨架完成
- 3 个示例 calculator 跑通

### Milestone 4

- 产品详情、下载、联系转化完善
- 开始补更多工况和更完整产品内容

## 15. 当前明确不做

第一版暂不优先实现：

- 全量迁移 19 个复杂公式
- CMS
- 权限系统
- 报价系统
- 新闻系统
- 经销商系统
- 多语言完整切换
- 复杂营销动画

## 16. 当前最适合立即执行的动作

建议按以下顺序直接开工：

1. 先初始化项目与全站信息架构
2. 同步落地官网内容页骨架
3. 再接 Prisma 和产品导入
4. 先完成 Buyer 快速筛选
5. 再搭 Engineer 选型骨架和 3 个示例 calculator

这样能最快得到一个“既像官网，又有真实工具能力”的第一版结果。
