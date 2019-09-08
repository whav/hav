import React from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import groupBy from "lodash/groupBy";
import { fetchTags, createTag } from "../../api/tags";

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

const prepareOption = o => ({ value: o.id, label: o.name, ...o });

const fetchFancyTags = async (query, limit_types = [], grouped = false) => {
  const opts = await fetchTags(query);
  // do the basic mapping so that we have value and label
  const options = opts.map(prepareOption);
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
    inputValue: "",
    values: []
  };

  handleCreate = new_option => {
    createTag(new_option).then(data => {
      const option = prepareOption(data);
      this.setState(state => {
        const values = [...state.values, option];
        this.props.onChange && this.props.onChange(values);
        return {
          inputValue: "",
          values
        };
      });
    });
  };

  handleChange = values => {
    // values might be null, but we need an array
    values = values || [];
    this.setState({ values });
    this.props.onChange && this.props.onChange(values);
  };

  render() {
    return (
      <AsyncCreatableSelect
        isMulti={true}
        cacheOptions={false}
        defaultOptions={false}
        loadOptions={q => fetchFancyTags(q, [], true)}
        isLoading={this.state.isLoading}
        onChange={this.handleChange}
        onCreateOption={this.handleCreate}
        value={this.state.values}
      />
    );
  }
}

export { MultiTagField };
