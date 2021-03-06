import React from 'react';
import styled from 'styled-components';
import buttonTheme from './theme';

const Button = styled.button`
  width: fit-content;
  border: 0.1rem solid;
  border-radius: 0.4rem;
  padding: 0.5rem;
  cursor: pointer;
  ${(props) => props.style};
  &:disabled {
    opacity: 0.7;
  }
`;

function CustomButton({ handleClick, children, style = {}, disabled = false }) {
  const colorStyle = buttonTheme[style.color] || buttonTheme.default;
  const fontSize = style.size === 'sm' ? '0.8rem' : '1rem';
  return (
    <Button
      style={{ fontSize, ...colorStyle }}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

export default CustomButton;
