// components/CategoryFilter.tsx
import React, { useState } from "react";

interface ChildProps {
  choosenCategories: string[];
  categories: any;
  setChoosenCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

interface CategoryButtonProps {
  category_name: string;
  choosenCategories: string[];
  setChoosenCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({
  category_name,
  choosenCategories,
  setChoosenCategories,
}) => {
  const [selected, setSelected] = useState(false);

  const handleAppend = () => {
    const exists = choosenCategories.includes(category_name);
    if (!exists) {
      setChoosenCategories((prev) => [...prev, category_name]);
    } else {
      //Need to remove the category
      setChoosenCategories((prev) =>
        prev.filter(function (category) {
          return category !== category_name;
        })
      );
    }
    setSelected((prev) => !prev);
  };

  return (
    <button
      onClick={handleAppend}
      className={`px-3 py-1 rounded-full border-[0.5px] border-black text-sm text-black hover:bg-gray-100 transition-colors
      ${selected ? "bg-gray-100" : "bg-gray-300"}`}
    >
      {category_name}
    </button>
  );
};

const CategoryFilter: React.FC<ChildProps> = ({
  choosenCategories,
  categories,
  setChoosenCategories,
}) => {
  return (
    <div className="flex flex-wrap gap-2 justify-start mb-8">
      {categories?.map((category, index: number) => (
        <CategoryButton
          key={index}
          category_name={category.category_name}
          choosenCategories={choosenCategories}
          setChoosenCategories={setChoosenCategories}
        />
      ))}
    </div>
  );
};

export default CategoryFilter;
