import { useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import styled from "styled-components";

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 900;
  width: 100%;
  margin-bottom: 32px;
  text-align: center;
`;

export const Music = () => {
  const params = useParams();

  return (
    <Layout>
      <Title>{params.filename}</Title>
      <audio controls src={`/files/${params.filename}`} />
    </Layout>
  );
};
