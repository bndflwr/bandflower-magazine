// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import pagefind from "astro-pagefind";

import icon from "astro-icon";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [pagefind(), icon(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Azeret Mono",
      cssVariable: "--font-azeret-mono",
      fallbacks: ["monospace"],
      weights: [400, 500, 600, 700],
      styles: ["normal", "italic"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Blackout Midnight",
      cssVariable: "--font-blackout-midnight",
    },
    {
      provider: fontProviders.fontsource(),
      name: "Blackout Two AM",
      cssVariable: "--font-blackout-two-am",
    },
  ],
});