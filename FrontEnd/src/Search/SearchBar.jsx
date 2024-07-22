import {useState} from "react";

function SearchBar({filterPosts}) {
  const [ searchWord, setSearchWord ] = useState("");
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchWord(value);
    filterPosts([], value);
  };
  return (
    <div className="searchArea">
      <i className="fa-solid fa-magnifying-glass searchIcon"></i>
      <input
        value={searchWord}
        onChange={handleSearchChange}
        className="searchInput"
        placeholder="Search..."
      />
    </div>
  );
}

export default SearchBar;
