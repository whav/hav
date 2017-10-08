import React from "react";
import { Grid, Segment } from "semantic-ui-react";

console.log(Segment);
class IngestForm extends React.Component {
  render() {
    const {
      license,
      creators,
      year,
      month,
      day,
      ingestId,
      available_licenses = [],
      available_creators = []
    } = this.props;

    return (
      <Grid.Row>
        <Grid.Column>
          <Segment>{ingestId}</Segment>
        </Grid.Column>
        <Grid.Column>
          <Segment>Creator(s)</Segment>
        </Grid.Column>
        <Grid.Column width={6}>
          <Segment>Date</Segment>
        </Grid.Column>
        <Grid.Column>
          <Segment>License</Segment>
        </Grid.Column>
      </Grid.Row>
    );
  }
}

class BatchIngest extends React.Component {
  render() {
    return (
      <Grid columns="equal">
        {this.props.ingestionFiles.map((ingestionFile, index) => (
          <IngestForm {...this.props} key={index} ingestId={index} />
        ))}
      </Grid>
    );
  }
}

export default BatchIngest;
