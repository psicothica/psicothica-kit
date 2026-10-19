/*! psicothica-kit 1.0.1 · PsiHeader — só depende de React. CSS: tokens.css + psi-components.css. */
import { useEffect, useState } from "react";

export type PsiHeaderProps = {
  /** Nome do app (aparece em destaque fora do iframe; fica só para leitores de tela dentro dele). */
  appName: string;
  /**
   * Pasta onde ficam os arquivos do kit servidos como estáticos (a pasta logo/ vai dentro dela).
   * Em Vite com GitHub Pages: `import.meta.env.BASE_URL + "psi-kit/"` (copie logo/ para public/psi-kit/logo/).
   */
  assetsBase?: string;
  /** Força o modo embutido (compacto) ou completo; por padrão detecta o iframe. */
  embedded?: boolean;
  className?: string;
};

/** true quando a página roda dentro de um iframe. */
function detectEmbedded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Cabeçalho Psicothica: logo + nome do app + selo. Dentro de um iframe (AyAClin) fica compacto: uma
 * linha, círculo oficial da logo e selo. Fora, mostra a logo completa e o nome do app. A detecção
 * é feita no estado inicial (síncrona), então não há "pisca".
 * Pensado para apps só de cliente (Vite SPA). Com SSR, o servidor renderiza o modo completo e o
 * cliente pode divergir: nesse caso passe `embedded` explicitamente.
 */
export function PsiHeader({ appName, assetsBase = "./psi-kit/", embedded, className = "" }: PsiHeaderProps) {
  const [auto] = useState(detectEmbedded);
  const compact = embedded ?? auto;

  // Mesma classe do bloco HTML, para o CSS do app poder reagir ao modo embutido.
  useEffect(() => {
    document.documentElement.classList.toggle("psi-embedded", compact);
  }, [compact]);

  const base = assetsBase.endsWith("/") ? assetsBase : assetsBase + "/";
  // Completa fora do iframe (44px); círculo oficial no modo embutido (28px).
  const [name1x, name2x, size] = compact ? ["logo-32", "logo-64", 28] : ["logo-128", "logo-256", 44];
  return (
    <header className={`psi-header${compact ? " psi-header--compact" : ""} ${className}`.trim()} role="banner">
      <div className="psi-header__inner">
        <picture className={`psi-header__logo psi-header__logo--${compact ? "crop" : "full"}`}>
          <source type="image/webp" srcSet={`${base}logo/${name1x}.webp 1x, ${base}logo/${name2x}.webp 2x`} />
          <img
            src={`${base}logo/${name1x}.png`}
            srcSet={`${base}logo/${name1x}.png 1x, ${base}logo/${name2x}.png 2x`}
            width={size}
            height={size}
            alt=""
            decoding="async"
          />
        </picture>
        <p className="psi-header__app">{appName}</p>
        <span className="psi-seal">Psicothica</span>
      </div>
    </header>
  );
}

export default PsiHeader;
