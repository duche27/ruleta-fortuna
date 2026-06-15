import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import {resolve} from 'path';
import sirv from 'sirv';

const isCapacitor = process.env.CAPACITOR === 'true';
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const base = isCapacitor ? './' : (isGitHubPages ? '/ruleta-fortuna/' : '/');

export default defineConfig({
    base,
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                {src: 'assets', dest: '.'},
                {src: 'questions_and_answers', dest: '.'},
                {src: 'favicon.png', dest: '.'},
                {src: 'app.webmanifest', dest: '.'}
            ]
        }),
        {
            name: 'serve-legacy-static',
            configureServer(server) {
                server.middlewares.use('/assets', sirv(resolve('assets'), {dev: true, etag: true}));
                server.middlewares.use('/questions_and_answers', sirv(resolve('questions_and_answers'), {dev: true, etag: true}));
                server.middlewares.use('/favicon.png', sirv(resolve('.'), {dev: true}));
                server.middlewares.use('/app.webmanifest', sirv(resolve('.'), {dev: true}));
            }
        }
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    },
    server: {
        port: 5173,
        fs: {allow: ['.']}
    },
    preview: {
        port: 4173
    }
});
