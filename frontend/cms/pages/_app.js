import Head from "next/head";
import Link from "next/link";
import NavBar from "components/navigation/NavBar";
import Layout from "components/layout/Layout";
import "../components/styles.css";

function HAVApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>HAV</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout.Wrapper>
        <Layout.Nav>
          <NavBar />
        </Layout.Nav>
        <Layout.Main>
          <Component {...pageProps} />
        </Layout.Main>
      </Layout.Wrapper>
    </>
  );
}

export async function getStaticProps(context) {
  // This does not (yet) work:
  // discussion here: https://github.com/vercel/next.js/discussions/10949
  return {
    props: {
      navItems: ["whav", "gaenzle", "nebesky", "urxn"],
    },
    revalidate: 1,
  };
}

export default HAVApp;
