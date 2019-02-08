import Reset from '../components/Reset';

const ResetPage = props => {
  return (
    <>
      <Reset resetToken={props.query.resetToken} />
    </>
  );
};

export default ResetPage;
