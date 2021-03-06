import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { CURRENT_USER_QUERY } from './User';
import styled from 'styled-components';

const ADD_TO_CART_MUTATION = gql`
  mutation addToCart($id: ID!) {
    addToCart(id: $id) {
      id
      quantity
    }
  }
`;

const Icon = styled.span`
  padding: 0 0.5rem;
`;

export class AddToCart extends Component {
  render() {
    const { id } = this.props;
    return (
      <Mutation
        mutation={ADD_TO_CART_MUTATION}
        variables={{ id }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(addToCart, { error, loading }) => (
          <button onClick={addToCart} disabled={loading}>
            Add{loading && 'ing'} to Cart{' '}
            <Icon role='img' aria-label='Cart Emoji' aria-labelledby='Shopping Cart'>
              🛒
            </Icon>
          </button>
        )}
      </Mutation>
    );
  }
}

export { ADD_TO_CART_MUTATION };
export default AddToCart;
