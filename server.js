// This tiny server keeps the lesson dependency-free: it only serves files from this folder.
// In a production app, an API route would live on the server too, so secret model
// credentials never need to be placed in browser JavaScript.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ts': 'text/plain; charset=utf-8'
};

const server = http.createServer((request, response) => {
  // Decode only the URL path; query strings are not part of a file name.
  const requestedPath = decodeURIComponent(request.url.split('?')[0]);
  const relativePath = requestedPath === '/' ? '/index.html' : requestedPath;
  const filePath = path.resolve(ROOT, `.${relativePath}`);

  // A simple traversal guard keeps requests inside the project folder.
  if (!filePath.startsWith(ROOT + path.sep)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, file) => {
    if (error) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    const extension = path.extname(filePath);
    response.writeHead(200, {
      'Content-Type': MIME_TYPES[extension] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    response.end(file);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`AI Basics Chatbot Lab listening on port ${PORT}`);
});
