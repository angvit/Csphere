import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-[#202A29] flex w-full h-full items-center justify-center text-white pt-12 md:pt-16 pb-4 md:pb-6 relative"
    >
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-4 items-start justify-items-start">
          <div className="rounded p-2 flex items-start justify-start self-start">
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
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Chrome Extension
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
          
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <a
                  href="mailto:angelo.vitalino5@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/angvit/Csphere"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 md:mt-6 pt-0 text-center text-white z-40">
          <h3 className="text-white">2025 Csphere. All rights reserved.</h3>
        </div>
      </div>
    </footer>
  );
}
