import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// Import dependencies at the top
import { Buffer } from 'buffer';
import crypto from 'crypto-browserify';

window.Buffer = Buffer;
// window.crypto = crypto;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
