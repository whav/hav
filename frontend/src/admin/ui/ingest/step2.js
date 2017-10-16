import React from "react";
import {
  Grid,
  Segment,
  Dropdown,
  Form,
  Button,
  Container,
  Divider,
  Header
} from "semantic-ui-react";
import PropTypes from "prop-types";

const BtnGroup = ({ children, ...props }) => (
  <Button.Group {...props}>{children}</Button.Group>
);

class CreatorSelect extends React.Component {
  onChange = (_, data) => {
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

const DateForm = ({ data, ...props }) => {
  return [
    <Form.Input
      required
      key="year"
      placeholder="Year"
      value={data.year || ""}
      type="number"
      name="year"
      width={2}
      onChange={props.onChange}
    />,
    <Form.Input
      key="month"
      placeholder="Month"
      name="month"
      type="number"
      value={data.month || ""}
      width={2}
      min={1}
      max={12}
      onChange={props.onChange}
    />,
    <Form.Input
      key="day"
      placeholder="Day"
      name="day"
      type="number"
      min={2}
      max={31}
      value={data.day || ""}
      width={1}
      onChange={props.onChange}
    />
  ];
};

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
    this.props.onChange(this.props.ingest_id, {
      [event.target.name]: data.value
    });
  };

  render() {
    const { licenses = [], creators = [], roles = [], data = {} } = this.props;
    let parts = this.props.ingest_id.split("/").reverse();
    return [
      <Form.Field width={2} key="file">
        {parts[0]}
      </Form.Field>,
      <Form.Field width={3} key="creators">
        <CreatorSelect
          required
          creators={creators}
          roles={roles}
          value={data.creators}
          onChange={d =>
            this.props.onChange(this.props.ingest_id, { creators: d })}
        />
      </Form.Field>,
      <DateForm data={data} onChange={this.handleChange} />,
      <Form.Field width={2} key="license">
        <LicenseSelect
          required
          licenses={licenses}
          value={data.license}
          onChange={d =>
            this.props.onChange(this.props.ingest_id, { license: d })}
        />
      </Form.Field>,
      <Form.Field width={2} key="controls">
        {this.props.children}
      </Form.Field>
    ];
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

  updateTemplateData = (_, data) => {
    this.setState(state => ({
      template_data: { ...state.template_data, ...data }
    }));
  };

  applyToAll = () => {
    const data = this.state.template_data;
    this.props.ingestionFiles.forEach(ingestionFile =>
      this.props.onChange(ingestionFile.id, data)
    );
  };

  render() {
    return (
      <Container fluid>
        <Header as="h1" dividing>
          Ingest
        </Header>
        <Form>
          <Form.Group key="template-form">
            <IngestForm
              ingest_id={"Template Form"}
              {...this.props}
              data={this.state.template_data}
              onChange={this.updateTemplateData}
            >
              <BtnGroup>
                <Button primary compact size="mini" onClick={this.applyToAll}>
                  Apply to all
                </Button>
                <Button secondary>Ha!</Button>
              </BtnGroup>
            </IngestForm>
          </Form.Group>
        </Form>
        <Divider />
        <Form onSubmit={this.props.onSave}>
          {this.props.ingestionFiles.map((ingestionFile, index) => {
            let key = ingestionFile.id;
            return (
              <Form.Group key={key}>
                <IngestForm
                  data={ingestionFile.data}
                  {...this.props}
                  onChange={this.props.onChange}
                  ingest_id={key}
                />
              </Form.Group>
            );
          })}
          <Divider />
          <button type="submit">Save</button>
        </Form>
      </Container>
    );
  }
}

export default BatchIngest;
