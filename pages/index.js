import { useUser } from '../lib/hooks';
import Layout from '../components/layout';

const Home = () => {
  const user = useUser();

  return (
    <Layout>
      {user ? <div>You're logged in!</div> : <div>Log in to continue</div>}
      <style jsx>{`
        div {
          font-size: 17px;
        }
      `}</style>
    </Layout>
  );
};

export default Home;
