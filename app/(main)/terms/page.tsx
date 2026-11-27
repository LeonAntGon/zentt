import { LegalDocumentLayout } from "@/components/legal/LegalDocumentLayout";
import { termsSections } from "@/components/legal/legal-content";

export default function TermsPage() {
  return (
    <LegalDocumentLayout
      title="Términos y Condiciones de Uso"
      updatedAt="15 de agosto de 2026"
      intro="Estos Términos regulan el acceso y uso del software de gestión y creación de páginas web Zentt, operado por Leonardo Antonio González desde la República Argentina."
      sections={termsSections}
    />
  );
}
