import React from "react";
const Loader = require("react-loader");

var options = {
  lines: 13,
  length: 10,
  width: 10,
  radius: 30,
  scale: 1.0,
  corners: 1,
  color: "#000",
  opacity: 0.25,
  rotate: 0,
  direction: 1,
  speed: 1,
  trail: 60,
  fps: 20,
  zIndex: 2e9,
  top: "50%",
  left: "50%",
  shadow: false,
  hwaccel: false,
  position: "absolute",
};
const LoaderSpinner = () => (
  <div>
    <Loader loaded={false} options={options} className="loader" />
  </div>
);

export default LoaderSpinner;
