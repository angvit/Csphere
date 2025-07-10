"use client";
import React, { useState } from "react";
import FolderLayout from "./FolderLayout";
import { Plus, Filter, ChevronDown } from "lucide-react";

function page() {
  const [sortBy, setSortBy] = useState("Latest");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const sortOptions = [
    "Latest",
    "Oldest",
    "Name A-Z",
    "Name Z-A",
    "Most Popular",
  ];
  return (
    <FolderLayout>
      <div className="w-full ">
        <div className="flex items-center gap-3 mb-8">
          {/* New Button */}
          <button className="bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
            <Plus size={16} />
            New
          </button>

          {/* Filters Button */}
          <button className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
            <Filter size={16} />
            Filters
          </button>

          {/* Sort By Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 6h18M7 12h10M11 18h2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Sort By: {sortBy}
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                      sortBy === option
                        ? "bg-blue-50 text-gray-600"
                        : "text-gray-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <h2>Folders</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    </FolderLayout>
  );
}

export default page;
