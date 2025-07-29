import BookmarkCard from "./BookmarkCard";

import { useContext } from "react";
import { LayoutContext } from "@/app/(content)/home/BookmarkLayout";

type Bookmark = {
  content_id: string;
  title?: string;
  source?: string;
  ai_summary?: string;
  url: string;
};

export default function BookmarkList({ items }: { items: Bookmark[] }) {
  const viewMode = useContext(LayoutContext);
  console.log("current conext value: ", viewMode);
  if (items.length === 0) {
    return <p className="text-center text-gray-500">No bookmarks found</p>;
  }

  return (
    <div
      className={`grid gap-6 ${
        viewMode === "grid"
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1"
      }`}
    >
      {items.map((item) => (
        <BookmarkCard key={item.content_id} bookmark={item} />
      ))}
    </div>
  );
}
