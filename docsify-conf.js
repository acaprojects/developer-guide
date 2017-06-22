window.$docsify = {
    name: 'ACA Developer Guide',
    repo: 'acaprojects',
    themeColor: '#414858',
    coverpage: true,
    loadNavbar: true,
    loadSidebar: true,
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
    ],
    alias: {
        '/overview': 'README.md'
    }
};
