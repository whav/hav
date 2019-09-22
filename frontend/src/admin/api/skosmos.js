const SKOSMOS_URL =
  "https://skosmos-hav.aussereurop.univie.ac.at/rest/v1/search";

const gatherCrumbs = result => {
  const all = [...result.inScheme, ...result.broader];
  return all.map(x => x.prefLabel);
};

const fetchSkosmosTags = async (query, lang = "en") => {
  let params = {
    query: `${query}*`,
    lang,
    labellang: lang,
    maxhits: 20,
    unique: true,
    fields: "broader inScheme"
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
    return results.map(r => {
      return {
        value: r.uri,
        label: r.prefLabel,
        type: r.vocab,
        crumbs: gatherCrumbs(r)
      };
    });
  } else {
    return Promise.reject(data);
  }
};

export default fetchSkosmosTags;
