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

export default function CategoryFilter({ categories }) {
  return (
    <div className="flex flex-wrap gap-2 justify-start mb-8">
      {categories?.map((category, index) => (
        <button
          key={index}
          className="px-3 py-1 rounded-full border-[0.5px] border-black text-sm text-black hover:bg-gray-100 transition-colors bg-gray-300"
        >
          {category.category_name}
        </button>
      ))}
    </div>
  );
}
