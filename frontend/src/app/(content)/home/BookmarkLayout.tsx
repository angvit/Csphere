// components/BookmarkLayout.tsx
"use client";
import React, { ReactNode, useState } from "react";
import SearchInput from "@/components/SearchInput";
import CategoryFilter from "@/components/CategoryFilter";
// import LatestButton from "@/app/components/home/LatestButton";
// import UnreadButton from "@/app/components/home/UnreadButton";
// import FolderButton from "@/app/components/home/FolderButton";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Filter, Grid3X3, List, Folder, Clock, BookOpen } from "lucide-react";
import { Tabs, TabsList } from "@/components/ui/tabs";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  onSearch: (query: string) => void;
  children: ReactNode;
};

type ChildProps = {
  activeTab?: string;
};

export default function BookmarkLayout({ onSearch, children }: Props) {
  const [activeTab, setActiveTab] = useState("latest");
  const [viewMode, setViewMode] = useState("grid");
  console.log("active tab in bookmark layout: ", activeTab);
  return (
    <div className="container  px-4 py-8 min-h-screen flex flex-col space-y-6">
      {/* <div className="flex items-center justify-between mb-6 z-10 relative">
        <h1 className="md:text-2xl text-lg font-bold">Your Bookmarks</h1>
        <div className="flex items-center gap-2">
          <LatestButton />
          <UnreadButton />
          <FolderButton />
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
      </div> */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Bookmarks
          </h2>
          <p className="text-gray-600">
            Organize and rediscover your saved content
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`rounded-r-none border-gray-700 
      ${
        viewMode === "grid"
          ? "bg-[#202A29] text-white hover:bg-gray-200"
          : "bg-transparent text-[#202A29] hover:bg-gray-100"
      }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>

            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`rounded-l-none border-gray-700 
      ${
        viewMode === "list"
          ? "bg-[#202A29] text-white hover:bg-gray-200"
          : "bg-transparent text-[#202A29] hover:bg-gray-100"
      }`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Categories */}
        {/* <div className="space-y-4 mb-8">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search your bookmarks..." className="pl-10 h-12 text-lg" />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category} variant="outline" className="cursor-pointer hover:bg-gray-100 transition-colors">
                  {category}
                </Badge>
              ))}
            </div>
          </div> */}
      </div>
      {/* Enhanced Tab Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-8 space-y-4"
      >
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6 border rounded-lg bg-transparent">
          {(() => {
            const pathname = usePathname();

            return (
              <>
                <Link
                  href="/home"
                  className={`flex items-center justify-center space-x-2 rounded-l-lg border-r border-gray-700 transition-colors
            ${
              pathname === "/home"
                ? "bg-[#202A29] text-white"
                : "bg-transparent text-[#202A29] hover:bg-gray-100"
            }`}
                >
                  <Clock className="h-4 w-4" />
                  <span>Latest</span>
                </Link>

                <Link
                  href="/home/unread"
                  className={`flex items-center justify-center space-x-2 border-r border-gray-700 transition-colors
            ${
              pathname === "/home/unread"
                ? "bg-[#202A29] text-white"
                : "bg-transparent text-[#202A29] hover:bg-gray-100"
            }`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Unread</span>
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-blue-300 text-white"
                  >
                    3
                  </Badge>
                </Link>

                <Link
                  href="/home/folders"
                  className={`flex items-center justify-center space-x-2 rounded-r-lg transition-colors
            ${
              pathname === "/home/folders"
                ? "bg-[#202A29] text-white"
                : "bg-transparent text-[#202A29] hover:bg-gray-100"
            }`}
                >
                  <Folder className="h-4 w-4" />
                  <span>Folders</span>
                </Link>
              </>
            );
          })()}
        </TabsList>
        <SearchInput onSearch={onSearch} />
        <CategoryFilter />
        {/* <TabsContent value="latest"> */}
        {children}
        {/* </TabsContent> */}
      </Tabs>
    </div>
  );
}
