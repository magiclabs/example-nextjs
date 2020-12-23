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
      @import url('https://fonts.googleapis.com/css2?family=Cutive+Mono&display=swap');
      *,
      *::before,
      *::after {
        box-sizing: border-box;
        font-family: 'Inter', sans-serif;
        outline: none;
      }
      body {
        margin: 0;
        color: #333;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
          Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
          'Noto Color Emoji';
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
