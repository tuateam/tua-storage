/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.2/workbox-sw.js");

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "96871f891203c10bc776289086289ae7"
  },
  {
    "url": "assets/css/1.styles.3ac4ce2d.css",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "assets/css/2.styles.9d3b15ac.css",
    "revision": "df7c35ec8029dbbde0735a45f875eaf7"
  },
  {
    "url": "assets/css/styles.8a2ba78e.css",
    "revision": "70decdd9b1b1ee38d07d58dab68bd9d0"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/1.3ac4ce2d.js",
    "revision": "aa0a3e3ca70cfb3cbf1c8c7dd2c544d9"
  },
  {
    "url": "assets/js/2.9d3b15ac.js",
    "revision": "bcc486eea5a9b9b81519cb7ff4663161"
  },
  {
    "url": "assets/js/3.d4de7ce2.js",
    "revision": "6c0eb1ebaeaa0aa0e1d94fb1420edf8b"
  },
  {
    "url": "assets/js/4.e19fd72a.js",
    "revision": "e1e1c6d3ea580d5b078a18e89a16b157"
  },
  {
    "url": "assets/js/5.8de9aff8.js",
    "revision": "33cec0252ab5787da5d13c4f51ee1cdd"
  },
  {
    "url": "assets/js/6.399cf083.js",
    "revision": "fd18643fabee16fe5007bc34e3c0f0d1"
  },
  {
    "url": "assets/js/7.3c74a60d.js",
    "revision": "33b02217603394dec8df7d4c3430fd2e"
  },
  {
    "url": "assets/js/8.2be0cfe3.js",
    "revision": "199d68957e56af479cb0eab56298f431"
  },
  {
    "url": "assets/js/9.9ef19f30.js",
    "revision": "56066f5e0c2389b22f5c8d018dab206a"
  },
  {
    "url": "assets/js/app.8a2ba78e.js",
    "revision": "c1193f3b6674c737eb7274e92828d16f"
  },
  {
    "url": "config-methods/default.html",
    "revision": "54a0d5ddc82fb9778092965a87f576a3"
  },
  {
    "url": "config-methods/index.html",
    "revision": "155279bfe75bebe78d4182908158d8e7"
  },
  {
    "url": "config-methods/methods.html",
    "revision": "eb6647588a6a3d1b544d816a4bf35f01"
  },
  {
    "url": "index.html",
    "revision": "0f51e6df704e9e79fca7e1727c36e1a2"
  },
  {
    "url": "logo.png",
    "revision": "7f5f5300ded88b992de697c61021a507"
  },
  {
    "url": "quick-start/index.html",
    "revision": "b52ad3f0f37a119c3f2f49cc44209949"
  },
  {
    "url": "quick-start/installation.html",
    "revision": "4d0c2d3ad18168ebbd0977769c9303b8"
  },
  {
    "url": "quick-start/sync-data.html",
    "revision": "f64bf216293a5452e3afd18b67ed4419"
  },
  {
    "url": "standard.svg",
    "revision": "92650602b63995390fc74b25ea4bd501"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})