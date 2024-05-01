"use strict";(self.webpackChunkgatsby_starter_lavender=self.webpackChunkgatsby_starter_lavender||[]).push([[245],{454:function(e){var t="%[a-f0-9]{2}",r=new RegExp("("+t+")|([^%]+?)","gi"),n=new RegExp("("+t+")+","gi");function o(e,t){try{return[decodeURIComponent(e.join(""))]}catch(a){}if(1===e.length)return e;t=t||1;var r=e.slice(0,t),n=e.slice(t);return Array.prototype.concat.call([],o(r),o(n))}function a(e){try{return decodeURIComponent(e)}catch(a){for(var t=e.match(r)||[],n=1;n<t.length;n++)t=(e=o(t,n).join("")).match(r)||[];return e}}e.exports=function(e){if("string"!=typeof e)throw new TypeError("Expected `encodedURI` to be of type `string`, got `"+typeof e+"`");try{return e=e.replace(/\+/g," "),decodeURIComponent(e)}catch(t){return function(e){for(var r={"%FE%FF":"��","%FF%FE":"��"},o=n.exec(e);o;){try{r[o[0]]=decodeURIComponent(o[0])}catch(t){var i=a(o[0]);i!==o[0]&&(r[o[0]]=i)}o=n.exec(e)}r["%C2"]="�";for(var l=Object.keys(r),s=0;s<l.length;s++){var c=l[s];e=e.replace(new RegExp(c,"g"),r[c])}return e}(e)}}},3055:function(e){e.exports=function(e,t){for(var r={},n=Object.keys(e),o=Array.isArray(t),a=0;a<n.length;a++){var i=n[a],l=e[i];(o?-1!==t.indexOf(i):t(i,l,e))&&(r[i]=l)}return r}},5339:function(e,t,r){r.r(t),r.d(t,{default:function(){return U}});var n=r(6540);let o=function(e){return e.ALL="All",e}({});var a=r(4490);const i=(0,a.I4)("section",{margin:"2rem auto",padding:"1rem",borderLeft:"0.25rem solid $borderPrimary",transition:"border-left-color $transitionDuration $transitionTiming"}),l=(0,a.I4)("h3",{display:"block",color:"$text300",transition:"color $transitionDuration $transitionTiming"}),s=(0,a.I4)("input",{maxWidth:"18.75rem",width:"100%",height:"2.5rem",marginTop:"1rem",padding:"0.5rem 0.75rem",border:"1px solid $borderGray",borderRadius:"0.25rem",color:"$text500",fontSize:"1rem",backgroundColor:"$titleFilterBackground",transition:"color $transitionDuration $transitionTiming, border-color $transitionDuration $transitionTiming, background-color $transitionDuration $transitionTiming",appearance:"none"}),c=(0,a.I4)("div",{display:"flex",flexWrap:"wrap",gap:"0.5rem",marginTop:"1rem"}),u=(0,a.I4)("button",{padding:"0.5rem 1rem",border:0,borderRadius:"0.25rem",color:"$tagColor",fontSize:"0.875rem",backgroundColor:"$tagFilterBackground",cursor:"pointer",transition:"color $transitionDuration $transitionTiming, background-color $transitionDuration $transitionTiming",appearance:"none",variants:{filtered:{true:{color:"$primary500",backgroundColor:"$primary200"}}}}),d=e=>{let{tags:t,currentTag:r,setCurrentTag:a,titleFilter:d,onTitleFilterChange:p}=e;const m=(0,n.useCallback)((e=>{const t=e.target.dataset.tag;a(t)}),[a]);return n.createElement(i,null,n.createElement(l,null,"Filter"),n.createElement(s,{type:"text",placeholder:"Article name..",value:d,onChange:p}),n.createElement(c,null,n.createElement(u,{type:"button","data-tag":o.ALL,onClick:m,filtered:r===o.ALL},o.ALL),t.map((e=>n.createElement(u,{type:"button",key:e,"data-tag":e,onClick:m,filtered:r===e},e)))))};var p=(0,n.memo)(d),m=r(8007);const f=(0,a.I4)("header",{margin:"1rem auto"}),g=(0,a.I4)("h2",{fontSize:"1.5rem",a:{color:"$text500",transition:"color $transitionDuration $transitionTiming"}}),v=(0,a.I4)("section",{marginBottom:"3rem",color:"$text200",transition:"color $transitionDuration $transitionTiming"}),y=e=>{let{slug:t,title:r,description:o}=e;return n.createElement("li",{key:t},n.createElement("br",null),n.createElement("article",{className:"post-list-item",itemScope:!0,itemType:"http://schema.org/Article"},n.createElement(f,null,n.createElement(g,null,n.createElement(m.Link,{to:t,itemProp:"url"},n.createElement("span",{itemProp:"headline"},r)))),n.createElement(v,null,n.createElement("p",{dangerouslySetInnerHTML:{__html:o},itemProp:"description"}))))};var b=(0,n.memo)(y);const h=(0,a.I4)("ol",{marginLeft:0,listStyle:"none"}),k=e=>{let{posts:t}=e;return n.createElement(h,null,t.map((e=>{var t,r,o,a,i,l,s,c,u;if(void 0===e)return null;const d=null!==(t=null!==(r=null===(o=e.frontmatter)||void 0===o?void 0:o.title)&&void 0!==r?r:null===(a=e.fields)||void 0===a?void 0:a.slug)&&void 0!==t?t:"",p=null!==(i=null===(l=e.fields)||void 0===l?void 0:l.slug)&&void 0!==i?i:"",m=null!==(s=null!==(c=null===(u=e.frontmatter)||void 0===u?void 0:u.description)&&void 0!==c?c:e.excerpt)&&void 0!==s?s:"";return n.createElement(b,{key:p,title:d,slug:p,description:m})})))};var E=(0,n.memo)(k),$=r(6783),S=r(7397);const F=(e,t)=>{const r=function(e,t){void 0===t&&(t={});const{0:r,1:o}=(0,n.useState)(null),{0:a,1:i}=(0,n.useState)(!1),l=(0,n.useRef)(null);return(0,n.useEffect)((()=>{o(e.current)}),[e]),(0,n.useEffect)((()=>{var e,n;if(null!==r)return null===(e=l.current)||void 0===e||e.disconnect(),l.current=new IntersectionObserver((e=>{let[t]=e;i(t.isIntersecting)}),{...t}),null===(n=l.current)||void 0===n||n.observe(r),()=>{var e;null===(e=l.current)||void 0===e||e.disconnect()}}),[r,t]),a}(e,{threshold:0});(0,n.useEffect)((()=>{r&&t()}),[r,t])};var j=r(4050);const x="__lavender__/page",L=(w=1,Number(null!==(I=null===j.z||void 0===j.z?void 0:j.z.sessionStorage.getItem(x))&&void 0!==I?I:w));var w,I;const C=()=>{const{0:e,1:t}=(0,n.useState)(L);return[e,e=>{t(e),(e=>{null===j.z||void 0===j.z||j.z.sessionStorage.setItem(x,e.toString())})(e)}]};var A=r(6663);const O=()=>{const{0:e,1:t}=(0,n.useState)(""),r=((e,t)=>{const{0:r,1:o}=(0,n.useState)(e);return(0,n.useEffect)((()=>{const r=setTimeout((()=>{o(e)}),t);return()=>{clearTimeout(r)}}),[e,t]),r})(e,300),o=()=>{const e=A.parse(location.search).search;t(null!=e?e:"")};return(0,n.useEffect)((()=>{const e=A.parse(location.search),{search:r}=e;return r&&t(r),window.addEventListener("popstate",o),()=>{window.removeEventListener("popstate",o)}}),[]),(0,n.useEffect)((()=>{var e;const t=A.parse(location.search);if(r===(null!==(e=t.search)&&void 0!==e?e:""))return;t.search=r;const n=A.stringifyUrl({url:location.pathname,query:t},{skipNull:!0,skipEmptyString:!0});history.pushState(t,"",n)}),[r]),[e,t]};var T=r(4125);const N=()=>{const{0:e,1:t}=(0,n.useState)(o.ALL),r=()=>{const e=A.parse(location.search).tag;t(null!=e?e:o.ALL)};return(0,n.useEffect)((()=>{const e=A.parse(location.search).tag;return e&&t(e),window.addEventListener("popstate",r),()=>{window.removeEventListener("popstate",r)}}),[]),(0,n.useEffect)((()=>{var t;const r=A.parse(location.search);if(e===(null!==(t=r.tag)&&void 0!==t?t:o.ALL))return;e===o.ALL?delete r.tag:r.tag=e;const n=A.stringifyUrl({url:location.pathname,query:r},{skipNull:!0,skipEmptyString:!0});history.pushState(r,"",n)}),[e]),[e,t]};var R=r(4345);var U=e=>{var t,r,a,i,l,s,c,u,d,f,g,v;let{data:y,location:b}=e;const h=(0,n.useRef)(null),[k,j]=C(),[x,L]=O(),[w,I]=N(),A=null===(t=(0,T.h)().site)||void 0===t?void 0:t.siteMetadata,U=null===(r=(0,m.useStaticQuery)("1664684097").allMarkdownRemark)||void 0===r?void 0:r.distinct,_=null!==(a=null===(i=y.site)||void 0===i||null===(l=i.siteMetadata)||void 0===l?void 0:l.siteUrl)&&void 0!==a?a:"",z=null!==(s=null===(c=y.site)||void 0===c||null===(u=c.siteMetadata)||void 0===u?void 0:u.title)&&void 0!==s?s:"",D=null===(d=y.site)||void 0===d||null===(f=d.siteMetadata)||void 0===f?void 0:f.thumbnail,M=((e,t)=>t===o.ALL?e:e.filter((e=>{var r,n;return null===(r=e.frontmatter)||void 0===r||null===(n=r.tags)||void 0===n?void 0:n.includes(t)})))(((e,t)=>""===t?e:e.filter((e=>{var r,n;return null===(r=e.frontmatter)||void 0===r||null===(n=r.title)||void 0===n?void 0:n.toLocaleLowerCase().includes(t)})))(y.allMarkdownRemark.nodes,x),w),q=Math.ceil(M.length/5),B=(0,n.useCallback)((e=>{L(e.target.value)}),[]),P=[];if(D){const e=["og:image","twitter:image"];for(const t of e)P.push({property:t,content:""+_+D})}return F(h,(0,n.useCallback)((()=>{k<q&&j(k+1)}),[k,j,q])),n.createElement(R.A,{location:b,title:z,resetFilter:()=>{L(""),I(o.ALL)}},n.createElement(S.A,{lang:"en",title:null!==(g=null==A?void 0:A.title)&&void 0!==g?g:"",description:null!==(v=null==A?void 0:A.description)&&void 0!==v?v:"",meta:P,noSiteName:!0}),n.createElement($.A,null),n.createElement(p,{tags:U,titleFilter:x,onTitleFilterChange:B,currentTag:w,setCurrentTag:I}),0===M.length?n.createElement("p",null,"No posts found."):n.createElement(n.Fragment,null,n.createElement(E,{posts:M.slice(0,5*k)})),n.createElement("div",{className:"infinite-scroll",ref:h}))}},6663:function(e,t,r){const n=r(4280),o=r(454),a=r(528),i=r(3055),l=Symbol("encodeFragmentIdentifier");function s(e){if("string"!=typeof e||1!==e.length)throw new TypeError("arrayFormatSeparator must be single character string")}function c(e,t){return t.encode?t.strict?n(e):encodeURIComponent(e):e}function u(e,t){return t.decode?o(e):e}function d(e){return Array.isArray(e)?e.sort():"object"==typeof e?d(Object.keys(e)).sort(((e,t)=>Number(e)-Number(t))).map((t=>e[t])):e}function p(e){const t=e.indexOf("#");return-1!==t&&(e=e.slice(0,t)),e}function m(e){const t=(e=p(e)).indexOf("?");return-1===t?"":e.slice(t+1)}function f(e,t){return t.parseNumbers&&!Number.isNaN(Number(e))&&"string"==typeof e&&""!==e.trim()?e=Number(e):!t.parseBooleans||null===e||"true"!==e.toLowerCase()&&"false"!==e.toLowerCase()||(e="true"===e.toLowerCase()),e}function g(e,t){s((t=Object.assign({decode:!0,sort:!0,arrayFormat:"none",arrayFormatSeparator:",",parseNumbers:!1,parseBooleans:!1},t)).arrayFormatSeparator);const r=function(e){let t;switch(e.arrayFormat){case"index":return(e,r,n)=>{t=/\[(\d*)\]$/.exec(e),e=e.replace(/\[\d*\]$/,""),t?(void 0===n[e]&&(n[e]={}),n[e][t[1]]=r):n[e]=r};case"bracket":return(e,r,n)=>{t=/(\[\])$/.exec(e),e=e.replace(/\[\]$/,""),t?void 0!==n[e]?n[e]=[].concat(n[e],r):n[e]=[r]:n[e]=r};case"colon-list-separator":return(e,r,n)=>{t=/(:list)$/.exec(e),e=e.replace(/:list$/,""),t?void 0!==n[e]?n[e]=[].concat(n[e],r):n[e]=[r]:n[e]=r};case"comma":case"separator":return(t,r,n)=>{const o="string"==typeof r&&r.includes(e.arrayFormatSeparator),a="string"==typeof r&&!o&&u(r,e).includes(e.arrayFormatSeparator);r=a?u(r,e):r;const i=o||a?r.split(e.arrayFormatSeparator).map((t=>u(t,e))):null===r?r:u(r,e);n[t]=i};case"bracket-separator":return(t,r,n)=>{const o=/(\[\])$/.test(t);if(t=t.replace(/\[\]$/,""),!o)return void(n[t]=r?u(r,e):r);const a=null===r?[]:r.split(e.arrayFormatSeparator).map((t=>u(t,e)));void 0!==n[t]?n[t]=[].concat(n[t],a):n[t]=a};default:return(e,t,r)=>{void 0!==r[e]?r[e]=[].concat(r[e],t):r[e]=t}}}(t),n=Object.create(null);if("string"!=typeof e)return n;if(!(e=e.trim().replace(/^[?#&]/,"")))return n;for(const o of e.split("&")){if(""===o)continue;let[e,i]=a(t.decode?o.replace(/\+/g," "):o,"=");i=void 0===i?null:["comma","separator","bracket-separator"].includes(t.arrayFormat)?i:u(i,t),r(u(e,t),i,n)}for(const o of Object.keys(n)){const e=n[o];if("object"==typeof e&&null!==e)for(const r of Object.keys(e))e[r]=f(e[r],t);else n[o]=f(e,t)}return!1===t.sort?n:(!0===t.sort?Object.keys(n).sort():Object.keys(n).sort(t.sort)).reduce(((e,t)=>{const r=n[t];return Boolean(r)&&"object"==typeof r&&!Array.isArray(r)?e[t]=d(r):e[t]=r,e}),Object.create(null))}t.extract=m,t.parse=g,t.stringify=(e,t)=>{if(!e)return"";s((t=Object.assign({encode:!0,strict:!0,arrayFormat:"none",arrayFormatSeparator:","},t)).arrayFormatSeparator);const r=r=>t.skipNull&&null==e[r]||t.skipEmptyString&&""===e[r],n=function(e){switch(e.arrayFormat){case"index":return t=>(r,n)=>{const o=r.length;return void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?r:null===n?[...r,[c(t,e),"[",o,"]"].join("")]:[...r,[c(t,e),"[",c(o,e),"]=",c(n,e)].join("")]};case"bracket":return t=>(r,n)=>void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?r:null===n?[...r,[c(t,e),"[]"].join("")]:[...r,[c(t,e),"[]=",c(n,e)].join("")];case"colon-list-separator":return t=>(r,n)=>void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?r:null===n?[...r,[c(t,e),":list="].join("")]:[...r,[c(t,e),":list=",c(n,e)].join("")];case"comma":case"separator":case"bracket-separator":{const t="bracket-separator"===e.arrayFormat?"[]=":"=";return r=>(n,o)=>void 0===o||e.skipNull&&null===o||e.skipEmptyString&&""===o?n:(o=null===o?"":o,0===n.length?[[c(r,e),t,c(o,e)].join("")]:[[n,c(o,e)].join(e.arrayFormatSeparator)])}default:return t=>(r,n)=>void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?r:null===n?[...r,c(t,e)]:[...r,[c(t,e),"=",c(n,e)].join("")]}}(t),o={};for(const i of Object.keys(e))r(i)||(o[i]=e[i]);const a=Object.keys(o);return!1!==t.sort&&a.sort(t.sort),a.map((r=>{const o=e[r];return void 0===o?"":null===o?c(r,t):Array.isArray(o)?0===o.length&&"bracket-separator"===t.arrayFormat?c(r,t)+"[]":o.reduce(n(r),[]).join("&"):c(r,t)+"="+c(o,t)})).filter((e=>e.length>0)).join("&")},t.parseUrl=(e,t)=>{t=Object.assign({decode:!0},t);const[r,n]=a(e,"#");return Object.assign({url:r.split("?")[0]||"",query:g(m(e),t)},t&&t.parseFragmentIdentifier&&n?{fragmentIdentifier:u(n,t)}:{})},t.stringifyUrl=(e,r)=>{r=Object.assign({encode:!0,strict:!0,[l]:!0},r);const n=p(e.url).split("?")[0]||"",o=t.extract(e.url),a=t.parse(o,{sort:!1}),i=Object.assign(a,e.query);let s=t.stringify(i,r);s&&(s=`?${s}`);let u=function(e){let t="";const r=e.indexOf("#");return-1!==r&&(t=e.slice(r)),t}(e.url);return e.fragmentIdentifier&&(u=`#${r[l]?c(e.fragmentIdentifier,r):e.fragmentIdentifier}`),`${n}${s}${u}`},t.pick=(e,r,n)=>{n=Object.assign({parseFragmentIdentifier:!0,[l]:!1},n);const{url:o,query:a,fragmentIdentifier:s}=t.parseUrl(e,n);return t.stringifyUrl({url:o,query:i(a,r),fragmentIdentifier:s},n)},t.exclude=(e,r,n)=>{const o=Array.isArray(r)?e=>!r.includes(e):(e,t)=>!r(e,t);return t.pick(e,o,n)}},528:function(e){e.exports=(e,t)=>{if("string"!=typeof e||"string"!=typeof t)throw new TypeError("Expected the arguments to be of type `string`");if(""===t)return[e];const r=e.indexOf(t);return-1===r?[e]:[e.slice(0,r),e.slice(r+t.length)]}},4280:function(e){e.exports=e=>encodeURIComponent(e).replace(/[!'()*]/g,(e=>`%${e.charCodeAt(0).toString(16).toUpperCase()}`))}}]);
//# sourceMappingURL=component---src-pages-index-tsx-b871f11c9ff47eb99e5a.js.map