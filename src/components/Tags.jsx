import React from "react";
import styled from "styled-components";

const TagWrapper = styled.div`
  background-color: var(--blue);
  border-radius: 100px;
  padding: 3px 7px;
  color: #ffffff;
  font-weight: 900;
  margin-right: 5px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;

const Tag = (tag) => <TagWrapper>{tag}</TagWrapper>;

const Wrapper = styled.div`
  display: flex;
  flex: 1;
`;

const Tags = ({ tags }) => <Wrapper>{tags.map(Tag)}</Wrapper>;

export default Tags;
