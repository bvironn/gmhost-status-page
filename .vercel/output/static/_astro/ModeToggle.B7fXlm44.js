import{c as n,j as e,B as l}from"./button.BopsIoKm.js";import{r as a}from"./index.BIIuLtGZ.js";/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]],d=n("moon",m);/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]],h=n("sun",i),k="theme";function u(){return document.documentElement.classList.contains("dark")?"dark":"light"}function y(){const[s,o]=a.useState("light");a.useEffect(()=>{o(u())},[]);const c=a.useCallback(()=>{const t=s==="dark"?"light":"dark",r=t==="dark";document.documentElement.classList.toggle("dark",r),localStorage.setItem(k,t),o(t)},[s]);return e.jsxs(l,{variant:"outline",size:"icon",onClick:c,"aria-label":"Toggle theme",children:[e.jsx(h,{className:"h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"}),e.jsx(d,{className:"absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"}),e.jsx("span",{className:"sr-only",children:"Toggle theme"})]})}export{y as default};
