window.onload = (function () {
  "use strict";

  const blogElement = document.getElementById("blogpostWrapper");
  const blogpost = new URL(window.location.href).searchParams.get("blogpost");
  const converter = new showdown.Converter();
  const MDtoHTML = (md) => {
    return converter.makeHtml(md);
  };

  const getUrl = (blogpost, localEditing = false) => {
    if (localEditing) {
      return `http://localhost:8000/blogposts/${blogpost}`;
    }
    return `https://cdn.jsdelivr.net/gh/fippli/fippli.se-cdn@latest/blogposts/${blogpost}`;
  };

  const getBlogPost = (blogpost) => {
    return fetch(getUrl(blogpost, true))
      .then((response) => response.text())
      .then((page) => {
        console.log(page);
        return page;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getBlogPost(blogpost).then((page) => {
    blogElement.innerHTML = MDtoHTML(page);
    Prism.highlightAll();
  });
})();
