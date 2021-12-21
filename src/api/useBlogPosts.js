import { useContext, useEffect } from "react";
import AppContext from "../store/AppState.js";
import { superSearch } from "@codewell/super-search";
// import { useFetch } from "./useFetch.js";

const filter = (posts, search) => {
  console.log(">>> search", search);
  if ([undefined, null, ""].includes(search)) return posts;

  return posts.filter(
    (post) => superSearch()(search, post).numberOfMatches > 0
  );
};

export const useBlogPosts = () => {
  // const fetcher = useFetch("/posts");
  const { state } = useContext(AppContext);

  // useEffect(() => {
  //   fetcher({ mehtod: "get" }).then((data) => {
  //     dispatch({ type: "SET_POSTS", payload: data });
  //   });
  // }, [dispatch, fetcher]);

  return filter(state.posts, state.searchInput);
};
