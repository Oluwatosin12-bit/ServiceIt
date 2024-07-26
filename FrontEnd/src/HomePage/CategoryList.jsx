import "./CategoryList.css";
import { useState, useEffect } from "react";
import { useTheme } from "../UseContext";
import fetchCategoryNames from "../Categories";

function CategoryList({ filterPosts }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { theme } = useTheme();

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchCategoryNames();
      setCategories(fetchedCategories);
    };

    loadCategories();
  }, []);

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
    filterPosts(newSelectedCategories, "");
  };

  return (
    <div className={`categories ${theme}`}>
      <h2 className="categoriesList">Categories</h2>
      <nav>
        <ul>
          {categories.map((category) => (
            <li
              key={category}
              className={
                selectedCategories.includes(category) ? "selectedFilter" : ""
              }
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
