# psicothica-kit

Kit visual único dos apps terapêuticos gratuitos da **Psicothica** (marca de Alanne Raquel Fragoso de Farias, psicóloga, CRP 13/9646), exibidos no Programa Ramificar da AyA Clínica Integrada.

**Versão atual: 1.0.0** (arquivo `VERSION`). Demonstração: `https://psicothica.github.io/psicothica-kit/demo/`.

Cada app **copia** os arquivos do kit para dentro de si (sem submodule, sem `npm link`, sem dependência entre repositórios) e registra a versão usada. Nada do kit faz requisição a domínio externo: as fontes são locais.

## O que tem aqui

| Caminho | Para quê |
|---|---|
| `tokens.css` | Variáveis `--psi-*` (cores, gradientes, vidro, brilho, raios, espaços, tipografia) e `@font-face` locais |
| `psi-components.css` | Cabeçalho, rodapé, vidro, cartão, botão, selo e aviso de armazenamento (tudo com prefixo `.psi-`) |
| `fonts/` | 6 fontes OFL em WOFF2 (latin + latin-ext) e `fonts/licenses/` |
| `logo/` | Logomarca em PNG e WebP (512, 256, 128, 64, 32), `favicon.ico`, `apple-touch-icon.png` |
| `html/psi-header.html`, `html/psi-footer.html` | Blocos para apps de HTML único |
| `react/PsiHeader.tsx`, `react/PsiFooter.tsx` | O mesmo cabeçalho e rodapé para apps Vite/React |
| `js/psi-storage.js` e `js/psi-storage.ts` | Armazenamento local por app, exportar/importar JSON, migração de chaves antigas |
| `docs/contraste.md` | Tabela de contraste WCAG e regras de uso das cores |
| `demo/` | Página de demonstração (gerada por `scripts/gerar-demo.mjs`) |
| `tests/` | Testes do helper de armazenamento (`node --test tests/*.test.mjs`) |

## Regras da marca

- Fontes: **Bebas Neue** (display), **Shrikhand** (acento), **Amatic SC** (manuscrito), **Great Vibes** (assinatura), **JetBrains Mono** (sistema/dados), **Plus Jakarta Sans** (texto corrido). Todas OFL.
- **Extenda 60 GIGA e Brittany são fontes comerciais de uso exclusivo no Canva. Nunca entram neste kit nem em nenhum app.** Bebas Neue e Great Vibes são as escolhas definitivas fora do Canva.
- Base escura `#0f142a`, destaque `#e1eefc`. Magenta-violeta `#b104dc` e índigo `#130169` **não** servem como cor de texto pequeno em fundo escuro (veja `docs/contraste.md`).
- A logo é a do arquivo `logomarcidentidnov.png` da marca, sem vetorizar.

## Aplicar num app de HTML único

O app é publicado como arquivos estáticos (GitHub Pages), então pode ter uma pasta ao lado do `index.html`.

1. Copie para o repositório do app:
   - `tokens.css`, `psi-components.css`, a pasta `fonts/` (pode apagar `fonts/licenses/` só se mantiver as licenças no repositório), a pasta `logo/` e `js/psi-storage.js`
   - tudo dentro de uma pasta **`psi-kit/`** (ex.: `psi-kit/tokens.css`, `psi-kit/fonts/`, `psi-kit/logo/`, `psi-kit/js/psi-storage.js`). `tokens.css` e `fonts/` precisam ficar **juntos**.
2. No `<head>` do `index.html`:
   ```html
   <!-- psicothica-kit 1.0.0 -->
   <link rel="icon" href="psi-kit/logo/favicon.ico" sizes="any">
   <link rel="apple-touch-icon" href="psi-kit/logo/apple-touch-icon.png">
   <link rel="stylesheet" href="psi-kit/tokens.css">
   <link rel="stylesheet" href="psi-kit/psi-components.css">
   ```
3. No `<body>`: use `class="psi-theme"` (fundo e texto da marca). Cole `html/psi-header.html` **logo depois de `<body>`** (o script dele precisa rodar antes do cabeçalho aparecer) e troque "Nome do app". Cole `html/psi-footer.html` no fim do `<body>` e preencha `data-psi-app`, `data-psi-versao`, `data-psi-revisao`; deixe `data-psi-aviso-medico` só nos apps com conteúdo de saúde física.
4. **Linha de registro** (obrigatória), no topo do `index.html`, logo depois do `<!doctype html>`:
   ```html
   <!-- psicothica-kit 1.0.0 -->
   ```
