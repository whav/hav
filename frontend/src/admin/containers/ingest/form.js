import React from "react";
import {
  Formik,
  Form,
  Field,
  ErrorMessage as FormikErrorMessage,
  FieldArray,
  connect,
  getIn
} from "formik";
import classnames from "classnames";
import ReactSelect from "react-select";
import { Persist } from "formik-persist";
import groupBy from "lodash/groupBy";
import parseDateToRange from "../../utils/daterange";
import TagInput from "../../ui/components/taginput";
import Button from "../../ui/components/buttons";
import { UploadContainer, SingleUpload } from "../simpleUpload";
import SourcePreview from "./sources";
import "./form.css";

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

class MTField extends React.Component {
  state = {
    group: null
  };

  onChange = e => {
    this.setState({ group: e.target.value });
    this.props.formik.setFieldValue("media_type", "");
  };

  render() {
    const { media_types = [], formik } = this.props;
    const currentValue = formik.values.media_type;
    const grouped = groupBy(media_types, "type");
    const currentSelection = media_types.find(mt => mt.id === currentValue);
    // default to first group
    let currentGroup = this.state.group || Object.keys(grouped)[0];
    if (currentSelection) {
      currentGroup = currentSelection.type;
    }
    return (
      <>
        <BField label="Original Media Type">
          {Object.keys(grouped).map(k => (
            <label key={k} className="radio">
              <input
                type="radio"
                name="mediatypetype"
                value={k}
                checked={k === currentGroup}
                onChange={this.onChange}
              />
              {k}
            </label>
          ))}
        </BField>
        <BField>
          <Field
            component={SelectField}
            name="media_type"
            options={grouped[currentGroup]}
          />
          <ErrorMessage name="media_type" component="div" />
        </BField>
      </>
    );
  }
}

const MediaTypeField = connect(MTField);

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

const Attachments = ({ attachments, errors, ...props }) => {
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
                  <GlobalErrors
                    keys={[
                      `${field_accessor}.source`,
                      `${field_accessor}.non_field_errors`
                    ]}
                  />
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

const GlobalErrors = ({ keys = ["sources", "target", "non_field_errors"] }) => {
  return (
    <>
      {keys.map((k, i) => (
        <div className="notification is-danger" key={`i-${k}`}>
          <FormikErrorMessage name={k} />
        </div>
      ))}
    </>
  );
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
            <Columns>
              <Column>
                <BField label="Original Media Type">
                  <Field
                    component={SelectField}
                    name="media_type"
                    options={options.media_types.map(mt => ({
                      ...mt,
                      name: `${mt.type}/${mt.name}`
                    }))}
                  />
                  <ErrorMessage name="media_license" component="div" />
                </BField>
              </Column>
              <Column>
                {" "}
                <BField label="Original Creation Date">
                  <Field
                    className="input"
                    component={DateField}
                    name="date"
                    placeholder="YYYY-MM-DD"
                    autoComplete="off"
                  />
                  <ErrorMessage name="date" component="div" />
                </BField>
              </Column>
              <Column>
                <BField label="License">
                  <Field
                    component={SelectField}
                    name="media_license"
                    options={options.licenses}
                  />
                  <ErrorMessage name="media_license" component="div" />
                </BField>
              </Column>
            </Columns>
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
              <GlobalErrors keys={["source", "target", "non_field_errors"]} />
              <Field type="hidden" name="source" />
              <Field type="hidden" name="target" />

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

              <Columns>
                <Column>
                  <MediaTypeField media_types={options.media_types} />
                </Column>
                <Column>
                  {" "}
                  <BField label="Original Creation Date">
                    <Field
                      className="input"
                      component={DateField}
                      name="date"
                      placeholder="YYYY-MM-DD"
                      autoComplete="off"
                    />
                    <ErrorMessage name="date" component="div" />
                  </BField>
                </Column>
                <Column>
                  <BField label="License">
                    <Field
                      component={SelectField}
                      name="media_license"
                      options={options.licenses}
                    />
                    <ErrorMessage name="media_license" component="div" />
                  </BField>
                </Column>
              </Columns>

              <Columns>
                <Column className="is-one-third is-clipped ingest-form-preview">
                  <SourcePreview url={source} />
                </Column>
                <Column>
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

              {/* Attachments */}
              <Columns>
                <Column>
                  <Attachments
                    attachments={values.attachments}
                    errors={errors.attachments || []}
                    {...options}
                  />
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
