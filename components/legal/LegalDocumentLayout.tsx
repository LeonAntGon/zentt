import Link from "next/link";
import Footer from "@/components/landing/Footer";
import { ZenttLogo } from "@/components/landing/ZenttLogo";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export function LegalDocumentLayout({
  title,
  updatedAt,
  intro,
  sections,
}: {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" aria-label="Volver a Zentt">
            <ZenttLogo className="h-9 w-auto" />
          </Link>
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-14 lg:px-8 lg:py-20">
        <p className="page-eyebrow">Información legal</p>
        <h1 className="page-title mt-3 max-w-3xl text-3xl sm:text-4xl md:text-5xl">{title}</h1>
        <p className="mt-4 text-sm font-medium text-slate-500">Última actualización: {updatedAt}</p>
        <p className="mt-8 max-w-3xl text-base leading-8 text-slate-700">{intro}</p>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-heading text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-8 text-slate-700">
                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets && (
                  <ul className="list-disc space-y-2 pl-6">
                    {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
