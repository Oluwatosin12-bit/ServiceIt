import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

const SearchWordContext = createContext();
export const SearchWordProvider = ({ children }) => {
  const [searchWord, setSearchWord] = useState("");

  return (
    <SearchWordContext.Provider value={{searchWord, setSearchWord}}>
      {children}
    </SearchWordContext.Provider>
  );
};

export const useSearchWord = () => useContext(SearchWordContext);
