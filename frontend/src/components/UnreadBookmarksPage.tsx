"use client";

import { useEffect, useState, useContext } from "react";
import BookmarkList from "./BookmarkList";
import BookmarkLayout from "@/app/(content)/home/BookmarkLayout";
import { LayoutContext } from "@/app/(content)/home/BookmarkLayout";
import CategoryFilter from "./CategoryFilter";

type ChildProps = {
  activeTab?: string;
};

type dataParmas = {
  bookmarks: [];
  categories: [];
  next_cursor: string;
  has_next: boolean;
};

const UnreadBookmarksPage: React.FC<ChildProps> = ({ activeTab }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cursor, setCursor] = useState("");
  const [hasNext, setHasNext] = useState(false);

  const fetchBookmarks = async (query = "") => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) return;

    try {
      let cursorUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/content/unread`;

      if (cursor !== "") {
        cursorUrl += "?cursor=" + encodeURIComponent(cursor);
      }
      const url = query.trim()
        ? `${
            process.env.NEXT_PUBLIC_API_BASE_URL
          }/content/search?query=${encodeURIComponent(query)}`
        : cursorUrl;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch content");

      const data: dataParmas = await res.json();
      console.log("bookmark data being returned for unread page: ", data);

      if (data) {
        setBookmarks(data.bookmarks);
        setCategories(data.categories);
        setCursor(data.next_cursor);
        setHasNext(data.has_next);
      } else {
        console.log("error occured, no data was returned from the unread api ");
      }
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    }
  };

  const loadNextBatch = async (query = "") => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    try {
      let contentApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/content`;
      console.log("CURRENT CURSOR:", cursor);
      if (cursor !== "") {
        contentApi += "?cursor=" + encodeURIComponent(cursor);
      }
      console.log("fetching at this api endpoint: ", contentApi);
      const url = query.trim()
        ? `${
            process.env.NEXT_PUBLIC_API_BASE_URL
          }/content/search?query=${encodeURIComponent(query)}`
        : contentApi;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch content");

      const data = await res.json();
      console.log("bookmark data being returned: ", data);

      setBookmarks((prev) => [...prev, ...data.bookmarks]);
      // setBookmarks(data.bookmarks);
      setCategories((prev) => [...prev, ...data.categories]);
      // setCategories(data.categories);
      setHasNext(data.has_next);
      if (data.has_next) {
        setCursor(data.next_cursor);
      }
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    }
  };

  useEffect(() => {
    fetchBookmarks(); // calls /content on initial load
  }, []);

  return (
    <BookmarkLayout onSearch={fetchBookmarks}>
      <CategoryFilter categories={categories} />
      <BookmarkList items={bookmarks} />

      {hasNext && bookmarks.length > 0 && (
        <button onClick={() => loadNextBatch()}>load next</button>
      )}
    </BookmarkLayout>
  );
};

export default UnreadBookmarksPage;
