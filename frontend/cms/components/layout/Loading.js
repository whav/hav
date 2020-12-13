import { Spinner } from "theme-ui";

const Loading = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div>
        <Spinner className="animte-spin" />
      </div>
    </div>
  );
};

export default Loading;
