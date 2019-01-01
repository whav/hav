import React from "react";
import { connect } from "react-redux";

import LoadingIndicator from "../../ui/loading";
import uniq from "lodash/uniq";
import isEmpty from "lodash/isEmpty";
import {
  fetchIngestionQueue,
  loadIngestOptions,
  ingestionSuccess,
  deleteIngestItem,
  handleIngestUpdate
} from "../../ducks/ingest";
import IngestForm, { TemplateForm, FormSet } from "../../ui/ingest/form";

import PreviewImage from "../filebrowser/image_preview";
import PreviewFolder from "../filebrowser/folder_preview";
import { queueForIngestion } from "../../api/ingest";
import { ingestQueueWS } from "../../api/urls";
import parseDate from "../../utils/daterange";
import { PreviouslyIngestedMedia } from "../../ui/ingest";

import Sockette from "sockette";

class WSListener extends React.PureComponent {
  componentDidMount() {
    const location = this.props.url || document.location;
    console.warn(location, this.props, document.location);
    const url = new URL(location);
    const ws_url = `${url.protocol === "https:" ? "wss" : "ws"}://${url.host}${
      url.pathname
    }`;
    this.ws = new Sockette(ws_url, {
      timeout: 5e3,
      maxAttempts: 10,
      onopen: e => console.log("Connected!", e),
      onmessage: this.onReceive,
      onreconnect: e => console.log("Reconnecting...", e),
      onmaximum: e => console.log("Stop Attempting!", e),
      onclose: e => console.log("Closed!", e),
      onerror: e => console.log("Error:", e)
    });
  }

  componentWillUnmount() {
    this.ws.close(1000);
  }

  onReceive = e => {
    const data = JSON.parse(e.data);
    this.props.onReceive(data);
  };

  render() {
    return null;
  }
}

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
    this.clearErrors(ingestId);
    let start, end;

    // TODO: don't validate here
    try {
      [start, end] = parseDate(data.date);
    } catch (e) {
      this.onError(ingestId, { date: ["Invalid dates."] });
    }
    let response = queueForIngestion(this.props.uuid, {
      source: ingestId,
      target: this.props.target,
      ...data,
      start,
      end
    });
    response
      .then(data => {
        this.props.onIngestSuccess(ingestId, data);
        // this.props.loadIngestData();
      })
      .catch(err => {
        this.onError(ingestId, err);
      });
    return response;
  };

  render() {
    const {
      options,
      items = [],
      target,
      created_media_entries = [],
      ws_url
    } = this.props;

    const { formData, templateData, errors } = this.state;

    const loading = isEmpty(options);
    console.log(this.props);
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
            {/* <span>Asset #{index + 1}</span> */}
            <PreviewImage source={source} />
          </IngestForm>
        );
      });

      return (
        <div>
          <WSListener url={ws_url} onReceive={this.props.onIngestUpdate} />
          <div className="box">
            <h1 className="title">
              {count === 1
                ? "Single Item Ingestion"
                : `Ingesting ${count} files.`}
            </h1>

            <PreviewFolder source={target} />
          </div>
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

const Ingest = connect(
  (state, ownProps) => {
    const queue = state.ingest.ingestionQueues[ownProps.match.params.uuid];
    if (!queue || !queue.loaded) {
      return {
        loading: true
      };
    }
    const items = queue.ingestion_queue;
    const target = queue.target;
    const created_media_entries = queue.created_media_entries
      .map(ma => {
        const key = ma.url;
        return state.repositories[key];
      })
      .filter(ma => ma !== undefined);
    return {
      items,
      target,
      created_media_entries,
      uuid: queue.uuid,
      options: state.ingest.options,
      loading: state.ingest.options ? false : true,
      ws_url: ingestQueueWS(queue.uuid)
    };
  },
  (dispatch, ownProps) => {
    const uuid = ownProps.match.params.uuid;

    return {
      loadIngestData: () => {
        dispatch(fetchIngestionQueue(uuid));
        dispatch(loadIngestOptions());
      },
      onIngestSuccess: (source_id, data) => {
        uuid && dispatch(ingestionSuccess(uuid, source_id, data));
      },
      deleteIngestItem: source_id => {
        uuid && dispatch(deleteIngestItem(uuid, source_id));
      },
      onIngestUpdate: data => {
        uuid && dispatch(handleIngestUpdate(uuid, data));
      }
    };
  }
)(IngestQueue);

export default Ingest;
