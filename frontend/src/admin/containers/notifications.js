import React, { useEffect } from "react";
import { connect } from "react-redux";
import { remove_notification } from "../ducks/notifications";

const wrapperStyle = {
  maxWidth: "40vw",
  position: "fixed",
  bottom: "1rem",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 1000
};
const notificationStyle = {
  padding: "1rem"
};
const Notification = ({ message, timeout, level, remove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      remove();
    }, timeout);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div
      className={`notification is-size-7 is-${level}`}
      style={notificationStyle}
    >
      <button onClick={remove} className="delete"></button>
      {message}
    </div>
  );
};

class Notifications extends React.Component {
  render() {
    const { notifications, remove_notification } = this.props;
    return (
      <div style={wrapperStyle}>
        {notifications.map(({ id, ...props }) => (
          <Notification
            key={id}
            remove={() => remove_notification(id)}
            {...props}
          ></Notification>
        ))}
      </div>
    );
  }
}

export default connect(
  state => ({ notifications: state.notifications }),
  { remove_notification }
)(Notifications);
