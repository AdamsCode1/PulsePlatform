// Vercel serverless function that wraps the Express app
export default async function handler(req, res) {
  // Dynamically import the Express app
  const { default: app } = await import('../server/index.ts');
  
  // Handle the request with Express
  return app(req, res);
}
