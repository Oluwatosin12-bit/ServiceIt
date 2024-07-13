import "./CategoryList.css";
import { CATEGORIES } from "../Categories";
function CategoryList() {
  return (
    <div className="categories">
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
