import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  images : {
    remotePatterns: [
      new URL("https://assets.pokemon.com/assets/cms2/img/pokedex/full/**")
    ]
  }
};

export default nextConfig;
