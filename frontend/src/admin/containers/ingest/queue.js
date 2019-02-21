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
import { FormSet } from "../../ui/ingest/form";
import IngestForm, { TemplateForm } from "./form";
import PreviewImage from "../filebrowser/image_preview";
import PreviewFolder from "../filebrowser/folder_preview";
import { queueForIngestion } from "../../api/ingest";
import { ingestQueueWS } from "../../api/urls";
import parseDate from "../../utils/daterange";
import { PreviouslyIngestedMedia } from "../../ui/ingest";

import Sockette from "sockette";

const initialFormValues = {
  title: "",
  description: "",
  creators: [],
  media_license: "",
  tags: [],
  date: "",
  media_identifier: ""
};

class WSListener extends React.PureComponent {
  componentDidMount() {
    this.ws = new Sockette(this.props.ws_url, {
      timeout: 5e3,
      maxAttempts: 2,
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
    const formData = {};
    props.items.forEach(k => (formData[k] = { ...initialFormValues }));
    this.state = {
      formData,
      templateData: {},
      errors: {},
      previously_ingested: {},
      sources: [...props.items],
      deletedSources: []
    };
  }

  applyTemplate = data => {
    const formData = {};
    this.props.items.forEach(k => {
      const fd = this.state.formData[k];
      formData[k] = {
        ...fd,
        ...data
      };
    });
    console.log(formData);
    this.setState({ formData });
  };

  onTemplateChange = data => {
    console.log("Template:", data);
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
        this.setState(state => ({
          previously_ingested: {
            ...state.previously_ingested,
            [ingestId]: data.url
          }
        }));
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

    const {
      formData,
      templateData,
      previously_ingested,
      sources,
      deletedSources
    } = this.state;

    const count = items.length;

    // gather list of previously (before this component mounted) created media entries
    // this is necessary to show some media entries inline and some at the end of the page
    const previouslyIngestedMediaUrls = new Set(
      Object.values(previously_ingested)
    );
    const previouslyIngestedMediaEntries = created_media_entries.filter(
      ma => !previouslyIngestedMediaUrls.has(ma.url)
    );
    const forms = sources.map((source, index) => {
      // filter out deleted
      if (deletedSources.indexOf(source) !== -1) {
        return <div key={source} />;
      }
      if (Object.keys(previously_ingested).indexOf(source) === -1) {
        return (
          <IngestForm
            key={source}
            source={source}
            persistName={source}
            {...options}
            // onChange={this.onChange}
            // data={formData[source] || {}}
            // errors={errors[source] || {}}
            // onSubmit={() => this.ingestItem(source, formData[source] || {})}
            // onError={this.onError}
            // onDelete={() => {
            //   this.props.deleteIngestItem(source);
            //   this.setState(state => ({
            //     deletedSources: [...state.deletedSources, source]
            //   }));
            // }}
            initialValues={formData[source]}
          >
            <PreviewImage source={source} />
          </IngestForm>
        );
      } else {
        const media = created_media_entries.find(
          ma => ma.url === previously_ingested[source]
        );
        if (media === undefined) {
          console.error(
            "Media not found",
            media,
            created_media_entries,
            previouslyIngestedMediaEntries
          );
          return null;
        }
        return <PreviouslyIngestedMedia key={source} media={media} />;
      }
    });
    return (
      <div className="hav-ingest">
        <WSListener ws_url={ws_url} onReceive={this.props.onIngestUpdate} />
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
        <hr />
        {previouslyIngestedMediaEntries.map(m => (
          <PreviouslyIngestedMedia key={m.name} media={m} />
        ))}
      </div>
    );
  }
}

class IngestQueueLoader extends React.Component {
  constructor(props) {
    super(props);
    props.loadIngestData();
  }
  render() {
    const { options, items } = this.props;
    const loading = isEmpty(options) || !Array.isArray(items);
    return loading ? <LoadingIndicator /> : <IngestQueue {...this.props} />;
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
        return {
          ...ma,
          ...(state.repositories[key] || {})
        };
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
)(IngestQueueLoader);

export default Ingest;
