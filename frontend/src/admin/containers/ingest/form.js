import React from "react";
import {
  Formik,
  Form,
  Field,
  ErrorMessage as FormikErrorMessage
} from "formik";
import classnames from "classnames";
import ReactSelect from "react-select";
import { Persist } from "formik-persist";
import parseDateToRange from "../../utils/daterange";
import TagInput from "../../ui/components/taginput";

const customStyles = {
  control: provided => ({
    ...provided
  })
};

const Select = ({ className = "", ...props }) => {
  return (
    <ReactSelect
      // className={classnames(className, "select")}
      styles={customStyles}
      {...props}
    />
  );
};

const CombiField = ({ label = "", name, props }) => {
  return (
    <div className="field">
      {label ? <label className="label">{label}</label> : null}
      <div className={classnames("control")}>{children}</div>
      <ErrorMessage name={name} />
    </div>
  );
};

const BField = ({ label = "", children }) => {
  return (
    <div className="field">
      {label ? <label className="label">{label}</label> : null}
      <div className={classnames("control")}>{children}</div>
    </div>
  );
};

const ErrorMessage = props => (
  <FormikErrorMessage
    {...props}
    render={msg => <p className="help is-danger">{msg}</p>}
  />
);

const DateField = ({ field, form, ...props }) => {
  // console.log("Date value...", field.value);
  return (
    <input
      {...props}
      value={field.value}
      name={field.name}
      onBlur={() => form.setFieldTouched(field.name, true)}
      onChange={e => {
        const value = e.target.value;
        try {
          const [start, end] = parseDateToRange(value);
          // console.log(start, end);
        } catch (e) {
          // console.error(e);
          form.setFieldError(field.name, "Invalid date format.");
        } finally {
          form.setFieldValue(field.name, value);
        }
      }}
    />
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

const TagField = ({ field, form, ...props }) => {
  return (
    <TagInput
      {...props}
      name={field.name}
      value={field.value}
      onChange={value => {
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
              component={DateField}
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
              className="input"
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

const GlobalErrors = ({ errors }) => {
  const keys = ["sources", "target", "non_field_errors"];
  const error_keys = Object.keys(errors).filter(k => keys.indexOf(k) > -1);
  // console.log(error_keys)
  // console.warn("Global errors..", errors, error_keys);

  if (error_keys.length) {
    return (
      <div className="notification is-danger">
        <ul>
          {error_keys.map(k => (
            <li key={k}>{errors[k]}</li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
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

class IngestForm extends React.Component {
  submit = (data, actions) => {
    this.props
      .onSubmit(data)
      .catch(errors => {
        let formikErrors = {};
        Object.entries(errors).forEach(
          ([key, errs]) => (formikErrors[key] = errs.join(" "))
        );
        console.warn(formikErrors);
        // console.warn(Object.keys(errors));
        actions.setErrors(formikErrors);
      })
      .finally(() => actions.setSubmitting(false));
  };

  render() {
    const { options, initialValues = {}, persistName, onDelete } = this.props;
    return (
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        onSubmit={this.submit}
        render={({ isSubmitting, errors }) => {
          console.warn(errors);
          return (
            <Form className="ingest-form">
              {persistName && <Persist name={persistName} />}
              <GlobalErrors errors={errors} />
              <BField label="Title">
                <Field className="input" name="media_title" />
                <ErrorMessage name="media_title" component="div" />
              </BField>
              <BField label="Tags">
                <Field
                  component={TagField}
                  className="input"
                  name="media_tags"
                />
                <ErrorMessage name="media_tags" component="div" />
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
  }
}

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
