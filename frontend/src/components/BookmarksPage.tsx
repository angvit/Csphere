"use client";

import { useEffect, useState } from "react";
import BookmarkList from "./BookmarkList";
import { Suspense } from "react";
import BookmarkLayout from "@/app/(content)/home/BookmarkLayout";
import CategoryFilter from "./CategoryFilter";
import { fetchToken } from "@/functions/user/UserData";

import Loading from "./ux/Loading";
type ChildProps = {
  activeTab?: string;
};

const BookmarksPage: React.FC<ChildProps> = ({ activeTab }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cursor, setCursor] = useState("");

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
      if (data.has_next) {
        setCursor(data.next_cursor);
      }
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    }
  };

  const fetchBookmarks = async (query = "") => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) return;

    try {
      let contentApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/content`;
      if (cursor !== "") {
        contentApi += cursor;
      }
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
      setBookmarks(data.bookmarks);
      setCategories(data.categories);
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
      <Suspense fallback={<Loading />}>
        <BookmarkList items={bookmarks} />
      </Suspense>{" "}
      <button onClick={() => loadNextBatch()}>load next</button>
    </BookmarkLayout>
  );
};

export default BookmarksPage;
