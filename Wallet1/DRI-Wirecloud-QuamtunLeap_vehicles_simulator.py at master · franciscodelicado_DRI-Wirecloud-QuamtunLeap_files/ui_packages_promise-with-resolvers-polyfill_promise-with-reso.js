"use strict";(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([["ui_packages_promise-with-resolvers-polyfill_promise-with-resolvers-polyfill_ts-ui_packages_re-8d43b0"],{31481:(e,t,n)=>{n.d(t,{I:()=>a});let a=(0,n(96540).createContext)(null)},51848:(e,t,n)=>{let a;n.d(t,{BI:()=>p,Ti:()=>_,lA:()=>m});var s=n(70837),r=n(18679),i=n(74572),o=n(51528);let{getItem:l}=(0,i.A)("localStorage"),c="dimension_",d=["utm_source","utm_medium","utm_campaign","utm_term","utm_content","scid"];try{let e=(0,s.O)("octolytics");delete e.baseContext,a=new r.s(e)}catch{}function u(e){let t=(0,s.O)("octolytics").baseContext||{};if(t)for(let[e,n]of(delete t.app_id,delete t.event_url,delete t.host,Object.entries(t)))e.startsWith(c)&&(t[e.replace(c,"")]=n,delete t[e]);let n=document.querySelector("meta[name=visitor-payload]");for(let[e,a]of(n&&Object.assign(t,JSON.parse(atob(n.content))),new URLSearchParams(window.location.search)))d.includes(e.toLowerCase())&&(t[e]=a);return t.staff=(0,o.X)().toString(),Object.assign(t,e)}function m(e){a?.sendPageView(u(e))}function p(e,t={}){let n=document.head?.querySelector('meta[name="current-catalog-service"]')?.content,s=n?{service:n}:{};for(let[e,n]of Object.entries(t))null!=n&&(s[e]=`${n}`);a&&(u(s),a.sendEvent(e||"unknown",u(s)))}function _(e){return Object.fromEntries(Object.entries(e).map(([e,t])=>[e,JSON.stringify(t)]))}},67726:(e,t,n)=>{n.d(t,{l:()=>a});let a=()=>void 0},24620:(e,t,n)=>{n.d(t,{Y:()=>a});function a(){let e={};return e.promise=new Promise((t,n)=>{e.resolve=t,e.reject=n}),e}},23581:(e,t,n)=>{n.d(t,{A:()=>o});let{getItem:a,setItem:s,removeItem:r}=(0,n(74572).A)("localStorage"),i="REACT_PROFILING_ENABLED",o={enable:()=>s(i,"true"),disable:()=>r(i),isEnabled:()=>!!a(i)}},71312:(e,t,n)=>{n.d(t,{S:()=>o,s:()=>i});var a=n(96540),s=n(51848),r=n(31481);function i(){let e=(0,a.useContext)(r.I);if(!e)throw Error("useAnalytics must be used within an AnalyticsContext");let{appName:t,category:n,metadata:i}=e;return{sendAnalyticsEvent:(0,a.useCallback)((e,a,r={})=>{let o={react:!0,app_name:t,category:n,...i};(0,s.BI)(e,{...o,...r,target:a})},[t,n,i])}}function o(){let{sendAnalyticsEvent:e}=i();return{sendClickAnalyticsEvent:(0,a.useCallback)((t={})=>{e("analytics.click",void 0,t)},[e])}}},59840:(e,t,n)=>{n.d(t,{m:()=>r});var a=n(96540),s=n(97156);function r(e,t){s.KJ&&(0,a.useLayoutEffect)(e,t)}},73272:(e,t,n)=>{n.d(t,{A:()=>r});var a=n(59840),s=n(96540);function r(){let e=(0,s.useRef)(!1),t=(0,s.useCallback)(()=>e.current,[]);return(0,a.m)(()=>(e.current=!0,()=>{e.current=!1}),[]),t}},83784:(e,t,n)=>{n.d(t,{A:()=>r});var a=n(73272),s=n(96540);let r=function(e){let t=(0,a.A)(),[n,r]=(0,s.useState)(e);return[n,(0,s.useCallback)(e=>{t()&&r(e)},[t])]}},37190:(e,t,n)=>{n.d(t,{y:()=>i});var a=n(74848),s=n(96540),r=n(31481);function i({children:e,appName:t,category:n,metadata:i}){let o=(0,s.useMemo)(()=>({appName:t,category:n,metadata:i}),[t,n,i]);return(0,a.jsx)(r.I.Provider,{value:o,children:e})}try{i.displayName||(i.displayName="AnalyticsProvider")}catch{}},22629:(e,t,n)=>{n.d(t,{O:()=>v,r:()=>j});var a=n(74848),s=n(71312),r=n(16823),i=n(30595),o=n(89323),l=n(14616),c=n(38621),d=n(96540),u=n(75014);let m=(0,d.lazy)(()=>Promise.all([n.e("primer-react"),n.e("react-core"),n.e("react-lib"),n.e("vendors-node_modules_dompurify_dist_purify_js"),n.e("vendors-node_modules_github_relative-time-element_dist_index_js"),n.e("vendors-node_modules_braintree_browser-detection_dist_browser-detection_js-node_modules_githu-bb80ec"),n.e("vendors-node_modules_react-relay_index_js"),n.e("vendors-node_modules_date-fns_format_mjs"),n.e("vendors-node_modules_date-fns_addWeeks_mjs-node_modules_date-fns_addYears_mjs-node_modules_da-827f4f"),n.e("vendors-node_modules_focus-visible_dist_focus-visible_js-node_modules_fzy_js_index_js-node_mo-c4d1d6"),n.e("vendors-node_modules_date-fns_getDaysInMonth_mjs-node_modules_date-fns_isAfter_mjs-node_modul-49f526"),n.e("vendors-node_modules_github_combobox-nav_dist_index_js-node_modules_github_g-emoji-element_di-6ce195"),n.e("vendors-node_modules_react-relay_hooks_js-node_modules_github_paste-markdown_dist_index_js-no-c4f127"),n.e("ui_packages_paths_index_ts"),n.e("ui_packages_ui-commands_ui-commands_ts"),n.e("ui_packages_date-picker_date-picker_ts-ui_packages_github-avatar_GitHubAvatar_tsx"),n.e("ui_packages_item-picker_constants_labels_ts-ui_packages_item-picker_constants_values_ts-ui_pa-163a9a"),n.e("ui_packages_item-picker_components_RepositoryPicker_tsx"),n.e("ui_packages_use-safe-async-callback_use-safe-async-callback_ts-ui_packages_copy-to-clipboard_-4c1096"),n.e("ui_packages_issue-create_dialog_CreateIssueDialogEntry_tsx"),n.e("ui_packages_aria-live_aria-live_ts-ui_packages_test-id-props_test-id-props_ts-ui_packages_use-00bbd8")]).then(n.bind(n,36860)));function p({label:e,analyticsLabel:t}){return{category:"SiteHeaderComponent",action:"add_dropdown",label:t||e.toLowerCase()}}function _({label:e,href:t,LeadingVisual:n,analyticsLabel:i}){let{sendClickAnalyticsEvent:o}=(0,s.S)(),l=(0,d.useCallback)(()=>{o(p({label:e,analyticsLabel:i}))},[e,i,o]);return(0,a.jsxs)(r.l.LinkItem,{href:t,onClick:l,children:[(0,a.jsx)(r.l.LeadingVisual,{children:(0,a.jsx)(n,{})}),e]})}function h({label:e,onClick:t,LeadingVisual:n,analyticsLabel:i}){let{sendClickAnalyticsEvent:o}=(0,s.S)(),l=(0,d.useCallback)(()=>{o(p({label:e,analyticsLabel:i})),t()},[e,i,o,t]);return(0,a.jsxs)(r.l.Item,{onSelect:l,children:[(0,a.jsx)(r.l.LeadingVisual,{children:(0,a.jsx)(n,{})}),e]})}function y(){return(0,a.jsx)(i.A,{size:"small"})}function g({side:e="outside-bottom",createRepo:t,importRepo:n,createOrg:s,createProject:i,createProjectUrl:l,createLegacyProject:u,createIssue:p,codespaces:g,gist:f,org:x,owner:j,repo:b,isOpen:v=!1,setIsOpen:w=()=>{},environment:C}){let[N,k]=(0,d.useState)(!1),[I,A]=(0,d.useState)(!1),[P,O]=(0,d.useState)(v);(0,d.useEffect)(()=>{v&&O(!0)},[v]);let S=N&&!I;return(0,a.jsxs)(a.Fragment,{children:[p&&P&&(0,a.jsx)(d.Suspense,{children:(0,a.jsx)(m,{isVisible:N,setIsVisible:k,setIsLoaded:A,setIsParentMenuOpen:w,owner:j,repo:b,environment:C})}),(0,a.jsx)(o.W.Overlay,{side:e,children:(0,a.jsxs)(r.l,{children:[p&&(0,a.jsx)(h,{label:"New issue",onClick:()=>(k(!0),!1),LeadingVisual:S?y:c.IssueOpenedIcon}),!1!==t&&(0,a.jsx)(_,{label:"New repository",href:"/new",LeadingVisual:c.RepoIcon}),n&&(0,a.jsx)(_,{label:"Import repository",href:"/new/import",LeadingVisual:c.RepoPushIcon}),(g||f)&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(r.l.Divider,{}),g&&(0,a.jsx)(_,{label:"New codespace",href:"/codespaces/new",LeadingVisual:c.CodespacesIcon}),f&&(0,a.jsx)(_,{label:"New gist",href:"/gist",LeadingVisual:c.CodeIcon})]}),(s||i||u)&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(r.l.Divider,{}),s&&(0,a.jsx)(_,{label:"New organization",href:"/account/organizations/new",LeadingVisual:c.OrganizationIcon}),i&&(0,a.jsx)(_,{label:"New project",analyticsLabel:"new project",href:l,LeadingVisual:c.ProjectIcon}),!i&&u&&(0,a.jsx)(_,{label:"New project",analyticsLabel:"new legacy project",href:"/new/project",LeadingVisual:c.ProjectIcon})]}),x&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(r.l.Divider,{}),(0,a.jsx)(_,{label:`${x.addWord} someone to ${x.login}`,analyticsLabel:"invite someone",href:`/orgs/${x.login}/people#invite-member`,LeadingVisual:c.PersonAddIcon}),(0,a.jsx)(_,{label:`New team in ${x.login}`,analyticsLabel:"new team",href:`/orgs/${x.login}/new-team`,LeadingVisual:c.PeopleIcon}),(0,a.jsx)(_,{label:`New repository in ${x.login}`,analyticsLabel:"organization - new repository",href:`/organizations/${x.login}/repositories/new`,LeadingVisual:c.RepoIcon})]})]})})]})}function f(e){let{ref:t,open:n,setOpen:s}=(0,u.Mm)(e.reactPartialAnchor);return(0,a.jsx)(o.W,{anchorRef:t,open:n,onOpenChange:s,children:(0,a.jsx)(g,{...e,isOpen:n,setIsOpen:s})})}function x(e){let t=`global-create-menu-tooltip-${(0,d.useId)()}`,[n,s]=(0,d.useState)(!1);return(0,a.jsxs)(o.W,{open:n,onOpenChange:s,children:[(0,a.jsx)(l.m,{text:"Create New...",type:"label",id:t,children:(0,a.jsx)(o.W.Button,{leadingVisual:c.PlusIcon,children:""})}),(0,a.jsx)(g,{...e,isOpen:n,setIsOpen:s})]})}function j(e){return e.reactPartialAnchor?(0,a.jsx)(f,{...e,reactPartialAnchor:e.reactPartialAnchor}):(0,a.jsx)(x,{...e})}let b={"@media (min-width: 48rem)":{display:"none"}};function v(e){let[t,n]=(0,d.useState)(!1);return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)(o.W,{open:t,onOpenChange:n,children:[(0,a.jsx)(o.W.Anchor,{children:(0,a.jsxs)(r.l.Item,{sx:b,onSelect:()=>{n(e=>!e)},children:[(0,a.jsx)(r.l.LeadingVisual,{children:(0,a.jsx)(c.PlusIcon,{})}),"Create new"]})}),(0,a.jsx)(g,{...e,isOpen:t,setIsOpen:n,side:"outside-top"})]}),(0,a.jsx)(r.l.Divider,{sx:b})]})}try{m.displayName||(m.displayName="LazyCreateIssueDialog")}catch{}try{_.displayName||(_.displayName="CreateMenuLinkItem")}catch{}try{h.displayName||(h.displayName="CreateMenuItem")}catch{}try{y.displayName||(y.displayName="MenuItemSpinner")}catch{}try{g.displayName||(g.displayName="GlobalCreateMenuOverlay")}catch{}try{f.displayName||(f.displayName="ExternallyAnchoredGlobalCreateMenu")}catch{}try{x.displayName||(x.displayName="GlobalCreateMenuWithAnchor")}catch{}try{j.displayName||(j.displayName="GlobalCreateMenu")}catch{}try{v.displayName||(v.displayName="GlobalCreateMenuItem")}catch{}},47831:(e,t,n)=>{n.d(t,{BP:()=>d,D3:()=>c,O8:()=>o});var a=n(74848),s=n(96540),r=n(97156),i=n(59840),o=function(e){return e.ServerRender="ServerRender",e.ClientHydrate="ClientHydrate",e.ClientRender="ClientRender",e}({});let l=(0,s.createContext)("ClientRender");function c({wasServerRendered:e,children:t}){let[n,o]=(0,s.useState)(()=>r.X3?"ServerRender":e?"ClientHydrate":"ClientRender");return(0,i.m)(()=>{"ClientRender"!==n&&o("ClientRender")},[n]),(0,a.jsx)(l.Provider,{value:n,children:t})}function d(){return(0,s.useContext)(l)}try{l.displayName||(l.displayName="RenderPhaseContext")}catch{}try{c.displayName||(c.displayName="RenderPhaseProvider")}catch{}},54156:(e,t,n)=>{n.d(t,{Qn:()=>l,T8:()=>d,Y6:()=>m,k6:()=>u});var a=n(74848),s=n(65556),r=n(96540),i=n(67726),o=n(83784);let l=5e3,c=(0,r.createContext)({addToast:i.l,addPersistedToast:i.l,clearPersistedToast:i.l}),d=(0,r.createContext)({toasts:[],persistedToast:null});function u({children:e}){let[t,n]=(0,o.A)([]),[i,u]=(0,r.useState)(null),{safeSetTimeout:m}=(0,s.A)(),p=(0,r.useCallback)(function(e){n([...t,e]),m(()=>n(t.slice(1)),l)},[t,m,n]),_=(0,r.useCallback)(function(e){u(e)},[u]),h=(0,r.useCallback)(function(){u(null)},[u]),y=(0,r.useMemo)(()=>({addToast:p,addPersistedToast:_,clearPersistedToast:h}),[_,p,h]),g=(0,r.useMemo)(()=>({toasts:t,persistedToast:i}),[t,i]);return(0,a.jsx)(c.Provider,{value:y,children:(0,a.jsx)(d.Provider,{value:g,children:e})})}function m(){return(0,r.useContext)(c)}try{c.displayName||(c.displayName="ToastContext")}catch{}try{d.displayName||(d.displayName="InternalToastsContext")}catch{}try{u.displayName||(u.displayName="ToastContextProvider")}catch{}},67870:(e,t,n)=>{n.d(t,{V:()=>m});var a=n(74848),s=n(96540),r=n(54156),i=n(38621),o=n(65556),l=n(16255);let c={info:"",success:"Toast--success",error:"Toast--error"},d={info:(0,a.jsx)(i.InfoIcon,{}),success:(0,a.jsx)(i.CheckIcon,{}),error:(0,a.jsx)(i.StopIcon,{})},u=({message:e,timeToLive:t,icon:n,type:r="info",role:i="log"})=>{let[u,m]=s.useState(!0),{safeSetTimeout:p}=(0,o.A)();return(0,s.useEffect)(()=>{t&&p(()=>m(!1),t-300)},[p,t]),(0,a.jsx)(l.Z,{children:(0,a.jsx)("div",{className:"p-1 position-fixed bottom-0 left-0 mb-3 ml-3",children:(0,a.jsxs)("div",{className:`Toast ${c[r]} ${u?"Toast--animateIn":"Toast--animateOut"}`,id:"ui-app-toast","data-testid":`ui-app-toast-${r}`,role:i,children:[(0,a.jsx)("span",{className:"Toast-icon",children:n||d[r]}),(0,a.jsx)("span",{className:"Toast-content",children:e})]})})})};try{u.displayName||(u.displayName="Toast")}catch{}function m(){let{toasts:e,persistedToast:t}=(0,s.useContext)(r.T8);return(0,a.jsxs)(a.Fragment,{children:[e.map((e,t)=>(0,a.jsx)(u,{message:e.message,icon:e.icon,timeToLive:r.Qn,type:e.type,role:e.role},t)),t&&(0,a.jsx)(u,{message:t.message,icon:t.icon,type:t.type,role:t.role})]})}try{m.displayName||(m.displayName="Toasts")}catch{}},18679:(e,t,n)=>{n.d(t,{s:()=>AnalyticsClient});let a=["utm_source","utm_medium","utm_campaign","utm_term","utm_content","scid"];var s=n(36301);let AnalyticsClient=class AnalyticsClient{constructor(e){this.options=e}get collectorUrl(){return this.options.collectorUrl}get clientId(){return this.options.clientId?this.options.clientId:(0,s.y)()}createEvent(e){return{page:location.href,title:document.title,context:{...this.options.baseContext,...function(){let e={};try{for(let[t,n]of new URLSearchParams(window.location.search)){let s=t.toLowerCase();a.includes(s)&&(e[s]=n)}return e}catch(e){return{}}}(),...e}}}sendPageView(e){let t=this.createEvent(e);this.send({page_views:[t]})}sendEvent(e,t){let n={...this.createEvent(t),type:e};this.send({events:[n]})}send({page_views:e,events:t}){let n=JSON.stringify({client_id:this.clientId,page_views:e,events:t,request_context:{referrer:function(){let e;try{e=window.top.document.referrer}catch(t){if(window.parent)try{e=window.parent.document.referrer}catch(e){}}return""===e&&(e=document.referrer),e}(),user_agent:navigator.userAgent,screen_resolution:function(){try{return`${screen.width}x${screen.height}`}catch(e){return"unknown"}}(),browser_resolution:function(){let e=0,t=0;try{return"number"==typeof window.innerWidth?(t=window.innerWidth,e=window.innerHeight):null!=document.documentElement&&null!=document.documentElement.clientWidth?(t=document.documentElement.clientWidth,e=document.documentElement.clientHeight):null!=document.body&&null!=document.body.clientWidth&&(t=document.body.clientWidth,e=document.body.clientHeight),`${t}x${e}`}catch(e){return"unknown"}}(),browser_languages:navigator.languages?navigator.languages.join(","):navigator.language||"",pixel_ratio:window.devicePixelRatio,timestamp:Date.now(),tz_seconds:-60*new Date().getTimezoneOffset()}});try{if(navigator.sendBeacon){navigator.sendBeacon(this.collectorUrl,n);return}}catch{}fetch(this.collectorUrl,{method:"POST",cache:"no-cache",headers:{"Content-Type":"application/json"},body:n,keepalive:!1})}}},70837:(e,t,n)=>{n.d(t,{O:()=>a});function a(e="ha"){let t;let n={};for(let a of Array.from(document.head.querySelectorAll(`meta[name^="${e}-"]`))){let{name:s,content:r}=a,i=s.replace(`${e}-`,"").replace(/-/g,"_");"url"===i?t=r:n[i]=r}if(!t)throw Error(`AnalyticsClient ${e}-url meta tag not found`);return{collectorUrl:t,...Object.keys(n).length>0?{baseContext:n}:{}}}}}]);
//# sourceMappingURL=ui_packages_promise-with-resolvers-polyfill_promise-with-resolvers-polyfill_ts-ui_packages_re-8d43b0-b947b4c31c3a.js.map