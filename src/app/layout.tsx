import type { Metadata } from "next";
import {
  DM_Sans,
  Inter,
  Manrope,
  Plus_Jakarta_Sans,
  Poppins,
  Bricolage_Grotesque,
} from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
import Providers from "@/providers";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { ChatProvider } from "@/contexts/ChatContext";
import Chatroom from "@/components/Chatroom";
import { ToastContainer } from "react-toastify";

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

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-bricolage-grotesque",
});

export const metadata: Metadata = {
  title: "DynaVest - DeFi Investment Made Easy",
  description: "Make DeFi investment easy and simple with DynaVest AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lilyScript.variable} ${dmSans.variable} ${inter.variable} ${manrope.variable} ${plusJakarta.variable} ${poppins.variable} ${bricolageGrotesque.variable} antialiased font-manrope`}
        style={{
          background:
            "linear-gradient(-59.08deg, #E6F2FB 0%, #EBE7FB 55%, #E6F2FB 100%) fixed",
        }}
      >
        <ChatProvider>
          <Providers>
            <div className="min-h-screen w-full">
              <div className="mx-auto">
                <Header />
                <div className="pt-10 max-w-7xl mx-auto px-5 md:px-20 relative">
                  {children}
                  <BottomNav />
                  <ToastContainer position="bottom-right" />
                </div>
                <Chatroom />
              </div>
            </div>
          </Providers>
        </ChatProvider>
      </body>
    </html>
  );
}
