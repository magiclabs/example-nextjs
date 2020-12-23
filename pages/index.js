import { useUser } from '../lib/hooks';
import Layout from '../components/layout';

const Home = () => {
  const user = useUser();

  return <Layout>{user ? <div>You're logged in!</div> : <div>Log in to continue</div>}</Layout>;
};

export default Home;
