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
    <div className="relative w-full sm:max-w-2xl mx-auto mb-8">
      <input
        type="text"
        placeholder="Search..."
        className="w-full px-4 py-2 rounded-full border-[0.5px] border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600"
      />
      <button
        type="submit"
        className="absolute inset-y-0 right-3 flex items-center"
      >
        <Search className="h-5 w-5 text-gray-500" />
      </button>
    </div>
  );
}
