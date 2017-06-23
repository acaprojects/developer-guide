window.$docsify = {
    name: 'ACA Developer Guide',
    repo: 'acaprojects',
    themeColor: '#414858',
    basePath: '/docs/',
    homepage: 'getting-started/overview.md',
    coverpage: '../../nav/coverpage.md',
    loadNavbar: false,
    loadSidebar: '../../nav/sidebar.md',
    subMaxLevel: 2,
    auto2top: true,
    search: {
        noData: 'I couldn\'t find what you are looking for.'
    },
    markdown: {
        smartypants: true,
    },
    plugins: [
        h => h.beforeEach(c => c.replace(/ACAEngine/gi, 'ACA&#8202;Engine'))
    ]
};
