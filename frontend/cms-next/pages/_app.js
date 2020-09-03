import { ThemeProvider } from "hav-ui";
import { MainWrapper, Main, Nav } from "hav-ui";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  const nav = (
    <Nav>
      <a href="/urxn/">test</a>
      <a href="/test2">Test2</a>
    </Nav>
  );

  return (
    <ThemeProvider>
      <Head>
        <title>HAV</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainWrapper nav={nav} logo_url="/logos/hav.svg">
        <Main content_variant="layout.text_content">
          <Component {...pageProps} />
        </Main>
      </MainWrapper>
    </ThemeProvider>
  );
}

export default MyApp;
