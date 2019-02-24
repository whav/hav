import React from "react";
import CreatableSelect from "react-select/lib/Creatable";

const components = {
  DropdownIndicator: null
};

const createOption = label => ({
  label,
  value: label
});

export default class CreatableInputOnly extends React.Component {
  state = {
    inputValue: "",
    value: []
  };

  handleValueChange = value => {
    this.props.onChange(value);
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
          this.handleValueChange([...this.props.value, inputValue]);
        }
        event.preventDefault();
    }
  };
  render() {
    const { inputValue } = this.state;
    const { value, onChange, placeholder = "" } = this.props;
    const internalValue = value.map(createOption);
    return (
      <CreatableSelect
        components={components}
        inputValue={inputValue}
        isClearable
        isMulti
        menuIsOpen={false}
        onChange={onChange}
        onInputChange={this.handleInputChange}
        onKeyDown={this.handleKeyDown}
        placeholder={placeholder}
        value={internalValue}
      />
    );
  }
}
