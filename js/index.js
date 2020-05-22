window.onload = (function () {
  "use strict";

  const blogElement = document.getElementById("blog");

  const blogposts = [
    {
      title: "AND",
      text: "How should a function and() be constructed?",
      postName: "and.md",
      date: "21 May 2020",
    },
    {
      title: "Initial Post",
      text:
        "Ranting about Apple's and Google's exploitation of the Corona crisis.",
      postName: "initial-post.html",
      date: "12 April 2020",
    },
  ];

  const createPostLink = (postName) =>
    `<a href='/blogpost.html?blogpost=${postName}' class="post-link-wrapper">`;

  const createBlogEntry = ({ title, text, postName, date }) => {
    console.log(title, text, postName, date);
    const blogEntry = document.createElement("div");
    blogEntry.className = "blog-entry";
    blogEntry.innerHTML = `
    ${createPostLink(postName)}
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
