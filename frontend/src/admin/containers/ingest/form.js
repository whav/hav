import React from "react";
import {
  Formik,
  Form,
  Field,
  ErrorMessage as FormikErrorMessage,
  FieldArray,
  connect
} from "formik";
import classnames from "classnames";
import ReactSelect, { components } from "react-select";
import { Persist } from "formik-persist";
import groupBy from "lodash/groupBy";
import parseDateToRange from "../../utils/daterange";
import { FieldWrapper as BField } from "../../ui/forms";
import Button from "../../ui/components/buttons";
import { UploadContainer, SingleUpload } from "../simpleUpload";
import SourcePreview from "./sources";
import "./form.css";

import { MultiTagField } from "../autocomplete";

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
    <MultiTagField
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
  onChange = e => {
    this.props.formik.setFieldValue("media_type", e.value);
  };

  render() {
    const { media_types = [], formik } = this.props;
    const current_value = formik.values.media_type;
    let options = media_types.map(mt => ({
      label: mt.name,
      value: mt.id,
      ...mt
    }));
    const selected_option = options.find(o => o.value === current_value);
    const grouped_options = groupBy(options, "type");
    options = Object.entries(grouped_options).map(([type, opts]) => ({
      label: type,
      options: opts
    }));

    return (
      <BField label="Original Media Type">
        <Field
          component={ReactSelect}
          name="media_type"
          options={options}
          onChange={this.onChange}
          value={selected_option}
        />
        <ErrorMessage name="media_type" component="div" />
      </BField>
    );
  }
}

const MediaTypeField = connect(MTField);

const CreatorRoleTable = ({
  instances,
  accessor,
  creators = [],
  creator_roles = []
}) => {
  return (
    <FieldArray
      name={accessor}
      render={arrayhelpers => {
        return (
          <table
            className="table is-fullwidth creator-table"
            style={{ backgroundColor: "transparent" }}
          >
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
                    type="button"
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
};

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
    data = { ...data };
    // Flatten where needed
    data.media_tags = data.media_tags.map(t => t.id);
    console.log("Submitting...", data);
    this.props
      .onSubmit(data)
      .catch(errors => {
        console.error("Error in IngestForm", errors);
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
      source,
      collection_id
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
                  collection_id={collection_id}
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
