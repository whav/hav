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

const Field = props => {
  const { onChange, name, value, label, errors, ...input_props } = props;
  return (
    <div className="field">
      {label ? <label className="label">{label}</label> : null}
      <div class="control">{props.children}</div>
    </div>
  );
};

const BtnGroup = ({ children, ...props }) => (
  <Button.Group {...props}>{children}</Button.Group>
);

class CreatorSelect extends React.Component {
  render() {
    const { creators } = this.props;
    const options = creators.map(c => ({
      key: `creator-${c.id}`,
      text: c.name,
      value: c.id
    }));
    return (
      <Form.Field>
        <label>Creator(s)</label>
        <Form.Dropdown options={options} {...this.props} />
      </Form.Field>
    );
  }
}

class LicenseSelect extends React.Component {
  render() {
    const { licenses } = this.props;
    const options = licenses.map(l => ({
      value: l.id,
      text: l.name,
      key: l.id
    }));
    return (
      <Form.Field>
        <label>License</label>
        <Form.Dropdown options={options} {...this.props} />
      </Form.Field>
    );
  }
}

const DateForm = ({ data, ...props }) => {
  return (
    <Form.Group inline widths="equal">
      <Form.Input
        required
        key="year"
        placeholder="Year"
        value={data.year || ""}
        type="number"
        name="year"
        onChange={props.onChange}
        label="Year"
      />
      <Form.Input
        key="month"
        placeholder="Month"
        name="month"
        type="number"
        value={data.month || ""}
        min={1}
        max={12}
        onChange={props.onChange}
        label="Month"
      />
      <Form.Input
        key="day"
        placeholder="Day"
        name="day"
        type="number"
        min={1}
        max={31}
        value={data.day || ""}
        onChange={props.onChange}
        label="Day"
      />
    </Form.Group>
  );
};

class IngestForm extends React.Component {
  static propType = {
    licenses: PropTypes.array.isRequired,
    creators: PropTypes.array.isRequired,
    roles: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired
  };

  handleRawChange = (key, event, data) => {
    // this is necessary because the dropdown
    // does not work properly
    this.props.onChange(this.props.ingest_id, {
      [key]: data.value
    });
  };

  handleChange = (event, data) => {
    this.props.onChange(this.props.ingest_id, {
      [event.target.name]: data.value
    });
  };

  render() {
    const { licenses = [], creators = [], roles = [], data = {} } = this.props;
    let parts = this.props.ingest_id.split("/").reverse();
    return (
      <Grid.Row columns={3}>
        <Grid.Column>
          <Form.Field key="file">{parts[0]}</Form.Field>
        </Grid.Column>
        <Grid.Column>
          <DateForm data={data} onChange={this.handleChange} />
          <CreatorSelect
            required
            multiple
            creators={creators}
            value={data.creators || []}
            name="creators"
            onChange={this.handleRawChange.bind(this, "creators")}
          />
          <LicenseSelect
            required
            licenses={licenses}
            value={data.license}
            name="license"
            onChange={this.handleRawChange.bind(this, "license")}
          />
        </Grid.Column>
        <Grid.Column>
          {this.props.children ? (
            this.props.children
          ) : (
            <Form.Field
              control="textarea"
              label="Description"
              value={data.description || ""}
              name="description"
              rows="3"
              onChange={this.handleChange}
            />
          )}
        </Grid.Column>
      </Grid.Row>
    );
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
      this.props.onChange(ingestionFile.ingestion_id, data)
    );
  };

  render() {
    return (
      <Container fluid>
        <Header as="h1" dividing>
          Ingest
        </Header>
        <Form size="tiny" noValidate>
          <Grid inverted>
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
              </BtnGroup>
            </IngestForm>
          </Grid>
        </Form>
        <Divider />
        <Form size="tiny">
          <Grid divided="vertically">
            {this.props.ingestionFiles.map((ingestionFile, index) => {
              let key = ingestionFile.ingestion_id;
              return (
                <IngestForm
                  data={ingestionFile.data}
                  errors={ingestionFile.errors}
                  {...this.props}
                  onChange={this.props.onChange}
                  ingest_id={key}
                  key={key}
                />
              );
            })}
          </Grid>
        </Form>
        <Divider />
        <Button primary compact type="submit">
          Save
        </Button>
      </Container>
    );
  }
}

export default BatchIngest;
