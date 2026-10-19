// Gera demo/index.html e demo/embed.html a partir dos blocos reais de html/ (para o demo nunca
// divergir do kit). Uso: node scripts/gerar-demo.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const K = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(K, p), "utf8");
const write = (p, s) => fs.writeFileSync(path.join(K, p), s);
// tira o comentário de instruções do começo do bloco
const strip = (s) => s.replace(/<!--[\s\S]*?-->\s*/, "");
// no demo, os arquivos do kit ficam um nível acima (../), e não em psi-kit/
const hdr = (name) => strip(read("html/psi-header.html")).replaceAll("psi-kit/", "../").replace("Nome do app", name);
const ftr = (attrs, name) =>
  strip(read("html/psi-footer.html")).replaceAll("psi-kit/", "../").replace(
    'data-psi-app="Nome do app" data-psi-versao="1.0.0" data-psi-revisao="10/2026"',
    `data-psi-app="${name}" data-psi-versao="1.0.0" data-psi-revisao="10/2026"${attrs}`,
  );
const head = (t) => `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t}</title>
<link rel="icon" href="../logo/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="../logo/apple-touch-icon.png">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../psi-components.css">`;

write("demo/embed.html", `${head("Demo embutido · psicothica-kit")}
<style>.demo-corpo{max-width:var(--psi-container);margin:0 auto;padding:var(--psi-space-4)}.demo-corpo p{margin:0;color:var(--psi-text-muted);font-size:var(--psi-text-sm)}</style>
</head>
<body class="psi-theme">
${hdr("App de exemplo")}
<main class="demo-corpo"><p>Esta página roda dentro de um iframe: o cabeçalho ficou compacto (logo pequena + selo, uma linha).</p></main>
${ftr("", "App de exemplo")}
</body>
</html>
`);

write(
  "demo/index.html",
  read("scripts/demo.template.html")
    .replace("<!--HEAD-->", head("psicothica-kit 1.0.1 · demo"))
    .replace("<!--HEADER-->", hdr("Balança da Decisão"))
    .replace("<!--FOOTER-SEM-->", ftr("", "App sem aviso médico"))
    .replace("<!--FOOTER-COM-->", ftr(" data-psi-aviso-medico", "App com aviso médico"))
    .replace(
      "<!--FOOTER-COLAB-->",
      ftr(
        ` data-psi-colaboradores='[{"nome":"Nome Exemplo","profissao":"nutricionista","registro":"CRN 0/0000 — exemplo"},{"nome":"Outra Pessoa Exemplo","profissao":"médica","registro":"CRM 0000 — exemplo"}]'`,
        "App com colaboradores (exemplo)",
      ),
    ),
);
console.log("demo gerado");
