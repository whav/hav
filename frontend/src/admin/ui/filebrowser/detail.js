import React from "react";
import filesize from "filesize";
export default class extends React.Component {
  render() {
    const tableProps = {
      Size: filesize(this.props.size),
      "Mime Type": this.props.mime,
      Ingestable: this.props.ingestable
    };
    return (
      <div className="container content">
        <h1>{this.props.name}</h1>

        <h2>Properties</h2>

        <table className="table is-striped">
          <tbody>
            {Object.entries(tableProps).map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* <pre>{JSON.stringify(this.props, null, 2)}</pre> */}
      </div>
    );
  }
}
