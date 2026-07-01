import Link from "next/link";

export default function LabsPage() {
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 40, fontFamily: "Inter, sans-serif" }}>
      <p style={{ color: "#2563eb", fontWeight: 800, letterSpacing: 1 }}>DIASMATH LABS</p>

      <h1 style={{ fontSize: 42, marginTop: 10 }}>Laboratórios Digitais</h1>

      <p style={{ color: "#555", fontSize: 20, maxWidth: 760 }}>
        Ambientes interativos para investigação, experimentação e construção de conceitos matemáticos.
      </p>

      <div style={{ marginTop: 40, display: "grid", gap: 25 }}>
        <Link
          href="/labs/geotessela"
          style={{
            textDecoration: "none",
            border: "1px solid #ddd",
            borderRadius: 22,
            padding: 28,
            color: "#000",
            background: "#fff",
            boxShadow: "0 12px 30px rgba(0,0,0,.08)"
          }}
        >
          <p style={{ color: "#2563eb", fontWeight: 800 }}>Laboratório de Geometria</p>
          <h2 style={{ fontSize: 30, margin: "8px 0" }}>⬡ GeoTessela Lab</h2>
          <p style={{ color: "#555", fontSize: 17 }}>
            Investigue tesselações, códigos de vértices, soma angular, lacunas, sobreposições e ladrilhamentos uniformes.
          </p>
          <strong>Abrir laboratório →</strong>
        </Link>
      </div>
    </main>
  );
}
