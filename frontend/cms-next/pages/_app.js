import { ThemeProvider } from "hav-ui";
import { MainWrapper, Main } from "hav-ui";
import Head from "next/head";
import Link from "next/link";
import { Nav } from "components/navigation";

function MyApp({ Component, pageProps }) {
  const nav = (
    <Nav>
      <Link href="/">Home</Link>
      {["whav", "gaenzle", "nebesky"].map((slug) => (
        <Link
          key={slug}
          href="/collections/[collection_slug]"
          as={`/collections/${slug}`}
        >
          {slug}
        </Link>
      ))}
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
