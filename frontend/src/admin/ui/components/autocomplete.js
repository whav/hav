import React from "react";
import AsyncSelect from "react-select/async";
import fetchTags from "../../api/tags";

class MultiTagField extends ReactComponent {
  state = {
    inputValue: ""
  };

  handleInputChange = newValue => {
    const inputValue = newValue.replace(/\W/g, "");
    this.setState({ inputValue });
    return inputValue;
  };

  render() {
    return (
      <AsyncSelect
        isMulti
        cacheOptions
        defaultOptions
        loadOptions={promiseOptions}
      />
    );
  }
}

export { MultiTagField };
