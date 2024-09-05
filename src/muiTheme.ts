"use client";
import { ThemeOptions, createTheme } from "@mui/material/styles";

export const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#20B2FF",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#E3E3E5",
    },
    success: {
      main: "#58BD7C",
    },
    error: {
      main: "#DA6A3F",
    },
  },
  // @ts-ignore
  shadows: ["none"],
  typography: {
    fontFamily: "Nunito",
  },
  shape: {
    borderRadius: 8,
  },
};

export const lightTheme = createTheme(themeOptions);
