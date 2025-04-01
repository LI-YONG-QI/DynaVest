import type { Metadata } from "next";
import { DM_Sans, Inter, Manrope, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const lilyScript = localFont({
  src: "../../public/fonts/LilyScriptOne-Regular.ttf",
  variable: "--font-lily-script",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "OneVault - DeFi Investment Made Easy",
  description: "Make DeFi investment easy and simple with OneVault AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lilyScript.variable} ${dmSans.variable} ${inter.variable} ${manrope.variable} ${plusJakarta.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
