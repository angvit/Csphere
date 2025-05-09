"use client";

import { useEffect, useState } from "react";
import SearchInput from "./SearchInput";
import CategoryFilter from "./CategoryFilter";
import BookmarkList from "./BookmarkList";
import { DotPattern } from "@/components/ui/dot-pattern";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);

  const fetchBookmarks = async (query = "") => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) return;

    try {
      const url = query.trim()
        ? `http://127.0.0.1:8000/search?query=${encodeURIComponent(query)}`
        : `http://127.0.0.1:8000/content`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch content");

      const data = await res.json();
      setBookmarks(data);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    }
  };

  useEffect(() => {
    fetchBookmarks(); // calls /content on initial load
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      {/* Section with background dots */}
      <div className="relative mb-8 overflow-visible">
        {/* Dot pattern behind everything */}
        <DotPattern className="absolute inset-0 w-full h-full opacity-1000 [mask-image:radial-gradient(500px_circle_at_center,white,transparent)]" />
        {/* Foreground content */}
        <div className="relative z-10 flex flex-col items-center space-y-6 pt-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center">
            Rediscover
          </h1>
          <SearchInput onSearch={fetchBookmarks} />
          <CategoryFilter />
        </div>
      </div>

      {/* Bookmark list below the dot pattern section */}
      <BookmarkList items={bookmarks} />
    </div>
  );
}
