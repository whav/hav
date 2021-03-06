import React from 'react';
import Layout from '../components/layout';
import { Button } from 'hav-ui';

const SearchInput = ({ collection }) => {
  return (
    <>
      <input
        type="search"
        placeholder={`Search ${collection.shortName} collection`}
      />
      <Button>Search</Button>
    </>
  );
};

class SearchPage extends React.Component {
  render() {
    const { collection } = this.props.pageContext;
    console.log(collection);
    return (
      <Layout active_collection={collection.slug}>
        <SearchInput collection={collection} />
      </Layout>
    );
  }
}

export default SearchPage;
