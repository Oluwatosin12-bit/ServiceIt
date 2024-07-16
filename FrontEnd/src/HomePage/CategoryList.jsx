import "./CategoryList.css";
import { useTheme } from '../UseContext';
import { CATEGORIES } from "../Categories";

function CategoryList() {
  const { theme } = useTheme();
  return (
    <div className={`categories ${theme}`}>
      <h2 className="categoriesList">Categories</h2>
      <nav>
        <ul>
          {CATEGORIES.map((category) => (
            <li key={category}>{category}</li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default CategoryList;
