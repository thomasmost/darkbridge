import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

interface IModule {
  hot?: boolean;
}

const render = (module as IModule).hot ? ReactDOM.render : ReactDOM.hydrate;
render(<App />, document.getElementById('root'));
