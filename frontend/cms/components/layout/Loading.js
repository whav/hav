import { SpinnerIcon } from "../icons";

const Loading = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center text-xl">
        <SpinnerIcon className="block m-auto w-10 h-10 text-blue-500 animate-spin" />
        <h2 className="text-gray-300 pt-10">Loading</h2>
      </div>
    </div>
  );
};

export default Loading;
