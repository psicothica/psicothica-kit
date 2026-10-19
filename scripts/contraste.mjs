// Calcula a razão de contraste WCAG 2.1 entre cores de texto e fundos do kit.
// Uso: node scripts/contraste.mjs   (gera a tabela em Markdown no stdout)
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// camada translúcida (rgba) sobre um fundo opaco
const over = (fg, a, bg) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));

const BASE = hex("#0f142a");
const FROST = hex("#e1eefc");
const fundos = {
  "base #0f142a": BASE,
  "vidro sobre a base": over(FROST, 0.06, BASE),
  "vidro forte sobre a base": over(FROST, 0.12, BASE),
  "gradiente noite #04223d": hex("#04223d"),
  "gradiente oceano #01366d": hex("#01366d"),
  "gradiente aurora #422774": hex("#422774"),
  "papel #ffffff": hex("#ffffff"),
};
const textos = {
  "destaque #e1eefc": "#e1eefc",
  "texto secundário #b4c0d9": "#b4c0d9",
  "céu #82e5ff": "#82e5ff",
  "lavanda #ec9eff": "#ec9eff",
  "ciano #02bbff": "#02bbff",
  "orquídea #ce57df": "#ce57df",
  "magenta-violeta #b104dc": "#b104dc",
  "índigo #130169": "#130169",
  "base #0f142a (sobre papel)": "#0f142a",
};
const linhas = ["| Texto ↓ · Fundo → | " + Object.keys(fundos).join(" | ") + " |", "|---|" + Object.keys(fundos).map(() => "---|").join("")];
for (const [nome, h] of Object.entries(textos)) {
  const cel = Object.values(fundos).map((bg) => {
    const r = ratio(hex(h), bg);
    return `${r.toFixed(2)} ${r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "só grande" : "NÃO"}`;
  });
  linhas.push(`| ${nome} | ${cel.join(" | ")} |`);
}
console.log(linhas.join("\n"));
