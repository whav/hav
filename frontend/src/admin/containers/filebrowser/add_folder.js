import React from "react";
import { Formik, Field } from "formik";

import { FieldWrapper, ErrorMessage } from "../../ui/forms";

class HAVAddFolder extends React.Component {
  createFolder = async data => {
    console.log(data);
  };

  render() {
    return (
      <div className="content">
        <h1>Add Folder....</h1>
        <Formik
          onSubmit={this.createFolder}
          initialValues={{
            name: "Testfolder",
            description: "Test description"
          }}
          render={props => {
            return (
              <>
                <FieldWrapper label="Name">
                  <Field className="input" type="text" name="name" />
                  <ErrorMessage name="name" />
                </FieldWrapper>
                <FieldWrapper label="Description">
                  <Field
                    className="textarea"
                    component="textarea"
                    name="description"
                  />
                  <ErrorMessage name="description" />
                </FieldWrapper>
                <button type="submit" onClick={props.handleSubmit}>
                  Save
                </button>
              </>
            );
          }}
        />
      </div>
    );
  }
}

export default HAVAddFolder;
