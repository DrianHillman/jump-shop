import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import User from './User';
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import StyledButton from './styles/StyledButton';
import CartItem from './CartItem';
import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';
import TakeMyMoney from './TakeMyMoney';

const Disclaimer = styled.div`
  font-size: 11px;
  color: #3a3a3a;

  & a {
    text-decoration: underline #aa0000;
  }

  & code {
    font-size: 12px;
    background-color: #eee;
    padding: 2px 4px;
    margin: 0 4px;
  }
`;

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

const Composed = adopt({
  user: ({ render }) => <User>{render}</User>,
  toggleCart: ({ render }) => <Mutation mutation={TOGGLE_CART_MUTATION}>{render}</Mutation>,
  localState: ({ render }) => <Query query={LOCAL_STATE_QUERY}>{render}</Query>,
});

const Cart = () => {
  return (
    <Composed>
      {({ user, toggleCart, localState }) => {
        const me = user.data.me;
        if (!me) return null;
        return (
          <CartStyles open={localState.data.cartOpen}>
            <header>
              <CloseButton onClick={toggleCart} title='close'>
                &times;
              </CloseButton>
              <Supreme>{me.name}'s Cart</Supreme>
              <p>
                You have {me.cart.length} item{me.cart.length === 1 ? '' : 's'} in your cart.
              </p>
            </header>
            <ul>
              {me.cart.map(cartItem => (
                <CartItem key={cartItem.id} cartItem={cartItem} />
              ))}
            </ul>
            <footer>
              <p>{formatMoney(calcTotalPrice(me.cart))}</p>
              {me.cart.length ? (
                <TakeMyMoney>
                  <StyledButton>Checkout</StyledButton>
                </TakeMyMoney>
              ) : null}
            </footer>
            <Disclaimer>
              <p>
                Stripe checkout is fully functional but this site is in test mode! Do not enter any
                actual card info. Copy one of{' '}
                <a
                  href='https://stripe.com/docs/testing#cards'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Stripe's Dummy Card Numbers
                </a>{' '}
                to give order placement a spin!
              </p>
              <p>
                Dummy Card:
                <code>4242424242424242</code> <code>02/22</code>
                <code>222</code>
              </p>
            </Disclaimer>
          </CartStyles>
        );
      }}
    </Composed>
  );
};

export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION };
export default Cart;
