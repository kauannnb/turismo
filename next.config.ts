import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Ao mexer aqui, atualize também ALLOWED_IMAGE_HOSTS em src/lib/form.ts:
    // é ele que valida as URLs digitadas no painel. Host fora desta lista
    // passa no formulário e o next/image recusa em tempo de execução.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
