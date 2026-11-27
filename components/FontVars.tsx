/**
 * Define las variables CSS de fuentes (--font-body, --font-heading,
 * --font-public) a nivel :root desde cada layout. Así los portales (modales,
 * toasts) también las heredan, y cada segmento solo carga las fuentes que usa.
 */
export function FontVars({ vars }: { vars: Record<string, string> }) {
  const css = Object.entries(vars)
    .map(([name, family]) => `${name}:${family};`)
    .join("");
  return <style>{`html:root{${css}}`}</style>;
}
