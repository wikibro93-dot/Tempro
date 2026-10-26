export default function handler(request, response) {
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.status(404).send(`
    <!DOCTYPE html>
    <html>
      <head><title>404 - Page Not Found</title></head>
      <body>
        <h1>404 - Page Not Found</h1>
        <p>The page you requested does not exist.</p>
      </body>
    </html>
  `);
}
