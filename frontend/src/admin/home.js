/**
 * Created by sean on 01/02/17.
 */
import React from "react";
import { MultiTagField } from "./ui/components/autocomplete";

const Welcome = () => {
  return (
    <div className="content">
      <h1>HAV Dashboard</h1>
      <p>Please use the menu on the left.</p>

      <h2>Tag Test</h2>
      <MultiTagField />
    </div>
  );
};

export default Welcome;
