import "./CategoryList.css";
import { useState } from "react";
import { useTheme } from "../UseContext";
import fetchCategoryNames, { CATEGORIES } from "../Categories";

function CategoryList({ filterPosts }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { theme } = useTheme();

  const handleCategoryClick = (category) => {
    let newSelectedCategories = [...selectedCategories];

    if (newSelectedCategories.includes(category)) {
      newSelectedCategories = newSelectedCategories.filter(
        (selectedCategory) => selectedCategory !== category
      );
    } else {
      newSelectedCategories.push(category);
    }

    setSelectedCategories(newSelectedCategories);
    filterPosts(newSelectedCategories, '');
  };

  return (
    <div className={`categories ${theme}`}>
      <h2 className="categoriesList">Categories</h2>
      <nav>
        <ul>
          {CATEGORIES.map((category) => (
            <li
              key={category}
              className={selectedCategories.includes(category) ? "selected" : ""}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default CategoryList;
