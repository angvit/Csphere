"use client";

import { useState } from "react";
import { Search } from "lucide-react";

type Props = {
  onSearch: (query: string) => void;
};

export default function SearchInput({ onSearch }: Props) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full sm:max-w-2xl mx-auto mb-8"
    >
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 pr-12 rounded-full border border-black text-black placeholder-gray-400 bg-gray-300
             focus:outline-none focus:ring-2 focus:ring-gray-600 
             hover:ring-2 hover:ring-gray-600"
      />

      <button
        type="submit"
        className="absolute top-1/2 right-9 transform -translate-y-5"
      >
        <Search className="h-5 w-5 text-gray-500" />
      </button>
    </form>
  );
}
