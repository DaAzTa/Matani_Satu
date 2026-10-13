// src/services/kelahiranService.js
// Birth records. A newborn is a normal resident (table penduduk) plus a row in
// table kelahiran with the parents' names. catat_kelahiran() saves both at once.
import { supabase } from "../supabase";

function galat(error) {
  if (error.code === "23505") return new Error("NIK ini sudah terdaftar.");
  if (error.code === "23514") return new Error("Data tidak valid. Pastikan NIK terdiri dari 16 angka.");
  if (error.code === "P0001") return new Error(error.message);
  if (error.code === "42501" || error.code === "PGRST116")
    return new Error("Tidak punya izin untuk tindakan ini, atau data tidak ditemukan.");
  return new Error("Gagal menyimpan. Periksa koneksi lalu coba lagi.");
}

export const ratakan = (r) => {
  const p = (Array.isArray(r.penduduk) ? r.penduduk[0] : r.penduduk) || {};
  return {
    id: r.id, pendudukId: p.id, nik: p.nik, nama: p.nama, jk: p.jenis_kelamin,
    tanggalLahir: p.tanggal_lahir, tempatLahir: p.tempat_lahir, lingkungan: p.lingkungan,
    alamat: p.alamat, noKk: p.no_kk, namaAyah: r.nama_ayah, namaIbu: r.nama_ibu,
    dicatatOleh: r.dicatat_oleh, dicatatPada: r.dicatat_pada,
  };
};

/** Search living residents, to copy the family's No. KK, neighborhood and address. */
export async function cariKeluarga(teks) {
  const q = teks.replace(/[,()%*]/g, " ").trim();
  if (q.length < 3) return [];
  const { data, error } = await supabase
    .from("penduduk").select("id,nik,no_kk,nama,hubungan,lingkungan,alamat")
    .eq("status_hidup", "HIDUP")
    .or(`nama.ilike.%${q}%,nik.ilike.%${q}%,no_kk.ilike.%${q}%`)
    .order("nama").limit(8);
  if (error) throw galat(error);
  return data;
}

export async function getKelahiran() {
  const { data, error } = await supabase
    .from("kelahiran")
    .select("id,nama_ayah,nama_ibu,dicatat_oleh,dicatat_pada," +
            "penduduk:penduduk_id(id,nik,no_kk,nama,jenis_kelamin,tanggal_lahir,tempat_lahir,lingkungan,alamat)")
    .order("dicatat_pada", { ascending: false }).limit(1000);
  if (error) throw galat(error);
  return data.map(ratakan);
}

export async function catatKelahiran(f) {
  const { error } = await supabase.rpc("catat_kelahiran", {
    p_nik: f.nik, p_nama: f.nama, p_jk: f.jk, p_tgl_lahir: f.tanggalLahir,
    p_tempat_lahir: f.tempatLahir, p_no_kk: f.noKk, p_lingkungan: f.lingkungan,
    p_alamat: f.alamat, p_nama_ayah: f.namaAyah, p_nama_ibu: f.namaIbu, p_hubungan: f.hubungan,
  });
  if (error) throw galat(error);
}

/** Undo a birth entered by mistake: removes the baby from the residents as well. */
export async function batalkanKelahiran(pendudukId) {
  const { data, error } = await supabase.from("penduduk").delete().eq("id", pendudukId).select("id");
  if (error) throw galat(error);
  if (!data.length) throw new Error("Tidak punya izin untuk menghapus, atau data tidak ditemukan.");
}