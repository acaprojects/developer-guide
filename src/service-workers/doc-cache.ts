/*
 * Based on @huxpro's sw.js (Copyright 2016 @huxpro)
 * Licensed under Apache 2.0.
 *
 * Service worker to locally caching doc contents for offline access.
 */

const sw = self as ServiceWorkerGlobalScope;

const CACHE_NAME = 'aca-docs';

const WHITELIST = [
    sw.location.hostname,
    'fonts.gstatic.com',
    'fonts.googleapis.com',
    'unpkg.com'
];

const BLACKLIST = [
    'localhost'        // Disable cache for local dev
];

type Predicate<T> = (x: T) => boolean;

const isIn = <T>(xs: T[]) => (x: T) => xs.indexOf(x) > -1;

const checkAll = <T>(...p: Array<Predicate<T>>) => (x: T) => p.every(f => f(x));

const useCache = checkAll<URL>(
    url => isIn(WHITELIST)(url.hostname),
    url => !isIn(BLACKLIST)(url.hostname)
);

/**
 * Map a request object to a cache busted URL that can be passed to fetch.
 */
const getFixedUrl = (req: Request) => {
    const url = new URL(req.url);

    url.protocol = self.location.protocol;

    // FIXME remove when { cache: 'no-store' } is properly supported by fetch.
    // https://bugs.chromium.org/p/chromium/issues/detail?id=453190
    if (url.hostname === self.location.hostname) {
        url.search += `${url.search ? '&' : '?'}cache-bust=${Date.now()}`;
    }

    return url.href;
};

sw.addEventListener('activate', event => {
    event.waitUntil(sw.clients.claim());
});

sw.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    if (useCache(requestUrl)) {
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
            Promise.all([fetchedCopy, caches.open(CACHE_NAME)])
                .then(([response, cache]) =>
                    response.ok
                        ? cache.put(event.request, response)
                        : undefined
                )
                .catch(() => { /* eat any errors */ })
        );
    }
});
