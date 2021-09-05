import React from "react";
import useSWR from "swr";
import fetcher from "../utils/fetcher";

const ImageMedia = ({ title, thumbnail, aspect_ratio, srcset=[] }) => {
    let srcset_attr = '';
    if (srcset.length) {
        srcset_attr = srcset.map(([width, url]) => `${url} ${width}w`).join(', ')
    }
    let width = 'auto';
    if (aspect_ratio) {
        width = Math.floor(
            Math.sqrt(4800 * 6 * aspect_ratio)
        )
        width = `${width}px`
    }
    return <img className={"preview-image"} alt={title} style={{width}} src={thumbnail} srcSet={srcset_attr}/>;
};

const MediaSwitch = (props) => {
  return <ImageMedia {...props} />;
};

const Media = (props) => {
  const { id, caption, sizes, width } = props;
  const { data, error } = useSWR(`/d/api/public/media/${id}/`, fetcher);

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  // return <ImageMedia {...data} />;
  return (
    <a href={data.url}>
        <figure className="tile">
            <div className="preview">
                <MediaSwitch {...data} {...props} />
            </div>
            <figcaption className={"caption"}>{caption}</figcaption>
        </figure>
    </a>
  );
};

export default Media;
