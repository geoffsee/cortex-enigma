import styled from 'styled-components';

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;
  padding: 4rem 0;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
`;

export const Header = styled.div`
  margin-bottom: 2rem;
`;

export const GeneratorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 1000px;
  padding: 0 1rem;
`;

export const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  text-align: left;
`;

export const CategoryGroup = styled.div`
  h3 {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.1rem;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export const OptionsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const OptionButton = styled.button<{ $active?: boolean }>`
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.accent : theme.colors.border)};
  background: ${({ $active, theme }) => ($active ? theme.colors.accent : theme.colors.background)};
  color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.text)};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ $active, theme }) => ($active ? theme.colors.accent : theme.colors.accentBorder)};
    background: ${({ $active, theme }) => ($active ? theme.colors.accent : theme.colors.accentBg)};
  }
`;

export const PromptDisplay = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.socialBg};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const PromptBox = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.codeBg};
  border-radius: 4px;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;

  code {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.heading};
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

export const ActionButton = styled.button`
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  border: none;
  background: ${({ theme }) => theme.colors.accent};
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
  }
`;

export const Formula = styled.p`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.8rem;
  margin-top: 1rem;
  color: ${({ theme }) => theme.colors.accent};
`;

export const ReferenceLinks = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;

  span {
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
    background: ${({ theme }) => theme.colors.codeBg};
    border-radius: 3px;
  }
`;

export const FooterSection = styled.section`
  display: flex;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
`;

export const Ticks = styled.div`
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: ${({ theme }) => theme.colors.border};
  }
  &::after {
    right: 0;
    border-right-color: ${({ theme }) => theme.colors.border};
  }
`;

export const Spacer = styled.section`
  height: 88px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 1024px) {
    height: 48px;
  }
`;
