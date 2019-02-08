import styled from 'styled-components';

const CloseButton = styled.button`
  background: black;
  color: white;
  font-size: 3rem;
  border: 0;
  position: absolute;
  z-index: 2;
  right: 0;
  cursor: pointer;
  min-width: 50px;
  min-height: 50px;
`;

export default CloseButton;
