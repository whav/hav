import styles from "./Loading.module.css";
import { Spinner } from "theme-ui";

const Loading = () => {
  return (
    <div className={styles.container}>
      <div>
        <Spinner />
      </div>
    </div>
  );
};

export default Loading;
