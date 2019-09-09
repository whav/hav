import React from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
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
  locations: GoGlobe,
  languages: MdLanguage
};

const icon_for_type = type => {
  const icon = mapping[type];
  return icon || IoIosPricetags;
};

const prepareOption = o => ({ value: o.id, label: o.name, ...o });

const fetchFancyTags = async (
  query,
  collection = null,
  limit_types = [],
  grouped = false
) => {
  const opts = await fetchTags(query, collection);
  // do the basic mapping so that we have value and label
  const options = opts.map(prepareOption);

  let fancyOptions;

  if (grouped) {
    const groupedOptions = groupBy(options, o => o.type);
    fancyOptions = Object.entries(groupedOptions).map(([type, options]) => {
      const Icon = icon_for_type(type);
      return {
        label: (
          <span>
            <Icon />
            {type}
          </span>
        ),
        options
      };
    });
  } else {
    fancyOptions = options.map(o => {
      const Icon = icon_for_type(o.type);
      return {
        ...o,
        label: (
          <span>
            <Icon />
            {o.name}
          </span>
        )
      };
    });
  }
  return fancyOptions;
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
    const option = prepareOption(result);
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
        loadOptions={this.handleSearch}
        isLoading={this.state.isLoading}
        onChange={this.handleChange}
        onCreateOption={this.handleCreate}
        value={this.state.values}
      />
    );
  }
}

export { MultiTagField };
