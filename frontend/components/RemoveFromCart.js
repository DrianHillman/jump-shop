import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { CURRENT_USER_QUERY } from './User';

const REMOVE_FROM_CART_MUTATION = gql`
  mutation removeFromCart($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${props => props.theme.red};
  }
`;

export class RemoveFromCart extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
  };

  render() {
    return (
      <Mutation mutation={REMOVE_FROM_CART_MUTATION} variables={{ id: this.props.id }}>
        {(removeFromCart, { loading, error }) => (
          <BigButton
            title='Delete Item'
            onClick={() => {
              removeFromCart().catch(err => alert(err.message));
            }}
            disable={loading}
          >
            &times;
          </BigButton>
        )}
      </Mutation>
    );
  }
}

export default RemoveFromCart;
