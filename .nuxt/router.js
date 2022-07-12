import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _82725e76 = () => interopDefault(import('..\\pages\\about.vue' /* webpackChunkName: "pages/about" */))
const _fac2262e = () => interopDefault(import('..\\pages\\archives.vue' /* webpackChunkName: "pages/archives" */))
const _0585a872 = () => interopDefault(import('..\\pages\\link.vue' /* webpackChunkName: "pages/link" */))
const _503d43ea = () => interopDefault(import('..\\pages\\love.vue' /* webpackChunkName: "pages/love" */))
const _174fcf82 = () => interopDefault(import('..\\pages\\message.vue' /* webpackChunkName: "pages/message" */))
const _86ff8354 = () => interopDefault(import('..\\pages\\shuoshuo.vue' /* webpackChunkName: "pages/shuoshuo" */))
const _71b74f26 = () => interopDefault(import('..\\pages\\categories\\_slug.vue' /* webpackChunkName: "pages/categories/_slug" */))
const _74c54acf = () => interopDefault(import('..\\pages\\posts\\_slug.vue' /* webpackChunkName: "pages/posts/_slug" */))
const _2b140909 = () => interopDefault(import('..\\pages\\tags\\_slug.vue' /* webpackChunkName: "pages/tags/_slug" */))
const _4302a8ec = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: '/',
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/about",
    component: _82725e76,
    name: "about"
  }, {
    path: "/archives",
    component: _fac2262e,
    name: "archives"
  }, {
    path: "/link",
    component: _0585a872,
    name: "link"
  }, {
    path: "/love",
    component: _503d43ea,
    name: "love"
  }, {
    path: "/message",
    component: _174fcf82,
    name: "message"
  }, {
    path: "/shuoshuo",
    component: _86ff8354,
    name: "shuoshuo"
  }, {
    path: "/categories/:slug?",
    component: _71b74f26,
    name: "categories-slug"
  }, {
    path: "/posts/:slug?",
    component: _74c54acf,
    name: "posts-slug"
  }, {
    path: "/tags/:slug?",
    component: _2b140909,
    name: "tags-slug"
  }, {
    path: "/",
    component: _4302a8ec,
    name: "index"
  }],

  fallback: false
}

export function createRouter (ssrContext, config) {
  const base = (config._app && config._app.basePath) || routerOptions.base
  const router = new Router({ ...routerOptions, base  })

  // TODO: remove in Nuxt 3
  const originalPush = router.push
  router.push = function push (location, onComplete = emptyFn, onAbort) {
    return originalPush.call(this, location, onComplete, onAbort)
  }

  const resolve = router.resolve.bind(router)
  router.resolve = (to, current, append) => {
    if (typeof to === 'string') {
      to = normalizeURL(to)
    }
    return resolve(to, current, append)
  }

  return router
}
