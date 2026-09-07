import mediaManifest from "./catalog-media-manifest.json";

type Pair = { en: string; "zh-cn": string };
type FamilyKey = "shock_absorbers" | "heavy_duty_buffers" | "wire_rope_vibration_isolators" | "special_vibration_isolators" | "flexible_pipe_connections" | "rubber_vibration_isolators";
export type SeriesEditorial = {
  code: string; familyKey: FamilyKey; slug: string; name: Pair; overview: Pair;
  principle: Pair; applications: Pair; source: { catalog: string; pages: number[] };
  figure?: { mediaKey: keyof typeof mediaManifest; title: Pair; description: Pair };
};
const pair = (en: string, zh: string): Pair => ({ en, "zh-cn": zh });
const full = (pages: number[]) => ({ catalog: "EKD全本样册", pages });
const isolation = (pages: number[]) => ({ catalog: "隔振器综合样本2024", pages });
const wirePrinciple = pair("Stranded steel cable deforms between mounting bars. Friction between the strands dissipates energy; stiffness varies with displacement and load direction.", "钢丝绳在安装板之间变形，绳股间摩擦耗散能量。刚度随变形量和载荷方向变化，选型需区分隔振刚度与冲击刚度。");
const wireApps = pair("Equipment vibration isolation and transport protection. Specify the supported load, mounting direction, available travel and shock environment.", "用于设备隔振和运输防护。选型需明确承载、安装方向、可用变形空间及冲击环境。");
const rubberPrinciple = pair("An elastomer supports the equipment and reduces vibration transmission through controlled deformation and material damping. Load direction and static deflection determine the installation choice.", "通过橡胶弹性体的受控变形和材料阻尼，支撑设备并降低振动传递。需要结合承载方向、静变形和安装空间选型。");
const rubberApps = pair("Pumps, fans, compressors, diesel engines and auxiliary equipment. Confirm the operating temperature, media exposure and static load per mount.", "适用于水泵、风机、空压机、柴油机及辅助设备。选型需核对工作温度、接触介质和单个支座的静载荷。");

function entry(code: string, familyKey: FamilyKey, slug: string, name: Pair, overview: Pair, principle: Pair, applications: Pair, source: SeriesEditorial["source"], figure?: SeriesEditorial["figure"]): SeriesEditorial {
  return { code, familyKey, slug, name, overview, principle, applications, source, figure };
}

