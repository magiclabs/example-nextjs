import Head from 'next/head';
import Header from './header';

const Layout = (props) => (
  <>
    <Head>
      <title>Magic</title>
      <link rel='icon' href='/favicon.ico' />
    </Head>

    <Header />
    <main>
      <div className='container'>{props.children}</div>
    </main>
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300&display=swap');
      *,
      *::before,
      *::after {
        font-family: 'Inter', sans-serif;
        outline: none;
      }
      body {
        margin: 0;
        color: #333;
        background-color: #fff;
      }
      .container {
        max-width: 42rem;
        margin: 0 auto;
      }
    `}</style>
  </>
);

export default Layout;
