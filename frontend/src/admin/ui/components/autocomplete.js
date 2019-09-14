import React from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import { components } from "react-select";
import groupBy from "lodash/groupBy";
import reactModal from "@prezly/react-promise-modal";
import { fetchTags, createTag } from "../../api/tags";
import { GoGlobe } from "react-icons/go";
import { MdLanguage } from "react-icons/md";
import { IoIosPricetags } from "react-icons/io";
import Modal from "../modal";
import { Formik } from "formik";
import { FieldWrapper, ErrorMessage } from "../../ui/forms";

const mapping = {
  countries: GoGlobe,
  languages: MdLanguage
};

const icon_for_type = type => {
  const icon = mapping[type];
  return icon || IoIosPricetags;
};

const fetchFancyTags = async (
  query,
  collection = null,
  limit_types = [],
  grouped = false
) => {
  const options = await fetchTags(query, collection);
  if (grouped) {
    const groupedOptions = groupBy(options, o => o.type);
    options = Object.entries(groupedOptions).map(([type, options]) => {
      return {
        label: type,
        options
      };
    });
  }
  return options;
};

class TagModal extends React.Component {
  handleSubmit = async (values, actions) => {
    try {
      const data = await createTag(values.name, this.props.collection);
      this.props.onSubmit(data);
    } catch (errors) {
      actions.setErrors(errors);
    }
  };

  render() {
    const { show, onDismiss, name = "" } = this.props;

    return (
      <Modal open={show} onCancel={onDismiss}>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Create new Tag</p>
            <button
              className="delete"
              aria-label="close"
              onClick={onDismiss}
            ></button>
          </header>
          <Formik
            initialValues={{ name }}
            onSubmit={this.handleSubmit}
            render={props => (
              <>
                <section className="modal-card-body">
                  <form onSubmit={props.handleSubmit}>
                    <FieldWrapper label="Tag name">
                      <input
                        className="input"
                        type="text"
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.name}
                        name="name"
                      ></input>
                      <ErrorMessage name="name" />
                    </FieldWrapper>
                  </form>
                </section>
                <footer className="modal-card-foot">
                  <button
                    className="button is-success"
                    onClick={props.handleSubmit}
                  >
                    Save changes
                  </button>
                  <button className="button" onClick={onDismiss}>
                    Cancel
                  </button>
                </footer>
              </>
            )}
          ></Formik>
        </div>
      </Modal>
    );
  }
}

const TagLabel = ({ type, name }) => {
  const Icon = icon_for_type(type);
  return (
    <span key={name}>
      <Icon />
      &nbsp;
      {name}
    </span>
  );
};

const MultiValueLabel = ({ data }) => <TagLabel {...data} />;
const Option = props => {
  const { data, children } = props;
  return (
    <components.Option {...props}>
      {data.__isNew__ ? children : <TagLabel {...props.data} />}
    </components.Option>
  );
};

const customSelectComponents = {
  MultiValueLabel,
  Option
};

class MultiTagField extends React.Component {
  state = {
    inputValue: "",
    values: []
  };

  handleSearch = async q => {
    const options = await fetchFancyTags(q, this.props.collection_id);
    return options;
  };

  handleCreate = async new_option => {
    const result = await reactModal(props => (
      <TagModal
        {...props}
        name={new_option}
        collection={this.props.collection_id}
      ></TagModal>
    ));
    this.setState(state => {
      const values = [...state.values, option];
      this.props.onChange && this.props.onChange(values);
      return {
        inputValue: "",
        values
      };
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
        getOptionValue={o => o.id}
        loadOptions={this.handleSearch}
        isLoading={this.state.isLoading}
        onChange={this.handleChange}
        onCreateOption={this.handleCreate}
        value={this.props.value}
        components={customSelectComponents}
      />
    );
  }
}

export { MultiTagField };
