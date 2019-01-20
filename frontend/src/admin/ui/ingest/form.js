import React from "react";

import PropTypes from "prop-types";

import classnames from "classnames";

import Select from "react-select";
import "react-select/dist/react-select.css";

import "./ingest.css";

import TagInputField from "../components/taginput";

import { TransitionGroup, CSSTransition } from "react-transition-group"; // ES6

const Field = props => {
  const { label = "", errors = [], expanded = false } = props;
  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className={classnames("control", { "is-expanded": expanded })}>
        {props.children}
      </div>
      {errors
        ? errors.map((e, i) => (
            <p key={i} className="help is-danger">
              {e}
            </p>
          ))
        : null}
    </div>
  );
};

const FieldErrors = ({ errors }) =>
  errors
    ? errors.map((e, i) => (
        <p key={i} className="help is-danger">
          {e}
        </p>
      ))
    : null;

const GlobalErrors = ({ errors = [] }) => {
  return errors.length ? (
    <div className="notification is-danger is-size-7">
      <ul>
        {errors.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  ) : null;
};

class CreatorSelect extends React.Component {
  onChange = e => {
    let dummyEvent = {
      target: {
        name: "creators",
        multiple: true,
        selectedOptions: e
      }
    };

    this.props.onChange(dummyEvent);
  };

  render() {
    const { creators, errors, value, name } = this.props;
    const options = creators.map(c => ({
      label: c.name,
      value: c.id
    }));
    const selectedOptions = options.filter(o => value.indexOf(o.value) > -1);
    return (
      <Field label="Creators" errors={errors}>
        <Select
          name={name || "creators"}
          className={classnames({ "is-danger": errors })}
          value={selectedOptions}
          onChange={this.onChange}
          options={options}
          multi={true}
        />
      </Field>
    );
  }
}

class MediaTypeSelect extends React.Component {
  render() {
    const { types, errors, name = "media_type" } = this.props;
    return (
      <Field label="Media type" expanded errors={errors}>
        <div
          className={classnames("select", "is-fullwidth", {
            "is-danger": errors
          })}
        >
          <select
            name={name}
            value={this.props.value || ""}
            onChange={this.props.onChange}
            placeholder="Select..."
          >
            <option value="" />
            {types.map(t => (
              <option key={t[0]} value={t[0]}>
                {t[1]}
              </option>
            ))}
          </select>
        </div>
      </Field>
    );
  }
}

class LicenseSelect extends React.Component {
  render() {
    const { licenses, errors, name, onChange, value = "" } = this.props;
    const options = licenses.map(l => ({
      value: l.id,
      text: l.name,
      key: l.id
    }));
    return (
      <Field label="License" expanded errors={errors}>
        <div
          className={classnames("select", "is-fullwidth", {
            "is-danger": errors
          })}
        >
          <select
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder="Select..."
          >
            <option value="" />
            {options.map(o => (
              <option key={o.value} value={o.value}>
                {o.text}
              </option>
            ))}
          </select>
        </div>
      </Field>
    );
  }
}

const DateForm = ({ data, errors, children, ...props }) => {
  return (
    <Field label="Date" errors={errors}>
      <input
        type="text"
        name="date"
        className={classnames("input", { "is-danger": errors })}
        placeholder="YYYY-MM-DD"
        value={data.date || ""}
        autoComplete="off"
        onChange={props.onChange}
      />
      {children || null}
    </Field>
  );
};

const formPropTypes = {
  licenses: PropTypes.array.isRequired,
  creators: PropTypes.array.isRequired,
  roles: PropTypes.array.isRequired,
  media_types: PropTypes.array.isRequired
};

class TemplateForm extends React.Component {
  static propTypes = {
    ...formPropTypes,
    onChange: PropTypes.func.isRequired,
    apply: PropTypes.func.isRequired
  };

  handleChange = event => {
    let value = event.target.value;
    const name = event.target.name;
    if (event.target.multiple) {
      value = Array.from(event.target.selectedOptions).map(opt => opt.value);
    }
    this.props.onChange({ [name]: value });
  };

  render() {
    const {
      licenses = [],
      creators = [],
      data = {},
      media_types = []
    } = this.props;
    return (
      <form
        noValidate
        onSubmit={e => {
          e.preventDefault();
          this.props.apply();
        }}
        className="box ingest-template-form"
      >
        {/* <em>Template Form</em> */}
        <div className="columns">
          <div className="column">
            <DateForm data={data} onChange={this.handleChange} />
          </div>

          <div className="column">
            <CreatorSelect
              multiple
              creators={creators}
              value={data.creators || []}
              name="creators"
              onChange={this.handleChange}
            />
          </div>

          <div className="column">
            <LicenseSelect
              licenses={licenses}
              value={data.media_license}
              name="media_license"
              onChange={this.handleChange}
            />
          </div>

          <div className="column">
            <MediaTypeSelect
              types={media_types}
              value={data.media_type}
              name="media_type"
              onChange={this.handleChange}
            />
          </div>
        </div>
        <div>
          <div className="field is-grouped is-grouped-right">
            <p className="control">
              <button className="button is-link pull-right" type="submit">
                Apply
              </button>
            </p>
          </div>
        </div>
      </form>
    );
  }
}

class IngestForm extends React.Component {
  static propTypes = {
    ...formPropTypes,
    source: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired
  };

  state = {
    submitting: false
  };

  _is_mounted = true;

  componentWillUnmount() {
    this._is_mounted = false;
  }

  handleChange = event => {
    let value = event.target.value;
    const name = event.target.name;
    if (event.target.multiple) {
      value = Array.from(event.target.selectedOptions).map(opt => opt.value);
    }
    this.props.onChange(this.props.source, {
      [name]: value
    });
  };

  handleDateChange = value => {
    this.props.onChange(this.props.source, {
      date: value
    });
  };

  onSubmit = e => {
    e.preventDefault();
    this.setState({ submitting: true });
    let response = this.props.onSubmit();
    response.finally(
      () => this._is_mounted && this.setState({ submitting: false })
    );
  };

  render() {
    const {
      licenses = [],
      creators = [],
      media_types = [],
      data = {},
      errors = {}
    } = this.props;
    let globalErrors = { ...errors };
    [
      "date",
      "creators",
      "media_license",
      "media_type",
      "media_description",
      "media_identifier",
      "media_title"
    ].forEach(k => delete globalErrors[k]);
    const error_msgs = Object.entries(globalErrors).reduce(
      (collected_errors, [key, error_msgs]) => {
        return [...collected_errors, ...error_msgs];
      },
      []
    );

    return (
      <div className="box is-outlined">
        <form className="ingest-form" onSubmit={this.onSubmit}>
          <div className="columns is-desktop">
            <div className="column is-one-third is-clipped">
              {this.props.children}
            </div>

            <div className="column is-two-thirds">
              <GlobalErrors errors={error_msgs} />

              <Field label="Title" errors={errors.media_title}>
                <input
                  type="text"
                  className={classnames("input", {
                    "is-danger": errors.media_title
                  })}
                  value={data.media_title || ""}
                  name="media_title"
                  onChange={this.handleChange}
                />
              </Field>
              <Field label="Tags">
                <TagInputField
                  tags={data.media_tags || []}
                  onTagsChange={media_tags => {
                    this.props.onChange(this.props.source, {
                      media_tags
                    });
                  }}
                />
              </Field>

              <div className="columns">
                <div className="column">
                  <Field label="Description">
                    <textarea
                      className={classnames("textarea", {
                        "is-danger": errors.media_description
                      })}
                      value={data.media_description}
                      name="media_description"
                      onChange={this.handleChange}
                    />
                  </Field>
                </div>
                <div className="column">
                  <Field label="Identifier">
                    <input
                      type="text"
                      className={classnames("input", {
                        "is-danger": errors.media_identifier
                      })}
                      value={data.media_identifier}
                      name="media_identifier"
                      onChange={this.handleChange}
                    />
                  </Field>
                </div>
              </div>

              <div className="columns">
                <div className="column">
                  <DateForm
                    data={data}
                    onChange={e => this.handleDateChange(e.target.value)}
                    errors={errors.date}
                  >
                    {/* {data.start && data.end ? (
                      <p className="help">
                        {data.start.toISO()} - {data.end.toISO()}
                      </p>
                    ) : null} */}
                  </DateForm>
                </div>
                <div className="column">
                  <CreatorSelect
                    required
                    multiple
                    creators={creators}
                    value={data.creators || []}
                    name="creators"
                    onChange={this.handleChange}
                    errors={errors.creators}
                  />
                </div>
              </div>

              <div className="columns">
                <div className="column">
                  <LicenseSelect
                    required
                    licenses={licenses}
                    value={data.media_license}
                    name="media_license"
                    onChange={this.handleChange}
                    errors={errors.media_license}
                  />
                </div>
                <div className="column">
                  <MediaTypeSelect
                    required
                    types={media_types}
                    value={data.media_type}
                    name="media_type"
                    onChange={this.handleChange}
                    errors={errors.media_type}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="columns is-desktop">
            <div className="column">
              <div className="control">
                <button
                  className="button is-danger"
                  type="button"
                  onClick={this.props.onDelete}
                >
                  <i className="delete" />
                  Remove
                </button>
              </div>
            </div>
            <div className="column is-half has-text-right">
              <button
                className={classnames("button is-primary is-active", {
                  "is-loading": this.state.submitting
                })}
                type="submit"
              >
                Ingest
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

const FormSet = ({ children }) => {
  return (
    <TransitionGroup>
      {children.map((c, i) => (
        <CSSTransition
          classNames="ingest-form"
          timeout={{ enter: 500, exit: 300 }}
          key={i}
        >
          {c}
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
};

export default IngestForm;
export { TemplateForm, FormSet };
