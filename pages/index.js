import { useContext } from 'react';
import { UserContext } from '../lib/UserContext';
import Loading from '../components/loading';

const Home = () => {
  const [user] = useContext(UserContext);

  return <>{user?.loading ? <Loading /> : user?.issuer && <div>You're logged in!</div>}</>;
};

export default Home;
