import React, { useState } from "react";
import styles from "./NavBar.module.css";
import { MenuButton } from "theme-ui";

import ActiveLink from "./Link";
import { useRouter } from "next/router";

const collections = ["nebesky", "gaenszle"];
if (process.env.NODE_ENV === "development") {
  collections.push("test");
}

const collectionRe = /^\/collections\/(\w+)\/.*$/;

const Link = (props) => {
  return <ActiveLink activeClassName={styles.active_link} {...props} />;
};

const CollectionNav = ({ slug }) => {
  return (
    <ul>
      <li>
        <Link href="/[[...page]]/" as="/">
          <a>Return</a>
        </Link>
      </li>
      <li>
        <Link href="/[[...page]]/" as={`/collections/${slug}/`}>
          <a>{slug}</a>
        </Link>
      </li>
      <li>
        <Link
          href="/collections/[collection_slug]/browse/[[...folder_id]]/"
          as={`/collections/${slug}/browse/`}
        >
          <a>Browse</a>
        </Link>
      </li>
      <li>
        <Link
          href="/collections/[collection_slug]/search/"
          as={`/collections/${slug}/search/`}
        >
          <a>Search</a>
        </Link>
      </li>
    </ul>
  );
};

const GlobalNav = () => {
  return (
    <ul>
      <li>
        <Link href="/[[...page]]/" as="/">
          <a>Home</a>
        </Link>
        <ul>
          <li>
            <Link href="/[[...page]]/" as="/cooperation/">
              <a>How to cooperate</a>
            </Link>
          </li>

          <li>
            <Link href="/[[...page]]/" as="/open-knowledge/">
              <a>License Models</a>
            </Link>
          </li>
        </ul>
      </li>

      <li>
        Collections
        <ul>
          {collections.map((c) => (
            <li key={c}>
              <Link href="/[[...page]]/" as={`/collections/${c}/`}>
                <a>{c}</a>
              </Link>
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
};

const NavBar = () => {
  const [navVisible, setNavVisibility] = useState(false);
  const router = useRouter();

  let { collection_slug } = router.query;
  if (!collection_slug) {
    const match = router.asPath.match(collectionRe);
    if (match) {
      collection_slug = match[1];
    }
  }
  console.log(
    collection_slug,
    router.asPath,
    router.asPath.match(collectionRe)
  );
  return (
    <div className={styles.navbar_wrapper}>
      <div className={styles.navbar}>
        <div className={styles.navbar_banner}>
          <Link href="/">
            <a>
              <img src="/logos/hav.svg" />
            </a>
          </Link>
        </div>
        <div className={styles.navbar_hamburger}>
          <MenuButton onClick={() => setNavVisibility(!navVisible)} />
        </div>
      </div>
      <nav className={`${styles.nav} ${navVisible ? "" : styles.nav_hidden}`}>
        {collection_slug ? (
          <CollectionNav slug={collection_slug} />
        ) : (
          <GlobalNav />
        )}
        <div className="nav-bottom">
          <ul>
            <li>
              <img src="/logos/cirdis.svg" />
            </li>

            <li>
              <img src="/logos/univie.svg" />
            </li>
            <li>
              <a href="https://dsba.univie.ac.at/fileadmin/user_upload/p_dsba/datenschutzerklaerung_websites_V04_26062020_EN.pdf">
                Privacy Policy
              </a>
              <Link href="/imprint/">
                <a>Imprint</a>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
