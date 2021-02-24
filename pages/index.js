import { useContext, useEffect } from 'react';
import Router from 'next/router';
import { UserContext } from '../lib/UserContext';
import Loading from '../components/loading';

const Home = () => {
  const [user] = useContext(UserContext);

  // If not loading and no user found, redirect to /login
  useEffect(() => {
    user && !user.loading && !user.issuer && Router.push('/login');
  }, [user]);

  return <>{user?.loading ? <Loading /> : user?.issuer && <div>You're logged in!</div>}</>;
};

export default Home;
