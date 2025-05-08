import React from "react";

type Bookmark = {
  content_id: string;
  title?: string;
  source?: string;
  ai_summary?: string;
  url: string;
};

export default function BookmarkCard({ item }: { item: Bookmark }) {
  return (
    <div className="border-[0.5px] border-black rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="mb-4">
        <h3 className="font-bold text-lg">{item.title || "Untitled"}</h3>
        <p className="text-sm text-gray-600 mb-2">
          {item.source || "No source"}
        </p>
      </div>
      <p className="text-gray-700 mb-4 line-clamp-3">
        {item.ai_summary || "No summary available."}
      </p>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline"
      >
        Visit
      </a>
    </div>
  );
}
