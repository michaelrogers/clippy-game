import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import 'react-mdl/extra/material.css';
// import 'react-mdl/extra/material.js';
// import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
