/*! psicothica-kit 1.0.0 · psi-storage.js
 *
 * Armazenamento local com prefixo por app: psi.<slug>.v1.<chave>.
 * Motivo: todos os apps dividem a origem psicothica.github.io (e o localStorage dela). Com prefixo por
 * app, cada app lê, grava, exporta e apaga SÓ as suas chaves.
 *
 * Uso (script clássico):  <script src="psi-kit/js/psi-storage.js"></script>
 *   const store = PsiStorage.create({ slug: "balanca-da-decisao", appName: "Balança da Decisão", version: "1.0.0" });
 *   store.set("decisoes", [...]); store.get("decisoes", []);
 *   store.exportJSON();  // objeto  |  store.download();  // baixa o arquivo
 *   await store.importFile(file);  // valida o app ANTES de gravar
 *   store.migrate([{ from: "psicothica:decisoes:lista", to: "decisoes" }]);  // uma vez
 * Uso (CommonJS): const { create } = require("./psi-storage.js"). Em apps Vite/ES modules use psi-storage.ts.
 * Sem dependências, sem requisição externa.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PsiStorage = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var KIT_VERSION = "1.0.0";
  var SCHEMA = 1;
  var MIGRATED_FLAG = "__migrated";
  var DEFAULT_WARNING = "Seus registros não serão salvos neste navegador.";

  function isSlug(s) {
    return typeof s === "string" && /^[a-z0-9][a-z0-9-]*$/.test(s);
  }

  /** Teste real de gravação: localStorage pode existir e mesmo assim lançar erro (modo privado, bloqueio). */
  function probe(storage) {
    try {
      if (!storage) return false;
      var k = "__psi_probe__";
      storage.setItem(k, "1");
      storage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }

  function create(options) {
    options = options || {};
    var slug = options.slug;
    if (!isSlug(slug)) throw new Error("PsiStorage: informe `slug` (minúsculas, números e hífen).");
    var appName = options.appName || slug;
    var version = options.version || "0.0.0";
    var prefix = "psi." + slug + ".v1.";
    var ls = options.storage !== undefined ? options.storage : (typeof localStorage !== "undefined" ? safeLocal() : null);
    var persistent = probe(ls);
    var memory = Object.create(null); // chave sem prefixo -> texto JSON
    var warned = false;

    function safeLocal() {
      try { return localStorage; } catch (e) { return null; }
    }

    function warn() {
      if (warned) return;
      warned = true;
      var msg = options.warningText || DEFAULT_WARNING;
      if (typeof options.onWarning === "function") { options.onWarning(msg); return; }
      showBanner(msg);
    }

    function showBanner(msg) {
      if (typeof document === "undefined") return;
      function insert() {
        if (document.querySelector("[data-psi-warning]")) return;
        var el = document.createElement("p");
        el.className = "psi-warning";
        el.setAttribute("role", "alert");
        el.setAttribute("data-psi-warning", "");
        // estilo mínimo embutido: o aviso aparece mesmo se psi-components.css não foi carregado
        el.style.cssText = "margin:0;padding:12px 16px;background:#3a1d00;color:#ffe2b8;border-bottom:2px solid #ffb04a;font:15px/1.4 system-ui,sans-serif;text-align:center";
        el.textContent = msg;
        document.body.insertBefore(el, document.body.firstChild);
      }
      if (document.body) insert();
      else document.addEventListener("DOMContentLoaded", insert);
    }

    if (!persistent) warn();

    function rawGet(key) {
      if (persistent) {
        try { var v = ls.getItem(prefix + key); if (v !== null) return v; } catch (e) { /* cai para memória */ }
      }
      return key in memory ? memory[key] : null;
    }

    function rawSet(key, text) {
      if (persistent) {
        try { ls.setItem(prefix + key, text); delete memory[key]; return true; }
        catch (e) { persistent = false; warn(); } // cota cheia ou bloqueio no meio do uso
      }
      memory[key] = text;
      return false;
    }

    function get(key, fallback) {
      var raw = rawGet(key);
      if (raw === null) return fallback;
      try { return JSON.parse(raw); } catch (e) { return raw; }
    }

    function set(key, value) {
      return rawSet(key, JSON.stringify(value));
    }

    function remove(key) {
      delete memory[key];
      if (persistent) { try { ls.removeItem(prefix + key); } catch (e) { /* ignora */ } }
    }

    /** Chaves do PRÓPRIO app (sem o prefixo). */
    function keys() {
      var out = [];
      if (persistent) {
        try {
          for (var i = 0; i < ls.length; i++) {
            var k = ls.key(i);
            if (k && k.indexOf(prefix) === 0) out.push(k.slice(prefix.length));
          }
        } catch (e) { /* ignora */ }
      }
      for (var m in memory) if (out.indexOf(m) === -1) out.push(m);
      return out.filter(function (k) { return k !== MIGRATED_FLAG; }).sort();
    }

    /** Pacote de exportação: SÓ as chaves deste app, com metadados. */
    function exportJSON() {
      var data = {};
      keys().forEach(function (k) { data[k] = get(k, null); });
      return {
        kit: "psicothica-kit",
        schema: SCHEMA,
        app: slug,
        appName: appName,
        version: version,
        exportedAt: new Date().toISOString(),
        data: data,
      };
    }

    function download(filename) {
      var name = filename || slug + "-" + new Date().toISOString().slice(0, 10) + ".json";
      var blob = new Blob([JSON.stringify(exportJSON(), null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      return name;
    }

    /** Valida e grava. Aceita texto JSON ou objeto. Lança Error (pt-BR) se o arquivo não for DESTE app. */
    function importJSON(input) {
      var pack = input;
      if (typeof input === "string") {
        try { pack = JSON.parse(input); }
        catch (e) { throw new Error("Não foi possível ler o arquivo. Verifique se ele está íntegro."); }
      }
      if (!pack || typeof pack !== "object" || pack.kit !== "psicothica-kit" || typeof pack.app !== "string" ||
          !pack.data || typeof pack.data !== "object" || Array.isArray(pack.data)) {
        throw new Error("Este arquivo não é um backup de um app Psicothica.");
      }
      if (pack.app !== slug) {
        throw new Error("Este arquivo é de outro app (" + (pack.appName || pack.app) + "). Nada foi importado.");
      }
      var names = Object.keys(pack.data);
      // valida os nomes ANTES de gravar qualquer coisa
      names.forEach(function (k) {
        if (!/^[A-Za-z0-9_.:-]{1,80}$/.test(k) || k === MIGRATED_FLAG) throw new Error("O arquivo tem uma chave inválida (" + k + "). Nada foi importado.");
      });
      names.forEach(function (k) { rawSet(k, JSON.stringify(pack.data[k])); });
      return names.length;
    }

    function importFile(file) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () {
          try { resolve(importJSON(String(reader.result))); } catch (e) { reject(e); }
        };
        reader.onerror = function () { reject(new Error("Falha ao abrir o arquivo.")); };
        reader.readAsText(file);
      });
    }

    /**
     * Migração única de chaves antigas (de antes do prefixo). `legacy` = lista de strings (a chave
     * nova repete o nome) ou de { from, to }. Copia o valor bruto e apaga a chave antiga. Só roda
     * uma vez por navegador (guarda uma marca no próprio prefixo). Devolve quantas chaves moveu.
     */
    function migrate(legacy) {
      if (!persistent || rawGet(MIGRATED_FLAG) !== null) return 0;
      var moved = 0;
      (legacy || []).forEach(function (item) {
        var from = typeof item === "string" ? item : item.from;
        var to = typeof item === "string" ? item : item.to;
        if (!from || !to || from.indexOf("psi.") === 0) return;
        try {
          var raw = ls.getItem(from);
          if (raw === null) return;
          if (ls.getItem(prefix + to) === null) { ls.setItem(prefix + to, raw); moved++; }
          ls.removeItem(from);
        } catch (e) { /* segue */ }
      });
      rawSet(MIGRATED_FLAG, JSON.stringify({ at: new Date().toISOString(), moved: moved }));
      return moved;
    }

    return {
      get: get, set: set, remove: remove, keys: keys,
      exportJSON: exportJSON, download: download,
      importJSON: importJSON, importFile: importFile,
      migrate: migrate,
      prefix: prefix,
      get persistent() { return persistent; },
    };
  }

  return { create: create, version: KIT_VERSION };
});
