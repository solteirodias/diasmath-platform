import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        marginTop: "48px",
        background: "#062f55",
        color: "#ffffff",
        padding: "28px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <strong>DIASMATH™</strong>

          <p style={{ margin: "6px 0 0", color: "#c6ddf0" }}>
            © 2026 Francisco Vieira Dias. Todos os direitos reservados.
          </p>
        </div>

        <Link
          href="/professor"
          style={{
            color: "#ffffff",
            textDecoration: "none",
          }}
        >
          Área do Professor
        </Link>
      </div>
    </footer>
  );
}
