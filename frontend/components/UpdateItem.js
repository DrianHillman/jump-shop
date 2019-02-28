import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import Form from './styles/Form';
import Error from './ErrorMessage';
import styled from 'styled-components';
import formatMoney from '../lib/formatMoney';

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
    }
  }
`;

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION($id: ID!, $title: String, $description: String, $price: Int) {
    updateItem(id: $id, title: $title, description: $description, price: $price) {
      id
      title
      description
      price
    }
  }
`;

const SuccessMessage = styled.span`
  color: #393939;
  margin: 0 3rem;
  font-size: 13px;
`;

class UpdateItem extends Component {
  state = {
    showSuccess: false,
  };

  handleChange = e => {
    const { name, type, value } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    this.setState({ [name]: val });
  };

  updateItem = async (e, updateItemMutation) => {
    e.preventDefault();
    this.setState({ showSuccess: false });
    const res = await updateItemMutation({
      variables: {
        id: this.props.id,
        ...this.state,
      },
    });
    this.setState({ showSuccess: true });
  };

  render() {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ data, loading }) => {
          if (loading) return <p>Loading...</p>;
          if (!data.item) return <p>No item found for ID: {this.props.id}</p>;
          return (
            <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
              {(updateItem, { loading, error }) => (
                <Form onSubmit={e => this.updateItem(e, updateItem)}>
                  <Error error={error} />
                  <fieldset disabled={loading} aria-busy={loading}>
                    <h2>Update this Item</h2>
                    <label htmlFor='title'>
                      Title
                      <input
                        type='text'
                        id='title'
                        name='title'
                        placeholder='Title'
                        required
                        defaultValue={data.item.title}
                        onChange={this.handleChange}
                      />
                    </label>
                    <label htmlFor='price'>
                      Price
                      <input
                        type='number'
                        id='price'
                        name='price'
                        placeholder='Price'
                        required
                        defaultValue={data.item.price}
                        onChange={this.handleChange}
                      />
                    </label>
                    <label htmlFor='description'>
                      Description
                      <textarea
                        id='description'
                        name='description'
                        placeholder='Please enter a description'
                        defaultValue={data.item.description}
                        onChange={this.handleChange}
                      />
                    </label>
                    <button type='submit'>Sav{loading ? 'ing' : 'e'} Changes</button>
                    {this.state.showSuccess ? <SuccessMessage>Success ✓</SuccessMessage> : null}
                  </fieldset>
                </Form>
              )}
            </Mutation>
          );
        }}
      </Query>
    );
  }
}

export default UpdateItem;
export { UPDATE_ITEM_MUTATION };
