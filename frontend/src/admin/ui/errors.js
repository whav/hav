import React from "react";

class ErrorBoundary extends React.Component {
  state = {
    hasError: false
  };

  // componentDidCatch(error, info) {
  // TODO: logging?
  // }

  static getDerivedStateFromError(error) {
    console.error(error);
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="content">
          <div class="notification is-danger">
            <h1>Something broke...</h1>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
