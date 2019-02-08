import React from 'react';
import Signup from '../components/Signup';
import Signin from '../components/Signin';
import RequestReset from '../components/RequestReset';
import styled from 'styled-components';

const Columns = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;

const SignupPage = props => {
  return (
    <Columns>
      <Signup />
      <Signin />
      <RequestReset />
    </Columns>
  );
};

export default SignupPage;
