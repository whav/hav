import { default as NextHead } from "next/head";

function Head({ Component, pageProps }) {
  return (
    <NextHead>
      <title>HAV</title>
      <link rel="icon" href="/favicon.ico" />
    </NextHead>
  );
}

export default Head;
