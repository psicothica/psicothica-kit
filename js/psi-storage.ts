/*! psicothica-kit 1.0.1 · psi-storage.ts — mesma lógica de psi-storage.js, como módulo ES tipado.
 *
 * Armazenamento local com prefixo por app: psi.<slug>.v1.<chave>.
 * Todos os apps dividem a origem psicothica.github.io; o prefixo faz cada app ler, gravar, exportar
 * e apagar SÓ as suas chaves.
 *
 *   import { create } from "./psi-kit/js/psi-storage";
 *   const store = create({ slug: "navegador-emocional", appName: "Navegador Emocional", version: "1.0.0" });
 */

export const KIT_VERSION = "1.0.1";
const SCHEMA = 1;
const MIGRATED_FLAG = "__migrated";
const DEFAULT_WARNING = "Seus registros não serão salvos neste navegador.";

export type PsiStorageOptions = {
  /** Identificador do app: minúsculas, números e hífen (vira parte do prefixo). */
  slug: string;
  appName?: string;
  /** Versão do app (vai nos metadados do arquivo exportado). */
  version?: string;
  /** Storage a usar (padrão: localStorage; útil em testes). */
  storage?: Storage | null;
  /** Texto do aviso quando o navegador não deixa gravar. */
  warningText?: string;
  /** Substitui o aviso visual padrão. */
  onWarning?: (mensagem: string) => void;
};

export type PsiBackup = {
  kit: "psicothica-kit";
  schema: number;
  app: string;
  appName: string;
  version: string;
  exportedAt: string;
  data: Record<string, unknown>;
};

export type PsiLegacyKey = string | { from: string; to: string };

export type PsiStore = {
  get<T = unknown>(key: string, fallback?: T): T;
  set(key: string, value: unknown): boolean;
  remove(key: string): void;
  keys(): string[];
  exportJSON(): PsiBackup;
  download(filename?: string): string;
  importJSON(input: string | unknown): number;
  importFile(file: File): Promise<number>;
  migrate(legacy: PsiLegacyKey[]): number;
  readonly prefix: string;
  readonly persistent: boolean;
};

function isSlug(s: unknown): s is string {
  return typeof s === "string" && /^[a-z0-9][a-z0-9-]*$/.test(s);
}

/** Teste real de gravação: localStorage pode existir e mesmo assim lançar erro (modo privado, bloqueio). */
function probe(storage: Storage | null): boolean {
  try {
    if (!storage) return false;
    const k = "__psi_probe__";
    storage.setItem(k, "1");
    storage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

function safeLocal(): Storage | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage : null;
  } catch {
    return null;
  }
}

function showBanner(msg: string): void {
  if (typeof document === "undefined") return;
  const insert = () => {
    if (document.querySelector("[data-psi-warning]")) return;
    const el = document.createElement("p");
    el.className = "psi-warning";
    el.setAttribute("role", "alert");
    el.setAttribute("data-psi-warning", "");
    // estilo mínimo embutido: o aviso aparece mesmo se psi-components.css não foi carregado
    el.style.cssText =
      "margin:0;padding:12px 16px;background:#3a1d00;color:#ffe2b8;border-bottom:2px solid #ffb04a;font:15px/1.4 system-ui,sans-serif;text-align:center";
    el.textContent = msg;
    document.body.insertBefore(el, document.body.firstChild);
  };
  if (document.body) insert();
  else document.addEventListener("DOMContentLoaded", insert);
}

