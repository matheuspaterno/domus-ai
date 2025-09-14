module.exports = {
  reactStrictMode: true,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  // Server-only secrets are read directly via process.env on the server
  // RECAPTCHA_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE[_KEY]
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  images: {
    domains: ['example.com'], // Add any domains you want to allow for images
  },
  // Additional Next.js configuration options can be added here
};