import 'piccolore';
import { p as decodeKey } from './chunks/astro/server_CbQT0PAA.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_0SgSHxjX.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///root/status-page/","cacheDir":"file:///root/status-page/node_modules/.astro/","outDir":"file:///root/status-page/dist/","srcDir":"file:///root/status-page/src/","publicDir":"file:///root/status-page/public/","buildClientDir":"file:///root/status-page/dist/client/","buildServerDir":"file:///root/status-page/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/.pnpm/astro@5.18.0_jiti@2.6.1_lightningcss@1.31.1_rollup@4.59.0_typescript@5.9.3/node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/metrics.json","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/metrics\\.json\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"metrics.json","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/metrics.json.ts","pathname":"/api/metrics.json","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.Bgwu3osd.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/root/status-page/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/api/metrics.json@_@ts":"pages/api/metrics.json.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/.pnpm/astro@5.18.0_jiti@2.6.1_lightningcss@1.31.1_rollup@4.59.0_typescript@5.9.3/node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_nK4stD8U.mjs","/root/status-page/node_modules/.pnpm/astro@5.18.0_jiti@2.6.1_lightningcss@1.31.1_rollup@4.59.0_typescript@5.9.3/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_B0XtY5FW.mjs","/root/status-page/src/components/ModeToggle":"_astro/ModeToggle.B7fXlm44.js","/root/status-page/src/components/metrics-dashboard":"_astro/metrics-dashboard.j1qLvBL9.js","@astrojs/react/client.js":"_astro/client.BgplVUld.js","/root/status-page/src/components/Footer.astro?astro&type=script&index=0&lang.ts":"_astro/Footer.astro_astro_type_script_index_0_lang.w2yyke5k.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/root/status-page/src/components/Footer.astro?astro&type=script&index=0&lang.ts","const y=document.getElementById(\"copy-discord-user\"),o=document.getElementById(\"copy-discord-popover\");let r;const a=e=>{o&&(o.textContent=e,o.classList.remove(\"opacity-0\"),o.classList.add(\"opacity-100\"),r&&clearTimeout(r),r=setTimeout(()=>{o.classList.remove(\"opacity-100\"),o.classList.add(\"opacity-0\")},1600))};y?.addEventListener(\"click\",async()=>{try{await navigator.clipboard.writeText(\"@bviron\"),a(\"Copiado\")}catch{const e=document.createElement(\"input\");e.value=\"@bviron\",document.body.appendChild(e),e.select();const n=document.execCommand(\"copy\");document.body.removeChild(e),a(n?\"Copiado\":\"No se pudo copiar\")}});const s=document.getElementById(\"love-burst-button\"),v=()=>{if(!s||window.matchMedia(\"(prefers-reduced-motion: reduce)\").matches)return;const e=14;for(let n=0;n<e;n+=1){const t=document.createElement(\"span\"),c=Math.PI*2*n/e+Math.random()*.35,d=18+Math.random()*26,i=`${Math.cos(c)*d}px`,p=`${Math.sin(c)*d}px`,m=`${Math.random()*70-35}deg`,l=`${520+Math.random()*320}ms`,u=`${.6+Math.random()*.45}rem`;t.className=\"heart-burst-particle\",t.textContent=\"♥\",t.style.setProperty(\"--dx\",i),t.style.setProperty(\"--dy\",p),t.style.setProperty(\"--rot\",m),t.style.setProperty(\"--dur\",l),t.style.setProperty(\"--size\",u),s.appendChild(t),t.addEventListener(\"animationend\",()=>t.remove(),{once:!0})}};s?.addEventListener(\"click\",v);"]],"assets":["/_astro/fa-brands-400.BP5tdqmh.woff2","/_astro/fa-regular-400.nyy7hhHF.woff2","/_astro/fa-solid-900.DRAAbZTg.woff2","/_astro/index.Bgwu3osd.css","/favicon.ico","/favicon.svg","/_astro/ModeToggle.B7fXlm44.js","/_astro/button.BopsIoKm.js","/_astro/client.BgplVUld.js","/_astro/index.B04Pf2oS.js","/_astro/index.BIIuLtGZ.js","/_astro/metrics-dashboard.j1qLvBL9.js"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"hsO0s8LwBquymWZmwOd3x+3pybpLQ07ZqHe4TLujd1k="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
