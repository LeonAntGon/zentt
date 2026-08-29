import Link from "next/link";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

const Footer = () => (
  <footer className="py-10 bg-card border-t border-border/50">
    <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} Zentt. Todos los derechos reservados.
      </p>
      <div className="flex gap-6 text-sm text-muted-foreground">
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
