import React from "react";
import { Grid, Segment, Dropdown, Form } from "semantic-ui-react";
import PropTypes from "prop-types";

class CreatorSelect extends React.Component {
  onChange = (_, data) => {
    console.log(this.props);
    this.props.onChange(data.value);
  };
  render() {
    const { creators, roles, value = [] } = this.props;
    const options = creators.map(c => ({
      key: `creator-${c.id}`,
      text: c.name,
      value: c.id
    }));
    return (
      <Dropdown
        multiple={true}
        placeholder="Creator(s)"
        options={options}
        value={value}
        name="creators"
        onChange={this.onChange}
      />
    );
  }
}

class LicenseSelect extends React.Component {
  onChange = (_, data) => {
    this.props.onChange(data.value);
  };
  render() {
    const { licenses, value = null, onChange } = this.props;
    const options = licenses.map(l => ({
      value: l.id,
      text: l.name,
      key: l.id
    }));
    return (
      <Dropdown
        options={options}
        value={value}
        placeholder="License"
        name="license"
        onChange={this.onChange}
      />
    );
  }
}

class IngestForm extends React.Component {
  static propType = {
    licenses: PropTypes.array.isRequired,
    creators: PropTypes.array.isRequired,
    roles: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired
  };

  handleChange = (event, data) => {
    this.props.onChange(this.props.ingest_id, event.target.name, data.value);
  };

  render() {
    const { licenses = [], creators = [], roles = [], data = {} } = this.props;
    let parts = this.props.ingest_id.split("/").reverse();
    const inputProps = {
      onChange: this.handleChange
    };
    return [
      <Grid.Column key="file">{parts[0]}</Grid.Column>,
      <Grid.Column key="creators">
        <CreatorSelect
          creators={creators}
          roles={roles}
          value={data.creators}
          onChange={d =>
            this.props.onChange(this.props.ingest_id, "creators", d)}
        />
      </Grid.Column>,
      <Grid.Column width={6} key="date">
        <Form>
          <Form.Group>
            <Form.Input
              placeholder="Year"
              value={data.year || ""}
              type="number"
              name="year"
              width={4}
              {...inputProps}
            />
            <Form.Input
              placeholder="Month"
              name="month"
              type="number"
              value={data.month || ""}
              width={4}
              min={1}
              max={12}
              {...inputProps}
            />
            <Form.Input
              placeholder="Day"
              name="day"
              type="number"
              min={1}
              max={31}
              value={data.day || ""}
              width={4}
              {...inputProps}
            />
          </Form.Group>
        </Form>
      </Grid.Column>,
      <Grid.Column key="license">
        <LicenseSelect
          licenses={licenses}
          value={data.license}
          onChange={d =>
            this.props.onChange(this.props.ingest_id, "license", d)}
        />
      </Grid.Column>,
      <Grid.Column key="controls">{this.props.children}</Grid.Column>
    ];
  }
}

class BatchIngest extends React.Component {
  render() {
    return (
      <Grid columns="equal" padded="horizontally">
        <Grid.Row color="yellow" key={"template-form"}>
          <IngestForm ingest_id={""} {...this.props} />
        </Grid.Row>

        {this.props.ingestionFiles.map((ingestionFile, index) => {
          let key = ingestionFile.id;
          return (
            <Grid.Row key={key}>
              <IngestForm
                data={ingestionFile.data}
                {...this.props}
                onChange={this.props.onChange}
                ingest_id={key}
              />
            </Grid.Row>
          );
        })}
      </Grid>
    );
  }
}

export default BatchIngest;
