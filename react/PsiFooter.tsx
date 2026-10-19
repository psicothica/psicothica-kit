/*! psicothica-kit 1.0.0 · PsiFooter — só depende de React. CSS: tokens.css + psi-components.css. */

export type PsiFooterProps = {
  /** Nome do app. */
  appName: string;
  /** Versão do app (ex.: "1.0.0"). */
  version: string;
  /** Mês/ano da última revisão (ex.: "10/2026"). */
  revisedAt: string;
  /** Mostra o bloco "aviso médico" (apps com conteúdo de saúde física). */
  medicalNotice?: boolean;
  className?: string;
};

/** Rodapé Psicothica. Os textos fixos vivem aqui; mudou o texto? Nova versão do kit. */
export function PsiFooter({ appName, version, revisedAt, medicalNotice = false, className = "" }: PsiFooterProps) {
  return (
    <footer className={`psi-footer ${className}`.trim()} role="contentinfo">
      <div className="psi-footer__inner">
        <p className="psi-footer__app">{appName}</p>
        <p className="psi-footer__assinatura">
          <strong>Psicothica</strong> · por Alanne Raquel Fragoso de Farias, psicóloga (CRP 13/9646)
          <br />
          Disponível no Programa Ramificar da AyA Clínica Integrada.
        </p>
        <p>
          Material informativo e de apoio. Não substitui avaliação, diagnóstico ou acompanhamento profissional, e não
          oferece promessa de cura ou de resultado.
        </p>
        {medicalNotice && (
          <p className="psi-footer__medico">
            As informações sobre diagnóstico e tratamento médico têm caráter apenas informativo e se baseiam em literatura
            científica publicada. Decisões sobre medicação ou tratamento devem ser tomadas com seu(sua) médico(a).
          </p>
        )}
        <p>
          Conteúdo e interface elaborados com auxílio de ferramentas de inteligência artificial e revisados pela
          profissional responsável.
        </p>
        <p>
          Seus dados ficam só neste aparelho. Nada do que você escreve é enviado à AyA nem a terceiros. Se você exportar
          um arquivo, ele levará o que você escreveu: guarde-o com cuidado.
        </p>
        <p className="psi-footer__crise">
          Em sofrimento intenso ou risco?{" "}
          <a href="tel:188" target="_blank" rel="noopener noreferrer">
            CVV 188
          </a>{" "}
          (gratuito, 24h) ·{" "}
          <a href="tel:192" target="_blank" rel="noopener noreferrer">
            SAMU 192
          </a>{" "}
          · ou a emergência mais próxima.
        </p>
        <p className="psi-footer__versao">
          Versão {version} · revisado em {revisedAt}
        </p>
      </div>
    </footer>
  );
}

export default PsiFooter;
