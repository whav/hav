import React from "react";
import { Formik, Form, Field } from "formik";

const IngestForm = ({
  media_creators = [],
  licenses = [],
  media_types = []
}) => {
  return (
    <Formik initialValues={{}}>
      <form onSubmit={(...args) => console.warn("Submitting..", args)}>
        <Field required name="title" placeholder="Title" />
        <Field name="description" type="textarea" placeholder="Description" />
        {/* <Field name='creators' type='select'>
        </Field> */}
      </form>
    </Formik>
  );
};

export default IngestForm;
