"use client";

import { useState } from "react";
import type { Bookmark } from "@/types/bookmark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Tag, BookmarkIcon } from "lucide-react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface BookmarkCardProps {
  bookmark: Bookmark;
}

export default function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const [saved, setSaved] = useState(true);

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  const tabBookmark = async () => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/content/tab`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content_id: bookmark.content_id,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Error response body:", errorBody);
        toast.error("Login failed. Please check your credentials.");
        return;
      }

      const data = await response.json();
      toast.message("Tab saved");
    } catch (error) {
      console.log("Error: ", error);
      toast.error("Error tabing your content");
    }
  };

  const toggleSaved = async () => {
    setSaved(!saved);
    console.log(saved);

    if (!saved) {
      tabBookmark();
      return;
    }

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/content/untab`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content_id: bookmark.content_id,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Error response body:", errorBody);
        toast.error("Login failed. Please check your credentials.");
        return;
      }

      const data = await response.json();
      toast.message("Tab unsaved");
    } catch (error) {
      console.log("Error: ", error);
      toast.error("Error untabing your tab");
    }
  };

  return (
    <div className="border border-black rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col justify-between h-full">
      {/* Top metadata row */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {bookmark.url ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=32`}
              alt="favicon"
              width={20}
              height={20}
              className="rounded-sm"
            />
          ) : (
            <div className="w-5 h-5 bg-gray-100 rounded-sm flex items-center justify-center text-xs text-gray-500">
              ?
            </div>
          )}
          <span className="text-sm text-gray-600 truncate max-w-[180px]">
            {new URL(bookmark.url).hostname}
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          {/* {bookmark.first_saved_at} */}
          {formatDate(bookmark.first_saved_at)}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-lg mb-2">{bookmark.title || "Untitled"}</h3>

      {/* AI Summary */}
      <p className="text-gray-700 mb-4 line-clamp-3">
        {bookmark.ai_summary || "No summary available."}
      </p>

      {/* Tags */}
      {bookmark.tags?.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {bookmark.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 text-sm underline flex items-center"
        >
          Visit <ExternalLink className="h-4 w-4 ml-1" />
        </a>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-gray-100"
          onClick={toggleSaved}
        >
          <BookmarkIcon
            className={`h-4 w-4 ${
              saved ? "fill-current text-blue-500" : "text-gray-400"
            }`}
          />
        </Button>
      </div>
    </div>
  );
}
