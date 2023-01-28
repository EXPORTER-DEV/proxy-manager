/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFileSync } from 'fs';
import path from 'path';

export const getData = <T = any>(directory: string) => (filename: string): T => {
	return JSON.parse(readFileSync(path.join(directory, `${filename}.json`), 'utf-8'));
};