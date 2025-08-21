module.exports = {
  reactStrictMode: true,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  images: {
    domains: ['example.com'], // Add any domains you want to allow for images
  },
  // Additional Next.js configuration options can be added here
};