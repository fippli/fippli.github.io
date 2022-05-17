import MarkdownViewer from "../MarkdownViewer";
import { getDateString } from "./utils/getDateString";
import Tags from "../components/Tags";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 64px;
`;

const TitleWrapper = styled.h2`
  font-size: 2rem;
  font-weight: 900;
  width: 100%;
  margin-bottom: 0;
`;

const InfoWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
`;

const Link = styled.a`
  text-decoration: none;
  color: var(--blue);
  :hover {
    color: var(--red);
  }
`;

const StyledLink = styled.a`
  color: #000000;
  width: 100%;
  text-decoration: none;
  font-family: var(--title-font);

  :hover {
    color: var(--blue);
    border-bottom: 4px solid var(--blue);
  }

  @media screen and (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Date = styled.span`
  fontsize: 1.4rem;
  font-weight: 400;
  fontfamily: Montserrat;
  color: #33333366;
  margin-left: 20px;
`;

const TitleRow = ({ title, link }) => {
  return (
    <TitleWrapper>
      <StyledLink href={link}>{title}</StyledLink>
    </TitleWrapper>
  );
};
const InfoRow = ({ tags, created, repository }) => {
  return (
    <InfoWrapper>
      <Tags tags={tags} />
      <div>
        <Link href={repository}>
          <i className="fab fa-github" />
        </Link>
        <Date>{getDateString(created)}</Date>
      </div>
    </InfoWrapper>
  );
};

export const Blogpost = ({
  id,
  content,
  title,
  link,
  created,
  tags,
  repository,
}) => {
  return (
    <Wrapper key={id}>
      <TitleRow title={title} link={link} tags={tags} />

      <MarkdownViewer markdown={content} />

      <InfoRow tags={tags} created={created} repository={repository} />
    </Wrapper>
  );
};
