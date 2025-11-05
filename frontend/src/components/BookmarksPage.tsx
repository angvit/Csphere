"use client";

import { useEffect, useState } from "react";
import BookmarkList from "./BookmarkList";
import { Suspense } from "react";
import BookmarkLayout from "@/app/(content)/home/BookmarkLayout";
import CategoryFilter from "./CategoryFilter";
import Loading from "./ux/Loading";
import { List } from "postcss/lib/list";

type ChildProps = {
  activeTab?: string;
};

const BookmarksPage: React.FC<ChildProps> = ({ activeTab }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cursor, setCursor] = useState<string>("");
  const [hasNext, setHasNext] = useState<boolean>(true);
  const [choosenCategories, setChoosenCategories] = useState<string[]>([]);

  console.log(choosenCategories);

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
      setCategories((prev) => [...prev, ...data.categories]);

      console.log("setting has next to: ", data.has_next);
      setHasNext(data.has_next);

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
      setBookmarks(data.bookmarks);
      setCategories(data.categories);
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
      <CategoryFilter
        choosenCategories={choosenCategories}
        categories={categories}
        setChoosenCategories={setChoosenCategories}
      />
      <Suspense fallback={<Loading />}>
        <BookmarkList items={bookmarks} />
      </Suspense>{" "}
      {hasNext && <button onClick={() => loadNextBatch()}>load next</button>}
    </BookmarkLayout>
  );
};

export default BookmarksPage;
