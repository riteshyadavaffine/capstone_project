import { createApp } from './app.js';
import { env } from './env.js';
import './db.js';

const app = createApp();

app.listen(env.port, () => {
  console.log(`SupportPilot API listening on http://localhost:${env.port}`);
});

