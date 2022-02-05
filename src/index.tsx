import { render } from 'react-dom';
import { App } from '@/components/App';

import '@/index.css';

const app = document.getElementById('app') || document.createElement('div');

render(<App />, app);
