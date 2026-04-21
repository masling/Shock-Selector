# 编码任务规划

## 任务总览

| 序号 | 任务 | 涉及文件 | 优先级 |
|------|------|----------|--------|
| T1 | 修复 formatNumber 函数 | `lib/calculators/presenter.ts` | P0 |
| T2 | 新增 Breadcrumb 组件 | `components/ui/breadcrumb.tsx` | P1 |
| T3 | 在产品页面集成面包屑 | `app/products/[familySlug]/page.tsx`, `app/products/[familySlug]/[modelId]/page.tsx`, `app/products/catalog/[id]/page.tsx` | P1 |
| T4 | 在选型页面集成面包屑 | `app/[locale]/selector/engineer/page.tsx`, `app/[locale]/selector/buyer/page.tsx` | P1 |
| T5 | 新增 MobileNav 移动端导航组件 | `components/layout/mobile-nav.tsx` | P1 |
| T6 | 修改 SiteHeader 集成移动端导航 | `components/layout/site-header.tsx` | P1 |
| T7 | 采购筛选页添加防抖自动搜索 | `components/marketing/buyer-search-client.tsx` | P2 |
| T8 | 新增 ReadableFilter 可读化筛选条件组件 | `components/selector/readable-filter.tsx` | P2 |
| T9 | 修改 EngineerSizingClient 集成可读化筛选和未实现工况提示 | `components/selector/engineer-sizing-client.tsx` | P2 |
| T10 | 新增联系表单 Zod Schema | `lib/contact/schemas.ts` | P2 |
| T11 | 新增 ContactFormClient 客户端组件 | `components/contact/contact-form-client.tsx` | P2 |
| T12 | 新增 Contact API Route | `app/api/contact/route.ts` | P2 |
| T13 | 修改 Contact 页面集成表单组件 | `app/[locale]/contact/page.tsx` | P2 |
| T14 | 补充 site-copy i18n 文案 | `lib/i18n/site-copy.ts` | P3 |

---

## T1: 修复 formatNumber 函数

**文件**: `lib/calculators/presenter.ts`

**操作**: 修改 `formatNumber` 函数实现

**具体步骤**:
1. 定位 `formatNumber` 函数（约第 4-6 行）
2. 替换为正确实现：
   - `Number.isFinite(value)` 为 false 时返回 `"—"`
   - `Number.isInteger(value)` 为 true 时返回 `String(value)`
   - 小数时使用 `value.toFixed(2).replace(/\.?0+$/, "")` 保留最多 2 位小数并去除末尾零

**验收条件**:
- `formatNumber(100)` → `"100"`
- `formatNumber(3.14)` → `"3.14"`
- `formatNumber(3.10)` → `"3.1"`
- `formatNumber(3.00)` → `"3"`
- `formatNumber(NaN)` → `"—"`

---

## T2: 新增 Breadcrumb 组件

**文件**: `components/ui/breadcrumb.tsx`（新建）

**操作**: 创建面包屑服务端组件

**具体步骤**:
1. 定义 `BreadcrumbItem` 类型：`{ label: string; href?: string }`
2. 定义 `BreadcrumbProps` 类型：`{ items: BreadcrumbItem[] }`
3. 实现组件：
   - 容器：`nav` 元素，`flex items-center gap-1.5 text-sm py-3`
   - 每项之间用 `ChevronRight` 图标（lucide-react）分隔，`text-steel/40 h-3.5 w-3.5`
   - 有 `href` 的项：`<a>` 标签，`text-steel hover:text-ink transition-colors`
   - 无 `href` 的项（当前页）：`<span>` 标签，`text-ink font-medium`
   - 支持 `aria-label="Breadcrumb"` 和结构化数据

---

## T3: 在产品页面集成面包屑

**文件**:
- `app/products/[familySlug]/page.tsx`
- `app/products/[familySlug]/[modelId]/page.tsx`
- `app/products/catalog/[id]/page.tsx`

**操作**: 在各产品页面顶部添加 Breadcrumb 组件

**具体步骤**:
1. 在产品家族页：面包屑为 `[{label: "Products", href: "/products"}, {label: familyName}]`
2. 在静态型号详情页：面包屑为 `[{label: "Products", href: "/products"}, {label: familyName, href: familyHref}, {label: modelName}]`
3. 在数据库型号详情页：面包屑为 `[{label: "Products", href: "/products"}, {label: familyName, href: familyHref}, {label: modelName}]`
4. 面包屑放置在页面内容顶部，`Container` 组件内部

---

## T4: 在选型页面集成面包屑

**文件**:
- `app/[locale]/selector/engineer/page.tsx`
- `app/[locale]/selector/buyer/page.tsx`

**操作**: 在选型页面顶部添加 Breadcrumb 组件

**具体步骤**:
1. 工程师选型页：面包屑为 `[{label: "Sizing", href: "/selector/engineer"}]`
2. 采购筛选页：面包屑为 `[{label: "Quick Filter", href: "/selector/buyer"}]`
3. 面包屑标签从 site-copy 获取，支持 i18n

