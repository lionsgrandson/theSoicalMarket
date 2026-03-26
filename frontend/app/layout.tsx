import type { Metadata } from "next";
import { Roboto, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutContent from "@/components/layoutContent";
import { ToastContainer } from "react-toastify";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Social Market ",
  description: "Collabs are just easier here. ",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${geistMono.variable} antialiased`}>
        <ToastContainer />
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
