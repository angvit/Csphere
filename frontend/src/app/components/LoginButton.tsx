import React from "react";
import Link from "next/link";

function LoginButton() {
  return (
    <div className="hidden md:flex">
      <Link
        href="/login"
        className="bg-[#E0E5E4] text-[#202A29] px-6 py-3 rounded-lg hover:bg-[#CCD3D2] text-base font-large"
      >
        Login
      </Link>
      <Link
        href="/signup"
        className="bg-[#E0E5E4] text-[#202A29] px-6 py-3 rounded-lg hover:bg-[#CCD3D2] text-base font-large ml-4"
      >
        Signup
      </Link>
    </div>
  );
}

export default LoginButton;
