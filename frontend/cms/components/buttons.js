const Button = ({ className = "", primary = false, children, ...props }) => {
  let cn =
    "bg-grey-300 hover:bg-grey-400 text-white font-bold py-2 px-4 rounded inline-flex items-center";
  let modifiers = "";
  if (primary) {
    modifiers = "bg-blue-400 hover:bg-blue-500";
  }
  return (
    <button className={`${className} ${modifiers} ${cn}`}>{children}</button>
  );
};

export { Button };
