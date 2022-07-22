import { google } from 'googleapis';

// If modifying these scopes, delete token.json.
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
];

const googleAuth = new google.auth.GoogleAuth({
  keyFile: "config/service-account.json",
  scopes: SCOPES,
});

export default googleAuth;