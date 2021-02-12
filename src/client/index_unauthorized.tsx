import React from 'react';
import ReactDOM from 'react-dom';
import UnauthorizedApp from './apps/UnauthorizedApp';

interface IModule {
  hot?: boolean;
}

const render = (module as IModule).hot ? ReactDOM.render : ReactDOM.hydrate;
render(<UnauthorizedApp />, document.getElementById('root'));
