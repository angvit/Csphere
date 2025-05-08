"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";

export default function BookmarkSearch() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const fetchContent = async () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        console.warn("No token found");
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/content", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch content: ${res.status}`);
        }

        const data = await res.json();
        console.log("Received bookmarks data from API:", data);
        setBookmarks(data);
      } catch (err) {
        console.error("Error fetching content:", err);
      }
    };

    fetchContent();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
        Rediscover
      </h1>

      <div className="relative max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder=""
          className="w-full px-4 py-2 rounded-full border border-black-700 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600"
        />
        <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Search className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {categories.map((category) => (
          <button
            key={category}
            className="px-3 py-1 rounded-full border border-black-700 text-sm text-black hover:bg-gray-100 transition-colors"
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">All Content</h2>
        <Link
          href="#"
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookmarks.length === 0 ? (
          <p className="text-center text-gray-500">No bookmarks found.</p>
        ) : (
          bookmarks.map((item, index) => {
            console.log(`Rendering bookmark #${index + 1}:`, item);
            return (
              <div
                key={item.content_id}
                className="border border-black rounded-lg p-6 hover:shadow-md transition-shadow"
              >
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
          })
        )}
      </div>
    </div>
  );
}

const categories = [
  "Social media",
  "AI",
  "Agents",
  "Lead generation",
  "E-commerce",
  "SEO tools",
  "Jobs",
  "News",
  "Real estate",
  "Developer tools",
  "Travel",
  "Videos",
  "Automation",
  "Integrations",
  "Open source",
  "Other",
];
