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
  const selectedValues = new Set(
    Array.isArray(field.value) ? field.value : [field.value]
  );
  const selectedOptions = selectOptions.filter(o =>
    selectedValues.has(o.value)
  );

  return (
    <Select
      options={selectOptions}
      isMulti={multiple}
      name={field.name}
      value={selectedOptions}
      onChange={option => {
        let value = option.value;
        if (Array.isArray(option)) {
          value = option.map(o => o.value);
        }
        form.setFieldValue(field.name, value);
      }}
      onBlur={field.onBlur}
    />
  );
};

const SharedFields = ({ licenses = [], creators = [], media_types = [] }) => {
  return (
    <React.Fragment>
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
              name="media_license"
              options={licenses}
            />
            <ErrorMessage name="media_license" component="div" />
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
    </React.Fragment>
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
    const { options, persistName = "template-form", apply } = this.props;
    return (
      <Formik
        initialValues={this.initialValues}
        onSubmit={(values, actions) => {
          apply(values);
        }}
        render={() => (
          <Form className="box ingest-template-form">
            <Persist name={persistName} />
            <SharedFields {...options} />
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
  options,
  initialValues = {},
  persistName = "",
  onSubmit,
  onDelete
}) => {
  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      onSubmit={(data, actions) => {
        onSubmit(data)
          .catch(errors => {
            console.warn(errors);
            actions.setErrors(errors);
          })
          .finally(() => actions.setSubmitting(false));
      }}
      render={({ errors, status, touched, isSubmitting }) => {
        console.log(isSubmitting);
        return (
          <Form className="ingest-form">
            {/* <Persist name={persistName} /> */}
            <BField label="Title">
              <Field className="input" name="media_title" />
              <ErrorMessage name="media_title" component="div" />
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
            <SharedFields {...options} />
            <div className="columns is-desktop">
              <div className="column">
                <div className="control">
                  <button
                    className="button is-danger"
                    type="button"
                    onClick={onDelete}
                  >
                    <i className="delete" />
                    Remove
                  </button>
                </div>
              </div>
              <div className="column is-half has-text-right">
                <button
                  className={classnames("button is-primary is-active", {
                    "is-loading": isSubmitting
                  })}
                  type="submit"
                >
                  Ingest
                </button>
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
