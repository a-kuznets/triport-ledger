import { google } from 'googleapis';
import auth from './auth.js';

const googleDrive = google.drive({
  version: "v3",
  auth
});

export default googleDrive;