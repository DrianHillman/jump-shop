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

const DemoLogin = styled.div`
  font-size: 0.8em;
  margin-top: 2em;
`;

const SignupPage = props => {
  return (
    <>
      <Columns>
        <Signup />
        <Signin />
        <RequestReset />
      </Columns>
      <DemoLogin>
        <p>Feel free to create an account, or Sign In as this demo Admin:</p>
        <blockquote>
          Username: demo@demo.com
          <br />
          Password: Admin1
        </blockquote>
      </DemoLogin>
    </>
  );
};

export default SignupPage;
