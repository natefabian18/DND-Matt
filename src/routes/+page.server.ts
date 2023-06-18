import { error } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

export async function load() {
	try {
		const FileList = await fs.readdir(path.join('static/Maps/'));

		return {
			summaries: 'Hello',
			FileList
		};
	} catch (e) {
		throw error(500, { message: `Failed to load map list. ${JSON.stringify(e)}` });
	}
}
