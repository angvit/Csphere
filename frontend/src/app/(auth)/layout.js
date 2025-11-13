import { Geist, Geist_Mono } from "next/font/google";
import { Poppins } from "next/font/google";

import "../globals.css";
import { Toaster } from "@/components/ui/sonner";

import LoginButton from "@/app/components/LoginButton";
import DropdownMenu from "@/app/components/DropdownMenu";
import LogoComponent from "@/app/components/LogoComponent";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

const fontFamily = `${geistSans.variable}, ${geistMono.variable}, ${poppins.variable}`;

export const metadata = {
  title: "Csphere",
  description: "Rediscover your content",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
};

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
console.log("google client id: ", GOOGLE_CLIENT_ID);

export default async function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={poppins.className}
      style={{ "--font-custom": fontFamily }}
    >
      <body className="relative font-custom">
        <header className="h-28 z-50 absolute bg-gray-300 w-full flex items-center justify-between py-12 px-6 sm:px-8 lg:px-16">
          <div className="flex items-center space-x-4 md:space-x-8">
            <LogoComponent />
          </div>

          <div className="flex items-center space-x-4">
            <LoginButton />

            <DropdownMenu />
          </div>
        </header>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          {children}
        </GoogleOAuthProvider>

        <Footer />

        <Toaster />
      </body>
    </html>
  );
}
