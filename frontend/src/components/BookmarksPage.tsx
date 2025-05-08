"use client";

import { useEffect, useState } from "react";
import SearchInput from "./SearchInput";
import CategoryFilter from "./CategoryFilter";
import BookmarkList from "./BookmarkList";

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
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
        Rediscover
      </h1>

      <SearchInput onSearch={fetchBookmarks} />
      <CategoryFilter />
      <BookmarkList items={bookmarks} />
    </div>
  );
}
