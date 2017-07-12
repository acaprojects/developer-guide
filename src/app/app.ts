// Setup docsify for client side md rendering
import './docsify-conf';
import 'docsify';
import 'docsify/lib/plugins/search';

// Prism for readable code snippets



if (typeof navigator.serviceWorker !== 'undefined') {
    navigator.serviceWorker.register('doc-cache.js');
}
