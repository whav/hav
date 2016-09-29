import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

var url = require('url');
var cs = document.currentScript.src;
var parts = url.parse(cs);
console.log(cs, parts);

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
