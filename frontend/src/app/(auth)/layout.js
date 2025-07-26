import { Geist, Geist_Mono, PT_Serif } from "next/font/google";

import "../globals.css";
import { Toaster } from "@/components/ui/sonner";

import LoginButton from "@/app/components/LoginButton";
import DropdownMenu from "@/app/components/DropdownMenu";
import LogoComponent from "@/app/components/LogoComponent";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Image from "next/image";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ptSerif = PT_Serif({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pt-serif",
});

const fontFamily = `${geistSans.variable}, ${geistMono.variable}, ${ptSerif.variable}`;

export const metadata = {
  title: "Csphere",
  description: "Rediscover your content",
};

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
console.log("google client id: ", GOOGLE_CLIENT_ID);

export default async function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={ptSerif.className}
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

        <footer
          id="contact"
          className="bg-[#202A29] flex w-ful h-full items-center justify-center text-white py-6 relative"
        >
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-4">
              <div className="rounded p-2 flex items-center justify-center">
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 relative">
                  <Image
                    src="/cspherelogo2.png"
                    alt="Logo"
                    fill
                    className="object-contain invert brightness-0"
                    sizes="(max-width: 768px) 64px, (max-width: 1024px) 80px, 128px"
                    priority
                    quality={100}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Chrome Extension
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Security
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Open Source
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Privacy
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      GitHub
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Documentation
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-8 text-center text-white z-40">
              <h3 className="!important !text-white ">
                2025 CSphere. All rights reserved.
              </h3>
            </div>
          </div>
        </footer>

        <Toaster />
      </body>
    </html>
  );
}
