import React from "react";
import AsyncSelect from "react-select/async";
import groupBy from "lodash/groupBy";
import fetchTags from "../../api/tags";

import { GoGlobe } from "react-icons/go";
import { MdLanguage } from "react-icons/md";

const mapping = {
  locations: GoGlobe,
  languages: MdLanguage
};

const icon_for_type = type => {
  const icon = mapping[type];
  return icon || null;
};

const fetchFancyTags = async (query, limit_types = [], grouped = false) => {
  const opts = await fetchTags(query);
  // do the basic mapping so that we have value and label
  const options = opts.map(o => ({ value: o.id, label: o.name, ...o }));
  let fancyOptions;
  if (grouped) {
    const groupedOptions = groupBy(options, o => o.type);
    fancyOptions = Object.entries(groupedOptions).map(([type, options]) => {
      const Icon = icon_for_type(type);
      return {
        label: (
          <>
            <Icon />
            {type}
          </>
        ),
        options
      };
    });
  } else {
    fancyOptions = options.map(o => {
      const Icon = icon_for_type(o.type);
      return {
        value: o.id,
        label: (
          <span>
            {o.name}
            <Icon />
          </span>
        ),
        ...o
      };
    });
  }
  return fancyOptions;
};

class MultiTagField extends React.Component {
  state = {
    inputValue: ""
  };

  render() {
    return (
      <AsyncSelect
        isMulti={true}
        cacheOptions={false}
        defaultOptions={false}
        loadOptions={q => fetchFancyTags(q, [], true)}
        {...this.props}
      />
    );
  }
}

export { MultiTagField };
