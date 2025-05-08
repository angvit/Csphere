import { useState } from "react";
import { Search } from "lucide-react";

type Props = {
  onSearch: (query: string) => void;
};

export default function SearchInput({ onSearch }: Props) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full sm:max-w-2xl mx-auto mb-8"
    >
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        type="text"
        placeholder="Search..."
        className="w-full px-4 py-2 rounded-full border-[0.5px] border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 transform -translate-y-1/2"
      >
        <Search className="h-5 w-5 text-gray-500" />
      </button>
    </form>
  );
}
