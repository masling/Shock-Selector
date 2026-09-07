import Image from "next/image";
import { editorialUi, getSeriesEditorial } from "@/lib/catalog/series-editorial";

export function SeriesCatalogFigure({ code, locale }: { code: string; locale: string }) {
  const editorial = getSeriesEditorial(code, locale);
  if (!editorial?.figure) return null;
  const { figure } = editorial;
  const ui = editorialUi(locale);
  return (
    <section className="mt-10 border-y border-line py-8" lang={editorial.language}>
      <div className="grid items-center gap-7 md:grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)]">
        <a href={figure.media.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg bg-white p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
          <Image src={figure.media.url} alt={figure.title} width={figure.media.width} height={figure.media.height} sizes="(min-width: 768px) 55vw, 100vw" className="max-h-[380px] w-full object-contain" />
        </a>
        <div>
          <h2 className="text-2xl font-semibold leading-tight">{figure.title}</h2>
          <p className="mt-4 max-w-prose text-sm leading-7 text-steel">{figure.description}</p>
          <p className="mt-4 text-xs leading-6 text-steel">{ui.catalog} · {ui.page} {figure.media.pdfPage}</p>
        </div>
      </div>
    </section>
  );
}
