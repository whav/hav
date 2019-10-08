import React from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import AsyncSelect from "react-select/async";
import { components } from "react-select";
import groupBy from "lodash/groupBy";
import reactModal from "@prezly/react-promise-modal";
// import reactModal from "../../../utils/promiseModal";
import { fetchTags, createTag } from "../api/tags";
import fetchSkosmosTags from "../api/skosmos";

import { GoGlobe, GoGitBranch } from "react-icons/go";
import { MdLanguage } from "react-icons/md";
import { IoIosPricetags } from "react-icons/io";
import Modal from "../ui/modal";
import { Formik, Form } from "formik";
import { FieldWrapper, ErrorMessage } from "../ui/forms";

// this shamefully does not work since react-promise-modal does not use portals
// it renders into it's own container which it appends to the document body
// import { useDispatch } from "react-redux";
// import { add_notification } from "../../ducks/notifications";

const mapping = {
  countries: GoGlobe,
  languages: MdLanguage,
  unesco: GoGitBranch
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

const TagModal = props => {
  const { show, onDismiss, name = "" } = props;
  // const dispatch = useDispatch();

  const handleSubmit = async (values, actions) => {
    try {
      const data = await createTag(values.name, props.collection);
      // dispatch(add_notification(`Tag "${data.name}" created`, "success"));
      props.onSubmit(data);
    } catch (errors) {
      actions.setErrors(errors);
    }
  };

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
          onSubmit={handleSubmit}
          render={formikProps => (
            <Form>
              <section className="modal-card-body">
                <FieldWrapper label="Tag name">
                  <input
                    className="input"
                    autoFocus
                    type="text"
                    onChange={formikProps.handleChange}
                    onBlur={formikProps.handleBlur}
                    value={formikProps.values.name}
                    name="name"
                  ></input>
                  <ErrorMessage name="name" />
                </FieldWrapper>
              </section>
              <footer className="modal-card-foot">
                <button
                  className="button is-success"
                  onClick={formikProps.handleSubmit}
                >
                  Save changes
                </button>
                <button className="button" onClick={onDismiss}>
                  Cancel
                </button>
              </footer>
            </Form>
          )}
        ></Formik>
      </div>
    </Modal>
  );
};

const BreadCrumbs = ({ crumbs = [] }) => {
  if (crumbs.length === 0) {
    return null;
  }
  return (
    <nav
      className="breadcrumb has-arrow-separator is-small"
      aria-label="breadcrumbs"
    >
      <ul>
        {crumbs.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </nav>
  );
};

const TagLabel = ({ type, name, label }) => {
  name = name || label;
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
  const { crumbs = [] } = data;
  return (
    <components.Option {...props}>
      {data.__isNew__ ? children : <TagLabel {...props.data} />}

      <BreadCrumbs crumbs={crumbs} />
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
    values: [],
    isLoading: false
  };

  handleSearch = async q => {
    this.setState({ isLoading: true });
    let hav_options = [];
    let skosmos_options = [];
    console.log(`Searching for tags ${q}`);
    if (q.length >= 3) {
      hav_options = await fetchFancyTags(q, this.props.collection_id);
      skosmos_options = await fetchSkosmosTags(q);
    }
    const options = [...skosmos_options, ...hav_options];
    this.setState({ isLoading: false });
    return options;
  };

  handleCreate = async new_option => {
    const option = await reactModal(props => (
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
        noOptionsMessage={({ inputValue }) => `No options ${inputValue}`}
      />
    );
  }
}

class SkosmosTagField extends React.Component {
  state = {
    isLoading: false
  };
  handleSearch = async query => {
    this.setState({ isLoading: true });
    const data = await fetchSkosmosTags(query);
    this.setState({ isLoading: false });
    return data;
  };

  render() {
    return (
      <AsyncSelect
        isMulti={true}
        cacheOptions={false}
        defaultOptions={false}
        isLoading={this.state.isLoading}
        loadOptions={this.handleSearch}
        onChange={this.props.onChange}
        value={this.props.value}
        components={customSelectComponents}
      />
    );
  }
}

export { MultiTagField, SkosmosTagField };
