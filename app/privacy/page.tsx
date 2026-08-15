import { LegalDocumentLayout } from "@/components/legal/LegalDocumentLayout";
import { privacySections } from "@/components/legal/legal-content";

export default function PrivacyPage() {
  return (
    <LegalDocumentLayout
      title="Política de Privacidad"
      updatedAt="15 de agosto de 2026"
      intro="Esta Política explica cómo Zentt recopila, utiliza, almacena y protege la información personal y comercial de sus usuarios y de los terceros que interactúan con sus sitios públicos."
      sections={privacySections}
    />
  );
}
