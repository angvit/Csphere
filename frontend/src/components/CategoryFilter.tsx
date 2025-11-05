// components/CategoryFilter.tsx
import React, { useState } from "react";

interface ChildProps {
  choosenCategories: string[];
  categories: any;
  setChoosenCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const CategoryFilter: React.FC<ChildProps> = ({
  choosenCategories,
  categories,
  setChoosenCategories,
}) => {
  const handleAppend = (category_name: string) => {
    const exist = choosenCategories.some((item) => category_name === item);

    if (!exist) {
      setChoosenCategories((prev) => [...prev, category_name]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2 justify-start mb-8">
      {categories?.map((category, index) => (
        <button
          key={index}
          onClick={() => handleAppend(category.category_name)}
          className="px-3 py-1 rounded-full border-[0.5px] border-black text-sm text-black hover:bg-gray-100 transition-colors bg-gray-300"
        >
          {category.category_name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
