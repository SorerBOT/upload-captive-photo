// Needs cleanup and more modifications for your use.
// Have token.json be an empty JSON ("{}"), we'll save the account creds there.
// To create credentials.json, see https://rclone.org/drive
const fs = require('fs');
fsp = fs.promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive']; // Scope for everything
const TOKEN_PATH = path.join(process.cwd(), 'token.json'); // Per user token
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json'); // Global keys (client ID / secret, etc)

async function saveCredentials(client) {
    const content = await fsp.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fsp.writeFile(TOKEN_PATH, payload);
}

async function loadCredentials() {
  try {
    const content = await fsp.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function authorize() {
  let client = await loadCredentials();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

async function uploadMultipart(drive, localPath, mimeType, folderId) {
    const requestBody = {
      name: path.basename(localPath),
      fields: 'id',
    };
    if (folderId) {
      requestBody.parents = [folderId]
    }
    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(localPath),
    };
    try {
      const file = await drive.files.create({
        requestBody,
        media: media,
      });
      console.log('File Id:', file.data.id);
      return file.data.id;
    } catch (err) {
      // TODO(developer) - Handle error
      throw err;
    }
}

async function getFolderID(drive, folderPath) {
  const splitPath = folderPath.split(path.sep);
  var folderId = null;
  while (splitPath.length)
  {
    const currentFolder = splitPath.shift();
    const requestBody = {
      fields: 'files(id, name)',
    }
    if (folderId) {
      requestBody.parents = [folderId]
    }
    const res = await drive.files.list(requestBody);
    const files = res.data.files;
    for (const x in files) {
      const file = files[x]
      if (file.name == currentFolder) {
        folderId = file.id;
      }
    }
  }
  return folderId;
}

async function main()
{
    var client = await authorize();
    var drive = google.drive({version: 'v3', auth: client});
    //await listFiles(drive);
    var testFolderID = await getFolderID(drive, "test/in_test")
    console.log("test folder id = " + testFolderID)
    await uploadMultipart(drive, "photo.jpg", "image/jpeg", testFolderID);
}
main()
