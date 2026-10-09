// src/utils/profil.js
// Helpers for the profile data. Shape of one section's "isi":
//   { intro?: string, groups: [ { title?: string, items: [ { l, v?, rows?, n } ] } ] }
//   l = label, v = text value, rows = [[name, value], ...] (small table), n = note

export const adaIsi = (v) => v !== null && v !== undefined && String(v).trim() !== "";

/** Does this item have something to show? */
export const itemTerisi = (x) =>
  Array.isArray(x.rows) ? x.rows.some((r) => adaIsi(r[1])) : adaIsi(x.v);

// Notes written for the staff ("needs checking", ...) are hidden from the public page.
const INTERNAL = /perlu|verifikasi|dicek|belum cocok|selisih|menunggu|rinci/i;
export const catatanInternal = (n) => !!n && INTERNAL.test(n);
export const catatanPublik = (n) => (n && !INTERNAL.test(n) ? n : "");

/* ---------- immutable updaters used by the editor ---------- */
const mutate = (isi, fn) => {
  const c = JSON.parse(JSON.stringify(isi));
  fn(c);
  return c;
};
export const setIntro = (isi, teks) => mutate(isi, (c) => { c.intro = teks; });
export const setGroupTitle = (isi, gi, teks) => mutate(isi, (c) => { c.groups[gi].title = teks; });
export const setItem = (isi, gi, ii, patch) => mutate(isi, (c) => { Object.assign(c.groups[gi].items[ii], patch); });
export const addItem = (isi, gi, tipe) =>
  mutate(isi, (c) => {
    c.groups[gi].items.push(tipe === "tabel" ? { l: "", rows: [["", ""]], n: "" } : { l: "", v: "", n: "" });
  });
export const removeItem = (isi, gi, ii) => mutate(isi, (c) => { c.groups[gi].items.splice(ii, 1); });
export const setRow = (isi, gi, ii, ri, kol, val) =>
  mutate(isi, (c) => { c.groups[gi].items[ii].rows[ri][kol] = val; });
export const addRow = (isi, gi, ii) => mutate(isi, (c) => { c.groups[gi].items[ii].rows.push(["", ""]); });
export const removeRow = (isi, gi, ii, ri) => mutate(isi, (c) => { c.groups[gi].items[ii].rows.splice(ri, 1); });

/** Trim texts, drop empty table rows and items without a label, before saving. */
export function bersihkan(isi) {
  return mutate(isi, (c) => {
    if (typeof c.intro === "string") c.intro = c.intro.trim();
    if (!c.intro) delete c.intro;
    for (const g of c.groups) {
      if (typeof g.title === "string") { g.title = g.title.trim(); if (!g.title) delete g.title; }
      g.items = g.items
        .map((x) => {
          const o = { l: String(x.l ?? "").trim(), n: String(x.n ?? "").trim() };
          if (Array.isArray(x.rows)) {
            o.rows = x.rows
              .map(([k, v]) => [String(k ?? "").trim(), String(v ?? "").trim()])
              .filter(([k, v]) => k || v);
          } else {
            o.v = adaIsi(x.v) ? String(x.v).trim() : null;
          }
          return o;
        })
        .filter((x) => x.l);
    }
  });
}