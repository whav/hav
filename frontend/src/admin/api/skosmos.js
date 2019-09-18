const SKOSMOS_URL =
  "https://skosmos-hav.aussereurop.univie.ac.at/rest/v1/search";

const fetchSkosmosTags = async (query, lang = "en") => {
  let params = {
    query: `${query}*`,
    lang,
    labellang: lang,
    maxhits: 20,
    unique: true
  };

  const response = await fetch(
    `${SKOSMOS_URL}?${new URLSearchParams(params)}`,
    {
      method: "GET",
      credentials: "same-origin",
      headers: new Headers({
        Accept: "application/json"
      })
    }
  );

  const data = await response.json();
  if (response.ok) {
    const results = data.results || [];
    console.log(JSON.stringify(results, null, 2));
    return results.map(r => {
      return {
        value: r.uri,
        label: r.prefLabel,
        type: r.vocab
      };
    });
  } else {
    return Promise.reject(data);
  }
};

export default fetchSkosmosTags;
