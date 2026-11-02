import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const layout = (name) => fileURLToPath(new URL(`./src/lib/layouts/${name}.svelte`, import.meta.url));

export default defineConfig({
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx'],
      preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx'], layout: { runbook: layout('runbook') } })],
      adapter: adapter(),
      prerender: { entries: ['/kb'] },
      inlineStyleThreshold: Infinity,
    }),
  ],
});
