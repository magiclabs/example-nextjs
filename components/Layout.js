import Head from 'next/head';
import Header from './header';
import { ThemeProvider, ToastProvider } from '@magiclabs/ui';
import '@magiclabs/ui/dist/cjs/index.css';

const Layout = (props) => (
  <>
    <Head>
      <title>Magic</title>
      <link rel='icon' href='/favicon.ico' />
    </Head>

    <Header />
    <main>
      <ThemeProvider root>
        <ToastProvider position={'top-end'}>
          <div className='container'>{props.children}</div>
        </ToastProvider>
      </ThemeProvider>
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
