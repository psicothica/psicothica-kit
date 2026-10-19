// node --test tests/   (sem dependências)
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { create } = createRequire(import.meta.url)("../js/psi-storage.js");

function fakeLS(initial = {}, { throwOnSet = false } = {}) {
  const m = new Map(Object.entries(initial));
  return {
    get length() { return m.size; },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { if (throwOnSet) throw new Error("bloqueado"); m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    _m: m,
  };
}
const opts = (storage, slug = "app-a") => ({ slug, appName: "App A", version: "1.2.3", storage, onWarning: () => {} });

test("prefixo, get/set/remove/keys", () => {
  const ls = fakeLS();
  const s = create(opts(ls));
  s.set("x", { a: 1 });
  assert.deepEqual(s.get("x"), { a: 1 });
  assert.ok(ls._m.has("psi.app-a.v1.x"));
  assert.deepEqual(s.keys(), ["x"]);
  s.remove("x");
  assert.equal(s.get("x", "vazio"), "vazio");
});

test("exportar leva SÓ as chaves do próprio app (isolamento)", () => {
  const ls = fakeLS({ "psi.app-b.v1.segredo": '"do outro app"', "psicothica:nutrimente:registros": "[1]", rpg_m1: "1" });
  const s = create(opts(ls));
  s.set("meu", 1);
  const pack = s.exportJSON();
  assert.deepEqual(Object.keys(pack.data), ["meu"]);
  assert.equal(pack.app, "app-a");
  assert.equal(pack.version, "1.2.3");
  assert.ok(pack.exportedAt);
});

test("importar valida o app antes de gravar", () => {
  const a = create(opts(fakeLS(), "app-a"));
  const b = create(opts(fakeLS(), "app-b"));
  b.set("k", 7);
  assert.throws(() => a.importJSON(b.exportJSON()), /outro app/);
  assert.deepEqual(a.keys(), []);
  assert.throws(() => a.importJSON("{nao é json"), /íntegro/);
  assert.throws(() => a.importJSON({ foo: 1 }), /não é um backup/);
  const own = create(opts(fakeLS(), "app-a"));
  own.set("k", 9);
  assert.equal(a.importJSON(JSON.stringify(own.exportJSON())), 1);
  assert.equal(a.get("k"), 9);
});

test("importar recusa chave inválida sem gravar nada", () => {
  const a = create(opts(fakeLS()));
  const pack = { kit: "psicothica-kit", app: "app-a", data: { ok: 1, "ruim chave!": 2 } };
  assert.throws(() => a.importJSON(pack), /chave inválida/);
  assert.deepEqual(a.keys(), []);
});

test("migração única de chaves antigas", () => {
  const ls = fakeLS({ rpg_m1_contract: '"x"', "psicothica:decisoes:lista": "[]", intocada: "1" });
  const s = create(opts(ls));
  const n = s.migrate(["rpg_m1_contract", { from: "psicothica:decisoes:lista", to: "decisoes" }]);
  assert.equal(n, 2);
  assert.equal(s.get("rpg_m1_contract"), "x");
  assert.deepEqual(s.get("decisoes"), []);
  assert.equal(ls.getItem("rpg_m1_contract"), null);
  assert.equal(ls.getItem("intocada"), "1");
  ls.setItem("rpg_m1_contract", '"de novo"');
  assert.equal(s.migrate(["rpg_m1_contract"]), 0); // não roda duas vezes
  assert.equal(ls.getItem("rpg_m1_contract"), '"de novo"');
  assert.ok(!s.keys().includes("__migrated"));
});

test("localStorage bloqueado: cai para memória e avisa", () => {
  let avisos = 0;
  const s = create({ slug: "app-a", storage: fakeLS({}, { throwOnSet: true }), onWarning: () => avisos++ });
  assert.equal(s.persistent, false);
  assert.equal(avisos, 1);
  s.set("k", 5);
  assert.equal(s.get("k"), 5);
  assert.deepEqual(s.keys(), ["k"]);
});

test("storage nulo: memória + aviso; slug inválido lança", () => {
  let avisos = 0;
  const s = create({ slug: "app-a", storage: null, onWarning: () => avisos++ });
  assert.equal(avisos, 1);
  s.set("k", 1);
  assert.equal(s.get("k"), 1);
  assert.throws(() => create({ slug: "Ruim Slug" }), /slug/);
});
