import React from 'react';
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import StyledButton from './styles/StyledButton';
import Header from './Header';

const Cart = () => {
  return (
    <CartStyles open={true}>
      <header>
        <CloseButton title='close'>&times;</CloseButton>
        <Supreme>Your Cart</Supreme>
        <p>You have __ items in your cart.</p>
      </header>

      <footer>
        <p>$10.00</p>
        <StyledButton>Checkout</StyledButton>
      </footer>
    </CartStyles>
  );
};

export default Cart;
