import Layout from "components/layout/Layout";

// css imports
import "../components/styles.css";

function HAVApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default HAVApp;
