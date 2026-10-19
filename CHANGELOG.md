# Changelog

Segue versionamento semântico: mudança que exige ajuste nos apps
(nomes de variáveis, props, formato do arquivo exportado) sobe a versão maior.

## 1.0.0 — 2026-10-19

Primeira versão.

- `tokens.css`: variáveis `--psi-*` (cores, 6 gradientes, vidro, brilho neon, raios, espaços,
  tipografia) e `@font-face` locais. Modo escuro por padrão. Contraste WCAG documentado.
- `psi-components.css`: cabeçalho, rodapé, vidro, cartão, botão, selo e aviso de armazenamento
  (escopo `.psi-`). Brilho animado só sem `prefers-reduced-motion`.
- `fonts/`: Bebas Neue, Shrikhand, Amatic SC, Great Vibes, JetBrains Mono e Plus Jakarta Sans
  (OFL, WOFF2, latin + latin-ext) com as licenças.
- `logo/`: logomarca em PNG e WebP (512, 256, 128, 64, 32), `favicon.ico` e `apple-touch-icon.png`.
- `html/psi-header.html`, `html/psi-footer.html` e `react/PsiHeader.tsx`, `react/PsiFooter.tsx`.
  Cabeçalho com modo embutido (iframe) decidido antes da primeira pintura.
- `js/psi-storage.js` e `.ts`: armazenamento com prefixo `psi.<slug>.v1.`, exportar/importar JSON
  por app, migração única de chaves antigas e aviso quando o navegador bloqueia o armazenamento.
- `demo/`: página de demonstração publicada no GitHub Pages.
