import React from "react";
import {
  Formik,
  Form,
  Field,
  ErrorMessage as FormikErrorMessage,
  FieldArray
} from "formik";
import isString from "lodash/isString";
import classnames from "classnames";
import ReactSelect from "react-select";
import { Persist } from "formik-persist";
import parseDateToRange from "../../utils/daterange";
import TagInput from "../../ui/components/taginput";
import Button from "../../ui/components/buttons";
import { UploadContainer, SingleUpload } from "../simpleUpload";
import SourcePreview from "./sources";

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
    render={msg => {
      console.error(msg);
      return <p className="help is-danger">{msg}</p>;
    }}
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
          <BField label="Media Type">
            <Field
              component={SelectField}
              name="media_type"
              options={media_types}
            />
            <ErrorMessage name="media_type" component="div" />
          </BField>
        </div>
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
          <BField label="License">
            <Field
              component={SelectField}
              name="media_license"
              options={licenses}
            />
            <ErrorMessage name="media_license" component="div" />
          </BField>
        </div>
      </div>
    </React.Fragment>
  );
};

const CreatorRoleTable = ({
  instances,
  accessor,
  creators = [],
  creator_roles = []
}) => (
  <FieldArray
    name={accessor}
    render={arrayhelpers => {
      return (
        <table className="table is-fullwidth">
          <thead>
            <tr>
              <th>Creator</th>
              <th>Role</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {instances.map((_, index) => {
              const field_accessor = `${accessor}.${index}`;
              console.log(`${field_accessor}.creator`);
              return (
                <tr key={index}>
                  <td>
                    <Field
                      component={SelectField}
                      className="input"
                      name={`${field_accessor}.creator`}
                      multiple={false}
                      options={creators}
                    />
                    <ErrorMessage
                      name={`${field_accessor}.creator`}
                      component="div"
                    />
                  </td>
                  <td>
                    <Field
                      component={SelectField}
                      className="input"
                      name={`${field_accessor}.role`}
                      multiple={false}
                      options={creator_roles}
                    />
                    <ErrorMessage
                      name={`${field_accessor}.role`}
                      component="div"
                    />
                  </td>
                  <td className="has-text-right">
                    {index === 0 ? null : (
                      <a
                        className="delete is-small"
                        onClick={e => {
                          e.preventDefault();
                          arrayhelpers.remove(index);
                        }}
                      >
                        Delete
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={3} className="has-text-right">
                <Button
                  className="is-small"
                  onClick={e => {
                    e.preventDefault();
                    arrayhelpers.push({ creator: "", role: "" });
                  }}
                >
                  Add Creator
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      );
    }}
  />
);

const UploadComponent = props =>
  props.success ? null : <SingleUpload {...props} />;

const Attachments = ({ attachments, ...props }) => {
  return (
    <FieldArray
      name="attachments"
      render={arrayhelpers => (
        <React.Fragment>
          {attachments.map((a, index) => {
            const field_accessor = `attachments.${index}`;
            return (
              <div className="media box" key={index}>
                <div className="media-left">
                  <SourcePreview url={a.source} />
                </div>
                <div className="media-content">
                  <Field type="hidden" name={`${field_accessor}.source`} />
                  <CreatorRoleTable
                    {...props}
                    accessor={`${field_accessor}.creators`}
                    instances={a.creators}
                  />
                </div>
              </div>
            );
          })}
          <UploadContainer
            onSuccess={resp => {
              console.log("Success...", resp);
              arrayhelpers.push({
                source: resp.url,
                description: "",
                creators: []
              });
            }}
            trigger_text="Add attachment"
            component={UploadComponent}
          />
        </React.Fragment>
      )}
    />
  );
};

const GlobalErrors = ({ errors }) => {
  console.warn(JSON.stringify(errors, null, 2));
  const keys = ["sources", "target", "non_field_errors"];
  const error_keys = Object.keys(errors).filter(k => keys.indexOf(k) > -1);

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
    creators: [
      {
        creator: "",
        role: ""
      }
    ],
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
        render={({ values }) => (
          <Form className="box ingest-template-form">
            <Persist name={persistName} />
            <SharedFields {...options} />
            <CreatorRoleTable
              instances={values.creators}
              accessor="creators"
              {...options}
            />
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

const Columns = ({ children }) => <div className="columns">{children}</div>;
const Column = ({ children, className }) => (
  <div className={classnames("column", className)}>{children}</div>
);

class IngestForm extends React.Component {
  submit = (data, actions) => {
    this.props
      .onSubmit(data)
      .catch(errors => {
        // TODO: I think the error component can not deal with arrays of errors
        actions.setErrors({ ...errors });
      })
      .finally(() => actions.setSubmitting(false));
  };

  render() {
    const {
      options,
      initialValues = {},
      persistName,
      onDelete,
      source
    } = this.props;
    return (
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        onSubmit={this.submit}
        render={({ isSubmitting, errors, values, setSubmitting }) => {
          return (
            <Form className="ingest-form">
              {persistName && <Persist name={persistName} />}
              <GlobalErrors errors={errors} />
              <Columns>
                <Column className="is-one-third is-clipped ingest-form-preview">
                  <SourcePreview url={source} />
                </Column>
                <Column>
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
                  <CreatorRoleTable
                    {...options}
                    accessor="creators"
                    instances={values.creators}
                  />
                </Column>
              </Columns>

              <BField label="Identifier">
                <Field className="input" name="media_identifier" />
                <ErrorMessage name="media_identifier" component="div" />
              </BField>

              <BField label="Description">
                <Field
                  component="textarea"
                  className="textarea"
                  name="media_description"
                />
                <ErrorMessage name="description" component="div" />
              </BField>

              <SharedFields {...options} />

              {/* Attachments */}
              <Columns>
                <Column>
                  <Attachments attachments={values.attachments} {...options} />
                </Column>
              </Columns>

              <Columns>
                <Column>
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
                </Column>
                <Column className="has-text-right">
                  {isSubmitting ? (
                    <a onClick={() => setSubmitting(false)}>Cancel</a>
                  ) : null}
                  <button
                    className={classnames("button is-primary is-active", {
                      "is-loading": isSubmitting
                    })}
                    type="submit"
                  >
                    Ingest
                  </button>
                </Column>
              </Columns>
            </Form>
          );
        }}
      />
    );
  }
}

export default props => {
  return (
    <div className="box is-outlined">
      <IngestForm {...props} />
    </div>
  );
};

export { TemplateForm };
