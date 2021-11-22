import * as React from 'react';
import { render } from 'react-dom';
import { App } from './components/App';

const app = document.getElementById('app') || document.createElement('div');

// Inject our app into the DOM
render(<App />, app);

if (import.meta.hot) {
  import.meta.hot.accept();
}
