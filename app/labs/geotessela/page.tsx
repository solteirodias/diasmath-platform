import Link from "next/link";

export const metadata = {
  title: "GeoTessela Lab | DIASMATH LABS",
  description: "Laboratório de Geometria para investigação de tesselações com polígonos regulares."
};

export default function GeoTesselaLabPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "#fff" }}>
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "0 16px",
          borderBottom: "1px solid rgba(255,255,255,.12)",
          background: "#0f172a"
        }}
      >
        <Link href="/labs" style={{ color: "#fff", fontWeight: 900, textDecoration: "none" }}>
          ← DIASMATH LABS
        </Link>

        <strong>Laboratório de Geometria · GeoTessela Lab</strong>

        <a
          href="/labs/geotessela/index.html"
          target="_blank"
          style={{
            color: "#0f172a",
            background: "#fff",
            padding: "8px 14px",
            borderRadius: 999,
            fontWeight: 800,
            textDecoration: "none"
          }}
        >
          Tela cheia
        </a>
      </div>

      <iframe
        src="/labs/geotessela/index.html"
        title="GeoTessela Lab"
        style={{ width: "100%", height: "calc(100vh - 56px)", border: 0 }}
        allowFullScreen
      />
    </main>
  );
}
