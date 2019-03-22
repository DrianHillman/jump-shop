import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import { format, parseISO } from 'date-fns';
import Head from 'next/head';
import gql from 'graphql-tag';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';
import OrderStyles from './styles/OrderStyles';
import Spinner from './Spinner';

const SINGLE_ORDER_QUERY = gql`
  query SINGLE_ORDER_QUERY($id: ID!) {
    order(id: $id) {
      id
      charge
      total
      createdAt
      user {
        id
      }
      items {
        id
        title
        description
        price
        image
        quantity
      }
    }
  }
`;

export class Order extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
  };

  render() {
    return (
      <Query query={SINGLE_ORDER_QUERY} variables={{ id: this.props.id }}>
        {({ data, error, loading }) => {
          if (error) return <Error error={error} />;
          if (loading) return <Spinner />;
          const order = data.order;

          return (
            <OrderStyles data-test='order'>
              <Head>
                <title>The Jump Shop - Order {order.id}</title>
              </Head>
              <p>
                <span>Order ID</span>
                <span>{this.props.id}</span>
              </p>
              <p>
                <span>Charge</span>
                <span>{order.charge}</span>
              </p>
              <p>
                <span>Date</span>
                <span>
                  {format(parseISO(order.createdAt), 'MMMM d, YYYY h:mm a', {
                    awareOfUnicodeTokens: true,
                  })}
                </span>
              </p>
              <p>
                <span>Order Total</span>
                <span>{formatMoney(order.total)}</span>
              </p>
              <p>
                <span>Items</span>
                <span>{order.items.length}</span>
              </p>
              <p>
                <span>Quantity</span>
                <span>{order.items.reduce((a, b) => a + b.quantity, 0)}</span>
              </p>
              <div className='items'>
                {order.items.map(item => (
                  <div className='order-item' key={item.id}>
                    <img src={item.image} alt={item.title} />
                    <div className='item-details'>
                      <h2>{item.title}</h2>
                      <p>Qty: {item.quantity}</p>
                      <p>Price: {formatMoney(item.price)}</p>
                      <p>SubTotal: {formatMoney(item.price * item.quantity)}</p>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </OrderStyles>
          );
        }}
      </Query>
    );
  }
}

export { SINGLE_ORDER_QUERY };
export default Order;
