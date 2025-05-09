"use client";

import { useState } from "react";
import type { Bookmark } from "@/types/bookmark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Tag, BookmarkIcon } from "lucide-react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

interface BookmarkCardProps {
  bookmark: Bookmark;
}

export default function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const [saved, setSaved] = useState(true);

  const toggleSaved = () => {
    setSaved(!saved);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      {/* Card Header with Source and Icon */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {bookmark.favicon ? (
            <Image
              src={bookmark.favicon || "/placeholder.svg"}
              alt={bookmark.url}
              width={20}
              height={20}
              className="rounded-sm"
            />
          ) : (
            <div className="w-5 h-5 bg-gray-100 rounded-sm flex items-center justify-center text-xs text-gray-500">
              {bookmark.url.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm text-gray-600 font-medium truncate">
            {bookmark.url}
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDate(bookmark.savedAt)}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {bookmark.title}
        </h3>

        {/* URL */}
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-violet-600 hover:text-violet-700 mb-3 flex items-center"
        >
          {new URL(bookmark.url).hostname}
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>

        {/* AI Summary */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 flex-grow">
          <div className="text-xs font-medium text-gray-500 mb-1">AI SUMMARY</div>
          <p className="text-sm text-gray-700 line-clamp-4">{bookmark.ai_summary}</p>
        </div>

        {/* Tags */}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="mt-auto">
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <Tag className="h-3 w-3 mr-1" />
              Tags
            </div>
            <div className="flex flex-wrap gap-2">
              {bookmark.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      {/* <div className="p-4 border-t border-gray-100 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/80 hover:bg-white"
          onClick={toggleSaved}
        >
          <BookmarkIcon
            className={`h-4 w-4 ${
              saved ? "fill-teal-900 text-white" : "text-gray-600"
            }`}
          />
        </Button>
      </div> */}
    </div>
  );
}