/**
 * Docsify plugin to insert replace text strings prior to rendering.
 */
const docsifyReplace = (search, replacement) => hook =>
    hook.beforeEach(c => c.replace(search, replacement));

/**
 * Site config to be picked up by docsify for rendering of site.
 */
window.$docsify = {
    name: 'ACA Developer Guide',
    repo: 'acaprojects',
    themeColor: '#414858',
    basePath: '/docs/',
    homepage: 'getting-started/overview.md',
    coverpage: '../../../coverpage/coverpage.md',
    loadNavbar: false,
    loadSidebar: '../../../docs/contents.md',
    subMaxLevel: 2,
    auto2top: true,
    search: {
        noData: `I couldn't find what you are looking for.`
    },
    markdown: {
        smartypants: true,
    },
    plugins: [
        // Insert a hairline space in all instances of ACAEngine to keep nice
        // typography.
        docsifyReplace(/ACAEngine/gi, 'ACA&#8202;Engine')
    ]
};
