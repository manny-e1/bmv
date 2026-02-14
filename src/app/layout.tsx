import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Be My Valentine",
  description: "A love story on rails"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
