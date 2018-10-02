import React from "react";
import PropType from "prop-types";
import ReactTagInput from "react-tag-autocomplete";
// import ReactTagComponent from "react-tag-autocomplete/dist-es6/Tag";

import uniq from "lodash/uniq";

import "react-tag-autocomplete/example/styles.css";

class TagComponent extends React.Component {
  render() {
    const { tag, onDelete } = this.props;
    return (
      <span class="tag">
        {tag.name}
        <button class="delete is-small" onClick={onDelete} />
      </span>
    );
    // return <ReactTagComponent {...this.props} />;
  }
}

class TagInput extends React.Component {
  static propTypes = {
    tags: PropType.arrayOf(PropType.string),
    suggestions: PropType.arrayOf(PropType.string),
    onTagsChange: PropType.func.isRequired
  };

  static classNames = {
    selected: "react-tags__selected tags",
    root: "react-tags input"
  };

  handleAdd = tag => {
    console.log(tag);
    this.props.onTagsChange([...this.props.tags, tag.name]);
  };

  handleDelete = index => {
    this.props.onTagsChange(this.props.tags.filter((t, i) => i != index));
  };

  render() {
    let tags = uniq(this.props.tags).map((t, index) => ({
      id: index,
      name: t
    }));
    return (
      <ReactTagInput
        tags={tags}
        suggestions={this.props.suggestions || []}
        handleAddition={this.handleAdd}
        handleDelete={this.handleDelete}
        autofocus={false}
        tagComponent={TagComponent}
        classNames={this.classNames}
        allowNew={true}
      />
    );
  }
}

export default TagInput;
