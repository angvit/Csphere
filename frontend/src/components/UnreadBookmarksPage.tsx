"use client";

import { useEffect, useState, useContext } from "react";

import BookmarkList from "./BookmarkList";
import BookmarkLayout from "@/app/(content)/home/BookmarkLayout";
import { LayoutContext } from "@/app/(content)/home/BookmarkLayout";

type ChildProps = {
  activeTab?: string;
};

const UnreadBookmarksPage: React.FC<ChildProps> = ({ activeTab }) => {
  const [bookmarks, setBookmarks] = useState([]);
  console.log("current active tab: ", activeTab);
  const viewMode = useContext(LayoutContext);

  const fetchBookmarks = async (query = "") => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) return;

    try {
      const url = query.trim()
        ? `${
            process.env.NEXT_PUBLIC_API_BASE_URL
          }/content/search?query=${encodeURIComponent(query)}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/content/unread`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch content");

      const data = await res.json();
      console.log("bookmark data being returned: ", data);
      setBookmarks(data);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    }
  };

  useEffect(() => {
    fetchBookmarks(); // calls /content on initial load
  }, []);

  return (
    <BookmarkLayout onSearch={fetchBookmarks}>
      <BookmarkList items={bookmarks} />
    </BookmarkLayout>
  );
};

export default UnreadBookmarksPage;
