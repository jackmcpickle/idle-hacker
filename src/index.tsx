import { createRoot } from 'react-dom/client';
import { App } from '@/components/App';

import '@/index.css';

const app = document.getElementById('app') || document.createElement('div');
const root = createRoot(app); // createRoot(container!) if you use TypeScript

root.render(<App />);
