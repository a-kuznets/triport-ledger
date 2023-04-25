import { google } from 'googleapis';
import auth from './auth.js';

const googleSheets = google.sheets({
  version: "v4",
  auth
});

export default googleSheets;