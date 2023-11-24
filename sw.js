
//* Importaciones
importScripts('assets/js/sw-utils.js');

const STATIC_CACHE_NAME    = 'static-v2';
const DYNAMIC_CACHE_NAME   = 'dinamic-v1';
const INMUTABLE_CACHE_NAME = 'inmutable-v1';
const DYNAMIC_CACHE_LIMIT  = 50;

const APP_SHELL = [
    /* '/', */
    'index.html',
    'assets/css/style.css',
    'assets/img/favicon.ico',
    'assets/img/avatars/hulk.jpg',
    'assets/img/avatars/ironman.jpg',
    'assets/img/avatars/spiderman.jpg',
    'assets/img/avatars/thor.jpg',
    'assets/img/avatars/wolverine.jpg',
    'assets/js/app.js',
    'assets/js/sw-utils.js'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'assets/css/animate.css',
    'assets/libs/jquery.js'
];

const cacheStaticProm = caches.open( STATIC_CACHE_NAME )
    .then( cache => {
        return cache.addAll( APP_SHELL );
    });

const cacheInmutableProm = caches.open( INMUTABLE_CACHE_NAME )
    .then( cache => {
        return cache.addAll( APP_SHELL_INMUTABLE );
    });

function limpiarCache( cacheName, numeroItems ) {

    caches.open( cacheName )
        .then( cache => {

            return cache.keys()
                .then( keys => {
                    if ( keys.length > numeroItems ) {
                        cache.delete( keys[0] )
                            .then(
                                limpiarCache( cacheName, numeroItems )
                            );
                    }
                });
        });
}

self.addEventListener('install', e => {
    e.waitUntil( Promise.all([ cacheStaticProm, cacheInmutableProm ]) );
});

self.addEventListener('activate', e => {

    const deleteCacheOld = caches.keys().then( keys => {

        keys.forEach( key => {
            if ( key !== STATIC_CACHE_NAME && key.includes('static') ) {
                return caches.delete( key );
            }
        });
    });

    e.waitUntil( deleteCacheOld );
});

self.addEventListener('fetch', e => {
    
    const respuesta = caches.match( e.request ).then( res => {
        
        if ( res ) { return res; }

        //* Validar si hay solicitudes internas
        //console.log(e.request.url);

        return fetch( e.request ).then( newRes => {            
            return actualizarCacheDinamico( DYNAMIC_CACHE_NAME, e.request, newRes );        
        });
    });

    e.respondWith( respuesta );
});