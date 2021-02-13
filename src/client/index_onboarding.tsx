import React from 'react';
import ReactDOM from 'react-dom';
import OnboardingApp from './apps/OnboardingApp';

interface IModule {
  hot?: boolean;
}

const render = (module as IModule).hot ? ReactDOM.render : ReactDOM.hydrate;
render(<OnboardingApp />, document.getElementById('root'));
