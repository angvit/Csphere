"use client";

import { useState } from "react";
import type { Bookmark } from "@/types/bookmark";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, Share2, MoreHorizontal, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BookmarkCardProps {
  bookmark: Bookmark;
}

export default function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const [saved, setSaved] = useState(true);

  const toggleSaved = () => {
    setSaved(!saved);
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="relative overflow-hidden aspect-video">
        <img
          src={bookmark.imageUrl || "/placeholder.svg"}
          alt={bookmark.title}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-2 right-2">
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
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
          <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-teal-950 rounded-full">
            {bookmark.category}
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="mb-2 text-lg font-semibold line-clamp-2">
          <a href={bookmark.url} className="hover:text-purple-600">
            {bookmark.title}
          </a>
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {bookmark.description}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          {bookmark.readTime}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Share2 className="w-4 h-4 text-gray-600" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MoreHorizontal className="w-4 h-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Add to collection</DropdownMenuItem>
              <DropdownMenuItem>Mark as read</DropdownMenuItem>
              <DropdownMenuItem>Edit tags</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}
