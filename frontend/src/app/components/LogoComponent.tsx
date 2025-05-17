"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ImageLoader } from "next/image";
import Image from "next/image";

import Link from "next/link";

function LogoComponent() {
  const isTokenPresent = true;
  const pathname = usePathname();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));
    const foundToken = cookie ? cookie.split("=")[1] : null;
    setToken(foundToken);
  }, [pathname]);

  return (
    <>
      <Link
        href={token ? "/home" : "/"}
        className="flex-shrink-0 md:h-auto md:w-auto h-80 w-80"
      >
        <div className="bg-gray-300 hover:cursor-pointer p-2 inline-block">
          <Image
            src="/cspherelogo2.png"
            alt="Logo"
            width={200}
            height={200}
            className="h-16 w-auto"
          />
        </div>
      </Link>

      <nav className="hidden md:flex md:items-center md:space-x-6">
        {!token ? (
          <>
            <a
              href="#"
              className="text-base font-medium text-[#202A29] hover:text-gray-700"
            >
              Solutions
            </a>
            <a
              href="#"
              className="text-base font-medium text-[#202A29] hover:text-gray-700"
            >
              Industries
            </a>
            <a
              href="#"
              className="text-base font-medium text-[#202A29] hover:text-gray-700"
            >
              About us
            </a>
          </>
        ) : (
          <></>
        )}
      </nav>
    </>
  );
}

export default LogoComponent;
