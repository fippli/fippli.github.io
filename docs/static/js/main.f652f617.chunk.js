(this["webpackJsonpfippli.se"]=this["webpackJsonpfippli.se"]||[]).push([[0],{252:function(t,e,n){"use strict";n.r(e);var i=n(0),r=n(21),a=n.n(r),c=(n(33),n(6)),o=n(28),l=n(2),s=n(3),p=n(27),d=n(13),f=n.n(d),j=n(22),h=n.n(j),b=n(1);f.a.setOption("tasklists",!0);var u,x,g,m,O,v,y,w,S,k,C,T,M,H,I,L,J=new f.a.Converter,P=function(t){var e=t.markdown,n=Object(i.useRef)(null);return Object(i.useEffect)((function(){var t;(console.log(n),n.current)&&(console.log("viewerRef updated"),(t=n.current,Object(p.a)(t.children).filter((function(t){return console.log(t),"PRE"===t.nodeName})).map((function(t){return t.children[0]}))).forEach((function(t){h.a.highlightBlock(t)})))}),[n]),Object(b.jsx)("div",{style:E.wrapper,ref:n,dangerouslySetInnerHTML:{__html:J.makeHtml(e)}})},E={wrapper:{width:"100%"}},R=n(4),z=R.a.div(u||(u=Object(s.a)(["\n  background-color: var(--blue);\n  border-radius: 100px;\n  padding: 3px 7px;\n  color: #ffffff;\n  font-weight: 900;\n  margin-right: 5px;\n  font-size: 12px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n"]))),N=function(t){return Object(b.jsx)(z,{children:t})},_=R.a.div(x||(x=Object(s.a)(["\n  display: flex;\n  flex: 1;\n"]))),A=function(t){var e=t.tags;return Object(b.jsx)(_,{children:e.map(N)})},U=R.a.div(g||(g=Object(s.a)(["\n  display: flex;\n  flex-direction: column;\n  box-sizing: border-box;\n  width: 100%;\n  margin-bottom: 64px;\n"]))),G=R.a.h2(m||(m=Object(s.a)(["\n  font-size: 2rem;\n  font-weight: 900;\n  width: 100%;\n  margin-bottom: 0;\n"]))),B=R.a.div(O||(O=Object(s.a)(["\n  display: flex;\n  width: 100%;\n"]))),F=R.a.a(v||(v=Object(s.a)(["\n  text-decoration: none;\n  color: var(--blue);\n  :hover {\n    color: var(--red);\n  }\n"]))),q=R.a.a(y||(y=Object(s.a)(["\n  color: #000000;\n  width: 100%;\n  text-decoration: none;\n  :hover {\n    color: var(--blue);\n    border-bottom: 4px solid var(--blue);\n  }\n"]))),Q=R.a.span(w||(w=Object(s.a)(["\n  fontsize: 1.4rem;\n  font-weight: 400;\n  fontfamily: Montserrat;\n  color: #33333366;\n  margin-left: 20px;\n"]))),W=function(t){var e=t.title,n=t.link;return Object(b.jsx)(G,{children:Object(b.jsx)(q,{href:n,children:e})})},D=function(t){var e,n=t.tags,i=t.created,r=t.repository;return Object(b.jsxs)(B,{children:[Object(b.jsx)(A,{tags:n}),Object(b.jsx)("div",{children:Object(b.jsx)(F,{href:r,children:Object(b.jsx)("i",{className:"fab fa-github"})})}),Object(b.jsx)(Q,{children:(e=i,new Date(e).toUTCString().split(" ").slice(1,4).join(" "))})]})},K=function(t){var e=t.id,n=t.content,i=t.title,r=t.link,a=t.created,c=t.tags,o=t.repository;return Object(b.jsxs)(U,{children:[Object(b.jsx)(W,{title:i,link:r,tags:c}),Object(b.jsx)(P,{markdown:n}),Object(b.jsx)(D,{tags:c,created:a,repository:o})]},e)},$=Object(i.createContext)(),V=n(26),X=function(){var t,e,n=Object(i.useContext)($).state;return t=n.posts,e=n.searchInput,console.log(">>> search",e),[void 0,null,""].includes(e)?t:t.filter((function(t){return Object(V.superSearch)()(e,t).numberOfMatches>0}))},Y=R.a.h1(S||(S=Object(s.a)(["\n  font-size: 12rem;\n  font-family: Anton, sans-serif;\n  text-align: center;\n  color: var(--red);\n  text-shadow: 10px 10px var(--blue);\n  letter-spacing: 25px;\n  margin: 0;\n"]))),Z=R.a.header(k||(k=Object(s.a)(["\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n"]))),tt=R.a.footer(C||(C=Object(s.a)(["\n  width: 100%;\n  min-height: 128px;\n  background-color: #f9f9f9;\n  margin-top: 128px;\n"]))),et=R.a.main(T||(T=Object(s.a)(["\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n"]))),nt=R.a.div(M||(M=Object(s.a)(["\n  display: flex;\n  flex-direction: wrapper;\n  font-size: 3rem;\n"]))),it=R.a.a(H||(H=Object(s.a)(["\n  color: #444444;\n  margin-right: 30px;\n"]))),rt=function(){return Object(b.jsxs)(Z,{children:[Object(b.jsx)(Y,{children:"FIPPLI"}),Object(b.jsxs)(nt,{children:[Object(b.jsx)(it,{href:"https://github.com/fippli",children:Object(b.jsx)("i",{className:"fab fa-github"})}),Object(b.jsx)(it,{href:"https://www.linkedin.com/in/filip-johansson-036b9984/",children:Object(b.jsx)("i",{className:"fab fa-linkedin"})})]})]})},at=function(){return Object(b.jsx)(tt,{})},ct=function(t){var e=t.children;return Object(b.jsxs)(b.Fragment,{children:[Object(b.jsx)(rt,{}),Object(b.jsx)(et,{children:e}),Object(b.jsx)(at,{})]})},ot=function(t,e){return t.created<e.created?1:t.created>e.created?-1:0},lt=R.a.div(I||(I=Object(s.a)(["\n  display: flex;\n  flex-direction: column;\n  max-width: 700px;\n  align-items: center;\n  width: 100%;\n"]))),st=R.a.input(L||(L=Object(s.a)(["\n  border-radius: 100px;\n  background-color: #e9e9e9;\n  padding: 10px 20px;\n  border: none;\n  font-size: 18px;\n  font-weight: 700;\n  margin-top: 36px;\n"]))),pt=function(){var t=X(),e=Object(i.useContext)($).dispatch;return Object(b.jsxs)(ct,{children:[Object(b.jsx)(st,{placeholder:"filter...",onChange:function(t){return e({type:"SET_SEARCH_INPUT",payload:t.target.value})}}),Object(b.jsx)(lt,{children:t.sort(ot).map(K)})]})},dt=function(){return Object(b.jsx)(o.a,{children:Object(b.jsx)(l.c,{children:Object(b.jsx)(l.a,{exact:!0,path:"/",element:Object(b.jsx)(pt,{})})})})},ft={searchInput:"",posts:[{id:"1",title:"Playing Cards",link:"https://fippli.se/playing-cards",created:1640082699673,tags:["HTML","CSS","JavaScript"],content:"I created playing cards in HTML, CSS and JavaScript.",repository:""},{id:"2",title:"Galaxy Animation",link:"https://fippli.se/galaxy-animation",created:1640082699673,tags:["HTML","CSS","JavaScript"],content:"Found a cool galaxy animation that I rewrote from object orientation to functional.",repository:"https://github.com/fippli/galaxy-animation"},{id:"3",title:"Pong",link:"https://fippli.se/fipplipong",created:1640082699673,tags:["HTML","CSS","JavaScript","Game"],content:"My own little version of the calssic game.",repository:"https://github.com/fippli/fipplipong"},{id:"4",title:"Plankton",link:"https://fippli.se/plankton",created:1640082699673,tags:["HTML","CSS","JavaScript","Game"],content:"A little game...",repository:"https://github.com/fippli/plankton"},{id:"5",title:"QR Code Generator",link:"https://fippli.se/qr",created:1649064597545,tags:["HTML","CSS","JavaScript","Utility"],content:"Minimalistic QR code generator.",repository:"https://github.com/fippli/qr"},{id:"6",title:"Lilldag",link:"https://fippli.se/lilldag",created:1649064597545,tags:["HTML","CSS","JavaScript","Utility"],content:'Know what "lilldag" it is.',repository:"https://github.com/fippli/lilldag"}]},jt=n(16),ht=function(t,e){return"SET_SEARCH_INPUT"===e.type?Object(jt.a)(Object(jt.a)({},t),{},{searchInput:e.payload}):t},bt=function(){var t=Object(i.useReducer)(ht,ft),e=Object(c.a)(t,2),n=e[0],r=e[1];return Object(b.jsx)($.Provider,{value:{state:n,dispatch:r},children:Object(b.jsx)(dt,{})})};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));a.a.render(Object(b.jsx)(bt,{}),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(t){t.unregister()}))},33:function(t,e,n){}},[[252,1,2]]]);
//# sourceMappingURL=main.f652f617.chunk.js.map