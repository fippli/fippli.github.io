window.onload = (function () {
  "use strict";

  const blogElement = document.getElementById("blog");

  const blogposts = [
    {
      title: "Initial Post",
      text:
        "Ranting about Apple's and Google's exploitation of the Corona crisis.",
      postName: "initial-post",
      date: "12 April 2020",
    },
  ];

  const createPostLink = (postName) => `/blogpost?blogpost=${postName}`;

  const createBlogEntry = ({ title, text, postName, date }) => {
    console.log(title, text, postName, date);
    const blogEntry = document.createElement("div");
    blogEntry.className = "blog-entry";
    blogEntry.innerHTML = `
    <a href='${createPostLink(postName)}' class="post-link-wrapper">
    <h2 class="post-title">${title} <span class="date">${date}</span></h2>
    <p>${text}</p>
    </a>
    `;
    return blogEntry;
  };

  const renderBlog = () => {
    console.log(blogposts);
    blogElement.innerHTML = "";
    blogposts.forEach((blogpost) => {
      blogElement.appendChild(createBlogEntry(blogpost));
    });
  };

  renderBlog();
})();
