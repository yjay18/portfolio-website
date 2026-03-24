import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ContentArea from "@/components/ContentArea";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yuuv Jauhari — Portfolio",
  description:
    "Pixel art portfolio — projects, publications, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full`}>
        <Sidebar />
        <ContentArea>{children}</ContentArea>
      </body>
    </html>
  );
}
