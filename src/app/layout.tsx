import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arena - Music Community",
  description: "Share and discover original music tracks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}

