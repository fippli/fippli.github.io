import React, { useRef, useEffect } from "react";
import showdown from "showdown";
import hljs from "highlight.js";

showdown.setOption("tasklists", true);
const converter = new showdown.Converter();

const MarkdownViewer = (props) => {
  const { markdown } = props;

  const viewerRef = useRef(null);

  const findCodeNodes = (root) => {
    return [...root.children]
      .filter((child) => {
        console.log(child);
        return child.nodeName === "PRE";
      })
      .map((child) => child.children[0]);
  };

  useEffect(() => {
    console.log(viewerRef);
    if (viewerRef.current) {
      console.log("viewerRef updated");
      const codeNodes = findCodeNodes(viewerRef.current);
      codeNodes.forEach((codeNode) => {
        hljs.highlightBlock(codeNode);
      });
    }
  }, [viewerRef]);

  return (
    <div
      style={styles.wrapper}
      ref={viewerRef}
      dangerouslySetInnerHTML={{
        __html: converter.makeHtml(markdown),
      }}
    />
  );
};

export default MarkdownViewer;

const styles = {
  wrapper: {
    width: "100%",
  },
};
