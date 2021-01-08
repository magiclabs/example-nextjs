/**
 * Inject @magiclabs/ui CSS variables into NextJS to avoid CSS being applied after page load
 */
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { DEFAULT_THEME, getThemeVariables } from '@magiclabs/ui';
export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <style
            type='text/css'
            dangerouslySetInnerHTML={{ __html: getThemeVariables(DEFAULT_THEME).toCSS() }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