export const seriesEditorial: SeriesEditorial[] = [
  entry("EK", "shock_absorbers", "ek-adjustable-shock-absorbers", pair("EK / EKL Adjustable Hydraulic Shock Absorbers", "EK / EKL 可调液压缓冲器"),
    pair("External damping adjustment helps match the absorber to changing impact conditions. The EKL range addresses lower approach speeds.", "通过外部旋钮调节阻尼，适应冲击条件变化；EKL 低速系列面向较低接近速度的应用。"),
    pair("The piston forces oil through metering passages to dissipate impact energy. Turning the adjustment knob changes the effective flow area; the return mechanism resets the piston after the load is removed.", "活塞推动液压油通过节流通道耗散冲击能量，旋转调节旋钮改变有效流通面积；负载解除后由复位机构推动活塞返回。"),
    pair("Cylinder-driven, motor-driven and free-moving mechanisms requiring controlled deceleration. Check stroke, energy per cycle and hourly energy together.", "适用于气缸驱动、电机驱动及自由运动机构的平稳减速，需同时核对行程、单次吸能和每小时吸能。"),full([6,7,8])),
  entry("EN", "shock_absorbers", "en-non-adjustable-shock-absorbers",pair("EN Self-Compensating Shock Absorbers", "EN 自补偿固定型缓冲器"),
    pair("A compact, non-adjustable range for repetitive stopping duties. Self-compensating metering accommodates the operating envelope specified for each model.", "面向重复停靠工况的紧凑型不可调产品，通过自补偿节流适应各型号规定范围内的工况变化。"),
    pair("As the piston travels, it progressively closes metering holes and changes the oil-flow area. A return spring resets the absorber for the next impact.", "活塞运动时逐步封闭节流孔，改变油液流通面积；负载解除后由复位弹簧准备下一次冲击。"),
    pair("Automation mechanisms and precision motion stops. Match impact speed, effective mass and energy to the selected model.", "适用于自动化机构和精密运动终端停靠，应将冲击速度、有效质量与吸收能量匹配到具体型号。"),full([22,23]),
    {mediaKey:"EN_RESPONSE",title:pair("Force–stroke response explained", "冲击力—行程响应示意"),description:pair("Catalogue schematic comparing force–stroke responses under different mass and speed conditions. Curves are illustrative and not to scale.", "目录原理示意图，比较不同质量和速度条件下的冲击力—行程响应。曲线用于解释原理，无数值刻度。")}),
  entry("ES", "shock_absorbers", "es-super-long-life-shock-absorbers",pair("ES Long-Life Shock Absorbers", "ES 超长寿命系列缓冲器"),
    pair("An integrated, non-adjustable range developed for demanding repetitive-duty applications, with model-specific and stainless-steel options.", "面向严苛重复工况的一体式固定型缓冲器，提供特定工况设计及不锈钢产品选项。"),
    pair("Hydraulic damping dissipates impact energy within a sealed assembly. The appropriate design depends on the duty cycle, environment and required stopping behaviour.", "通过密封组件内的液压阻尼耗散冲击能量，需根据循环频率、环境及所需停靠特性选择设计。"),
    pair("Packaging and precision machinery with repeated motion stops. Confirm the required service life under the actual operating conditions.", "用于包装和精密机械的重复运动停靠，使用寿命需结合实际运行条件确认。"),full([38,39])),
  entry("EI", "heavy_duty_buffers", "ei-heavy-industry-buffers",pair("EI Heavy Industry Buffers", "EI 重工业缓冲器"),
    pair("Gas–hydraulic buffers for high-energy industrial stopping and emergency protection, using a nitrogen return system.", "采用气液混合设计和氮气复位机构，面向重工业高能量制动与紧急防护。"),
    pair("A metered oil chamber dissipates energy while the nitrogen chamber provides the return force. Application-specific metering is selected from the required response.", "节流油腔吸收冲击能量，氮气腔提供复位力；根据所需响应配置对应节流设计。"),
    pair("Cranes, rail equipment and heavy production machinery. Provide mass, impact speed, drive force and available stroke for application review.", "用于起重机、轨道设备和重型生产机械，选型需提供质量、冲击速度、驱动力与可用行程。"),full([40,41,42]),
    {mediaKey:"EI_PRINCIPLE",title:pair("Gas–hydraulic construction", "气液混合结构"),description:pair("Catalogue cutaway showing the oil and gas chambers. Metering and return characteristics are specified for the application.", "目录剖面图展示油腔与气腔，节流和复位特性需结合工况确定。")}),
  entry("ED", "heavy_duty_buffers", "ed-heavy-duty-shock-absorbers",pair("ED Heavy-Duty Shock Absorbers", "ED 重型缓冲器"),
    pair("Hydraulic absorbers with an internal accumulator for heavy machinery requiring controlled stopping force and long travel.", "采用液压与内置蓄能器结构，面向需要控制停靠力及较长行程的重型机械。"),
    pair("Metered hydraulic flow absorbs energy, while the accumulator accommodates displaced oil. Orifice configuration and accumulator options depend on the application and cycle rate.", "利用液压节流吸能，由蓄能器补偿排开的油液；节流孔配置和蓄能器选项需结合工况与循环频率确定。"),
    pair("Automated warehouses, rail systems, gantry cranes and heavy production lines. Review hourly energy and the required return cycle.", "用于自动化仓库、轨道系统、龙门起重机和重型生产线，需重点核对每小时能量及复位周期。"),full([44,45]),
    {mediaKey:"ED_PRINCIPLE",title:pair("Internal accumulator layout", "内置蓄能结构"),description:pair("Catalogue construction illustration. Mounting arrangement and available options depend on the selected ED model.", "目录结构示意图，具体安装方式和配置选项以所选 ED 型号为准。")}),
  entry("HS", "heavy_duty_buffers", "hs-emergency-stop-buffers",pair("HS Emergency-Stop Buffers", "HS 紧急停止缓冲器"),
    pair("Compact hydraulic buffers configured for emergency stopping where installation space is limited.", "面向安装空间受限的紧急停止工况，采用紧凑型液压缓冲结构。"),
    pair("Hydraulic resistance absorbs the stopping energy. The catalogue treats HS as an application-specific product, so the stopping profile is reviewed for each installation.", "利用液压阻力吸收制动能量。目录将 HS 定义为工况定制产品，需针对实际安装条件复核制动响应。"),
    pair("Indoor and outdoor emergency stops. Specify impact direction, operating environment and any dust-cover or safety-chain requirements.", "用于室内外紧急停止，需说明碰撞方向、使用环境，以及防尘罩或安全链需求。"),{catalog:"EKD目录-重型缓冲器HS",pages:[18,19]}),
  entry("WR", "wire_rope_vibration_isolators", "wr-wire-rope-vibration-isolators",pair("WR Wire-Rope Isolators", "WR 钢绳隔振器"),pair("All-metal, multi-axis isolation using stainless-steel cable and mounting bars, with several mounting and loop-count options.", "由不锈钢钢绳和安装板构成全金属多轴隔振结构，提供多种安装形式与圈数选项。"),wirePrinciple,wireApps,full([54,55,56])),
  entry("CR", "wire_rope_vibration_isolators", "cr-compact-wire-rope-vibration-isolators",pair("CR Compact Wire-Rope Isolators", "CR 小型钢绳隔振器"),pair("A compact wire-rope range for installations requiring a small envelope and model-specific mounting geometry.", "适用于空间紧凑安装的钢绳隔振系列，各型号具有对应的安装几何尺寸。"),wirePrinciple,wireApps,full([85,86])),
  entry("HGGS", "special_vibration_isolators", "hggs-stainless-steel-wire-rope-vibration-isolators",pair("HGGS Stainless-Steel Isolators", "HGGS 不锈钢钢绳隔振器"),pair("A stainless-steel isolation range combining nonlinear stiffness with multiple mounting orientations.", "采用不锈钢结构，具有非线性刚度，并可采用多种方向安装。"),wirePrinciple,wireApps,full([98,99])),
  entry("HGGN", "special_vibration_isolators", "hggn-anti-impact-vibration-isolators",pair("HGGN Composite Shock Isolators", "HGGN 抗冲高能隔振器"),pair("A composite construction combines wire-rope isolation with an elastomer to increase support stiffness and damping.", "通过钢绳隔振器与弹性体复合，提高支撑刚度并增加阻尼。"),pair("Cable deformation and strand friction work together with elastomer damping to control vibration and shock response.", "钢绳变形、绳股摩擦与弹性体阻尼共同作用，控制振动和冲击响应。"),wireApps,full([102,103])),
  entry("JYXR_P", "flexible_pipe_connections", "jyxr-p-balanced-flexible-connecting-pipes",pair("JYXR(P) Balanced Flexible Pipe Connections", "JYXR(P) 单法兰平衡式挠性接管"),pair("Flexible pipe connections with catalogue-defined pressure, bore and flange-interface combinations.", "采用目录规定的压力、公称通径及法兰接口组合，提供平衡式挠性管路连接。"),pair("The flexible section accommodates relative movement between pipe connections. Overall length and interface dimensions follow the selected configuration.", "挠性段适应管路连接处的相对运动，总成长度及接口尺寸按所选配置确定。"),pair("Pipework requiring flexible connections. Specify working medium, nominal pressure, bore and mating flange standard.", "用于需要挠性连接的管路，应明确介质、公称压力、通径和配对法兰标准。"),full([119,120])),
  entry("JYXR_H", "flexible_pipe_connections", "jyxr-h-large-deflection-flexible-connecting-pipes",pair("JYXR(H) Large-Deflection Pipe Connections", "JYXR(H) 单法兰大变形量挠性接管"),pair("Flexible connections intended for larger displacement requirements, with configuration-specific interfaces and fixed catalogue lengths.", "面向较大位移需求的挠性接管，具有对应的接口配置和目录规定总成长度。"),pair("The flexible section accommodates movement; bore, pressure, medium and interface must be considered together when selecting a configuration.", "利用挠性段适应连接位移，选型需同时考虑通径、压力、介质及接口形式。"),pair("Pipe connections with larger movement allowances. Confirm installation length and mating interfaces before ordering.", "用于需要较大运动余量的管路连接，订货前需确认安装长度及配对接口。"),full([121])),
  entry("OVTW", "wire_rope_vibration_isolators", "ovtw-wire-rope-isolators",pair("OVTW Wire-Rope Isolators", "OVTW 钢绳隔振器"),pair("A wire-rope range with model-specific load, deflection and stiffness data for compression, shear and angled loading.", "提供压缩、剪切及斜向载荷下的承载、变形与刚度数据，各参数对应具体型号。"),wirePrinciple,wireApps,isolation([9,10,11])),
  entry("OVTC", "wire_rope_vibration_isolators", "ovtc-compact-wire-rope-isolators",pair("OVTC Compact Wire-Rope Isolators", "OVTC 小型钢绳隔振器"),pair("Compact wire-rope isolation with catalogue-defined mounting geometry and directional performance tables.", "具有明确安装几何尺寸及方向性能表的小型钢绳隔振系列。"),wirePrinciple,wireApps,isolation([40,41])),
  entry("OVTS", "special_vibration_isolators", "ovts-special-wire-rope-isolators",pair("OVTS Special Wire-Rope Isolators", "OVTS 特种隔振器"),pair("Special wire-rope isolation configurations for equipment protection, with model-specific loading and installation requirements.", "面向设备防护的特种钢绳隔振配置，承载和安装要求需对应具体型号。"),wirePrinciple,wireApps,isolation([52,53,54,55])),
  entry("OVTN", "special_vibration_isolators", "ovtn-composite-isolators",pair("OVTN Rubber-Coated Composite Isolators", "OVTN 包胶复合式隔振器"),pair("Rubber and wire-rope elements are combined in T, Z and X configurations for enhanced damping and shock control.", "将橡胶与钢绳结构复合，提供 T 型及 Z、X 型配置，用于增强阻尼和冲击控制。"),pair("The internal cable structure dissipates energy while the rubber adds damping. The configuration determines the supported direction and installation geometry.", "内部钢绳结构耗散能量，橡胶提供附加阻尼；承载方向和安装尺寸需按配置确定。"),wireApps,{catalog:"新产品2025",pages:[3,4]}),
  entry("OVTD", "special_vibration_isolators", "ovtd-multi-axis-hangers",pair("OVTD Multi-Degree-of-Freedom Hangers", "OVTD 多自由度吊架"),pair("Isolation hangers with catalogue-defined support and installation geometry.", "具有目录规定支撑及安装几何尺寸的隔振吊架。"),pair("An elastic support assembly accommodates movement while limiting vibration transmission through the hanger.", "通过弹性支撑组件适应相对运动，降低经吊架传递的振动。"),pair("Suspended equipment and pipework. Confirm load direction, attachment geometry and clearance.", "用于悬挂设备和管路，应核对载荷方向、连接形式及运动间隙。"),isolation([60,61])),
  entry("OVTG", "special_vibration_isolators", "ovtg-all-metal-pipe-clamps",pair("OVTG All-Metal Isolation Pipe Clamps", "OVTG 全金属隔振管夹"),pair("An all-metal clamp and elastic liner support pipework while providing vibration isolation.", "采用全金属管夹及弹性衬层，支撑管路并提供隔振作用。"),pair("The metal elastic element deforms within the clamp to reduce vibration transmission while accommodating the intended pipe movement.", "管夹内部的金属弹性元件通过变形降低振动传递，并适应规定的管路运动。"),pair("Pipework in demanding temperature or media environments. Select the bore and material for the service conditions.", "用于温度或介质条件较严苛的管路，应按使用环境选择管径和材质。"),isolation([62,63])),
  entry("OVTX", "special_vibration_isolators", "ovtx-all-metal-isolators",pair("OVTX All-Metal Isolators", "OVTX 全金属隔振器"),pair("An all-metal elastic support for isolation duties where elastomer exposure or ageing is a concern.", "适用于需考虑弹性体介质耐受或老化问题的全金属弹性支撑。"),pair("Internal metal elastic elements provide nonlinear support and energy dissipation. Select the installation orientation from the model-specific data.", "内部金属弹性元件提供非线性支撑与耗能作用，安装方向应依据具体型号数据确定。"),wireApps,isolation([64,65])),
  ...([
    ["BE","be-protected-rubber-isolators","BE Protected Rubber Mounts","BE 保护式橡胶隔振器","A protective mounting structure maintains the equipment connection if the rubber element is damaged.","采用防脱保护结构，在橡胶体受损时维持设备连接。",[66,67]],
    ["E","e-protected-rubber-isolators","E Protected Rubber Mounts","E 保护式橡胶隔振器","Protective rubber mounts for machinery support, with direction-specific load ratings.","用于机械支撑的保护式橡胶隔振器，承载参数需区分方向。",[68,69]],
    ["EA","ea-protected-rubber-isolators","EA Protected Rubber Mounts","EA 保护式橡胶隔振器","An alternative protective rubber-mount range with its own stiffness and deflection data.","具有独立刚度和变形数据的保护式橡胶隔振系列。",[68,69]],
    ["6JX","6jx-rubber-isolators","6JX Enclosed Rubber Mounts","6JX 封闭式橡胶隔振器","Enclosed mounts with a protective connection and a nonlinear load–deflection characteristic.","采用封闭保护连接结构，具有非线性载荷—变形特性。",[70,71]],
    ["SH","sh-machinery-rubber-isolators","SH Machinery Rubber Mounts","SH 机械橡胶隔振器","Rubber supports for machinery vibration reduction and structure-borne noise isolation.","用于机械减振和结构传声隔离的橡胶支撑。",[72,73]],
    ["WH","wh-rubber-isolators","WH Rubber Mounts","WH 橡胶隔振器","A machinery-mount range with model-specific static deflection and natural-frequency data.","具有具体型号静变形和固有频率数据的机械隔振系列。",[74,75]],
    ["WHG","whg-rubber-isolators","WHG Rubber Mounts","WHG 橡胶隔振器","Rubber supports covering the larger load configurations listed in the WH/WHG catalogue tables.","覆盖 WH/WHG 目录表中较大载荷配置的橡胶支撑。",[74,75]],
  ] as const).map(([code,slug,en,zh,overviewEn,overviewZh,pages]) => entry(code,"rubber_vibration_isolators",slug,pair(en,zh),pair(overviewEn,overviewZh),rubberPrinciple,rubberApps,isolation([...pages]))),
];

