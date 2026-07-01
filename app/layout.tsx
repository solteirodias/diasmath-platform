import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DIASMATH",
  description: "Tecnologia educacional para transformar o ensino da Matemática."
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
