// components/CategoryFilter.tsx
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

export default function CategoryFilter() {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-8">
      {categories.map((category) => (
        <button
          key={category}
          className="px-3 py-1 rounded-full border-[0.5px] border-black text-sm text-black hover:bg-gray-100 transition-colors bg-gray-300"
        >
          {category}
        </button>
      ))}
    </div>
  );
}
