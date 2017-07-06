import { Plugin } from './docsify-plugin';

/**
 * Insert a hairline space in all mentioned of ACAEngine so we keep nice
 * typography.
 */
const insertHairspaceInBrand: Plugin = hook =>
    hook.beforeEach(c => c.replace(/ACAEngine/gi, 'ACA&#8202;Engine'));

/**
 * Site config to be picked up by docsify for rendering of site.
 */
(window as any).$docsify = {
    name: 'ACA Developer Guide',
    repo: 'acaprojects',
    themeColor: '#414858',
    homepage: 'getting-started/overview.md',
    coverpage: 'coverpage.md',
    loadNavbar: false,
    loadSidebar: 'contents.md',
    subMaxLevel: 2,
    auto2top: true,
    search: {
        noData: `I couldn't find what you are looking for.`
    },
    markdown: {
        smartypants: true,
    },
    plugins: [
        insertHairspaceInBrand
    ]
};
