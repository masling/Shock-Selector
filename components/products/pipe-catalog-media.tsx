import { productImageUrl } from "@/lib/catalog/product-media";
import type { Locale } from "@/lib/i18n/config";

const captions = {
  en: { title: "Product photos & structure", photo: "Catalog product photo", drawing: "Series structure reference", source: "Source: EKD Special Isolator catalog, p.", note: "Series reference only. Confirm dimensions for the selected model before installation.", preview: "Local preview · publication review pending" },
  "zh-cn": { title: "产品图片与结构", photo: "目录产品实物图", drawing: "系列结构参考图", source: "来源：EKD 特种隔振器目录，第", note: "此图为系列结构参考，安装前请核对所选型号的具体尺寸。", preview: "本地预览 · 待发布审核" },
  de: { title: "Produktfotos & Aufbau", photo: "Produktfotos aus dem Katalog", drawing: "Aufbau der Serie", source: "Quelle: EKD Special Isolator Katalog, S.", note: "Serienreferenz. Vor dem Einbau die Abmessungen des gewählten Modells prüfen.", preview: "Lokale Vorschau · Freigabe ausstehend" },
  fr: { title: "Photos et structure", photo: "Photo produit du catalogue", drawing: "Structure de référence de la série", source: "Source : catalogue EKD Special Isolator, p.", note: "Référence de série. Vérifiez les dimensions du modèle choisi avant installation.", preview: "Aperçu local · publication en attente de validation" },
  it: { title: "Foto e struttura", photo: "Foto prodotto dal catalogo", drawing: "Struttura di riferimento della serie", source: "Fonte: catalogo EKD Special Isolator, p.", note: "Riferimento di serie. Verificare le dimensioni del modello scelto prima dell'installazione.", preview: "Anteprima locale · pubblicazione da approvare" },
} satisfies Record<Locale, Record<string, string>>;

const figures = [
  { series: "JYXR_P", key: "JYXR_P", label: "JYXR(P)", page: 27, drawing: false, width: 329, height: 222 },
  { series: "JYXR_H", key: "JYXR_H", label: "JYXR(H)", page: 29, drawing: false, width: 374, height: 218 },
  { series: "JYXR_P", key: "JYXR_P_DRAWING", label: "JYXR(P)", page: 27, drawing: true, width: 315, height: 358 },
] as const;

export function PipeCatalogMedia({ locale, seriesCodes }: { locale: Locale; seriesCodes: string[] }) {
  const copy = captions[locale];
  const available = figures.filter((figure) => seriesCodes.includes(figure.series)).flatMap((figure) => {
    const src = productImageUrl(figure.key);
    return src ? [{ ...figure, src }] : [];
  });
  if (available.length === 0) return null;
  return (
    <section className="mt-8 border-y border-line py-6">
      <h2 className="text-xl font-semibold">{copy.title}</h2>
      <div className="mt-5 flex flex-wrap gap-8">
        {available.map((figure) => (
          <figure key={figure.key} className="w-full max-w-[340px] sm:min-w-[240px] sm:flex-1">
            {/* Original catalog pixels, served only through the local preview endpoint. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={figure.src} alt={`${figure.label} — ${figure.drawing ? copy.drawing : copy.photo}`} width={figure.width} height={figure.height} loading="lazy" className="h-56 w-full object-contain" />
            <figcaption className="mt-4 text-sm leading-6">
              <p className="font-semibold">{figure.label} · {figure.drawing ? copy.drawing : copy.photo}</p>
              <p className="mt-1 text-xs text-steel">{copy.source} {figure.page}{locale === "zh-cn" ? " 页" : ""}</p>
              {figure.drawing && <p className="mt-2 text-xs text-steel">{copy.note}</p>}
            </figcaption>
          </figure>
        ))}
      </div>
      {process.env.NODE_ENV !== "production" && <p className="mt-4 text-xs text-steel">{copy.preview}</p>}
    </section>
  );
}