export function getSeriesEditorial(code: string, locale: string) {
  const source = seriesEditorial.find(item => item.code === code);
  if (!source) return null;
  const language = locale === "zh-cn" ? "zh-cn" : "en";
  const mediaKey = code as keyof typeof mediaManifest;
  const photo = Object.hasOwn(mediaManifest, mediaKey) ? mediaManifest[mediaKey] : code === "6JX" ? { url:"/products/representative-special-isolator.jpg", width:900, height:900 } : null;
  const figure = source.figure ? { ...source.figure, title: source.figure.title[language], description: source.figure.description[language], media: mediaManifest[source.figure.mediaKey] } : null;
  return { ...source, name:source.name[language], overview:source.overview[language], principle:source.principle[language], applications:source.applications[language], language, photo, figure };
}

export const editorialUi = (locale: string) => locale === "zh-cn" ? {
  illustration:"系列示意，具体外形以型号为准", basis:"技术资料", catalog:"中文产品目录", page:"PDF 页", principle:"结构与工作原理", applications:"应用与选型要点", selection:"确认选型条件", quote:"咨询该系列", noModels:"请提供载荷、运动或振动条件及安装空间，我们将协助确认型号和技术参数。",
} : {
  illustration:"Series illustration; configuration varies by model", basis:"Technical reference", catalog:"Chinese product catalogue", page:"PDF pages", principle:"Construction and operating principle", applications:"Applications and selection", selection:"Discuss your application", quote:"Enquire about this series", noModels:"Share the load, motion or vibration conditions and available installation space so we can help confirm the model and technical specifications.",
};
