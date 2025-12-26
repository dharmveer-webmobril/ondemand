import React, { createContext, useContext } from "react";
import { defaultTheme } from "./defaultTheme";

export type ThemeType = typeof defaultTheme;


export const ThemeContext = createContext<ThemeType>(defaultTheme);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeContext.Provider value={defaultTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
