window.onload = (function () {
  "use strict";

  const blogElement = document.getElementById("blogpostWrapper");

  const blogpost = new URL(window.location.href).searchParams.get("blogpost");
  console.log(blogpost);

  const getUrl = (blogpost, localEditing = false) => {
    if (localEditing) {
      return `http://localhost:3000/blogposts/${blogpost}.html`;
    }
    return `https://cdn.jsdelivr.net/gh/fippli/fippli.se-cdn@latest/blogposts/${blogpost}.html`;
  };

  const getBlogPost = (blogpost) => {
    return fetch(getUrl(blogpost, true))
      .then((response) => response.text())
      .then((page) => {
        return page;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getBlogPost(blogpost).then((page) => {
    blogElement.innerHTML = page;
    hljs.initHighlighting.called = false;
    hljs.initHighlighting();
  });
})();
