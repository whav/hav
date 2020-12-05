import React, { useState } from "react";
import styles from "./NavBar.module.css";
import { MenuButton } from "theme-ui";
import { Username } from "./user";
import ActiveLink from "./Link";
import { useCollection, useAPI } from "hooks";

const Link = (props) => {
  return <ActiveLink activeClassName={styles.active_link} {...props} />;
};

const CollectionNav = ({ collection: { slug, shortName, rootNode } }) => {
  return (
    <ul>
      <li>
        <Link href="/">
          <a>← All Collections</a>
        </Link>
      </li>
      <li>
        <Link href={`/collections/${slug}/`}>
          <a>{shortName}</a>
        </Link>
      </li>
      <li>
        <Link
          href={`/collections/${slug}/browse/`}
          additionalPaths={[`/collections/${slug}/media/`]}
          exact={false}
        >
          <a>Browse</a>
        </Link>
      </li>
      <li>
        <Link href={`/collections/${slug}/search/`}>
          <a>Search</a>
        </Link>
      </li>
    </ul>
  );
};

const GlobalNav = ({ collections = [] }) => {
  return (
    <ul>
      <li>
        <Link href="/">
          <a>Home</a>
        </Link>
        <ul>
          <li>
            <Link href="/cooperation/">
              <a>How to cooperate</a>
            </Link>
          </li>

          <li>
            <Link href="/open-knowledge/">
              <a>License Models</a>
            </Link>
          </li>
        </ul>
      </li>

      <li>
        Collections
        <ul>
          {collections.map((c) => (
            <li key={c.slug}>
              <Link href={`/collections/${c.slug}/`}>
                <a>{c.shortName}</a>
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
  const collection_slug = useCollection();
  const { data = [] } = useAPI("/api/collections/");
  const collection = data.find((c) => c.slug === collection_slug);

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
        {collection ? (
          <CollectionNav collection={collection} />
        ) : (
          <GlobalNav collections={data} />
        )}
        <div className={styles.nav_bottom}>
          <ul>
            <li>
              <Username />
            </li>
            <li>
              <img src="/logos/cirdis.svg" />
            </li>

            <li>
              <img src="/logos/univie.svg" />
            </li>
            <li>
              <a href="https://dsba.univie.ac.at/fileadmin/user_upload/p_dsba/datenschutzerklaerung_websites_V04_26062020_EN.pdf">
                Privacy Policy
              </a>{" "}
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
