# 中文目录驱动的系列页面更新

## 本次范围

- 以中文全本样册、隔振器综合样本 2024、重型 HS 分册、新产品 2025 为依据编写系列介绍、原理与应用说明。
- 新增橡胶隔振器大类和 15 个系列入口；既有 11 个系列保留原 URL。共 6 个大类、26 个系列。
- 系列说明提供中文与英文；其他站点语言当前采用带 `lang="en"` 标识的英文技术内容。
- 每个系列都有代表性配图；示意图/系列组合图不宣称是某一型号的精确照片。原先用 6JX 表示特种隔振器的问题已修正，6JX 归橡胶隔振器。
- 选择 EI、ED 结构图和 EN 力—行程示意图。EN 图无数值刻度，明确标为原理示意；未把它宣传成实测结果。EK 原图缺少完整标签，暂不展示其剖面图。

## 素材

- 选择记录：`scripts/catalog-sources/website-catalog-media.json`。
- 输出与出处：`lib/catalog/catalog-media-manifest.json`，包括源 PDF 页码、哈希、图片尺寸。
- 导出脚本：`scripts/export-website-catalog-media.py`。使用 PDFium 应用 PDF 的 Decode、透明蒙版和变换；相同位置叠放对象按页面区域渲染，避免直接解码原图反色。
- 网站图片位于 `public/products/catalog/`，WebP 衍生图约 0.55 MB；原目录与提取原图保留。

## 数据库变更

Supabase 项目 `nvfbyhprwiyigdcqgjtd`。执行前 5 大类 / 11 系列 / 190 型号 / 999 规格值；执行后 6 大类 / 26 系列 / 190 型号 / 999 规格值。

仅通过事务添加目录导航记录及橡胶类 5 种语言翻译。`ON CONFLICT DO NOTHING` 保留既有记录。未修改型号、规格或选型资格；新增系列以应用咨询入口承接，没有显示空参数表。

准备脚本：`scripts/prepare-editorial-taxonomy.ts`；生成 SQL 位于忽略的 `data/staging/editorial-taxonomy.sql`。新系列 ID 为 `catalog-series-*`，新大类 ID 为 `catalog-family-rubber-vibration-isolators`；如需暂停展示，应将对应新记录设为 DRAFT，并保留引用和数据。

## 验证

- TypeScript 和生产构建通过。
- 26 个本地系列 URL 均返回 200 并显示标题；26 个系列的代表图片文件存在。
- 桌面 EN 页、手机橡胶目录和中文 HS 页经过浏览器检查。
- HS 系列咨询跳转 `/zh-cn/contact?models=HS`，表单自动预填 `询盘型号: HS`，未发送测试询盘。
- 未执行 411 行候选型号的参数合并导入，该工作仍需处理 PDF/Excel 参数差异和变体关联。
