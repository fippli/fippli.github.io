import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Blog } from "./Blog/index.jsx";

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route exact path="/" element={<Blog />} />
    </Routes>
  </BrowserRouter>
);
