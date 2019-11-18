import React from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import AsyncSelect from "react-select/async";
import { components } from "react-select";
import groupBy from "lodash/groupBy";
import reactModal from "@prezly/react-promise-modal";
// import reactModal from "../../../utils/promiseModal";
import { fetchTags, createTag } from "../api/tags";

import { GoGlobe, GoGitBranch } from "react-icons/go";
import { MdLanguage } from "react-icons/md";
import { IoIosPricetags } from "react-icons/io";
import Modal from "../ui/modal";
import { Formik, Form } from "formik";
import { FieldWrapper, ErrorMessage } from "../ui/forms";
import uuid from "uuid/v4";
// this shamefully does not work since react-promise-modal does not use portals
// it renders into it's own container which it appends to the document body
// import { useDispatch } from "react-redux";
// import { add_notification } from "../../ducks/notifications";

const mapping = {
  countries: GoGlobe,
  languages: MdLanguage,
  unesco: GoGitBranch,
  skosmos: GoGitBranch
};

const icon_for_type = type => {
  if (!type) {
    return IoIosPricetags;
  }
  const icon = mapping[type] || mapping[type.toLowerCase()] || IoIosPricetags;
  return icon;
};

const fetchFancyTags = async (
  query,
  collection = null,
  limit_types = [],
  grouped = false
) => {
  let options = await fetchTags(query, collection);
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
  const { show, onDismiss, name = "", source = {} } = props;
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

const TagLabel = ({ source, name, label }) => {
  name = name || label;
  const Icon = icon_for_type(source);
  return (
    <span key={name}>
      <Icon />
      &nbsp;
      {name}
    </span>
  );
};

const MultiValueLabel = ({ data }) => {
  // console.log("rendering MVL", data);
  console.log(data);
  return <TagLabel {...data} />;
};
const Option = props => {
  const { data, children } = props;
  const { crumbs = [] } = data;
  console.log("Option", props);
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
    let options = await fetchFancyTags(q, this.props.collection_id);
    this.setState({ isLoading: false });
    // for some reason or the other react-select needs label and value
    // and a clever combination of props for AsyncCreatable
    // to actually work the way I want it to
    const prepOptions = o => {
      const uid = uuid();
      o = o.label ? o : { ...o, label: uid };
      o = o.value ? o : { ...o, value: o.id ? o.id : uid };
      return o;
    };
    options = options.map(prepOptions);
    // console.warn(`Query for "${q}" returned ${options.length} options.`);
    // console.table(options);
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
    console.log("Setting values", values);
    this.setState({ values });
    this.props.onChange && this.props.onChange(values);
  };

  render() {
    return (
      <AsyncCreatableSelect
        isMulti={true}
        cacheOptions={false}
        defaultOptions={false}
        // submit the full object and let the server figure out what to do
        // getOptionValue={o => o.id}
        loadOptions={this.handleSearch}
        isLoading={this.state.isLoading}
        onChange={this.handleChange}
        onCreateOption={this.handleCreate}
        value={this.props.value}
        components={customSelectComponents}
        noOptionsMessage={({ inputValue }) => `No options.`}
        // these props break all kinds of stuff
        // hideSelectedOptions={false}
        // filterOption={this.filterOption}
      />
    );
  }
}

export { MultiTagField };
