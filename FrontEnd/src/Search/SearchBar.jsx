import {useState} from "react";

function SearchBar({filterPosts}) {
  const [ searchWord, setSearchWord ] = useState("");
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchWord(value);
    filterPosts(value);
  };
  return (
    <div className="searchArea">
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
