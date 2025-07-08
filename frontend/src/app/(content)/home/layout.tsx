import React from "react";
import UnreadButton from "@/app/components/home/UnreadButton";
import LatestButton from "@/app/components/home/LatestButton";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <main className="w-full">
        <div className="flex flex-col gap-8 md:flex-row w-full">
          <div className="flex-1 w-full items-center justify-center flex overflow-visible relative z-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
