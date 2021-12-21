import getDateString from "./getDateString";

export default (state, blogposts) => blogposts.filter(blogpost => (
  (blogpost.content + blogpost.tags.join(" ") + getDateString(blogpost))
    .toLowerCase()
    .indexOf(state.postFilter.toLowerCase()) > -1
));