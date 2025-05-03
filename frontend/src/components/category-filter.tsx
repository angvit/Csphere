"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const categories = [
  { id: "all", name: "All Bookmarks", count: 42 },
  { id: "ai", name: "AI", count: 15 },
  { id: "productivity", name: "Productivity", count: 8 },
  { id: "design", name: "Design", count: 7 },
  { id: "development", name: "Development", count: 6 },
  { id: "marketing", name: "Marketing", count: 4 },
  { id: "business", name: "Business", count: 2 },
];

export default function CategoryFilter() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search categories..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        {filteredCategories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeCategory === category.id
                ? "bg-emerald-950 text-white hover:bg-custom-teal/80"
                : "text-gray-700"
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span className="flex-1 text-left">{category.name}</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              {category.count}
            </span>
          </Button>
        ))}
      </div>

      <div className="pt-4 mt-4 border-t border-gray-200">
        <h3 className="mb-2 text-sm font-medium text-gray-600">Collections</h3>
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700"
          >
            <span className="flex-1 text-left">Reading List</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              12
            </span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700"
          >
            <span className="flex-1 text-left">Research</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              8
            </span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700"
          >
            <span className="flex-1 text-left">Inspiration</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              5
            </span>
          </Button>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-gray-200">
        <Button variant="outline" className="w-full">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          New Collection
        </Button>
      </div>
    </div>
  );
}
