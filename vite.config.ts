import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

import { PluginValue } from './Socket/socket.js';

export default defineConfig({
	plugins: [sveltekit(), PluginValue],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
