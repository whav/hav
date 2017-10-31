import React from "react";

import Button from "../components/buttons";

import PropTypes from "prop-types";

import classnames from "classnames";

const Field = props => {
  const { onChange, name, value, label, errors, ...input_props } = props;
  return (
    <div className="field">
      {label ? <label className="label">{label}</label> : null}
      <div className="control">{props.children}</div>
    </div>
  );
};

class CreatorSelect extends React.Component {
  render() {
    const { creators } = this.props;
    const options = creators.map(c => ({
      key: `creator-${c.id}`,
      text: c.name,
      value: c.id
    }));

    return (
      <div className="field">
        <label className="label">Creators</label>
        <div className="control">
          <div className={classnames("select", "is-multiple")}>
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
      </div>
    );
  }
}

class LicenseSelect extends React.Component {
  render() {
    const { licenses } = this.props;
    const options = licenses.map(l => ({
      value: l.id,
      text: l.name,
      key: l.id
    }));
    return (
      <div className="field">
        <label className="label">License</label>
        <div className="control">
          <div className="select">
            <select
              name="license"
              value={this.props.value}
              onChange={this.props.onChange}
            >
              {options.map(o => (
                <option key={o.value} value={o.value}>
                  {o.text}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }
}

const DateForm = ({ data, ...props }) => {
  return (
    <div>
      <label className="label">Date</label>

      <div className="field is-grouped">
        <p className="control">
          <input
            className="input"
            required
            value={data.year || ""}
            type="number"
            name="year"
            placeholder="Year"
            onChange={props.onChange}
          />
        </p>
        <p className="control">
          <input
            placeholder="M"
            className="input"
            name="month"
            type="number"
            value={data.month || ""}
            min={1}
            max={12}
            onChange={props.onChange}
          />
        </p>
        <p className="control">
          <input
            className="input"
            placeholder="D"
            name="day"
            type="number"
            min={1}
            max={31}
            value={data.day || ""}
            onChange={props.onChange}
          />
        </p>
      </div>
    </div>
  );
};

class IngestForm extends React.Component {
  static propType = {
    licenses: PropTypes.array.isRequired,
    creators: PropTypes.array.isRequired,
    roles: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired
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
      hide_fields = []
    } = this.props;
    return (
      <div className="columns">
        <div className="column">
          <DateForm data={data} onChange={this.handleChange} />
          {hide_fields.includes("description") ? null : (
            <Field label="Description">
              <textarea
                className="textarea"
                value={data.description || ""}
                name="description"
                rows="3"
                onChange={this.handleChange}
              />
            </Field>
          )}
          <LicenseSelect
            required
            licenses={licenses}
            value={data.license}
            name="license"
            onChange={this.handleChange}
          />
        </div>
        <div className="column">
          <CreatorSelect
            required
            multiple
            creators={creators}
            value={data.creators || []}
            name="creators"
            onChange={this.handleChange}
          />
        </div>
        <div className="column">{this.props.children}</div>
      </div>
    );
  }
}

class BatchIngest extends React.Component {
  state = {
    template_data: {
      year: "",
      month: "",
      // day: "",
      creators: [],
      license: ""
    }
  };

  hide_template_fields = ["description"];

  updateTemplateData = (_, data) => {
    this.setState(state => ({
      template_data: { ...state.template_data, ...data }
    }));
  };

  applyToAll = () => {
    const data = { ...this.state.template_data };
    this.hide_template_fields.forEach(fn => delete data[fn]);

    this.props.ingestionFiles.forEach(ingestionFile =>
      this.props.onChange(ingestionFile.ingestion_id, data)
    );
  };

  render() {
    return (
      <div>
        <h1 className="title">Ingest</h1>
        <hr />
        <h2 className="subtitle">Template From</h2>
        <div className="ingest-template-form is-outlined">
          <IngestForm
            ingest_id={"Template Form"}
            {...this.props}
            data={this.state.template_data}
            onChange={this.updateTemplateData}
            hide_fields={this.hide_template_fields}
          >
            <Button onClick={this.applyToAll} className="is-primary">
              Apply to all
            </Button>
          </IngestForm>
        </div>
        <hr />

        {this.props.ingestionFiles.map((ingestionFile, index) => {
          let key = ingestionFile.ingestion_id;
          let filename = key.split("/").reverse()[0];

          return (
            <div key={key}>
              <IngestForm
                data={ingestionFile.data}
                errors={ingestionFile.errors}
                {...this.props}
                onChange={this.props.onChange}
                ingest_id={key}
              >
                <em>{filename}</em>
              </IngestForm>

              <hr />
            </div>
          );
        })}
      </div>
    );
  }
}

export default BatchIngest;