5. Armazenamento, no script do app:
   ```html
   <script src="psi-kit/js/psi-storage.js"></script>
   <script>
     const store = PsiStorage.create({ slug: "balanca-da-decisao", appName: "Balança da Decisão", version: "1.0.0" });
     // migração ÚNICA das chaves de antes do prefixo (cada app lista as suas):
     store.migrate([{ from: "psicothica:decisoes:lista", to: "decisoes" }]);
   </script>
   ```
   Troque as chamadas diretas a `localStorage.getItem/setItem` por `store.get/set`. O botão de exportar chama `store.download()`; o de importar usa `store.importFile(arquivo)`.

## Aplicar num app Vite/React

1. Copie para **`src/psi-kit/`**: `tokens.css`, `psi-components.css`, a pasta `fonts/`, `react/PsiHeader.tsx`, `react/PsiFooter.tsx` e `js/psi-storage.ts`. Copie a pasta `logo/` para **`public/psi-kit/logo/`** e o `favicon.ico` e `apple-touch-icon.png` também para `public/psi-kit/logo/` (ou use os do app).
2. Em `src/main.tsx`:
   ```ts
   // psicothica-kit 1.0.0
   import "./psi-kit/tokens.css";
   import "./psi-kit/psi-components.css";
   ```
   e no `index.html`, `<body class="psi-theme">` mais a linha `<!-- psicothica-kit 1.0.0 -->` logo depois do `<!doctype html>`.
3. **`base` do Vite para o GitHub Pages**: o site fica em `/<nome-do-repo>/`, então em `vite.config.ts`:
   ```ts
   export default defineConfig({
     base: "/nome-do-repo/",   // ex.: "/aya-navegador-emocional/"
     // ...
   });
   ```
   Sem isso, o `index.html` aponta para `/assets/...` e a página abre em branco. Em desenvolvimento nada muda.
4. Use os componentes:
   ```tsx
   import { PsiHeader } from "./psi-kit/PsiHeader";
   import { PsiFooter } from "./psi-kit/PsiFooter";
   import { create } from "./psi-kit/psi-storage";

   const assets = import.meta.env.BASE_URL + "psi-kit/";   // inclui o base do Vite
   <PsiHeader appName="Navegador Emocional" assetsBase={assets} />
   <PsiFooter appName="Navegador Emocional" version="1.0.0" revisedAt="10/2026" />
   const store = create({ slug: "navegador-emocional", appName: "Navegador Emocional", version: "1.0.0" });
   ```
   (Ajuste os caminhos de import conforme onde colocar os arquivos.) O kit não adiciona dependência além de React.

## Modo embutido (iframe)

Os apps aparecem dentro de um iframe no AyAClin, que já mostra o nome do app numa faixa acima. Quando `window.self !== window.top`, o cabeçalho fica compacto: logo pequena + selo, uma linha, e o nome do app só para leitores de tela. Fora do iframe, ele é completo.

- **HTML**: um script curto marca `<html class="psi-embedded">` antes de o cabeçalho ser desenhado (por isso o bloco vai no topo do `<body>`).
- **React**: a detecção é feita no estado inicial do componente, antes da primeira renderização. Em apps com renderização no servidor, passe `embedded` explicitamente.

Links que saem da página usam `target="_blank" rel="noopener noreferrer"` (os links `tel:` do rodapé também).

## Armazenamento por app

Todos os apps ficam na origem `psicothica.github.io` e **dividem o mesmo `localStorage`**. Por isso cada app usa o prefixo `psi.<slug>.v1.` e só lê, grava, exporta e apaga as chaves do próprio prefixo. O arquivo exportado leva metadados (`app`, `version`, `exportedAt`) e **a importação recusa arquivo de outro app antes de gravar qualquer coisa**.

Se o navegador bloquear o armazenamento (modo privado, bloqueio de dados de sites), o helper continua funcionando em memória e mostra o aviso "Seus registros não serão salvos neste navegador."

## Atualizar o kit num app

1. Compare `VERSION` e `CHANGELOG.md` com a linha `psicothica-kit x.y.z` do app.
2. Substitua os arquivos copiados pelos da nova versão (não edite o kit dentro do app: mudou? mude aqui e publique versão nova).
3. Atualize a linha de registro.

Mudança de versão maior pode pedir ajuste no app; o `CHANGELOG.md` diz o quê.

## Desenvolvimento do kit

```bash
node --test tests/*.test.mjs     # testes do psi-storage
node scripts/contraste.mjs       # tabela de contraste
node scripts/gerar-demo.mjs      # regera demo/ a partir dos blocos de html/
```

O fluxo de publicação (`.github/workflows/pages.yml`) roda os testes, confere se `demo/` está em dia e publica no GitHub Pages. Para ativar: **Settings → Pages → Source: GitHub Actions**.
