import React from "react";
import { connect } from "react-redux";

import LoadingIndicator from "../../ui/loading";
import uniq from "lodash/uniq";
import {
  fetchIngestionQueue,
  loadIngestOptions,
  ingestionSuccess,
  deleteIngestItem
} from "../../ducks/ingest";
import IngestForm, { TemplateForm, FormSet } from "../../ui/ingest/form";

import PreviewImage from "../filebrowser/image_preview";
import PreviewFolder from "../filebrowser/folder_preview";
import { queueForIngestion } from "../../api/ingest";

import parseDate from "../../utils/daterange";
import { PreviouslyIngestedMedia } from "../../ui/ingest";

class IngestQueue extends React.Component {
  constructor(props) {
    super(props);
    props.loadIngestData();
    this.state = {
      formData: {},
      templateData: {},
      errors: {}
    };
  }

  applyTemplate = () => {
    const data = this.state.templateData;

    this.props.items.forEach(k => {
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

  onError = (source, errors) => {
    // patch start and end errors to date
    let custom_errors = { ...errors };
    const date_errors = uniq([
      ...(errors.start || []),
      ...(errors.end || []),
      ...(errors.date || [])
    ]);
    delete custom_errors.start;
    delete custom_errors.end;
    custom_errors.date = date_errors;
    this.setState({
      errors: {
        ...this.state.errors,

        [source]: custom_errors
      }
    });
  };

  clearErrors = source => {
    this.setState({
      errors: {
        ...this.state.errors,
        [source]: {}
      }
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
    let start, end;
    try {
      [start, end] = parseDate(data.date);
    } catch (e) {
      this.onError(ingestId, { date: ["invalid dates"] });
      return;
    }
    this.clearErrors(ingestId);
    let response = queueForIngestion(this.props.uuid, {
      source: ingestId,
      ...data,
      start,
      end
    });
    response
      .then(data => {
        this.props.onIngestSuccess(ingestId, data.pk);
        // this.props.loadIngestData();
      })
      .catch(err => this.onError(ingestId, err));
  };

  render() {
    const {
      loading,
      options,
      items = [],
      target,
      created_media_entries = []
    } = this.props;
    const { formData, templateData, errors } = this.state;

    if (loading) {
      return <LoadingIndicator />;
    } else {
      const count = items.length;
      const forms = items.map((source, index) => {
        return (
          <IngestForm
            key={source}
            source={source}
            {...options}
            onChange={this.onChange}
            data={formData[source] || {}}
            errors={errors[source] || {}}
            onSubmit={() => this.ingestItem(source, formData[source] || {})}
            onError={this.onError}
            onDelete={() => {
              this.props.deleteIngestItem(source);
            }}
          >
            <span>Asset #{index + 1}</span>
            <PreviewImage source={source} />
          </IngestForm>
        );
      });

      return (
        <div>
          <h1>Ingesting {count === 1 ? "one file" : `${count} files`}</h1>
          <em>Target</em>
          <PreviewFolder source={target} />

          <hr />
          {/* template form if more than one ingest file */}
          {count > 1 ? (
            <TemplateForm
              {...options}
              data={templateData}
              apply={this.applyTemplate}
              onChange={this.onTemplateChange}
            />
          ) : null}
          <FormSet>{forms}</FormSet>
          {created_media_entries.length > 0 ? (
            <React.Fragment>
              <h2>Previously ingested</h2>
              <hr />
              {created_media_entries.map(m => (
                <PreviouslyIngestedMedia key={m.name} media={m} />
              ))}
            </React.Fragment>
          ) : null}
        </div>
      );
    }
  }
}

export default connect(
  (state, ownProps) => {
    const queue = state.ingest.ingestionQueues[ownProps.match.params.uuid];
    if (!queue) {
      return {
        loading: true
      };
    }
    const { ingestion_queue, created_media_entries } = queue;
    return {
      items: ingestion_queue,
      created_media_entries,
      uuid: queue.uuid,
      target: queue.target,
      options: state.ingest.options,
      loading: queue && state.ingest.options ? false : true
    };
  },
  (dispatch, ownProps) => {
    const uuid = ownProps.match.params.uuid;
    return {
      loadIngestData: () => {
        dispatch(fetchIngestionQueue(uuid));
        dispatch(loadIngestOptions());
      },
      onIngestSuccess: (source_id, media_id) => {
        dispatch(ingestionSuccess(uuid, source_id, media_id));
      },
      deleteIngestItem: source_id => {
        dispatch(deleteIngestItem(uuid, source_id));
      }
    };
  }
)(IngestQueue);
