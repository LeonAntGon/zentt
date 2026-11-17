import Link from "next/link";
import { MapPin } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { WA_MESSAGES, waHref } from "@/components/landing/whatsapp";

const Footer = () => (
  <footer className="py-10 bg-card border-t border-border/50">
    <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex flex-col items-center gap-1 md:items-start">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Zentt. Todos los derechos reservados.
        </p>
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin size={12} className="text-primary" aria-hidden />
          Hecho en Tucumán
          <span className="text-muted-foreground/50" aria-hidden>
            ·
          </span>
          Leonardo González
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <Link href="/privacy" className="hover:text-foreground transition-colors">
          Privacidad
        </Link>
        <Link href="/terms" className="hover:text-foreground transition-colors">
          Términos
        </Link>
        <a
          href="mailto:leonarddevweb@gmail.com"
          className="hover:text-foreground transition-colors"
        >
          Contacto
        </a>
        <a
          href={waHref(WA_MESSAGES.demo)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <WhatsAppIcon className="h-5 w-5 text-whatsapp" title="" />
          WhatsApp
        </a>
        <a
          href="https://www.instagram.com/somoszentt/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram de Zentt"
          className="hover:text-foreground transition-colors"
        >
          <InstagramIcon className="h-5 w-5" />
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
