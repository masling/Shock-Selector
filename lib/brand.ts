// Confirmed website identity. The English form is documented in the CE and
// RoHS materials; do not describe it as an English-language registration.
export const brand = {
  name: "EKD",
  appName: "EKD VibroAbsorber",
  company: "力科丹普",
  legalCompanyZh: "江苏力科丹普机械技术有限公司",
  companyEnglish: "Jiangsu EKD Machinery Technical Co., Ltd.",
  logo: "/brand/ekd-likedanpu-horizontal.png",
  email: "service@vibroabsorber.com",
  whatsapp: {
    displayNumber: "+86 180 6944 9700",
    href: "https://wa.me/8618069449700",
  },
  website: "https://www.vibroabsorber.com",
} as const;

export function getBrandCompanyName(locale: string) {
  return locale === "zh-cn" ? brand.legalCompanyZh : brand.companyEnglish;
}
