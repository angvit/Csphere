"use client";

import { useEffect, useState } from "react";
import BookmarkList from "./BookmarkList";
import { Suspense } from "react";
import BookmarkLayout from "@/app/(content)/home/BookmarkLayout";
import CategoryFilter from "./CategoryFilter";
import Loading from "./ux/Loading";

type ChildProps = {
  activeTab?: string;
};

interface Tags {
  category_id: string;
  category_name: string;
}

const BookmarksPage: React.FC<ChildProps> = ({ activeTab }) => {
  //Make a type for the bookmarks later
  const [originalBookmarks, setOriginalBookmarks] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  const [categories, setCategories] = useState<Tags[]>([]);
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
      if (cursor !== "") {
        contentApi += `?cursor=${encodeURIComponent(cursor)}`;
      }

      if (choosenCategories.length > 0) {
        const categoryString = choosenCategories.join(",");
        contentApi +=
          (contentApi.includes("?") ? "&" : "?") +
          `categories=${categoryString}`;
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
      setOriginalBookmarks((prev) => [...prev, ...data.bookmarks]);

      setBookmarks((prev) => [...prev, ...data.bookmarks]);
      setCategories((prev) => [...prev, ...data.categories]);

      setHasNext(data.has_next);

      if (data.has_next) {
        setCursor(data.next_cursor);
      }
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    }
  };

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const fullHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= fullHeight - 100) {
      console.log("near the bottom");
      if (hasNext === true) {
        loadNextBatch();
      } else {
        console.log("user has reached the end of his bookmarks");
      }

      // setVisibleCount((prev) => Math.min(prev + POSTS_PER_LOAD, posts.length));
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [bookmarks.length]);

  const fetchBookmarks = async (query = "") => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) return;

    try {
      let contentApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/content`;
      if (cursor !== "") {
        contentApi += "?cursor=" + encodeURIComponent(cursor);
      }

      if (choosenCategories.length > 0) {
        const categoryString = choosenCategories.join(",");
        contentApi +=
          (contentApi.includes("?") ? "&" : "?") +
          `categories=${categoryString}`;
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
      console.log("all data: ", data);
      setOriginalBookmarks(data.bookmarks);
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

  useEffect(() => {
    const filterBookmarks = () => {
      const chosenCategorySet = new Set(choosenCategories);

      if (chosenCategorySet.size === 0) {
        setBookmarks(originalBookmarks);
        return;
      }

      const filtered = originalBookmarks.filter((bookmark) => {
        const bookmarkNames = bookmark.tags.map((tag) => tag.category_name);
        const categorySet = new Set(bookmarkNames);

        // If `.intersection()` exists:
        const intersection = categorySet.intersection(chosenCategorySet);
        return intersection.size > 0;
      });

      setBookmarks(filtered);
    };
    filterBookmarks();
  }, [choosenCategories]);

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
      {!hasNext && (
        <h1 className="text-center">
          You've reached the end of your bookmarks!{" "}
        </h1>
      )}
    </BookmarkLayout>
  );
};

export default BookmarksPage;
