import React from "react";

import Button from "../components/buttons";
import { LargeModal as Modal } from "../components/modal";
import { ErrorList } from "../components/errors";

import PropTypes from "prop-types";

import classnames from "classnames";

const Field = props => {
  const { onChange, name, value, label, errors, ...input_props } = props;
  return (
    <div className="field">
      {label ? <label className="label">{label}</label> : null}
      <div className="control">{props.children}</div>
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

class CreatorSelect extends React.Component {
  render() {
    const { creators, errors } = this.props;
    const options = creators.map(c => ({
      key: `creator-${c.id}`,
      text: c.name,
      value: c.id
    }));

    return (
      <div className="field">
        <label className="label">Creators</label>
        <div className="control">
          <div
            className={classnames("select", "is-multiple", {
              "is-danger": errors
            })}
          >
            <select
              name="creators"
              value={this.props.value}
              onChange={this.props.onChange}
              multiple
            >
              {options.map(o => (
                <option key={o.value} value={o.value}>
                  {o.text}
                </option>
              ))}
            </select>
          </div>
        </div>
        <FieldErrors errors={errors} />
      </div>
    );
  }
}

class LicenseSelect extends React.Component {
  render() {
    const { licenses, errors } = this.props;
    const options = licenses.map(l => ({
      value: l.id,
      text: l.name,
      key: l.id
    }));
    return (
      <div className="field">
        <label className="label">License</label>
        <div className="control">
          <div className={classnames("select", { "is-danger": errors })}>
            <select
              name="license"
              value={this.props.value}
              onChange={this.props.onChange}
            >
              <option value={undefined} />
              {options.map(o => (
                <option key={o.value} value={o.value}>
                  {o.text}
                </option>
              ))}
            </select>
          </div>
        </div>
        <FieldErrors errors={errors} />
      </div>
    );
  }
}

const DateForm = ({ data, ...props }) => {
  const errors = props.errors || {};
  return (
    <div className="field">
      <label className="label">Date</label>

      <div className="field is-grouped">
        <p className="control">
          <input
            className={classnames("input", { "is-danger": errors.year })}
            required
            value={data.year || ""}
            type="number"
            name="year"
            placeholder="Year"
            onChange={props.onChange}
          />
        </p>
        <FieldErrors errors={errors.year} />
        <p className="control">
          <input
            className={classnames("input", { "is-danger": errors.month })}
            placeholder="M"
            name="month"
            type="number"
            value={data.month || ""}
            min={1}
            max={12}
            onChange={props.onChange}
          />
        </p>
        <FieldErrors errors={errors.month} />

        <p className="control">
          <input
            className={classnames("input", { "is-danger": errors.day })}
            placeholder="D"
            name="day"
            type="number"
            min={1}
            max={31}
            value={data.day || ""}
            onChange={props.onChange}
          />
        </p>
        <FieldErrors errors={errors.day} />
      </div>
    </div>
  );
};

class IngestForm extends React.Component {
  static propType = {
    licenses: PropTypes.array.isRequired,
    creators: PropTypes.array.isRequired,
    roles: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
  };

  handleChange = event => {
    let value = event.target.value;
    const name = event.target.name;
    if (event.target.multiple) {
      value = Array.from(event.target.selectedOptions).map(opt => opt.value);
    }
    this.props.onChange(this.props.ingest_id, {
      [name]: value
    });
  };

  render() {
    const {
      licenses = [],
      creators = [],
      roles = [],
      data = {},
      hide_fields = [],
      errors = {}
    } = this.props;

    return (
      <div className="columns box is-outlined is-desktop">
        <div className="column">{this.props.children}</div>
        <div className="column is-two-thirds">
          <DateForm data={data} onChange={this.handleChange} errors={errors} />
          {hide_fields.includes("description") ? null : (
            <Field label="Description">
              <textarea
                className="textarea"
                value={data.description || ""}
                name="description"
                rows="3"
                onChange={this.handleChange}
                error={errors.description}
              />
            </Field>
          )}

          <LicenseSelect
            required
            licenses={licenses}
            value={data.license}
            name="license"
            onChange={this.handleChange}
            errors={errors.license}
          />

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
    );
  }
}

export default IngestForm;
