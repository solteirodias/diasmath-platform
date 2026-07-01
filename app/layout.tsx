import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DIASMATH",
  description: "Tecnologia educacional para transformar o ensino da Matemática.",
  icons: {
    icon: "/brand/diasmath-icon.svg",
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
