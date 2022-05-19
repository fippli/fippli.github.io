import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Blog } from "../Blog/index.jsx";
import { Music } from "./Music.jsx";

export const Views = () => (
  <BrowserRouter>
    <Routes>
      <Route exact path="/" element={<Blog />} />
      <Route exact path="/music/:filename" element={<Music />} />
    </Routes>
  </BrowserRouter>
);
