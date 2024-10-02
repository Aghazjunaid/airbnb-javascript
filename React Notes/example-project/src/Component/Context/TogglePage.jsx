import React, { useContext } from "react";

// importing the context object that we created
import { ThemeContext } from "./ThemeContext";

const ToggleTheme = () => {
  // Access the context object
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <>
      <div className={`${theme === "light" ? "light" : "dark"} wrapper`}>
        <button onClick={toggleTheme}>Toggle Theme</button>
      </div>
    </>
  );
};

export default ToggleTheme;
