export type ProductFamilyGroup = {
  key: string;
  name: string;
  summary: string;
  description: string;
};

export type ProductFamily = {
  slug: string;
  groupKey: ProductFamilyGroup["key"];
  name: string;
  tag: string;
  supportingLabel?: string;
  summary: string;
  fitFor: string[];
  notFitFor: string[];
  highlights: string[];
  applications: string[];
  featuredOnHome?: boolean;
  specRange: {
    stroke: string;
    energy: string;
    force: string;
  };
};

export type ProductModel = {
  id: string;
  familySlug: string;
  model: string;
  summary: string;
  stroke: string;
  energy: string;
  thread: string;
  force: string;
};

export type ProductCenterLink = {
  title: string;
  tag: string;
  description: string;
  href: string;
};

export const mainNavigation = [
  { label: "Products", href: "/products" },
  { label: "Sizing", href: "/selector/engineer", highlight: true },
  { label: "Applications", href: "/applications" },
  { label: "Downloads", href: "/downloads" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerGroups = [
  {
    title: "Find Products",
    links: [
      { label: "All product families", href: "/products" },
      { label: "Find by application", href: "/applications" },
      { label: "Engineer sizing", href: "/selector/engineer" },
      { label: "Buyer quick filter", href: "/selector/buyer" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Applications", href: "/applications" },
      { label: "Downloads", href: "/downloads" },
      { label: "About EKD", href: "/about" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "Sales support", href: "/contact" },
      { label: "Technical support", href: "/contact" },
    ],
  },
];

export const productFamilyGroups: ProductFamilyGroup[] = [
  {
    key: "shock-absorbers",
    name: "Shock Absorbers",
    summary: "Hydraulic shock absorbers for repeatable machine stopping, equipment protection and sizing-led product selection.",
    description:
      "This is the core EKD product branch for automation, packaging, transfer systems and high-cycle machine protection.",
  },
  {
    key: "buffers",
    name: "Buffers",
    summary: "Protection-first hydraulic buffer lines for high moving masses, heavy equipment and severe end-stop conditions.",
    description:
      "Use these lines when machine scale, impact envelope or stopping safety matters more than compact tuning.",
  },
  {
    key: "vibration-isolators",
    name: "Vibration Isolators",
    summary: "Product families for shock isolation, vibration control and equipment protection across transport, machinery and harsh environments.",
    description:
      "These lines broaden the product center beyond hydraulic deceleration into isolation, resilience and equipment mounting protection.",
  },
  {
    key: "advanced-damping-systems",
    name: "Advanced Damping Systems",
    summary: "Structural and specialty damping systems for civil, industrial and heavy-duty energy-management projects.",
    description:
      "These families serve longer-cycle engineering projects where the application logic differs from standard machine end-stop sizing.",
  },
  {
    key: "mechanical-components",
    name: "Mechanical Components",
    summary: "Auxiliary motion-transmission components that sit beside the core damping and isolation portfolio.",
    description:
      "These lines support broader machinery packages but follow a different buying path from shock absorbers and isolators.",
  },
];

export const productFamilies: ProductFamily[] = [
  {
    slug: "adjustable-shock-absorbers",
    groupKey: "shock-absorbers",
    name: "Adjustable Shock Absorbers",
    tag: "Tunable deceleration",
    supportingLabel: "For variable-duty machine stops",
    summary:
      "Tunable hydraulic shock absorbers for lines where payload, speed or mounting conditions change from one machine setup to the next.",
    fitFor: [
      "Automation stops with changing loads",
      "Motor-driven or cylinder-driven axes",
      "Machines that need on-site tuning after installation",
    ],
    notFitFor: [
      "Very high-energy heavy-duty impacts",
      "Applications that need fail-safe crane-style end-stop protection",
    ],
    highlights: ["Adjustable damping", "Stable deceleration", "Lower end-stop shock"],
    applications: ["Automation equipment", "Conveyors", "Assembly machinery"],
    featuredOnHome: true,
    specRange: {
      stroke: "12 to 50 mm",
      energy: "light to medium repeated impacts",
      force: "for controlled machine motion",
    },
  },
  {
    slug: "non-adjustable-shock-absorbers",
    groupKey: "shock-absorbers",
    name: "Non-adjustable Shock Absorbers",
    tag: "Fast deployment",
    supportingLabel: "Self-compensating / non-adjustable models",
    summary:
      "Self-compensating shock absorbers for repeatable machine motion where quick installation and dependable daily operation matter more than manual tuning.",
    fitFor: [
      "Repeatable automation stops",
      "Standardized machine designs",
      "Installations that value low setup effort",
    ],
    notFitFor: [
      "Applications with large process variation",
      "High-energy unexpected impacts",
    ],
    highlights: ["Quick selection", "Consistent performance", "Simple installation"],
    applications: ["Packaging", "Transfer units", "Guide rail end stops"],
    featuredOnHome: true,
    specRange: {
      stroke: "12 to 40 mm",
      energy: "light to medium energy per cycle",
      force: "for repetitive industrial motion",
    },
  },
  {
    slug: "super-long-life-shock-absorbers",
    groupKey: "shock-absorbers",
    name: "Super Long Life Shock Absorbers",
    tag: "High cycle life",
    supportingLabel: "Built for frequent machine motion",
    summary:
      "Long-life hydraulic shock absorbers for high-frequency equipment where uptime, repeatability and service interval planning directly affect output.",
    fitFor: [
      "PET blowing machinery",
      "Fast packaging lines",
      "Repetitive machine end-stop protection",
    ],
    notFitFor: [
      "Large irregular shock events",
      "Severe heavy-duty emergency stops",
    ],
    highlights: ["Long cycle life", "High-frequency suitability", "Stable repeatability"],
    applications: ["PET blowing machines", "High-speed automation", "Packaging"],
    featuredOnHome: true,
    specRange: {
      stroke: "12 to 25 mm",
      energy: "for frequent medium impacts",
      force: "optimized for high cycle repetition",
    },
  },
  {
    slug: "heavy-duty-shock-absorbers",
    groupKey: "shock-absorbers",
    name: "Heavy Duty Shock Absorbers",
    tag: "Extreme-duty protection",
    supportingLabel: "For crane, rail and warehouse impact control",
    summary:
      "Heavy-duty hydraulic shock absorbers for crane travel, rail systems, stacker cranes and other severe impact conditions where energy absorption is safety-critical.",
    fitFor: [
      "Crane trolley protection",
      "Stacker crane track ends",
      "Railway end-stop safety devices",
    ],
    notFitFor: [
      "Small precision automation axes",
      "Compact installations with limited footprint",
    ],
    highlights: ["High impact absorption", "Extreme-duty construction", "Safety-oriented stopping"],
    applications: ["Port machinery", "Railway", "Automated warehouses"],
    featuredOnHome: true,
    specRange: {
      stroke: "50 mm and above",
      energy: "high to very high impact energy",
      force: "for extreme-duty motion systems",
    },
  },
  {
    slug: "heavy-industry-buffers",
    groupKey: "buffers",
    name: "Heavy Industry Buffers",
    tag: "Large-scale impact control",
    supportingLabel: "For high moving mass equipment",
    summary:
      "Industrial hydraulic buffer lines for large machines and transported structures where stopping envelope, mass and ruggedness are the first design constraints.",
    fitFor: [
      "Heavy machine end stops",
      "Large transported structures",
      "Applications with high moving mass",
    ],
    notFitFor: ["Compact automation equipment", "Fine deceleration tuning"],
    highlights: ["Large energy envelope", "Industrial robustness", "Protection-first design"],
    applications: ["Paper machinery", "Steel equipment", "Material handling"],
    featuredOnHome: true,
    specRange: {
      stroke: "large-envelope designs",
      energy: "high impact absorption",
      force: "built for large moving masses",
    },
  },
  {
    slug: "wire-rope-vibration-isolators",
    groupKey: "vibration-isolators",
    name: "Wire Rope Vibration Isolators",
    tag: "Multi-axis isolation",
    supportingLabel: "For shock, vibration and harsh environments",
    summary:
      "Wire rope isolators for equipment protection where shock resistance, vibration isolation and corrosion resistance need to work together.",
    fitFor: [
      "Transport protection",
      "Marine and outdoor environments",
      "Equipment isolation with multi-axis disturbance",
    ],
    notFitFor: [
      "Precision hydraulic deceleration duties",
      "Applications that require classic shock absorber sizing logic",
    ],
    highlights: ["Shock + vibration control", "Harsh-environment suitability", "Wide mounting flexibility"],
    applications: ["Marine", "Equipment protection", "Transport systems"],
    featuredOnHome: true,
    specRange: {
      stroke: "application-dependent",
      energy: "isolation-led selection",
      force: "selected by load and vibration target",
    },
  },
  {
    slug: "anti-impact-compound-vibration-isolators",
    groupKey: "vibration-isolators",
    name: "Anti-Impact Compound Vibration Isolators",
    tag: "Combined shock and vibration control",
    supportingLabel: "For impact-heavy isolation duties",
    summary:
      "Compound isolator designs for equipment that must withstand both repeated vibration and occasional impact without passing excessive load into the structure.",
    fitFor: [
      "Equipment bases with mixed shock and vibration inputs",
      "Machinery that sees transport or handling impact",
      "Installations that need broader protection than a single-material isolator",
    ],
    notFitFor: [
      "Standard machine end-stop deceleration",
      "Projects that only need simple thread-mounted shock absorbers",
    ],
    highlights: ["Combined isolation approach", "Impact buffering", "Broader environmental adaptability"],
    applications: ["Industrial machinery", "Transport equipment", "Protection skids"],
    specRange: {
      stroke: "application-dependent",
      energy: "shock + vibration isolation range",
      force: "selected by static and dynamic load",
    },
  },
  {
    slug: "all-metal-equal-stiffness-vibration-isolators",
    groupKey: "vibration-isolators",
    name: "All-Metal Equal-Stiffness Vibration Isolators",
    tag: "All-metal resilience",
    supportingLabel: "For demanding industrial and outdoor mounting",
    summary:
      "All-metal isolators designed for robust vibration control where environmental resistance, durability and multi-directional stiffness matter more than soft mounting.",
    fitFor: [
      "Outdoor or contaminated environments",
      "Long-life industrial isolation",
      "Projects that prefer all-metal construction",
    ],
    notFitFor: [
      "Compact hydraulic stop-control applications",
      "Applications that require a soft elastomer feel",
    ],
    highlights: ["All-metal construction", "Durable in harsh conditions", "Balanced stiffness behavior"],
    applications: ["Industrial equipment", "Transport systems", "Heavy machinery subassemblies"],
    specRange: {
      stroke: "isolation-led selection",
      energy: "environment and load dependent",
      force: "selected by supported mass",
    },
  },
  {
    slug: "steel-mesh-pad-rubber-vibration-isolators",
    groupKey: "vibration-isolators",
    name: "Steel Mesh Pad & Rubber Vibration Isolators",
    tag: "Flexible mounting options",
    supportingLabel: "For machine and equipment vibration reduction",
    summary:
      "Isolation products based on steel mesh pads and rubber elements for machine installations that need practical vibration reduction across a wide range of layouts.",
    fitFor: [
      "General machinery vibration reduction",
      "Equipment feet and mounting interfaces",
      "Installations that need multiple material options",
    ],
    notFitFor: [
      "Heavy-duty hydraulic end-stop protection",
      "Applications driven mainly by impact-energy sizing",
    ],
    highlights: ["Broad application coverage", "Simple installation", "Material options for different environments"],
    applications: ["General industrial equipment", "Machine bases", "Support structures"],
    specRange: {
      stroke: "selected by isolation requirement",
      energy: "vibration reduction focused",
      force: "chosen by supported load",
    },
  },
  {
    slug: "special-vibration-isolators",
    groupKey: "vibration-isolators",
    name: "Special Vibration Isolators",
    tag: "Project-specific isolation",
    supportingLabel: "For special structures and custom mounting conditions",
    summary:
      "Special-form vibration isolators for projects that fall outside standard machine mounts and need a more application-specific damping or isolation layout.",
    fitFor: [
      "Projects with unusual mounting constraints",
      "Custom equipment protection",
      "Special structures and non-standard envelopes",
    ],
    notFitFor: [
      "Routine compact automation stops",
      "Applications already covered by standard isolator families",
    ],
    highlights: ["Application-specific layouts", "Customizable structure", "Broader design freedom"],
    applications: ["Special equipment", "Custom machinery", "Protection structures"],
    specRange: {
      stroke: "project-dependent",
      energy: "application-defined",
      force: "selected with engineering review",
    },
  },
  {
    slug: "fluid-viscous-dampers",
    groupKey: "advanced-damping-systems",
    name: "Fluid Viscous Dampers",
    tag: "Structural damping",
    supportingLabel: "For civil and industrial energy dissipation",
    summary:
      "Fluid viscous dampers for projects that need controlled energy dissipation in structures, supports or large engineered systems.",
    fitFor: [
      "Structural vibration control",
      "Industrial support systems",
      "Projects with longer-cycle engineering review",
    ],
    notFitFor: [
      "Small machine end-stop selection",
      "Standard automation-axis cushioning",
    ],
    highlights: ["Energy dissipation", "Project-based engineering", "Suitable for large structures"],
    applications: ["Building structures", "Industrial supports", "Infrastructure projects"],
    specRange: {
      stroke: "project-dependent",
      energy: "system-level damping",
      force: "engineered to project load case",
    },
  },
  {
    slug: "tuned-mass-damper-systems",
    groupKey: "advanced-damping-systems",
    name: "Tuned Mass Damper Systems",
    tag: "Frequency-targeted control",
    supportingLabel: "TMD system solutions",
    summary:
      "Tuned mass damper systems for projects that need targeted vibration mitigation around critical frequencies in structures or equipment.",
    fitFor: [
      "Resonance-sensitive projects",
      "Structures with identifiable vibration modes",
      "Longer engineering cycles with system-level review",
    ],
    notFitFor: [
      "Direct replacement for compact hydraulic shock absorbers",
      "Standard machine end-stop duties",
    ],
    highlights: ["Frequency-targeted mitigation", "System-level engineering", "Suitable for structural tuning"],
    applications: ["Structures", "Large equipment", "Resonance-control projects"],
    specRange: {
      stroke: "project-dependent",
      energy: "system-specific",
      force: "tuned to modal behavior",
    },
  },
  {
    slug: "particle-dampers",
    groupKey: "advanced-damping-systems",
    name: "Particle Dampers",
    tag: "Passive damping",
    supportingLabel: "For compact vibration-energy reduction",
    summary:
      "Particle damper solutions for applications that need passive vibration-energy dissipation in a compact, durable format.",
    fitFor: [
      "Passive vibration damping projects",
      "Equipment that benefits from compact damping devices",
      "Applications that need low-maintenance structural damping",
    ],
    notFitFor: [
      "Hydraulic end-stop cushioning",
      "Projects that require classic shock absorber tuning",
    ],
    highlights: ["Passive energy dissipation", "Compact packaging", "Low-maintenance design"],
    applications: ["Industrial equipment", "Structural attachments", "Special damping projects"],
    specRange: {
      stroke: "application-dependent",
      energy: "damping-focused",
      force: "selected by vibration environment",
    },
  },
  {
    slug: "friction-spring-dampers",
    groupKey: "advanced-damping-systems",
    name: "Friction Spring Dampers",
    tag: "Heavy-load resilience",
    supportingLabel: "For severe shock and structural movement",
    summary:
      "Friction spring damper systems for heavy-load applications that need robust passive damping and repeated energy absorption under severe service conditions.",
    fitFor: [
      "Heavy-duty passive damping",
      "Projects with severe movement or impact conditions",
      "Applications that value rugged mechanical response",
    ],
    notFitFor: [
      "Compact automation equipment",
      "Light-duty sizing tasks driven by thread and stroke",
    ],
    highlights: ["Rugged mechanical damping", "Heavy-load capability", "Repeated energy absorption"],
    applications: ["Heavy equipment", "Structural systems", "Industrial protection projects"],
    specRange: {
      stroke: "project-dependent",
      energy: "heavy-duty damping range",
      force: "for high-load mechanical systems",
    },
  },
  {
    slug: "locking-assemblies-and-couplings",
    groupKey: "mechanical-components",
    name: "Locking Assemblies & Couplings",
    tag: "Power transmission",
    supportingLabel: "Auxiliary mechanical product line",
    summary:
      "Mechanical locking assemblies and couplings for machinery packages that need shaft connection, transmission support and broader component sourcing from one supplier.",
    fitFor: [
      "Power transmission interfaces",
      "Machinery packages sourced together with damping products",
      "Projects that need auxiliary mechanical components",
    ],
    notFitFor: [
      "Sizing-tool driven shock absorber selection",
      "Pure vibration-isolation projects",
    ],
    highlights: ["Auxiliary product line", "Machinery integration support", "Separate buying intent from damping products"],
    applications: ["General machinery", "Transmission assemblies", "OEM equipment"],
    specRange: {
      stroke: "not stroke-led",
      energy: "not energy-led",
      force: "selected by transmission duty",
    },
  },
];

export const homeProductFamilies = productFamilies.filter((family) => family.featuredOnHome);

export const productCenterLinks: ProductCenterLink[] = [
  {
    title: "Vibration Isolation Solutions",
    tag: "Solution route",
    description:
      "Start from machine layout, support conditions and disturbance type when you need an application-led isolation recommendation.",
    href: "/applications",
  },
  {
    title: "Import Replacement Support",
    tag: "Engineering support",
    description:
      "Use EKD as an alternative-source partner when a legacy imported model needs local replacement or application review.",
    href: "/contact",
  },
  {
    title: "Metal Working & Manufacturing Services",
    tag: "Production capability",
    description:
      "Review machining, fabrication and supporting manufacturing capability that can sit alongside the product supply scope.",
    href: "/about",
  },
];

export const featuredModels: ProductModel[] = [
  {
    id: "ekm-2525",
    familySlug: "adjustable-shock-absorbers",
    model: "EKM 25x25B",
    summary: "Adjustable model for variable-duty automation lines.",
    stroke: "25 mm",
    energy: "Medium cycle capacity",
    thread: "M25",
    force: "Controlled machine stop",
  },
  {
    id: "enc-2012",
    familySlug: "non-adjustable-shock-absorbers",
    model: "ENC 20x12-2",
    summary: "Compact non-adjustable unit for standardized end stops.",
    stroke: "12 mm",
    energy: "Light to medium duty",
    thread: "M20",
    force: "Repeatable stop profile",
  },
  {
    id: "ed-4250",
    familySlug: "heavy-duty-shock-absorbers",
    model: "ED 42x50",
    summary: "Heavy duty hydraulic model for severe impact environments.",
    stroke: "50 mm",
    energy: "High impact duty",
    thread: "M42",
    force: "Large impact absorption",
  },
];

export const applicationSectors = [
  {
    title: "PET Blowing Machinery",
    description: "High-frequency machine motion where cycle life and consistent deceleration are critical.",
    href: "/products/super-long-life-shock-absorbers",
  },
  {
    title: "Automotive Manufacturing",
    description: "Assembly, welding and stamping systems that need machine protection without slowing throughput.",
    href: "/products/adjustable-shock-absorbers",
  },
  {
    title: "Automated Warehouses",
    description: "Track-end and emergency impact protection for stacker cranes and transfer systems.",
    href: "/products/heavy-duty-shock-absorbers",
  },
  {
    title: "Port and Lifting Equipment",
    description: "Extreme-duty energy absorption for cranes, rail systems and heavy moving structures.",
    href: "/products/heavy-industry-buffers",
  },
];

export const solutions = [
  {
    title: "Find by motion",
    description: "Choose the motion behavior first, then narrow the suitable absorber family.",
    items: ["Linear free motion", "Motor-driven linear motion", "Cylinder-driven motion", "Rotary motion"],
  },
  {
    title: "Find by drive",
    description: "Good for engineers who know the actuator but still need family guidance.",
    items: ["Free motion", "External force", "Motor", "Cylinder"],
  },
];

export const downloads = [
  {
    title: "EKD Full Product Catalog",
    description: "Broad product overview for hydraulic shock absorbers and related motion control lines.",
    path: "/catalogs/ekd-full-catalog.pdf",
  },
  {
    title: "Vibration Isolator Catalog 2024",
    description: "Focused resource for vibration isolation product families and related applications.",
    path: "/catalogs/vibration-isolator-catalog-2024.pdf",
  },
];

export const companyHighlights = [
  "30+ employees with a core team carrying 15+ years of industry experience",
  "Application experience across standard industrial and demanding heavy-duty environments",
  "Quality and compliance references include ISO9001, ROHS and CE",
  "Engineering support for sizing review and application recommendations",
];

export function getFamilyBySlug(slug: string) {
  return productFamilies.find((family) => family.slug === slug);
}

export function getProductFamilyGroup(key: string) {
  return productFamilyGroups.find((group) => group.key === key);
}

export function getProductFamiliesByGroup(groupKey: ProductFamilyGroup["key"]) {
  return productFamilies.filter((family) => family.groupKey === groupKey);
}

export function getModelById(id: string) {
  return featuredModels.find((model) => model.id === id);
}

export function getFamilyModels(familySlug: string) {
  return featuredModels.filter((model) => model.familySlug === familySlug);
}
