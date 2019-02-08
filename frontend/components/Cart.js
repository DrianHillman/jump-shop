import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import StyledButton from './styles/StyledButton';
import Header from './Header';

const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`;

const Cart = () => {
  return (
    <Mutation mutation={TOGGLE_CART_MUTATION}>
      {toggleCart => (
        <Query query={LOCAL_STATE_QUERY}>
          {({ data }) => (
            <CartStyles open={data.cartOpen}>
              <header>
                <CloseButton onClick={toggleCart} title='close'>
                  &times;
                </CloseButton>
                <Supreme>Your Cart</Supreme>
                <p>You have __ items in your cart.</p>
              </header>

              <footer>
                <p>$10.00</p>
                <StyledButton>Checkout</StyledButton>
              </footer>
            </CartStyles>
          )}
        </Query>
      )}
    </Mutation>
  );
};

export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION };
export default Cart;