export function create(options: PsiStorageOptions): PsiStore {
  const { slug } = options;
  if (!isSlug(slug)) throw new Error("PsiStorage: informe `slug` (minúsculas, números e hífen).");
  const appName = options.appName ?? slug;
  const version = options.version ?? "0.0.0";
  const prefix = `psi.${slug}.v1.`;
  const ls: Storage | null = options.storage !== undefined ? options.storage : safeLocal();
  let persistent = probe(ls);
  const memory: Record<string, string> = Object.create(null);
  let warned = false;

  function warn(): void {
    if (warned) return;
    warned = true;
    const msg = options.warningText ?? DEFAULT_WARNING;
    if (options.onWarning) options.onWarning(msg);
    else showBanner(msg);
  }
  if (!persistent) warn();

  function rawGet(key: string): string | null {
    if (persistent && ls) {
      try {
        const v = ls.getItem(prefix + key);
        if (v !== null) return v;
      } catch {
        /* cai para memória */
      }
    }
    return key in memory ? memory[key] : null;
  }

  function rawSet(key: string, text: string): boolean {
    if (persistent && ls) {
      try {
        ls.setItem(prefix + key, text);
        delete memory[key];
        return true;
      } catch {
        persistent = false; // cota cheia ou bloqueio no meio do uso
        warn();
      }
    }
    memory[key] = text;
    return false;
  }

  function get<T = unknown>(key: string, fallback?: T): T {
    const raw = rawGet(key);
    if (raw === null) return fallback as T;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  function set(key: string, value: unknown): boolean {
    return rawSet(key, JSON.stringify(value));
  }

  function remove(key: string): void {
    delete memory[key];
    if (persistent && ls) {
      try {
        ls.removeItem(prefix + key);
      } catch {
        /* ignora */
      }
    }
  }

  /** Chaves do PRÓPRIO app (sem o prefixo). */
  function keys(): string[] {
    const out: string[] = [];
    if (persistent && ls) {
      try {
        for (let i = 0; i < ls.length; i++) {
          const k = ls.key(i);
          if (k && k.startsWith(prefix)) out.push(k.slice(prefix.length));
        }
      } catch {
        /* ignora */
      }
    }
    for (const m in memory) if (!out.includes(m)) out.push(m);
    return out.filter((k) => k !== MIGRATED_FLAG).sort();
  }

  /** Pacote de exportação: SÓ as chaves deste app, com metadados. */
  function exportJSON(): PsiBackup {
    const data: Record<string, unknown> = {};
    for (const k of keys()) data[k] = get(k, null);
    return {
      kit: "psicothica-kit",
      schema: SCHEMA,
      app: slug,
      appName,
      version,
      exportedAt: new Date().toISOString(),
      data,
    };
  }

  function download(filename?: string): string {
    const name = filename ?? `${slug}-${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([JSON.stringify(exportJSON(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return name;
  }

  /** Valida e grava. Aceita texto JSON ou objeto. Lança Error (pt-BR) se o arquivo não for DESTE app. */
  function importJSON(input: string | unknown): number {
    let pack: unknown = input;
    if (typeof input === "string") {
      try {
        pack = JSON.parse(input);
      } catch {
        throw new Error("Não foi possível ler o arquivo. Verifique se ele está íntegro.");
      }
    }
    const p = pack as Partial<PsiBackup> | null;
    if (
      !p || typeof p !== "object" || p.kit !== "psicothica-kit" || typeof p.app !== "string" ||
      !p.data || typeof p.data !== "object" || Array.isArray(p.data)
    ) {
      throw new Error("Este arquivo não é um backup de um app Psicothica.");
    }
    if (p.app !== slug) {
      throw new Error(`Este arquivo é de outro app (${p.appName || p.app}). Nada foi importado.`);
    }
    const names = Object.keys(p.data);
    // valida os nomes ANTES de gravar qualquer coisa
    for (const k of names) {
      if (!/^[A-Za-z0-9_.:-]{1,80}$/.test(k) || k === MIGRATED_FLAG) {
        throw new Error(`O arquivo tem uma chave inválida (${k}). Nada foi importado.`);
      }
    }
    for (const k of names) rawSet(k, JSON.stringify((p.data as Record<string, unknown>)[k]));
    return names.length;
  }

  function importFile(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          resolve(importJSON(String(reader.result)));
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(new Error("Falha ao abrir o arquivo."));
      reader.readAsText(file);
    });
  }

  /**
   * Migração única de chaves antigas (de antes do prefixo). `legacy` = lista de strings (a chave
   * nova repete o nome) ou de { from, to }. Copia o valor bruto e apaga a chave antiga. Só roda
   * uma vez por navegador (guarda uma marca no próprio prefixo). Devolve quantas chaves moveu.
   */
  function migrate(legacy: PsiLegacyKey[]): number {
    if (!persistent || !ls || rawGet(MIGRATED_FLAG) !== null) return 0;
    let moved = 0;
    for (const item of legacy ?? []) {
      const from = typeof item === "string" ? item : item.from;
      const to = typeof item === "string" ? item : item.to;
      if (!from || !to || from.startsWith("psi.")) continue;
      try {
        const raw = ls.getItem(from);
        if (raw === null) continue;
        if (ls.getItem(prefix + to) === null) {
          ls.setItem(prefix + to, raw);
          moved++;
        }
        ls.removeItem(from);
      } catch {
        /* segue */
      }
    }
    rawSet(MIGRATED_FLAG, JSON.stringify({ at: new Date().toISOString(), moved }));
    return moved;
  }

  return {
    get, set, remove, keys, exportJSON, download, importJSON, importFile, migrate, prefix,
    get persistent() {
      return persistent;
    },
  };
}
