import React, { useState } from "react";

// Create context object
export const ThemeContext = React.createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");
    console.log(theme)
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
