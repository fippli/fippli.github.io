import styled from "styled-components";

export const Title = styled.h1`
  font-size: 12rem;
  font-family: Anton, sans-serif;
  text-align: center;
  color: var(--red);
  text-shadow: 10px 10px var(--blue);
  letter-spacing: 25px;
  margin: 0;

  @media screen and (max-width: 768px) {
    font-size: 5rem;
    text-shadow: 0.05em 0.05em var(--blue);
    letter-spacing: 16px;
  }
`;
