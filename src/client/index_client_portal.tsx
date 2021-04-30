import React from 'react';
import ReactDOM from 'react-dom';
import SecuredClientPortal from './apps/SecuredClientPortal';

interface IModule {
  hot?: boolean;
}

const render = (module as IModule).hot ? ReactDOM.render : ReactDOM.hydrate;
render(<SecuredClientPortal />, document.getElementById('root'));
