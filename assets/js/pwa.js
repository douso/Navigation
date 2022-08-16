/**
 * sw.js
 * service worker注册之后install事件会触发
 */

 const CACHE_NAME = 'pwa_v1'
 // 需要缓存的页面
 const urls = [
   '/pwa/index.html',
   '/pwa/manifest.json'
 ]
 
 self.addEventListener('install', async event => {
   const cache = await caches.open(CACHE_NAME)
   await cache.addAll(urls) // 缓存页面
   // 跳过等待事件, skip the service worker's waiting phase 
   await self.skipWaiting()
 
   // 写法2
   // event.waitUntil(
   //   caches.open(CACHE_NAME).then((cache) => {
   //     cache.addAll(urls)
   //     self.skipWaiting() // 返回的是一个promise
   //   }).catch((err) => {
   //     console.log('缓存失败', err)
   //   })
   // )
 })
 
 /**
  * 在该事件中可以用来删除旧的缓存
  */
 self.addEventListener('activate', async event => {
   // 立即获取控制权
   // 获取所有的缓存keys
   const keys = caches.keys();
   (await keys).forEach((key) => {
     if (key !== CACHE_NAME) {
       caches.delete(key)
     }
   })
   // 将自己设置为控制器
   await self.clients.claim()
 })
 
 /**
  * 每次任何被 service worker 控制的资源被请求到时，都会触发 fetch 事件
  */
 self.addEventListener('fetch', (event) => {
   // 网络优先和缓存优先
   // 判断是否同源, 不缓存外部来的资源，否则可能会导致灾难性的后果
   const req = event.request
   const url = new URL(req.url)
   if (url.origin !== self.origin) { return }
 
   // console.log(url, url.origin, self.origin)
   let data
   if (url.pathname.indexOf('/api') !== -1) {
     // 动态请求的数据, 网络优先
     data = networkFirst(req)
   } else {
     // 静态资源,缓存优先
     data = cacheFirst(req)
   }
 })
 
 // 网络优先
 async function networkFirst (req) {
   // 先从网络中拿，请求失败的情况再使用缓存
   const cache = await caches.open(CACHE_NAME)
   try {
     const fresh = await fetch(req)
     // 网络中拿到的数组保存到缓存中，确保缓存中的数据是最新的数据
     cache.put(req, fresh.clone()) // 需要拷贝一份来存，不然后面无法使用fresh
     return fresh
   } catch (error) {
     return await cache.match(req)
   }
 }
 
 // 缓存优先
 async function cacheFirst (req) {
   // 先从缓存拿，拿不到再从网络中拿
   const cache = await caches.open(CACHE_NAME)
   const cached = await cache.match(req)
   if (cached) {
     return cached
   } else {
     const fresh = await fetch(req)
     // 网络中拿到的数组保存到缓存中
     cache.put(req, fresh.clone())
     return fresh
   }
 }