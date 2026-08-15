import { type ComponentType } from "react";

type SocialIconButtonProps = {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
};

export function SocialIconButton({
  href,
  icon: Icon,
  label,
}: SocialIconButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm transition-all hover:shadow-md hover:border-slate-300 hover:text-slate-900"
    >
      <Icon className="h-5 w-5" />
    </a>
  );
}
