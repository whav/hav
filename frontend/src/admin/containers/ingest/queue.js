import React from "react";
import { connect } from "react-redux";
import LoadingIndicator from "../../ui/loading";

import { fetchIngestionQueue, loadIngestOptions } from "../../actions/ingest";
import IngestForm, { TemplateForm } from "../../ui/ingest/form";

import PreviewImage from "../filebrowser/preview";
import { ingest } from "../../api/ingest";

class IngestQueue extends React.Component {
  constructor(props) {
    super(props);
    props.loadIngestData();
    this.state = {
      formData: {},
      templateData: {}
    };
  }

  applyTemplate = () => {
    const data = this.state.templateData;

    this.props.queue.filtered_selection.forEach(k => {
      this.onChange(k, { ...this.state.formData[k], ...data });
    });
  };

  onTemplateChange = data => {
    this.setState(state => {
      return {
        templateData: {
          ...state.templateData,
          ...data
        }
      };
    });
  };

  onChange = (source, data) => {
    this.setState(state => {
      return {
        formData: {
          ...state.formData,
          [source]: {
            ...state.formData[source],
            ...data
          }
        }
      };
    });
  };

  ingestItem = (ingestId, data) => {
    console.warn("submitting", ingestId, data);
  };

  render() {
    const { queue, loading, options } = this.props;
    const { formData, templateData } = this.state;

    if (loading) {
      return <LoadingIndicator />;
    } else {
      const count = queue.filtered_selection.length;
      return (
        <div>
          <h1>Ingesting {count === 1 ? "one file" : `${count} files`}</h1>
          <hr />
          {/* template form if mor than one ingest file */}
          {count > 1 ? (
            <TemplateForm
              {...options}
              data={templateData}
              apply={this.applyTemplate}
              onChange={this.onTemplateChange}
            />
          ) : null}

          {queue.filtered_selection.map((source, index) => {
            return (
              <IngestForm
                key={source}
                source={source}
                {...options}
                onChange={this.onChange}
                data={formData[source] || {}}
                onSubmit={() => (
                  console.log(formData),
                  this.ingestItem(source, formData[source] || {})
                )}
              >
                <span>Asset #{index + 1}</span>
                <p>
                  <PreviewImage source={source} />
                </p>
              </IngestForm>
            );
          })}
        </div>
      );
    }
  }
}

export default connect(
  (state, ownProps) => {
    const queue_data = state.ingest.ingestionQueues[ownProps.match.params.uuid];
    return {
      queue: queue_data,
      options: state.ingest.options,
      loading: queue_data && queue_data.filtered_selection ? false : true
    };
  },
  (dispatch, ownProps) => {
    const uuid = ownProps.match.params.uuid;
    return {
      loadIngestData: () => {
        dispatch(fetchIngestionQueue(uuid));
        dispatch(loadIngestOptions());
      }
    };
  }
)(IngestQueue);
