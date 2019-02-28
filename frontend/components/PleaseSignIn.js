import { Query } from 'react-apollo';
import { CURRENT_USER_QUERY } from './User';
import Signin from './Signin';
import MDSpinner from 'react-md-spinner';

const PleaseSignIn = props => (
  <Query query={CURRENT_USER_QUERY}>
    {({ data, loading }) => {
      if (loading)
        return <MDSpinner color1='#FF0000' color2='#3A3A3A' color3='#FF0000' color4='#3A3A3A' />;
      if (!data.me) {
        return (
          <div>
            <p>Please sign in to continue</p>
            <Signin />
          </div>
        );
      }
      return props.children;
    }}
  </Query>
);

export default PleaseSignIn;