---

## T5: 新增 MobileNav 移动端导航组件

**文件**: `components/layout/mobile-nav.tsx`（新建）

**操作**: 创建移动端全屏导航客户端组件

**具体步骤**:
1. 定义 Props 类型：
   ```ts
   type MobileNavProps = {
     locale: Locale;
     items: Array<{ label: string; href: string }>;
     localeNames: SiteCopy["localeNames"];
     currentPath: string;
   };
   ```
2. 使用 `useState<boolean>` 控制 `isOpen` 状态
3. 渲染汉堡按钮（`Menu` 图标，`lg:hidden`），点击设置 `isOpen = true`
4. 渲染全屏面板（`isOpen` 时显示）：
   - 背景遮罩：`fixed inset-0 z-50 bg-ink/95 backdrop-blur-sm`
   - 关闭按钮：右上角 `X` 图标
   - 导航项：纵向排列，当前项 `text-accent`，其他 `text-white/80 hover:text-white`
   - 语言切换器：底部，胶囊式设计（与桌面端一致）
5. 点击导航项后：`router.push(href)` + `setIsOpen(false)`
6. 点击遮罩背景关闭：`setIsOpen(false)`
7. CSS transition：面板从右侧滑入，`duration-300`

---

## T6: 修改 SiteHeader 集成移动端导航

**文件**: `components/layout/site-header.tsx`

**操作**: 在 SiteHeader 中引入 MobileNav 组件

**具体步骤**:
1. 导入 `MobileNav` 组件
2. 在 `hidden lg:flex` 的桌面导航区域旁，添加 `<MobileNav>` 组件（`lg:hidden`）
3. 传递 props：`locale`, `items`（从 `copy` 构建）, `localeNames`, `currentPath`
4. 确保桌面端（lg+）布局不受影响

---

## T7: 采购筛选页添加防抖自动搜索

**文件**: `components/marketing/buyer-search-client.tsx`

**操作**: 为数值输入添加 500ms 防抖自动搜索

**具体步骤**:
1. 新增 `useEffect` 监听 `filters` 状态变化
2. 在 useEffect 中使用 `setTimeout` + `clearTimeout` 实现 500ms 防抖
3. 防抖到期后调用 `runSearch(filters)`
4. useEffect cleanup 中清除 timeout
5. 下拉选择（`handleSelectChange`）保持即时搜索，不走防抖
6. 保留手动搜索按钮
7. 改进 `isPending` 加载状态展示：在结果区域显示加载指示器而非纯文本

---

## T8: 新增 ReadableFilter 可读化筛选条件组件

**文件**: `components/selector/readable-filter.tsx`（新建）

**操作**: 创建筛选条件可读化展示客户端组件

**具体步骤**:
1. 定义 Props 类型：
   ```ts
   type ReadableFilterProps = {
     filter: Record<string, number | string>;
     locale: Locale;
   };
   ```
2. 定义字段映射表 `FILTER_FIELD_MAP`：
   - `minStrokeMm` → 行程 / Stroke, ≥, mm
   - `minEnergyPerCycleNm` → 单次能量 / Energy/Cycle, ≥, Nm
   - `minEnergyPerHourNm` → 每小时能量 / Energy/Hour, ≥, Nm
   - `minImpactForceN` → 冲击力 / Impact Force, ≥, N
   - `minThrustForceN` → 推力 / Thrust Force, ≥, N
   - `maxTotalLengthMm` → 总长度 / Total Length, ≤, mm
   - `threadSize` → 螺纹 / Thread, =
   - `familySlug` → 产品家族 / Family, =
3. 遍历 `filter` 对象的 key，查找映射表
4. 有映射：显示 `label operator value unit`
5. 无映射：显示 `key = value`（回退）
6. 根据 locale 选择中文/英文 label
7. 样式：`bg-mist/50 rounded-xl p-4`，每行 `flex items-center gap-2 text-sm`

---

## T9: 修改 EngineerSizingClient 集成可读化筛选和未实现工况提示

**文件**: `components/selector/engineer-sizing-client.tsx`

**操作**: 
1. 替换 JSON 筛选条件展示为 ReadableFilter 组件
2. 显示未实现工况变体（灰色 + "即将推出"标签）

**具体步骤**:

**可读化筛选**:
1. 导入 `ReadableFilter` 组件
2. 定位 `<pre>{JSON.stringify(result.filter, null, 2)}</pre>` 代码
3. 替换为 `<ReadableFilter filter={result.filter} locale={locale} />`

**未实现工况提示**:
1. 修改 `visibleVariants` 逻辑：不再过滤 `isImplemented`，显示所有变体
2. 未实现变体的样式：`opacity-50 cursor-not-allowed`
3. 未实现变体添加 `Badge` 组件显示 "Coming Soon" / "即将推出"（根据 locale）
4. 点击未实现变体时不触发 `setSelectedVariantKey`
5. Entry 级别保持现有 disabled 逻辑

