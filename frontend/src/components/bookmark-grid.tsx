"use client";

import { useState, useEffect } from "react";
import BookmarkCard from "./bookmark-card";
import type { Bookmark } from "@/types/bookmark";

export default function BookmarkGrid() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching bookmarks
    const fetchBookmarks = async () => {
      // In a real app, this would be an API call
      setTimeout(() => {
        setBookmarks(mockBookmarks);
        setLoading(false);
      }, 1000);
    };

    fetchBookmarks();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="overflow-hidden bg-white rounded-lg shadow animate-pulse"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
              <div className="w-1/2 h-4 mb-4 bg-gray-200 rounded"></div>
              <div className="w-full h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {bookmarks.map((bookmark) => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
      ))}
    </div>
  );
}

// Mock data
const mockBookmarks: Bookmark[] = [
  {
    id: "1",
    title: "The Future of AI in Content Curation",
    description:
      "How artificial intelligence is changing the way we discover and organize content online.",
    url: "https://example.com/ai-content-curation",
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "AI",
    savedAt: new Date().toISOString(),
    readTime: "5 min",
  },
  {
    id: "2",
    title: "10 Productivity Tools You Should Be Using",
    description:
      "A curated list of the best productivity tools to boost your workflow.",
    url: "https://example.com/productivity-tools",
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Productivity",
    savedAt: new Date().toISOString(),
    readTime: "8 min",
  },
  {
    id: "3",
    title: "Understanding Neural Networks",
    description:
      "A beginner's guide to understanding how neural networks function.",
    url: "https://example.com/neural-networks",
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "AI",
    savedAt: new Date().toISOString(),
    readTime: "12 min",
  },
  {
    id: "4",
    title: "The Psychology of Color in Web Design",
    description:
      "How different colors affect user behavior and engagement on websites.",
    url: "https://example.com/color-psychology",
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Design",
    savedAt: new Date().toISOString(),
    readTime: "7 min",
  },
  {
    id: "5",
    title: "Building Scalable Web Applications",
    description:
      "Best practices for creating web applications that can handle growth.",
    url: "https://example.com/scalable-apps",
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Development",
    savedAt: new Date().toISOString(),
    readTime: "15 min",
  },
  {
    id: "6",
    title: "Introduction to Machine Learning",
    description:
      "Learn the basics of machine learning algorithms and applications.",
    url: "https://example.com/intro-ml",
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "AI",
    savedAt: new Date().toISOString(),
    readTime: "10 min",
  },
  {
    id: "7",
    title: "Remote Work Best Practices",
    description:
      "Tips and strategies for effective remote work and collaboration.",
    url: "https://example.com/remote-work",
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Productivity",
    savedAt: new Date().toISOString(),
    readTime: "6 min",
  },
  {
    id: "8",
    title: "The Art of Data Visualization",
    description: "How to create effective and beautiful data visualizations.",
    url: "https://example.com/data-viz",
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Design",
    savedAt: new Date().toISOString(),
    readTime: "9 min",
  },
];
