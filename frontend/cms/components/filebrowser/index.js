import React from "react";
import ReactMarkDown from "react-markdown";
import {ReadMoreMore} from "read-more-more";

const Description = ({ text }) => {
  return <>
		{ text.length > 700 ?
		<ReadMoreMore text={<ReactMarkDown className="prose mb-10">{text}</ReactMarkDown>}
          parseHTML='true'
	      linesToShow='10'
		  btnStyles={{ float: "right" }}
          transDuration='.5' />
		: <ReactMarkDown className="prose mb-10">{text}</ReactMarkDown>}
	</>;
};

export { Description };