---

## T10: 新增联系表单 Zod Schema

**文件**: `lib/contact/schemas.ts`（新建）

**操作**: 创建联系表单的前后端共享校验 Schema

**具体步骤**:
1. 定义 `ContactFormSchema`：
   ```ts
   import { z } from "zod";
   import { locales } from "@/lib/i18n/config";

   export const ContactFormSchema = z.object({
     name: z.string().min(1, "Name is required").max(100),
     email: z.string().email("Invalid email format").max(200),
     company: z.string().max(200).optional().or(z.literal("")),
     phone: z.string().max(50).optional().or(z.literal("")),
     message: z.string().min(1, "Message is required").max(2000),
     locale: z.enum(locales),
   });

   export type ContactFormData = z.infer<typeof ContactFormSchema>;
   ```
2. 导出类型 `ContactFormData`

---

## T11: 新增 ContactFormClient 客户端组件

**文件**: `components/contact/contact-form-client.tsx`（新建）

**操作**: 创建联系表单客户端交互组件

**具体步骤**:
1. 定义 Props：`{ locale: Locale; copy: SiteCopy["contact"] }`
2. 状态管理：
   - `formData`：表单字段值
   - `errors`：字段级错误信息 `Record<string, string>`
   - `isSubmitting`：提交中状态
   - `submitResult`：`"success" | "error" | null`
3. 表单字段：name, email, company, phone, message（与现有页面布局一致）
4. 前端校验：使用 `ContactFormSchema.safeParse()`，失败时设置 `errors`
5. 提交逻辑：
   - `fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) })`
   - 成功：`setSubmitResult("success")` + 清空表单
   - 失败：`setSubmitResult("error")` + 保留表单内容
6. 样式：与现有联系表单一致（圆角输入框、accent 按钮等）
7. 成功/失败提示：表单上方显示，使用 `bg-accent-soft` / `bg-red-50` 样式

---

## T12: 新增 Contact API Route

**文件**: `app/api/contact/route.ts`（新建）

**操作**: 创建联系表单后端 API

**具体步骤**:
1. 实现 `POST` handler：
   - 解析 request body
   - 使用 `ContactFormSchema` 校验，失败返回 400 + errors
   - 速率限制检查（基于 IP，每分钟 3 次），超限返回 429
   - 发送邮件（使用 `nodemailer` SMTP 或 `Resend` API）
   - 成功返回 200 + success message
   - 邮件发送失败返回 500 + error message
2. 速率限制器实现：
   - `Map<string, { count: number; windowStart: number }>`
   - 从 `request.headers.get("x-forwarded-for")` 获取 IP
   - 每次检查时清理过期窗口
3. 邮件发送：
   - 优先使用 `RESEND_API_KEY` 环境变量（Resend API）
   - 回退使用 SMTP 环境变量（`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`）
   - 收件人：`CONTACT_EMAIL_TO` 环境变量
   - 邮件内容：包含所有表单字段

---

## T13: 修改 Contact 页面集成表单组件

**文件**: `app/[locale]/contact/page.tsx`

**操作**: 将现有纯 HTML 表单替换为 ContactFormClient 组件

**具体步骤**:
1. 导入 `ContactFormClient` 组件
2. 定位现有 `<form>` 元素及其内部所有 `<input>` / `<textarea>`
3. 替换为 `<ContactFormClient locale={locale} copy={copy.contact} />`
4. 保留左侧联系信息卡片（邮箱列表等）不变
5. 确保布局（`grid lg:grid-cols-[0.85fr_1.15fr]`）不变

---

## T14: 补充 site-copy i18n 文案

**文件**: `lib/i18n/site-copy.ts`

**操作**: 为新增组件补充中英文文案

**具体步骤**:
1. 在 `SiteCopy` 类型中添加：
   - `navigation.mobileMenuOpen` / `mobileMenuClose`：汉堡菜单开关标签
   - `breadcrumb.home`：面包屑首页标签
   - `contact.form.*`：表单相关文案（字段标签、占位符、按钮、成功/失败提示）
   - `engineer.comingSoon`：未实现工况"即将推出"标签
2. 在英文 copy 中添加对应文案
3. 在中文 copy 中覆盖为中文文案
4. de/fr/it 保持回退到英文

---

## 执行顺序建议

```
T1 (formatNumber) → 独立，可先行
T14 (site-copy) → 为后续组件提供文案基础
T2 (Breadcrumb) → T3, T4 的前置
T3, T4 (面包屑集成) → 依赖 T2
T5 (MobileNav) → T6 的前置
T6 (SiteHeader 集成) → 依赖 T5
T7 (防抖搜索) → 独立
T8 (ReadableFilter) → T9 的前置
T9 (EngineerSizing 集成) → 依赖 T8
T10 (Contact Schema) → T11, T12 的前置
T11 (ContactFormClient) → 依赖 T10
T12 (Contact API) → 依赖 T10
T13 (Contact 页面集成) → 依赖 T11
```
