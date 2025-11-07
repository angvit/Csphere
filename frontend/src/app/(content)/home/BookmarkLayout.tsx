// components/BookmarkLayout.tsx
"use client";
import React, { ReactNode, useState, createContext, useEffect } from "react";
import SearchInput from "@/components/SearchInput";
import CategoryFilter from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, List, Folder, Clock, BookOpen } from "lucide-react";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { fetchToken } from "@/functions/user/UserData";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  onSearch: (query: string) => void;
  children: ReactNode;
};

interface MetaDataProps {
  unreadCount: number;
}
export const LayoutContext = createContext<string>("grid");

export default function BookmarkLayout({ onSearch, children }: Props) {
  const [activeTab, setActiveTab] = useState("latest");
  const [viewMode, setViewMode] = useState("grid");
  const [metaData, setMetaData] = useState<MetaDataProps>({
    unreadCount: 0,
  });
  console.log("active tab in bookmark layout: ", activeTab);

  useEffect(() => {
    const FetchMetaData = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/content/unread/count`;
        const token = fetchToken();
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "GET",
        });
        const data = await res.json();
        console.log("DATA BEING returned: ", data);
        if (data.status === "succesful") {
          console.log("medata dat count: ", data.total_count);
          setMetaData((prev) => ({
            ...prev,
            unreadCount: data.total_count,
          }));
        }
      } catch (error) {
        console.log("error occured in fetchimg meta data: ", error);
      }
    };

    FetchMetaData();
  }, []);

  return (
    <div className="container  px-4 py-8 min-h-screen flex flex-col space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Bookmarks
          </h2>
          <p className="text-gray-600">
            Organize and rediscover your saved content
          </p>
        </div>
        <div className="flex items-center space-x-3 ">
          <div className="flex border rounded-lg border-black">
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
      </div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-8 space-y-4 "
      >
        <TabsList className="grid w-full max-w-md grid-cols-3 p-0 mb-6 border rounded-lg bg-transparent border-black">
          {(() => {
            const pathname = usePathname();

            return (
              <>
                <Link
                  href="/home"
                  className={`flex items-center h-full justify-center space-x-2 rounded-l-lg border-r border-gray-700 transition-colors
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
                  className={`flex items-center h-full justify-center space-x-2 border-r border-gray-700 transition-colors
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
                    {metaData.unreadCount}
                  </Badge>
                </Link>

                {/* <Link
                  href="/home/unread"
                  className={`flex items-center h-full justify-center space-x-2 border-r border-gray-700 transition-colors
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
                    {metaData.unreadCount}
                  </Badge>
                </Link> */}

                <Link
                  href="/home/folders"
                  className={`flex items-center h-full justify-center space-x-2 border-r border-gray-700 transition-colors
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

        <LayoutContext.Provider value={viewMode}>
          {children}
        </LayoutContext.Provider>
      </Tabs>
    </div>
  );
}
