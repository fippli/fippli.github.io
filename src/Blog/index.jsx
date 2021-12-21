import { Blogpost } from "./Blogpost.jsx";
import { useBlogPosts } from "../api/useBlogPosts.js";
import { Layout } from "../components/Layout.jsx";
import styled from "styled-components";
import { useContext } from "react";
import AppContext from "../store/AppState.js";

const Feed = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 700px;
  align-items: center;
  width: 100%;
`;

const Input = styled.input`
  border-radius: 100px;
  background-color: #e9e9e9;
  padding: 10px 20px;
  border: none;
  font-size: 18px;
  font-weight: 700;
  margin-top: 36px;
`;

export const Blog = () => {
  const blogposts = useBlogPosts();
  const { dispatch } = useContext(AppContext);

  const handleInput = (event) =>
    dispatch({ type: "SET_SEARCH_INPUT", payload: event.target.value });

  return (
    <Layout>
      <Input placeholder="filter..." onChange={handleInput} />
      <Feed>{blogposts.map(Blogpost)}</Feed>
    </Layout>
  );
};
