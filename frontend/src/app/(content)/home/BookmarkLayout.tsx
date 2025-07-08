// components/BookmarkLayout.tsx
"use client";

import { ReactNode } from "react";
import SearchInput from "@/components/SearchInput";
import CategoryFilter from "@/components/CategoryFilter";
import LatestButton from "@/app/components/home/LatestButton";
import UnreadButton from "@/app/components/home/UnreadButton";
import FolderButton from "@/app/components/home/FolderButton";

type Props = {
  onSearch: (query: string) => void;
  children: ReactNode;
};

export default function BookmarkLayout({ onSearch, children }: Props) {
  return (
    <div className="container  px-4 py-8 min-h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6 z-10 relative">
        <h1 className="md:text-2xl text-lg font-bold">Your Bookmarks</h1>
        <div className="flex items-center gap-2">
          <LatestButton />
          <UnreadButton />
          {/* <FolderButton /> */}
        </div>
      </div>
      <div className="relative mb-8 overflow-visible">
        <div className="relative z-10 flex flex-col items-center space-y-6 pt-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center">
            Rediscover
          </h1>
          <div className="w-full max-w-7xl px-4 mx-auto">
            <SearchInput onSearch={onSearch} />
          </div>
          <CategoryFilter />
        </div>
      </div>
      {children} {/* This is where BookmarkList goes */}
    </div>
  );
}
