import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import Toast from "./components/ui/Toast";
import "@mantine/core/styles.css";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { darkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <MantineProvider
      theme={{
        colorScheme: darkMode ? "dark" : "light",
        primaryColor: "blue",
      }}
      withGlobalStyles
      withNormalizeCSS
    >
      <Toast />
      <RouterProvider router={router} />
    </MantineProvider>
  );
}
export default App;
