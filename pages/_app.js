import '@magiclabs/ui/dist/cjs/index.css';
import { ThemeProvider, ToastProvider } from '@magiclabs/ui';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider root>
      <ToastProvider position={'top-end'}>
        <Component {...pageProps} />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default MyApp;
