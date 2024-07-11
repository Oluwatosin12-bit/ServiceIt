import "./CategoryList.css";
import { categories } from "../Categories";
function CategoryList() {
  return (
    <div className="categories">
      <h2 className="categoriesList">Categories</h2>
      <nav>
        <ul>
          {categories.map((category) => (
            <li key={category}>{category}</li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default CategoryList;
