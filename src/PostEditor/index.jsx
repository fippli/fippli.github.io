import React from "react";
import AppState from "../store/AppState";
import Title from "../components/Title";
import Tags from "../components/Tags";

const PostEditor = () => {
  const savePost = state => () => {
    fetch("/", {
      method: "post",
      headers: {
        "content-type": "application/json",
        Authorization: `Token ${state.apiKey}`
      },
      body: JSON.stringify({
        content: state.newPost,
        tags: state.newTags
      }),
      mode: "cors"
    })
      .then(response => response.json())
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const updateTags = state => event => {
    event.preventDefault();
    state.update(state, {
      newTags: [...state.newTags, state.newTag],
      newTag: ""
    });
  };

  return (
    <AppState.Consumer>
      {state => (
        <div style={styles.wrapper}>
          <Title title="EDITOR" />
          <textarea
            style={styles.editor}
            onChange={state.updateOnEvent(state, "newPost")}
          />
          <div style={styles.tagsFormWrapper}>
            <Tags tags={state.newTags} />
            <form onSubmit={updateTags(state)}>
              <input
                style={styles.tagInput}
                placeholder="+ new tag"
                value={state.newTag}
                onChange={state.updateOnEvent(state, "newTag")}
              />
            </form>
          </div>
          <div style={styles.sendWrapper}>
            <input
              style={styles.input}
              placeholder="key"
              onChange={state.updateOnEvent(state, "apiKey")}
            />
            <button style={styles.button} onClick={savePost(state)}>
              Save
            </button>
          </div>
        </div>
      )}
    </AppState.Consumer>
  );
};

export default PostEditor;

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2rem 10rem",
    boxSizing: "border-box"
  },
  input: {
    border: "3px solid #11111111",
    borderRadius: "7px",
    width: "100%",
    fontFamily: "Dank Mono, monospace",
    fontSize: "1rem",
    padding: "10px",
    boxSizing: "border-box",
    marginRight: "20px",
    flex: 1
  },
  editor: {
    border: "3px solid #11111111",
    borderRadius: "7px",
    width: "100%",
    fontFamily: "Dank Mono, monospace",
    boxSizing: "border-box",
    padding: "20px",
    minHeight: "50vh"
  },
  sendWrapper: {
    display: "flex",
    flexDirection: "row",
    width: "100%"
  },
  tagInput: {
    border: "none",
    backgroundColor: "var(--blue)",
    borderRadius: "100px",
    padding: "3px 10px",
    color: "#ffffff",
    fontWeight: 900,
    marginRight: "10px",
    fontSize: "0.8rem",
    textAlign: "center"
  },
  tagsFormWrapper: {
    display: "flex",
    flexDirection: "row",
    margin: "20px 0",
    width: "100%"
  },
  button: {
    border: "none",
    borderBottom: "3px solid rgba(0,0,0,0.1)",
    backgroundColor: "var(--red)",
    color: "white",
    fontSize: ".8rem",
    borderRadius: "3px",
    fontWeight: "700",
    padding: "5px 15px",
    boxSizing: "border-box"
  }
};
