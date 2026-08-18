import { cn } from "@/lib/utils";

type ZenttMarkIconProps = {
  className?: string;
  size?: number;
};

/**
 * Monograma Zentt (t con forma de pino) desde assets/t-logotipo.png.
 */
export function ZenttMarkIcon({ className, size = 18 }: ZenttMarkIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/t-logotipo.png"
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      className={cn("shrink-0 object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
