import React from "react";
import CreatableSelect from "react-select/creatable";

const components = {
  DropdownIndicator: null
};

const stringToOpt = value => ({ value, label: value });
const optToString = objOrString => {
  if (typeof objOrString === "string") {
    return objOrString;
  }
  return objOrString.value;
};

export default class TagInput extends React.Component {
  state = {
    inputValue: ""
  };

  handleChange = selected => {
    // always map to a list of strings
    this.props.onChange(selected.map(optToString));
  };

  handleInputChange = inputValue => {
    this.setState({ inputValue });
  };

  handleKeyDown = event => {
    const { inputValue } = this.state;
    if (!inputValue) return;
    switch (event.key) {
      case "Enter":
      case "Tab":
        this.setState({
          inputValue: ""
        });
        if (this.props.value.indexOf(inputValue) === -1) {
          this.handleChange([...this.props.value, inputValue]);
        }
        event.preventDefault();
    }
  };

  render() {
    const { inputValue } = this.state;
    const { value, placeholder = "" } = this.props;
    // map values to the expected format for react-select
    const internalValue = value.map(stringToOpt);
    return (
      <CreatableSelect
        components={components}
        inputValue={inputValue}
        isClearable
        isMulti
        menuIsOpen={false}
        onChange={this.handleChange}
        onInputChange={this.handleInputChange}
        onKeyDown={this.handleKeyDown}
        placeholder={placeholder}
        value={internalValue}
      />
    );
  }
}
