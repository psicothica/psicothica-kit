# Changelog

Segue versionamento semântico: mudança que exige ajuste nos apps
(nomes de variáveis, props, formato do arquivo exportado) sobe a versão maior.

## 1.0.1 — 2026-10-19

Ajustes visuais e de texto.

- **Neon duplo:** o brilho passa a usar magenta/orquídea de um lado e ciano do outro, mais um halo
  suave dos dois. Tokens novos `--psi-neon-sm`, `--psi-neon`, `--psi-neon-lg` (box-shadow) e
  `--psi-neon-text-sm`, `--psi-neon-text`, `--psi-neon-text-lg` (text-shadow). Aplicado no selo,
  no botão principal, no título do cabeçalho e nos cartões de vidro em foco; novas classes
  `.psi-title-neon` e `.psi-title-neon--lg`. Os tokens `--psi-glow-magenta` e `--psi-glow-cyan`
  continuam, para uso pontual. Sem animação com `prefers-reduced-motion` (o brilho estático fica).
- **Fontes:** Bebas Neue sai; entra **Tektur 900 (Black)** como display de impacto. Great Vibes sai;
  entra **Allison** como assinatura. WOFF2 locais (latin + latin-ext) e licenças OFL. Os nomes das
  variáveis `--psi-font-display` e `--psi-font-signature` não mudaram. Tektur é mais larga que a
  Bebas: se algum app tinha títulos justos, revise a quebra de linha.
- **Logo nova** (`logo/source/logo-psicothica.png`, 2000 px, fundo transparente): 512, 256 e 128 px
  com a imagem inteira; 64 px, 32 px, `favicon.ico` e `apple-touch-icon.png` com o recorte do círculo
  central. A logo antiga foi removida. O cabeçalho completo usa a logo grande (128/256 px); o modo
  embutido usa o recorte (32/64 px). **Os apps precisam copiar a pasta `logo/` de novo**: os nomes
  de `logo-512` a `logo-32`, `favicon.ico` e `apple-touch-icon.png` se mantêm, mas as imagens mudaram.
- **Rodapé:** novo texto de autoria ("idealizado e revisado por…"), linha opcional de colaboração
  (`data-psi-colaboradores` no HTML, `collaborators` no React; aceita mais de um) e a linha de IA
  agora diz "revisados pelos profissionais responsáveis acima".
- Demo: neon duplo, fontes novas, logo completa e recorte, rodapé com colaboradores (exemplo
  fictício rotulado).

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
