import React from "react";
import PropType from "prop-types";

import uniq from "lodash/uniq";

const styles = {
  wrapper: {
    height: "auto"
  },
  input: {
    border: "none",
    marginBottom: ".1em",
    marginTop: ".1em"
  }
};

class TagComponent extends React.Component {
  render() {
    const { tag, onDelete } = this.props;
    return (
      <div className="control" style={styles.input}>
        <div className="tags">
          <span class="tag">
            {tag}
            <button class="delete is-small" onClick={onDelete} />
          </span>
        </div>
      </div>
    );
  }
}

class TagInput extends React.Component {
  state = {
    value: ""
  };

  update = e => {
    this.setState({ value: e.target.value });
  };

  onKeyDown = e => {
    switch (e.keyCode) {
      case 13: // Enter
        e.stopPropagation();
        e.preventDefault();
        this.props.onTagEntered(this.state.value);
        this.setState({ value: "" });
        break;
      case 8: //Backspace
        if (this.state.value === "") {
          this.props.deleteLast();
        }
        break;
      default:
        return;
    }
  };

  render() {
    return (
      <input
        type="text"
        value={this.state.value}
        onChange={this.update}
        onKeyDown={this.onKeyDown}
        placeholder={this.props.placeholder || "Add a tag"}
        style={styles.input}
      />
    );
  }
}

class TagInputField extends React.Component {
  static propTypes = {
    tags: PropType.arrayOf(PropType.string).isRequired,
    onTagAdded: PropType.func,
    onTagDeleted: PropType.func,
    onTagsChange: PropType.func
  };

  deleteLastTag = () => {
    const length = this.props.tags.length;
    if (length) {
      this.deleteTag(this.props.tags[length - 1]);
    }
  };

  deleteTag = tag => {
    this.props.onTagDeleted && this.props.onTagDeleted(tag);
    this.props.onTagsChange &&
      this.props.onTagsChange(this.props.tags.filter(t => t !== tag));
  };

  tagAdded = tag => {
    if (this.props.tags.indexOf(tag) !== -1) {
      return;
    }
    this.props.onTagAdded && this.props.onTagAdded(tag);
    this.props.onTagsChange &&
      this.props.onTagsChange([...this.props.tags, tag]);
  };

  render() {
    let tags = uniq(this.props.tags);

    return (
      <div
        style={styles.wrapper}
        className="field is-grouped is-grouped-multiline input"
      >
        {tags.map(t => (
          <TagComponent tag={t} key={t} onDelete={this.deleteTag} />
        ))}
        <TagInput
          onTagEntered={this.tagAdded}
          deleteLast={this.deleteLastTag}
        />
      </div>
    );
  }
}

export default TagInputField;
