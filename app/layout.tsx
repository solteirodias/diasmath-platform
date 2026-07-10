import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DIASMATH™",
    template: "%s | DIASMATH™",
  },
  description:
    "Jogos, laboratórios digitais e tecnologia educacional para transformar o ensino da Matemática.",
  icons: {
    icon: "/brand/diasmath-icon.svg",
    shortcut: "/brand/diasmath-icon.svg",
    apple: "/brand/diasmath-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
