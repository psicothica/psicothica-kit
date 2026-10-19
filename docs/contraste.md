# Contraste das cores do kit (WCAG 2.1)

Razões calculadas por `node scripts/contraste.mjs`. Legenda: **AAA** ≥ 7 · **AA** ≥ 4,5 (texto pequeno) · **só grande** ≥ 3 (texto ≥ 24px, ou ≥ 19px em negrito) · **NÃO** < 3.

Vidro = camada translúcida do kit (`--psi-glass-bg` 6% e `--psi-glass-bg-strong` 12%) sobre a base `#0f142a`.

| Texto ↓ · Fundo → | base #0f142a | vidro sobre a base | vidro forte sobre a base | gradiente noite #04223d | gradiente oceano #01366d | gradiente aurora #422774 | papel #ffffff |
|---|---|---|---|---|---|---|---|
| destaque #e1eefc | 15.46 AAA | 13.49 AAA | 11.42 AAA | 13.71 AAA | 10.19 AAA | 10.05 AAA | 1.18 NÃO |
| texto secundário #b4c0d9 | 9.95 AAA | 8.69 AAA | 7.35 AAA | 8.82 AAA | 6.56 AA | 6.47 AA | 1.83 NÃO |
| céu #82e5ff | 12.65 AAA | 11.04 AAA | 9.35 AAA | 11.22 AAA | 8.34 AAA | 8.23 AAA | 1.44 NÃO |
| lavanda #ec9eff | 9.45 AAA | 8.25 AAA | 6.98 AA | 8.38 AAA | 6.23 AA | 6.14 AA | 1.93 NÃO |
| ciano #02bbff | 8.28 AAA | 7.23 AAA | 6.12 AA | 7.34 AAA | 5.46 AA | 5.39 AA | 2.20 NÃO |
| orquídea #ce57df | 5.25 AA | 4.58 AA | 3.88 só grande | 4.65 AA | 3.46 só grande | 3.41 só grande | 3.47 só grande |
| magenta-violeta #b104dc | 3.40 só grande | 2.97 NÃO | 2.51 NÃO | 3.01 só grande | 2.24 NÃO | 2.21 NÃO | 5.36 AA |
| índigo #130169 | 1.07 NÃO | 1.07 NÃO | 1.26 NÃO | 1.05 NÃO | 1.42 NÃO | 1.44 NÃO | 16.99 AAA |
| base #0f142a (sobre papel) | 1.00 NÃO | 1.15 NÃO | 1.35 NÃO | 1.13 NÃO | 1.52 NÃO | 1.54 NÃO | 18.20 AAA |


## Regras de uso

**Aprovadas para texto pequeno** em qualquer fundo escuro do kit (base, vidro, gradientes): `#e1eefc` (destaque), `#b4c0d9` (secundário), `#82e5ff` (céu, links), `#ec9eff` (lavanda), `#02bbff` (ciano).

**Condicional:** orquídea `#ce57df` só como texto pequeno sobre a base, o vidro leve e o gradiente noite. Sobre vidro forte e os demais gradientes, só em texto grande.

**Proibidas para texto pequeno** em fundo escuro: magenta-violeta `#b104dc` e índigo `#130169`. Servem para preenchimento, borda, brilho e gradiente. Em fundo claro (`#ffffff`) o violeta passa AA (5,4:1) e o índigo passa AAA.

**Fundo claro (papel):** texto sempre em `#0f142a` (18,2:1). Texto claro sobre papel nunca.

**Texto sobre gradientes de marca:** os gradientes 1 a 5 têm pontas mais claras (`#5c8fe3`, `#68a1ed`) que reduzem o contraste. Use `--psi-text` sobre `--psi-grad-6` ou sobre vidro. Se precisar texto sobre os demais, confira o ponto mais claro sob o texto antes.
