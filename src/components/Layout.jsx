import styled from "styled-components";

import { Title } from "../components/Title";

const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const FooterWrapper = styled.footer`
  width: 100%;
  min-height: 128px;
  background-color: #f9f9f9;
  margin-top: 128px;
`;
const Main = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconList = styled.div`
  display: flex;
  flex-direction: wrapper;
  font-size: 3rem;
`;

const Icon = styled.a`
  color: #444444;
  margin-right: 30px;
`;

const Header = () => {
  return (
    <HeaderWrapper>
      <Title>FIPPLI</Title>
      <IconList>
        <Icon href="https://github.com/fippli">
          <i className="fab fa-github" />
        </Icon>
        <Icon href="https://www.linkedin.com/in/filip-johansson-036b9984/">
          <i className="fab fa-linkedin" />
        </Icon>
      </IconList>
    </HeaderWrapper>
  );
};

const Footer = () => {
  return <FooterWrapper></FooterWrapper>;
};

export const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <Main>{children}</Main>
      <Footer />
    </>
  );
};
