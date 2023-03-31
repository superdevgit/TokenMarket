"use strict";(self.webpackChunkmy_app=self.webpackChunkmy_app||[]).push([[107],{3107:function(e,r,a){a.r(r);var t=a(4165),s=a(5861),n=a(9439),l=a(2791),o=a(5960),u=a(7689),c=a(5218),d=a(7038),i=a(7699),b=a(3763),g=a(184);r.default=function(){var e=(0,o.useWallet)(),r=e.connected,a=e.account,x=e.signAndSubmitTransaction,f=(0,u.s0)(),m=(0,l.useState)(!1),p=(0,n.Z)(m,2),y=p[0],k=p[1],h=(0,l.useState)(),v=(0,n.Z)(h,2),w=v[0],j=v[1],N=(0,l.useState)(0),Z=(0,n.Z)(N,2),A=Z[0],S=Z[1],C=(0,l.useState)(""),I=(0,n.Z)(C,2),F=I[0],R=I[1],T=(0,l.useState)(0),_=(0,n.Z)(T,2),M=_[0],z=_[1],P=(0,l.useState)(""),U=(0,n.Z)(P,2),D=U[0],E=U[1],K=(0,l.useState)(0),W=(0,n.Z)(K,2),q=W[0],B=W[1],G=(0,l.useState)(!1),H=(0,n.Z)(G,2),J=H[0],L=H[1],O=function(){var e=(0,s.Z)((0,t.Z)().mark((function e(){var r,a,s,n;return(0,t.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(e.prev=0,F&&D&&M&&q&&M+q==100){e.next=4;break}return c.Am.error("Invalid values!"),e.abrupt("return");case 4:if(k(!0),!w){e.next=18;break}if(r=(0,d.rF)(A,[F,D],[M,q]),console.log("tx",r),r){e.next=12;break}return c.Am.error("Transaction error"),k(!1),e.abrupt("return");case 12:return e.next=14,x(r);case 14:c.Am.success("Update config success"),k(!1),e.next=34;break;case 18:if(a=(0,d.j2)(A,[F,D],[M,q]),console.log("tx",a),a){e.next=24;break}return c.Am.error("Transaction error"),k(!1),e.abrupt("return");case 24:return e.next=26,x(a);case 26:return c.Am.success("Initialize config success"),e.next=29,(0,d.jh)();case 29:s=e.sent,n=s.config,j(n),L(!0),k(!1);case 34:e.next=41;break;case 36:e.prev=36,e.t0=e.catch(0),console.log("error",e.t0),c.Am.error("Transaction error"),k(!1);case 41:case"end":return e.stop()}}),e,null,[[0,36]])})));return function(){return e.apply(this,arguments)}}();return(0,l.useEffect)((function(){(0,s.Z)((0,t.Z)().mark((function e(){var s,n,l,o;return(0,t.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,r&&a&&i.Z.ADMIN===(null===a||void 0===a?void 0:a.address)||f("/"),k(!0),e.next=5,(0,d.jh)();case 5:(s=e.sent).config&&(L(!0),j(null===s||void 0===s?void 0:s.config),n=null===s||void 0===s?void 0:s.config.data,l=n.fee,o=n.royalties,S(parseInt(l)/b.KN),R(o[0].vault_address),z(parseInt(o[0].percent)/b.Mg),E(o[1].vault_address),B(parseInt(o[1].percent)/b.Mg)),k(!1),e.next=13;break;case 10:e.prev=10,e.t0=e.catch(0),console.log("error",e.t0);case 13:case"end":return e.stop()}}),e,null,[[0,10]])})))()}),[a]),(0,g.jsxs)("div",{className:"admin-page",children:[y&&(0,g.jsx)("div",{id:"preloader"}),(0,g.jsx)("div",{className:"admin-container",children:(0,g.jsx)("div",{className:"admin-control",children:(0,g.jsxs)("div",{className:"grid gap-6 mb-6 w-1/2 my-0 mx-[auto]",children:[(0,g.jsxs)("div",{className:"w-1/2",children:[(0,g.jsx)("label",{className:"block mb-2 text-sm font-medium text-gray-900 text-white",children:"Fee"}),(0,g.jsx)("input",{type:"number",className:"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",value:A,onChange:function(e){return S(parseFloat(e.target.value))}})]}),(0,g.jsxs)("div",{className:"w-full",children:[(0,g.jsx)("label",{className:"block mb-2 text-sm font-medium text-gray-900 text-white",children:"Royalty1 Address"}),(0,g.jsx)("input",{type:"text",className:"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",value:F,onChange:function(e){return R(e.target.value)}})]}),(0,g.jsxs)("div",{className:"w-1/2",children:[(0,g.jsx)("label",{className:"block mb-2 text-sm font-medium text-gray-900 text-white",children:"Royalty1 Percent"}),(0,g.jsx)("input",{type:"number",className:"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",value:M,onChange:function(e){return z(parseFloat(e.target.value))}})]}),(0,g.jsxs)("div",{className:"w-full",children:[(0,g.jsx)("label",{className:"block mb-2 text-sm font-medium text-gray-900 text-white",children:"Royalty2 Address"}),(0,g.jsx)("input",{type:"text",className:"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",value:D,onChange:function(e){return E(e.target.value)}})]}),(0,g.jsxs)("div",{className:"w-1/2",children:[(0,g.jsx)("label",{className:"block mb-2 text-sm font-medium text-gray-900 text-white",children:"Royalty2 Percent"}),(0,g.jsx)("input",{type:"number",className:"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",value:q,onChange:function(e){return B(parseFloat(e.target.value))}})]}),(0,g.jsx)("div",{className:"w-full flex justify-center",children:(0,g.jsx)("button",{className:"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded",onClick:function(){return O()},children:J?"Update":"Initialize"})})]})})})]})}}}]);
//# sourceMappingURL=107.d521f5ac.chunk.js.map