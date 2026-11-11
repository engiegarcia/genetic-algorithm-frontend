/*
 * En Vercel la URL del backend es obligatoria: sin ella la página llamaría a localhost y fallaría
 * en el navegador del usuario. Se exige https porque una página https no puede llamar a http.
 */
if (process.env.VERCEL) {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) {
    throw new Error(
      'Falta NEXT_PUBLIC_API_URL: defínela en Vercel (Settings → Environment Variables) con la URL del backend en Render.',
    );
  }
  if (!api.startsWith('https://')) {
    throw new Error(
      `NEXT_PUBLIC_API_URL debe empezar con https:// en Vercel (valor actual: ${api}).`,
    );
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
