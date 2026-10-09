// src/components/Logo.jsx
// Crest of Kota Tomohon on a small white badge (so it stays readable on the dark header).
// The image file must be at admin-panel/public/logo-tomohon.png
export default function Logo({ size = 40, className = "" }) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-xl bg-white ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/logo-tomohon.png"
        alt="Lambang Kota Tomohon"
        width={Math.round(size * 0.8)}
        height={Math.round(size * 0.8)}
        className="object-contain"
        draggable={false}
      />
    </span>
  );
}