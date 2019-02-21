import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import classnames from "classnames";
import Select from "react-select";
import { Persist } from "formik-persist";

const BField = ({ label = "", children }) => {
  return (
    <div className="field">
      {label ? <label className="label">{label}</label> : null}
      <div className={classnames("control")}>{children}</div>
    </div>
  );
};

const SelectField = ({ options = [], multiple = false, field, form }) => {
  const selectOptions = options.map(o => {
    if (Array.isArray(o)) {
      return { value: o[0], label: o[1] };
    } else {
      return { value: o.id, label: o.name };
    }
  });

  return (
    <Select
      options={selectOptions}
      isMulti={multiple}
      name={field.name}
      value={field.value}
      onChange={option => {
        form.setFieldValue(field.name, option);
      }}
      onBlur={field.onBlur}
    />
  );
};

class TemplateForm extends React.Component {
  initialValues = {
    creators: [],
    license: "",
    media_type: "",
    date: ""
  };

  render() {
    const {
      creators = [],
      licenses = [],
      media_types = [],
      persistName = "template-form",
      apply
    } = this.props;
    return (
      <Formik
        initialValues={this.initialValues}
        onSubmit={(values, actions) => {
          apply(values);
        }}
        render={() => (
          <Form className="box ingest-template-form">
            <Persist name={persistName} />
            <div className="columns">
              <div className="column">
                <BField label="Date">
                  <Field
                    className="input"
                    name="date"
                    placeholder="YYYY-MM-DD"
                    autoComplete="off"
                  />
                  <ErrorMessage name="date" component="div" />
                </BField>
              </div>

              <div className="column">
                <BField label="Creators">
                  <Field
                    component={SelectField}
                    name="creators"
                    multiple={true}
                    options={creators}
                  />
                  <ErrorMessage name="creators" component="div" />
                </BField>
              </div>

              <div className="column">
                <BField label="License">
                  <Field
                    component={SelectField}
                    name="license"
                    options={licenses}
                  />
                  <ErrorMessage name="creators" component="div" />
                </BField>
              </div>

              <div className="column">
                <BField label="Media Type">
                  <Field
                    component={SelectField}
                    name="media_type"
                    options={media_types}
                  />
                  <ErrorMessage name="creators" component="div" />
                </BField>
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
          </Form>
        )}
      />
    );
  }
}

const IngestForm = ({
  creators = [],
  licenses = [],
  media_types = [],
  initialValues = {},
  persistName = ""
}) => {
  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      render={({ errors, status, touched, isSubmitting }) => {
        return (
          <Form className="ingest-form">
            <Persist name={persistName} />
            <BField label="Title">
              <Field className="input" name="title" />
              <ErrorMessage name="email" component="div" />
            </BField>
            <BField label="Tags">
              <Field className="input" name="tags" />
              <ErrorMessage name="tags" component="div" />
            </BField>
            <div className="columns">
              <div className="column">
                <BField label="Description">
                  <Field
                    component="textarea"
                    className="textarea"
                    name="media_description"
                  />
                  <ErrorMessage name="description" component="div" />
                </BField>
              </div>
              <div className="column">
                <BField label="Identifier">
                  <Field className="input" name="media_identifier" />
                  <ErrorMessage name="description" component="div" />
                </BField>
              </div>
            </div>
            <div className="columns">
              <div className="column">
                <BField label="Date">
                  <Field
                    className="input"
                    name="date"
                    placeholder="YYYY-MM-DD"
                    autoComplete="off"
                  />
                  <ErrorMessage name="date" component="div" />
                </BField>
              </div>
              <div className="column">
                <BField label="Creators">
                  <Field
                    component={SelectField}
                    name="creators"
                    multiple={true}
                    options={creators}
                  />
                  <ErrorMessage name="creators" component="div" />
                </BField>
              </div>
            </div>
            <div className="columns">
              <div className="column">
                <BField label="License">
                  <Field
                    component={SelectField}
                    name="license"
                    options={licenses}
                  />
                  <ErrorMessage name="license" component="div" />
                </BField>
              </div>
              <div className="column">
                <BField label="Original Media Type">
                  <Field
                    component={SelectField}
                    name="media_type"
                    options={media_types}
                  />
                  <ErrorMessage name="media_type" component="div" />
                </BField>
              </div>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default ({ children, ...props }) => (
  <div className="box is-outlined">
    <div className="columns is-desktop">
      <div className="column is-one-third is-clipped ingest-form-preview">
        {children}
      </div>
      <div className="column is-two-thirds">
        <IngestForm {...props} />
      </div>
    </div>
  </div>
);

export { TemplateForm };
