import Link from "next/link";

export function Header() {
  return (
    <header
      style={{
        background: "#0b4d86",
        color: "#ffffff",
        padding: "16px 24px",
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
        <Link
          href="/"
          style={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "22px",
            fontWeight: "bold",
          }}
        >
          DIASMATH™
        </Link>

        <nav style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
          <Link href="/" style={linkStyle}>
            Início
          </Link>

          <Link href="/labs" style={linkStyle}>
            Laboratórios
          </Link>

          <Link href="/games" style={linkStyle}>
            Jogos
          </Link>

          <Link href="/professor" style={linkStyle}>
            Professor
          </Link>
        </nav>
      </div>
    </header>
  );
}

const linkStyle = {
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 600,
};
