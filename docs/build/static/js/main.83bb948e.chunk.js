(this["webpackJsonpfippli.se"]=this["webpackJsonpfippli.se"]||[]).push([[0],{252:function(t,e,n){"use strict";n.r(e);var i=n(0),r=n(21),a=n.n(r),c=(n(33),n(6)),o=n(28),s=n(2),l=n(3),p=n(27),d=n(13),j=n.n(d),f=n(22),b=n.n(f),h=n(1);j.a.setOption("tasklists",!0);var u,x,g,O,m,v,y,w,k,S,C,T,I,M,H,P,E=new j.a.Converter,J=function(t){var e=t.markdown,n=Object(i.useRef)(null);return Object(i.useEffect)((function(){var t;(console.log(n),n.current)&&(console.log("viewerRef updated"),(t=n.current,Object(p.a)(t.children).filter((function(t){return console.log(t),"PRE"===t.nodeName})).map((function(t){return t.children[0]}))).forEach((function(t){b.a.highlightBlock(t)})))}),[n]),Object(h.jsx)("div",{style:L.wrapper,ref:n,dangerouslySetInnerHTML:{__html:E.makeHtml(e)}})},L={wrapper:{width:"100%"}},R=n(4),z=R.a.div(u||(u=Object(l.a)(["\n  background-color: var(--blue);\n  border-radius: 100px;\n  padding: 3px 7px;\n  color: #ffffff;\n  font-weight: 900;\n  margin-right: 5px;\n  font-size: 12px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n"]))),N=function(t){return Object(h.jsx)(z,{children:t})},_=R.a.div(x||(x=Object(l.a)(["\n  display: flex;\n  flex: 1;\n"]))),A=function(t){var e=t.tags;return Object(h.jsx)(_,{children:e.map(N)})},G=R.a.div(g||(g=Object(l.a)(["\n  display: flex;\n  flex-direction: column;\n  box-sizing: border-box;\n  width: 100%;\n  margin-bottom: 64px;\n"]))),U=R.a.h2(O||(O=Object(l.a)(["\n  font-size: 2rem;\n  font-weight: 900;\n  width: 100%;\n  margin-bottom: 0;\n"]))),B=R.a.div(m||(m=Object(l.a)(["\n  display: flex;\n  width: 100%;\n"]))),F=R.a.a(v||(v=Object(l.a)(["\n  text-decoration: none;\n  color: var(--blue);\n  :hover {\n    color: var(--red);\n  }\n"]))),q=R.a.a(y||(y=Object(l.a)(["\n  color: #000000;\n  width: 100%;\n  text-decoration: none;\n  :hover {\n    color: var(--blue);\n    border-bottom: 4px solid var(--blue);\n  }\n"]))),Q=R.a.span(w||(w=Object(l.a)(["\n  fontsize: 1.4rem;\n  font-weight: 400;\n  fontfamily: Montserrat;\n  color: #33333366;\n  margin-left: 20px;\n"]))),W=function(t){var e=t.title,n=t.link;return Object(h.jsx)(U,{children:Object(h.jsx)(q,{href:n,children:e})})},D=function(t){var e,n=t.tags,i=t.created,r=t.repository;return Object(h.jsxs)(B,{children:[Object(h.jsx)(A,{tags:n}),Object(h.jsx)("div",{children:Object(h.jsx)(F,{href:r,children:Object(h.jsx)("i",{className:"fab fa-github"})})}),Object(h.jsx)(Q,{children:(e=i,new Date(e).toUTCString().split(" ").slice(1,4).join(" "))})]})},$=function(t){var e=t.id,n=t.content,i=t.title,r=t.link,a=t.created,c=t.tags,o=t.repository;return Object(h.jsxs)(G,{children:[Object(h.jsx)(W,{title:i,link:r,tags:c}),Object(h.jsx)(J,{markdown:n}),Object(h.jsx)(D,{tags:c,created:a,repository:o})]},e)},K=Object(i.createContext)(),V=n(26),X=function(){var t,e,n=Object(i.useContext)(K).state;return t=n.posts,e=n.searchInput,console.log(">>> search",e),[void 0,null,""].includes(e)?t:t.filter((function(t){return Object(V.superSearch)()(e,t).numberOfMatches>0}))},Y=R.a.h1(k||(k=Object(l.a)(["\n  font-size: 12rem;\n  font-family: Anton, sans-serif;\n  text-align: center;\n  color: var(--red);\n  text-shadow: 10px 10px var(--blue);\n  letter-spacing: 25px;\n  margin: 0;\n"]))),Z=R.a.header(S||(S=Object(l.a)(["\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n"]))),tt=R.a.footer(C||(C=Object(l.a)(["\n  width: 100%;\n  min-height: 128px;\n  background-color: #f9f9f9;\n  margin-top: 128px;\n"]))),et=R.a.main(T||(T=Object(l.a)(["\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n"]))),nt=R.a.div(I||(I=Object(l.a)(["\n  display: flex;\n  flex-direction: wrapper;\n  font-size: 3rem;\n"]))),it=R.a.a(M||(M=Object(l.a)(["\n  color: #444444;\n  margin-right: 30px;\n"]))),rt=function(){return Object(h.jsxs)(Z,{children:[Object(h.jsx)(Y,{children:"FIPPLI"}),Object(h.jsxs)(nt,{children:[Object(h.jsx)(it,{href:"https://github.com/fippli",children:Object(h.jsx)("i",{className:"fab fa-github"})}),Object(h.jsx)(it,{href:"https://www.linkedin.com/in/filip-johansson-036b9984/",children:Object(h.jsx)("i",{className:"fab fa-linkedin"})})]})]})},at=function(){return Object(h.jsx)(tt,{})},ct=function(t){var e=t.children;return Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)(rt,{}),Object(h.jsx)(et,{children:e}),Object(h.jsx)(at,{})]})},ot=R.a.div(H||(H=Object(l.a)(["\n  display: flex;\n  flex-direction: column;\n  max-width: 700px;\n  align-items: center;\n  width: 100%;\n"]))),st=R.a.input(P||(P=Object(l.a)(["\n  border-radius: 100px;\n  background-color: #e9e9e9;\n  padding: 10px 20px;\n  border: none;\n  font-size: 18px;\n  font-weight: 700;\n  margin-top: 36px;\n"]))),lt=function(){var t=X(),e=Object(i.useContext)(K).dispatch;return Object(h.jsxs)(ct,{children:[Object(h.jsx)(st,{placeholder:"filter...",onChange:function(t){return e({type:"SET_SEARCH_INPUT",payload:t.target.value})}}),Object(h.jsx)(ot,{children:t.map($)})]})},pt=function(){return Object(h.jsx)(o.a,{children:Object(h.jsx)(s.c,{children:Object(h.jsx)(s.a,{exact:!0,path:"/",element:Object(h.jsx)(lt,{})})})})},dt={searchInput:"",posts:[{id:"1",title:"Playing Cards",link:"https://fippli.se/playing-cards",created:1640082699673,tags:["HTML","CSS","JavaScript"],content:"I created playing cards in HTML, CSS and JavaScript.",repository:""},{id:"2",title:"Galaxy Animation",link:"https://fippli.se/galaxy-animation",created:1640082699673,tags:["HTML","CSS","JavaScript"],content:"Found a cool galaxy animation that I rewrote from object orientation to functional.",repository:"https://github.com/fippli/galaxy-animation"},{id:"3",title:"Pong",link:"https://fippli.se/fipplipong",created:1640082699673,tags:["HTML","CSS","JavaScript","Game"],content:"My own little version of the calssic game.",repository:"https://github.com/fippli/fipplipong"},{id:"4",title:"Plankton",link:"https://fippli.se/plankton",created:1640082699673,tags:["HTML","CSS","JavaScript","Game"],content:"A little game...",repository:"https://github.com/fippli/plankton"},{id:"5",title:"QR Code Generator",link:"https://fippli.se/qr",created:1640082699673,tags:["HTML","CSS","JavaScript","Utility"],content:"Minimalistic QR code generator.",repository:"https://github.com/fippli/qr"}]},jt=n(16),ft=function(t,e){return"SET_SEARCH_INPUT"===e.type?Object(jt.a)(Object(jt.a)({},t),{},{searchInput:e.payload}):t},bt=function(){var t=Object(i.useReducer)(ft,dt),e=Object(c.a)(t,2),n=e[0],r=e[1];return Object(h.jsx)(K.Provider,{value:{state:n,dispatch:r},children:Object(h.jsx)(pt,{})})};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));a.a.render(Object(h.jsx)(bt,{}),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(t){t.unregister()}))},33:function(t,e,n){}},[[252,1,2]]]);
//# sourceMappingURL=main.83bb948e.chunk.js.map