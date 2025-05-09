"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

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
        <svg
          viewBox="0 0 410 170"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          className="h-16 w-auto text-[#202A29] hover:cursor-pointer"
          fill="none"
          stroke="currentColor"
          strokeWidth="16"
          strokeLinecap="round"
        >
          <path d="M110,70 C95,70 80,85 80,105 C80,125 95,140 110,140 L140,140" />
          <path d="M160,87 C170,75 190,75 200,85 C210,95 210,105 200,115 L190,120 C180,130 180,140 190,150 C200,160 220,160 230,147" />
          <path d="M250,70 L250,140 M250,85 C270,85 280,95 280,105 C280,115 270,125 250,125" />
          <path d="M300,70 L300,140 M300,100 C300,100 310,90 320,90 C330,90 340,100 340,110 L340,140" />
          <path d="M390,105 C390,125 375,140 360,140 C345,140 330,125 330,105 C330,85 345,70 360,70 C375,70 390,85 390,105 z M330,105 L390,105" />
          <circle cx="220" cy="50" r="12" fill="currentColor" />
        </svg>
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
