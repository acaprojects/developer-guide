/*
 * Based on the original docsify sw.js (Copyright 2016 @huxpro)
 * Licensed under Apache 2.0.
 *
 * Service worker that locally caching doc contents for offline access.
 */

const RUNTIME = 'aca-docs';

const WHITELIST = [
    self.location.hostname,
    'fonts.gstatic.com',
    'fonts.googleapis.com',
    'unpkg.com'
];

const useCache = (url) => WHITELIST.includes(new URL(url).hostname);

// Map a request object to a cache busted URL that can be passed to fetch.
const getFixedUrl = (req) => {
    const url = new URL(req.url);

    url.protocol = self.location.protocol;

    // FIXME remove when { cache: 'no-store' } is properly supported by fetch.
    // https://bugs.chromium.org/p/chromium/issues/detail?id=453190
    if (url.hostname === self.location.hostname) {
        url.search += `${url.search ? '&' : '?'}cache-bust=${Date.now()}`;
    }

    return url.href;
};

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    if (useCache(event.request.url)) {
        const cached = caches.match(event.request);
        const fixedUrl = getFixedUrl(event.request);
        const fetched = fetch(fixedUrl, { cache: 'no-store' });
        const fetchedCopy = fetched.then(resp => resp.clone());

        // Call respondWith() with whatever we get first.
        // If the fetch fails (e.g disconnected), wait for the cache.
        // If there’s nothing in cache, wait for the fetch.
        // If neither yields a response, return offline pages.
        event.respondWith(
            Promise.race([fetched.catch(() => cached), cached])
                .then(resp => resp || fetched)
                .catch(() => { /* eat any errors */ })
        );

        // Update the cache with the version we fetched (only for ok status)
        event.waitUntil(
            Promise.all([fetchedCopy, caches.open(RUNTIME)])
                .then(([response, cache]) => response.ok && cache.put(event.request, response))
                .catch(() => { /* eat any errors */ })
        );
    }
});
