(()=>{var aw=Object.create;var T_=Object.defineProperty;var lw=Object.getOwnPropertyDescriptor;var cw=Object.getOwnPropertyNames;var uw=Object.getPrototypeOf,hw=Object.prototype.hasOwnProperty;var Zr=(n,e,t)=>()=>{if(t)throw t[0];try{return n&&(e=n(n=0)),e}catch(i){throw t=[i],i}};var ji=(n,e)=>()=>{try{return e||n((e={exports:{}}).exports,e),e.exports}catch(t){throw e=0,t}};var fw=(n,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of cw(e))!hw.call(n,r)&&r!==t&&T_(n,r,{get:()=>e[r],enumerable:!(i=lw(e,r))||i.enumerable});return n};var Mr=(n,e,t)=>(t=n!=null?aw(uw(n)):{},fw(e||!n||!n.__esModule?T_(t,"default",{value:n,enumerable:!0}):t,n));var O_=ji(Je=>{"use strict";var ul=Symbol.for("react.element"),dw=Symbol.for("react.portal"),pw=Symbol.for("react.fragment"),mw=Symbol.for("react.strict_mode"),gw=Symbol.for("react.profiler"),_w=Symbol.for("react.provider"),vw=Symbol.for("react.context"),xw=Symbol.for("react.forward_ref"),yw=Symbol.for("react.suspense"),Sw=Symbol.for("react.memo"),Mw=Symbol.for("react.lazy"),b_=Symbol.iterator;function ww(n){return n===null||typeof n!="object"?null:(n=b_&&n[b_]||n["@@iterator"],typeof n=="function"?n:null)}var R_={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},P_=Object.assign,I_={};function Oo(n,e,t){this.props=n,this.context=e,this.refs=I_,this.updater=t||R_}Oo.prototype.isReactComponent={};Oo.prototype.setState=function(n,e){if(typeof n!="object"&&typeof n!="function"&&n!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,n,e,"setState")};Oo.prototype.forceUpdate=function(n){this.updater.enqueueForceUpdate(this,n,"forceUpdate")};function L_(){}L_.prototype=Oo.prototype;function Xd(n,e,t){this.props=n,this.context=e,this.refs=I_,this.updater=t||R_}var qd=Xd.prototype=new L_;qd.constructor=Xd;P_(qd,Oo.prototype);qd.isPureReactComponent=!0;var A_=Array.isArray,D_=Object.prototype.hasOwnProperty,Yd={current:null},N_={key:!0,ref:!0,__self:!0,__source:!0};function U_(n,e,t){var i,r={},s=null,o=null;if(e!=null)for(i in e.ref!==void 0&&(o=e.ref),e.key!==void 0&&(s=""+e.key),e)D_.call(e,i)&&!N_.hasOwnProperty(i)&&(r[i]=e[i]);var a=arguments.length-2;if(a===1)r.children=t;else if(1<a){for(var l=Array(a),c=0;c<a;c++)l[c]=arguments[c+2];r.children=l}if(n&&n.defaultProps)for(i in a=n.defaultProps,a)r[i]===void 0&&(r[i]=a[i]);return{$$typeof:ul,type:n,key:s,ref:o,props:r,_owner:Yd.current}}function Ew(n,e){return{$$typeof:ul,type:n.type,key:e,ref:n.ref,props:n.props,_owner:n._owner}}function Zd(n){return typeof n=="object"&&n!==null&&n.$$typeof===ul}function Tw(n){var e={"=":"=0",":":"=2"};return"$"+n.replace(/[=:]/g,function(t){return e[t]})}var C_=/\/+/g;function Wd(n,e){return typeof n=="object"&&n!==null&&n.key!=null?Tw(""+n.key):e.toString(36)}function iu(n,e,t,i,r){var s=typeof n;(s==="undefined"||s==="boolean")&&(n=null);var o=!1;if(n===null)o=!0;else switch(s){case"string":case"number":o=!0;break;case"object":switch(n.$$typeof){case ul:case dw:o=!0}}if(o)return o=n,r=r(o),n=i===""?"."+Wd(o,0):i,A_(r)?(t="",n!=null&&(t=n.replace(C_,"$&/")+"/"),iu(r,e,t,"",function(c){return c})):r!=null&&(Zd(r)&&(r=Ew(r,t+(!r.key||o&&o.key===r.key?"":(""+r.key).replace(C_,"$&/")+"/")+n)),e.push(r)),1;if(o=0,i=i===""?".":i+":",A_(n))for(var a=0;a<n.length;a++){s=n[a];var l=i+Wd(s,a);o+=iu(s,e,t,l,r)}else if(l=ww(n),typeof l=="function")for(n=l.call(n),a=0;!(s=n.next()).done;)s=s.value,l=i+Wd(s,a++),o+=iu(s,e,t,l,r);else if(s==="object")throw e=String(n),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(n).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return o}function nu(n,e,t){if(n==null)return n;var i=[],r=0;return iu(n,i,"","",function(s){return e.call(t,s,r++)}),i}function bw(n){if(n._status===-1){var e=n._result;e=e(),e.then(function(t){(n._status===0||n._status===-1)&&(n._status=1,n._result=t)},function(t){(n._status===0||n._status===-1)&&(n._status=2,n._result=t)}),n._status===-1&&(n._status=0,n._result=e)}if(n._status===1)return n._result.default;throw n._result}var Rn={current:null},ru={transition:null},Aw={ReactCurrentDispatcher:Rn,ReactCurrentBatchConfig:ru,ReactCurrentOwner:Yd};function F_(){throw Error("act(...) is not supported in production builds of React.")}Je.Children={map:nu,forEach:function(n,e,t){nu(n,function(){e.apply(this,arguments)},t)},count:function(n){var e=0;return nu(n,function(){e++}),e},toArray:function(n){return nu(n,function(e){return e})||[]},only:function(n){if(!Zd(n))throw Error("React.Children.only expected to receive a single React element child.");return n}};Je.Component=Oo;Je.Fragment=pw;Je.Profiler=gw;Je.PureComponent=Xd;Je.StrictMode=mw;Je.Suspense=yw;Je.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Aw;Je.act=F_;Je.cloneElement=function(n,e,t){if(n==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+n+".");var i=P_({},n.props),r=n.key,s=n.ref,o=n._owner;if(e!=null){if(e.ref!==void 0&&(s=e.ref,o=Yd.current),e.key!==void 0&&(r=""+e.key),n.type&&n.type.defaultProps)var a=n.type.defaultProps;for(l in e)D_.call(e,l)&&!N_.hasOwnProperty(l)&&(i[l]=e[l]===void 0&&a!==void 0?a[l]:e[l])}var l=arguments.length-2;if(l===1)i.children=t;else if(1<l){a=Array(l);for(var c=0;c<l;c++)a[c]=arguments[c+2];i.children=a}return{$$typeof:ul,type:n.type,key:r,ref:s,props:i,_owner:o}};Je.createContext=function(n){return n={$$typeof:vw,_currentValue:n,_currentValue2:n,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},n.Provider={$$typeof:_w,_context:n},n.Consumer=n};Je.createElement=U_;Je.createFactory=function(n){var e=U_.bind(null,n);return e.type=n,e};Je.createRef=function(){return{current:null}};Je.forwardRef=function(n){return{$$typeof:xw,render:n}};Je.isValidElement=Zd;Je.lazy=function(n){return{$$typeof:Mw,_payload:{_status:-1,_result:n},_init:bw}};Je.memo=function(n,e){return{$$typeof:Sw,type:n,compare:e===void 0?null:e}};Je.startTransition=function(n){var e=ru.transition;ru.transition={};try{n()}finally{ru.transition=e}};Je.unstable_act=F_;Je.useCallback=function(n,e){return Rn.current.useCallback(n,e)};Je.useContext=function(n){return Rn.current.useContext(n)};Je.useDebugValue=function(){};Je.useDeferredValue=function(n){return Rn.current.useDeferredValue(n)};Je.useEffect=function(n,e){return Rn.current.useEffect(n,e)};Je.useId=function(){return Rn.current.useId()};Je.useImperativeHandle=function(n,e,t){return Rn.current.useImperativeHandle(n,e,t)};Je.useInsertionEffect=function(n,e){return Rn.current.useInsertionEffect(n,e)};Je.useLayoutEffect=function(n,e){return Rn.current.useLayoutEffect(n,e)};Je.useMemo=function(n,e){return Rn.current.useMemo(n,e)};Je.useReducer=function(n,e,t){return Rn.current.useReducer(n,e,t)};Je.useRef=function(n){return Rn.current.useRef(n)};Je.useState=function(n){return Rn.current.useState(n)};Je.useSyncExternalStore=function(n,e,t){return Rn.current.useSyncExternalStore(n,e,t)};Je.useTransition=function(){return Rn.current.useTransition()};Je.version="18.3.1"});var hl=ji((i3,B_)=>{"use strict";B_.exports=O_()});var Z_=ji(_t=>{"use strict";function jd(n,e){var t=n.length;n.push(e);e:for(;0<t;){var i=t-1>>>1,r=n[i];if(0<su(r,e))n[i]=e,n[t]=r,t=i;else break e}}function Di(n){return n.length===0?null:n[0]}function au(n){if(n.length===0)return null;var e=n[0],t=n.pop();if(t!==e){n[0]=t;e:for(var i=0,r=n.length,s=r>>>1;i<s;){var o=2*(i+1)-1,a=n[o],l=o+1,c=n[l];if(0>su(a,t))l<r&&0>su(c,a)?(n[i]=c,n[l]=t,i=l):(n[i]=a,n[o]=t,i=o);else if(l<r&&0>su(c,t))n[i]=c,n[l]=t,i=l;else break e}}return e}function su(n,e){var t=n.sortIndex-e.sortIndex;return t!==0?t:n.id-e.id}typeof performance=="object"&&typeof performance.now=="function"?(k_=performance,_t.unstable_now=function(){return k_.now()}):($d=Date,z_=$d.now(),_t.unstable_now=function(){return $d.now()-z_});var k_,$d,z_,Qi=[],$r=[],Cw=1,mi=null,dn=3,lu=!1,Zs=!1,dl=!1,H_=typeof setTimeout=="function"?setTimeout:null,W_=typeof clearTimeout=="function"?clearTimeout:null,V_=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function Qd(n){for(var e=Di($r);e!==null;){if(e.callback===null)au($r);else if(e.startTime<=n)au($r),e.sortIndex=e.expirationTime,jd(Qi,e);else break;e=Di($r)}}function ep(n){if(dl=!1,Qd(n),!Zs)if(Di(Qi)!==null)Zs=!0,np(tp);else{var e=Di($r);e!==null&&ip(ep,e.startTime-n)}}function tp(n,e){Zs=!1,dl&&(dl=!1,W_(pl),pl=-1),lu=!0;var t=dn;try{for(Qd(e),mi=Di(Qi);mi!==null&&(!(mi.expirationTime>e)||n&&!Y_());){var i=mi.callback;if(typeof i=="function"){mi.callback=null,dn=mi.priorityLevel;var r=i(mi.expirationTime<=e);e=_t.unstable_now(),typeof r=="function"?mi.callback=r:mi===Di(Qi)&&au(Qi),Qd(e)}else au(Qi);mi=Di(Qi)}if(mi!==null)var s=!0;else{var o=Di($r);o!==null&&ip(ep,o.startTime-e),s=!1}return s}finally{mi=null,dn=t,lu=!1}}var cu=!1,ou=null,pl=-1,X_=5,q_=-1;function Y_(){return!(_t.unstable_now()-q_<X_)}function Jd(){if(ou!==null){var n=_t.unstable_now();q_=n;var e=!0;try{e=ou(!0,n)}finally{e?fl():(cu=!1,ou=null)}}else cu=!1}var fl;typeof V_=="function"?fl=function(){V_(Jd)}:typeof MessageChannel<"u"?(Kd=new MessageChannel,G_=Kd.port2,Kd.port1.onmessage=Jd,fl=function(){G_.postMessage(null)}):fl=function(){H_(Jd,0)};var Kd,G_;function np(n){ou=n,cu||(cu=!0,fl())}function ip(n,e){pl=H_(function(){n(_t.unstable_now())},e)}_t.unstable_IdlePriority=5;_t.unstable_ImmediatePriority=1;_t.unstable_LowPriority=4;_t.unstable_NormalPriority=3;_t.unstable_Profiling=null;_t.unstable_UserBlockingPriority=2;_t.unstable_cancelCallback=function(n){n.callback=null};_t.unstable_continueExecution=function(){Zs||lu||(Zs=!0,np(tp))};_t.unstable_forceFrameRate=function(n){0>n||125<n?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):X_=0<n?Math.floor(1e3/n):5};_t.unstable_getCurrentPriorityLevel=function(){return dn};_t.unstable_getFirstCallbackNode=function(){return Di(Qi)};_t.unstable_next=function(n){switch(dn){case 1:case 2:case 3:var e=3;break;default:e=dn}var t=dn;dn=e;try{return n()}finally{dn=t}};_t.unstable_pauseExecution=function(){};_t.unstable_requestPaint=function(){};_t.unstable_runWithPriority=function(n,e){switch(n){case 1:case 2:case 3:case 4:case 5:break;default:n=3}var t=dn;dn=n;try{return e()}finally{dn=t}};_t.unstable_scheduleCallback=function(n,e,t){var i=_t.unstable_now();switch(typeof t=="object"&&t!==null?(t=t.delay,t=typeof t=="number"&&0<t?i+t:i):t=i,n){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=t+r,n={id:Cw++,callback:e,priorityLevel:n,startTime:t,expirationTime:r,sortIndex:-1},t>i?(n.sortIndex=t,jd($r,n),Di(Qi)===null&&n===Di($r)&&(dl?(W_(pl),pl=-1):dl=!0,ip(ep,t-i))):(n.sortIndex=r,jd(Qi,n),Zs||lu||(Zs=!0,np(tp))),n};_t.unstable_shouldYield=Y_;_t.unstable_wrapCallback=function(n){var e=dn;return function(){var t=dn;dn=e;try{return n.apply(this,arguments)}finally{dn=t}}}});var J_=ji((s3,$_)=>{"use strict";$_.exports=Z_()});var eS=ji(si=>{"use strict";var Rw=hl(),ii=J_();function ae(n){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+n,t=1;t<arguments.length;t++)e+="&args[]="+encodeURIComponent(arguments[t]);return"Minified React error #"+n+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var ix=new Set,Fl={};function ao(n,e){ra(n,e),ra(n+"Capture",e)}function ra(n,e){for(Fl[n]=e,n=0;n<e.length;n++)ix.add(e[n])}var Cr=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),bp=Object.prototype.hasOwnProperty,Pw=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,K_={},j_={};function Iw(n){return bp.call(j_,n)?!0:bp.call(K_,n)?!1:Pw.test(n)?j_[n]=!0:(K_[n]=!0,!1)}function Lw(n,e,t,i){if(t!==null&&t.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return i?!1:t!==null?!t.acceptsBooleans:(n=n.toLowerCase().slice(0,5),n!=="data-"&&n!=="aria-");default:return!1}}function Dw(n,e,t,i){if(e===null||typeof e>"u"||Lw(n,e,t,i))return!0;if(i)return!1;if(t!==null)switch(t.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function Ln(n,e,t,i,r,s,o){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=i,this.attributeNamespace=r,this.mustUseProperty=t,this.propertyName=n,this.type=e,this.sanitizeURL=s,this.removeEmptyString=o}var cn={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n){cn[n]=new Ln(n,0,!1,n,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(n){var e=n[0];cn[e]=new Ln(e,1,!1,n[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(n){cn[n]=new Ln(n,2,!1,n.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(n){cn[n]=new Ln(n,2,!1,n,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n){cn[n]=new Ln(n,3,!1,n.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(n){cn[n]=new Ln(n,3,!0,n,null,!1,!1)});["capture","download"].forEach(function(n){cn[n]=new Ln(n,4,!1,n,null,!1,!1)});["cols","rows","size","span"].forEach(function(n){cn[n]=new Ln(n,6,!1,n,null,!1,!1)});["rowSpan","start"].forEach(function(n){cn[n]=new Ln(n,5,!1,n.toLowerCase(),null,!1,!1)});var vm=/[\-:]([a-z])/g;function xm(n){return n[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n){var e=n.replace(vm,xm);cn[e]=new Ln(e,1,!1,n,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n){var e=n.replace(vm,xm);cn[e]=new Ln(e,1,!1,n,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(n){var e=n.replace(vm,xm);cn[e]=new Ln(e,1,!1,n,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(n){cn[n]=new Ln(n,1,!1,n.toLowerCase(),null,!1,!1)});cn.xlinkHref=new Ln("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(n){cn[n]=new Ln(n,1,!1,n.toLowerCase(),null,!0,!0)});function ym(n,e,t,i){var r=cn.hasOwnProperty(e)?cn[e]:null;(r!==null?r.type!==0:i||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(Dw(e,t,r,i)&&(t=null),i||r===null?Iw(e)&&(t===null?n.removeAttribute(e):n.setAttribute(e,""+t)):r.mustUseProperty?n[r.propertyName]=t===null?r.type===3?!1:"":t:(e=r.attributeName,i=r.attributeNamespace,t===null?n.removeAttribute(e):(r=r.type,t=r===3||r===4&&t===!0?"":""+t,i?n.setAttributeNS(i,e,t):n.setAttribute(e,t))))}var Lr=Rw.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,uu=Symbol.for("react.element"),zo=Symbol.for("react.portal"),Vo=Symbol.for("react.fragment"),Sm=Symbol.for("react.strict_mode"),Ap=Symbol.for("react.profiler"),rx=Symbol.for("react.provider"),sx=Symbol.for("react.context"),Mm=Symbol.for("react.forward_ref"),Cp=Symbol.for("react.suspense"),Rp=Symbol.for("react.suspense_list"),wm=Symbol.for("react.memo"),Kr=Symbol.for("react.lazy"),ox=Symbol.for("react.offscreen"),Q_=Symbol.iterator;function ml(n){return n===null||typeof n!="object"?null:(n=Q_&&n[Q_]||n["@@iterator"],typeof n=="function"?n:null)}var It=Object.assign,rp;function wl(n){if(rp===void 0)try{throw Error()}catch(t){var e=t.stack.trim().match(/\n( *(at )?)/);rp=e&&e[1]||""}return`
`+rp+n}var sp=!1;function op(n,e){if(!n||sp)return"";sp=!0;var t=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(c){var i=c}Reflect.construct(n,[],e)}else{try{e.call()}catch(c){i=c}n.call(e.prototype)}else{try{throw Error()}catch(c){i=c}n()}}catch(c){if(c&&i&&typeof c.stack=="string"){for(var r=c.stack.split(`
`),s=i.stack.split(`
`),o=r.length-1,a=s.length-1;1<=o&&0<=a&&r[o]!==s[a];)a--;for(;1<=o&&0<=a;o--,a--)if(r[o]!==s[a]){if(o!==1||a!==1)do if(o--,a--,0>a||r[o]!==s[a]){var l=`
`+r[o].replace(" at new "," at ");return n.displayName&&l.includes("<anonymous>")&&(l=l.replace("<anonymous>",n.displayName)),l}while(1<=o&&0<=a);break}}}finally{sp=!1,Error.prepareStackTrace=t}return(n=n?n.displayName||n.name:"")?wl(n):""}function Nw(n){switch(n.tag){case 5:return wl(n.type);case 16:return wl("Lazy");case 13:return wl("Suspense");case 19:return wl("SuspenseList");case 0:case 2:case 15:return n=op(n.type,!1),n;case 11:return n=op(n.type.render,!1),n;case 1:return n=op(n.type,!0),n;default:return""}}function Pp(n){if(n==null)return null;if(typeof n=="function")return n.displayName||n.name||null;if(typeof n=="string")return n;switch(n){case Vo:return"Fragment";case zo:return"Portal";case Ap:return"Profiler";case Sm:return"StrictMode";case Cp:return"Suspense";case Rp:return"SuspenseList"}if(typeof n=="object")switch(n.$$typeof){case sx:return(n.displayName||"Context")+".Consumer";case rx:return(n._context.displayName||"Context")+".Provider";case Mm:var e=n.render;return n=n.displayName,n||(n=e.displayName||e.name||"",n=n!==""?"ForwardRef("+n+")":"ForwardRef"),n;case wm:return e=n.displayName||null,e!==null?e:Pp(n.type)||"Memo";case Kr:e=n._payload,n=n._init;try{return Pp(n(e))}catch{}}return null}function Uw(n){var e=n.type;switch(n.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return n=e.render,n=n.displayName||n.name||"",e.displayName||(n!==""?"ForwardRef("+n+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Pp(e);case 8:return e===Sm?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function hs(n){switch(typeof n){case"boolean":case"number":case"string":case"undefined":return n;case"object":return n;default:return""}}function ax(n){var e=n.type;return(n=n.nodeName)&&n.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function Fw(n){var e=ax(n)?"checked":"value",t=Object.getOwnPropertyDescriptor(n.constructor.prototype,e),i=""+n[e];if(!n.hasOwnProperty(e)&&typeof t<"u"&&typeof t.get=="function"&&typeof t.set=="function"){var r=t.get,s=t.set;return Object.defineProperty(n,e,{configurable:!0,get:function(){return r.call(this)},set:function(o){i=""+o,s.call(this,o)}}),Object.defineProperty(n,e,{enumerable:t.enumerable}),{getValue:function(){return i},setValue:function(o){i=""+o},stopTracking:function(){n._valueTracker=null,delete n[e]}}}}function hu(n){n._valueTracker||(n._valueTracker=Fw(n))}function lx(n){if(!n)return!1;var e=n._valueTracker;if(!e)return!0;var t=e.getValue(),i="";return n&&(i=ax(n)?n.checked?"true":"false":n.value),n=i,n!==t?(e.setValue(n),!0):!1}function ku(n){if(n=n||(typeof document<"u"?document:void 0),typeof n>"u")return null;try{return n.activeElement||n.body}catch{return n.body}}function Ip(n,e){var t=e.checked;return It({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:t??n._wrapperState.initialChecked})}function ev(n,e){var t=e.defaultValue==null?"":e.defaultValue,i=e.checked!=null?e.checked:e.defaultChecked;t=hs(e.value!=null?e.value:t),n._wrapperState={initialChecked:i,initialValue:t,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function cx(n,e){e=e.checked,e!=null&&ym(n,"checked",e,!1)}function Lp(n,e){cx(n,e);var t=hs(e.value),i=e.type;if(t!=null)i==="number"?(t===0&&n.value===""||n.value!=t)&&(n.value=""+t):n.value!==""+t&&(n.value=""+t);else if(i==="submit"||i==="reset"){n.removeAttribute("value");return}e.hasOwnProperty("value")?Dp(n,e.type,t):e.hasOwnProperty("defaultValue")&&Dp(n,e.type,hs(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(n.defaultChecked=!!e.defaultChecked)}function tv(n,e,t){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var i=e.type;if(!(i!=="submit"&&i!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+n._wrapperState.initialValue,t||e===n.value||(n.value=e),n.defaultValue=e}t=n.name,t!==""&&(n.name=""),n.defaultChecked=!!n._wrapperState.initialChecked,t!==""&&(n.name=t)}function Dp(n,e,t){(e!=="number"||ku(n.ownerDocument)!==n)&&(t==null?n.defaultValue=""+n._wrapperState.initialValue:n.defaultValue!==""+t&&(n.defaultValue=""+t))}var El=Array.isArray;function jo(n,e,t,i){if(n=n.options,e){e={};for(var r=0;r<t.length;r++)e["$"+t[r]]=!0;for(t=0;t<n.length;t++)r=e.hasOwnProperty("$"+n[t].value),n[t].selected!==r&&(n[t].selected=r),r&&i&&(n[t].defaultSelected=!0)}else{for(t=""+hs(t),e=null,r=0;r<n.length;r++){if(n[r].value===t){n[r].selected=!0,i&&(n[r].defaultSelected=!0);return}e!==null||n[r].disabled||(e=n[r])}e!==null&&(e.selected=!0)}}function Np(n,e){if(e.dangerouslySetInnerHTML!=null)throw Error(ae(91));return It({},e,{value:void 0,defaultValue:void 0,children:""+n._wrapperState.initialValue})}function nv(n,e){var t=e.value;if(t==null){if(t=e.children,e=e.defaultValue,t!=null){if(e!=null)throw Error(ae(92));if(El(t)){if(1<t.length)throw Error(ae(93));t=t[0]}e=t}e==null&&(e=""),t=e}n._wrapperState={initialValue:hs(t)}}function ux(n,e){var t=hs(e.value),i=hs(e.defaultValue);t!=null&&(t=""+t,t!==n.value&&(n.value=t),e.defaultValue==null&&n.defaultValue!==t&&(n.defaultValue=t)),i!=null&&(n.defaultValue=""+i)}function iv(n){var e=n.textContent;e===n._wrapperState.initialValue&&e!==""&&e!==null&&(n.value=e)}function hx(n){switch(n){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Up(n,e){return n==null||n==="http://www.w3.org/1999/xhtml"?hx(e):n==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":n}var fu,fx=(function(n){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,t,i,r){MSApp.execUnsafeLocalFunction(function(){return n(e,t,i,r)})}:n})(function(n,e){if(n.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in n)n.innerHTML=e;else{for(fu=fu||document.createElement("div"),fu.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=fu.firstChild;n.firstChild;)n.removeChild(n.firstChild);for(;e.firstChild;)n.appendChild(e.firstChild)}});function Ol(n,e){if(e){var t=n.firstChild;if(t&&t===n.lastChild&&t.nodeType===3){t.nodeValue=e;return}}n.textContent=e}var Al={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Ow=["Webkit","ms","Moz","O"];Object.keys(Al).forEach(function(n){Ow.forEach(function(e){e=e+n.charAt(0).toUpperCase()+n.substring(1),Al[e]=Al[n]})});function dx(n,e,t){return e==null||typeof e=="boolean"||e===""?"":t||typeof e!="number"||e===0||Al.hasOwnProperty(n)&&Al[n]?(""+e).trim():e+"px"}function px(n,e){n=n.style;for(var t in e)if(e.hasOwnProperty(t)){var i=t.indexOf("--")===0,r=dx(t,e[t],i);t==="float"&&(t="cssFloat"),i?n.setProperty(t,r):n[t]=r}}var Bw=It({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Fp(n,e){if(e){if(Bw[n]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(ae(137,n));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(ae(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(ae(61))}if(e.style!=null&&typeof e.style!="object")throw Error(ae(62))}}function Op(n,e){if(n.indexOf("-")===-1)return typeof e.is=="string";switch(n){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Bp=null;function Em(n){return n=n.target||n.srcElement||window,n.correspondingUseElement&&(n=n.correspondingUseElement),n.nodeType===3?n.parentNode:n}var kp=null,Qo=null,ea=null;function rv(n){if(n=tc(n)){if(typeof kp!="function")throw Error(ae(280));var e=n.stateNode;e&&(e=dh(e),kp(n.stateNode,n.type,e))}}function mx(n){Qo?ea?ea.push(n):ea=[n]:Qo=n}function gx(){if(Qo){var n=Qo,e=ea;if(ea=Qo=null,rv(n),e)for(n=0;n<e.length;n++)rv(e[n])}}function _x(n,e){return n(e)}function vx(){}var ap=!1;function xx(n,e,t){if(ap)return n(e,t);ap=!0;try{return _x(n,e,t)}finally{ap=!1,(Qo!==null||ea!==null)&&(vx(),gx())}}function Bl(n,e){var t=n.stateNode;if(t===null)return null;var i=dh(t);if(i===null)return null;t=i[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(n=n.type,i=!(n==="button"||n==="input"||n==="select"||n==="textarea")),n=!i;break e;default:n=!1}if(n)return null;if(t&&typeof t!="function")throw Error(ae(231,e,typeof t));return t}var zp=!1;if(Cr)try{Bo={},Object.defineProperty(Bo,"passive",{get:function(){zp=!0}}),window.addEventListener("test",Bo,Bo),window.removeEventListener("test",Bo,Bo)}catch{zp=!1}var Bo;function kw(n,e,t,i,r,s,o,a,l){var c=Array.prototype.slice.call(arguments,3);try{e.apply(t,c)}catch(u){this.onError(u)}}var Cl=!1,zu=null,Vu=!1,Vp=null,zw={onError:function(n){Cl=!0,zu=n}};function Vw(n,e,t,i,r,s,o,a,l){Cl=!1,zu=null,kw.apply(zw,arguments)}function Gw(n,e,t,i,r,s,o,a,l){if(Vw.apply(this,arguments),Cl){if(Cl){var c=zu;Cl=!1,zu=null}else throw Error(ae(198));Vu||(Vu=!0,Vp=c)}}function lo(n){var e=n,t=n;if(n.alternate)for(;e.return;)e=e.return;else{n=e;do e=n,(e.flags&4098)!==0&&(t=e.return),n=e.return;while(n)}return e.tag===3?t:null}function yx(n){if(n.tag===13){var e=n.memoizedState;if(e===null&&(n=n.alternate,n!==null&&(e=n.memoizedState)),e!==null)return e.dehydrated}return null}function sv(n){if(lo(n)!==n)throw Error(ae(188))}function Hw(n){var e=n.alternate;if(!e){if(e=lo(n),e===null)throw Error(ae(188));return e!==n?null:n}for(var t=n,i=e;;){var r=t.return;if(r===null)break;var s=r.alternate;if(s===null){if(i=r.return,i!==null){t=i;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===t)return sv(r),n;if(s===i)return sv(r),e;s=s.sibling}throw Error(ae(188))}if(t.return!==i.return)t=r,i=s;else{for(var o=!1,a=r.child;a;){if(a===t){o=!0,t=r,i=s;break}if(a===i){o=!0,i=r,t=s;break}a=a.sibling}if(!o){for(a=s.child;a;){if(a===t){o=!0,t=s,i=r;break}if(a===i){o=!0,i=s,t=r;break}a=a.sibling}if(!o)throw Error(ae(189))}}if(t.alternate!==i)throw Error(ae(190))}if(t.tag!==3)throw Error(ae(188));return t.stateNode.current===t?n:e}function Sx(n){return n=Hw(n),n!==null?Mx(n):null}function Mx(n){if(n.tag===5||n.tag===6)return n;for(n=n.child;n!==null;){var e=Mx(n);if(e!==null)return e;n=n.sibling}return null}var wx=ii.unstable_scheduleCallback,ov=ii.unstable_cancelCallback,Ww=ii.unstable_shouldYield,Xw=ii.unstable_requestPaint,Vt=ii.unstable_now,qw=ii.unstable_getCurrentPriorityLevel,Tm=ii.unstable_ImmediatePriority,Ex=ii.unstable_UserBlockingPriority,Gu=ii.unstable_NormalPriority,Yw=ii.unstable_LowPriority,Tx=ii.unstable_IdlePriority,ch=null,ir=null;function Zw(n){if(ir&&typeof ir.onCommitFiberRoot=="function")try{ir.onCommitFiberRoot(ch,n,void 0,(n.current.flags&128)===128)}catch{}}var Bi=Math.clz32?Math.clz32:Kw,$w=Math.log,Jw=Math.LN2;function Kw(n){return n>>>=0,n===0?32:31-($w(n)/Jw|0)|0}var du=64,pu=4194304;function Tl(n){switch(n&-n){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return n&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return n}}function Hu(n,e){var t=n.pendingLanes;if(t===0)return 0;var i=0,r=n.suspendedLanes,s=n.pingedLanes,o=t&268435455;if(o!==0){var a=o&~r;a!==0?i=Tl(a):(s&=o,s!==0&&(i=Tl(s)))}else o=t&~r,o!==0?i=Tl(o):s!==0&&(i=Tl(s));if(i===0)return 0;if(e!==0&&e!==i&&(e&r)===0&&(r=i&-i,s=e&-e,r>=s||r===16&&(s&4194240)!==0))return e;if((i&4)!==0&&(i|=t&16),e=n.entangledLanes,e!==0)for(n=n.entanglements,e&=i;0<e;)t=31-Bi(e),r=1<<t,i|=n[t],e&=~r;return i}function jw(n,e){switch(n){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Qw(n,e){for(var t=n.suspendedLanes,i=n.pingedLanes,r=n.expirationTimes,s=n.pendingLanes;0<s;){var o=31-Bi(s),a=1<<o,l=r[o];l===-1?((a&t)===0||(a&i)!==0)&&(r[o]=jw(a,e)):l<=e&&(n.expiredLanes|=a),s&=~a}}function Gp(n){return n=n.pendingLanes&-1073741825,n!==0?n:n&1073741824?1073741824:0}function bx(){var n=du;return du<<=1,(du&4194240)===0&&(du=64),n}function lp(n){for(var e=[],t=0;31>t;t++)e.push(n);return e}function Ql(n,e,t){n.pendingLanes|=e,e!==536870912&&(n.suspendedLanes=0,n.pingedLanes=0),n=n.eventTimes,e=31-Bi(e),n[e]=t}function eE(n,e){var t=n.pendingLanes&~e;n.pendingLanes=e,n.suspendedLanes=0,n.pingedLanes=0,n.expiredLanes&=e,n.mutableReadLanes&=e,n.entangledLanes&=e,e=n.entanglements;var i=n.eventTimes;for(n=n.expirationTimes;0<t;){var r=31-Bi(t),s=1<<r;e[r]=0,i[r]=-1,n[r]=-1,t&=~s}}function bm(n,e){var t=n.entangledLanes|=e;for(n=n.entanglements;t;){var i=31-Bi(t),r=1<<i;r&e|n[i]&e&&(n[i]|=e),t&=~r}}var pt=0;function Ax(n){return n&=-n,1<n?4<n?(n&268435455)!==0?16:536870912:4:1}var Cx,Am,Rx,Px,Ix,Hp=!1,mu=[],is=null,rs=null,ss=null,kl=new Map,zl=new Map,Qr=[],tE="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function av(n,e){switch(n){case"focusin":case"focusout":is=null;break;case"dragenter":case"dragleave":rs=null;break;case"mouseover":case"mouseout":ss=null;break;case"pointerover":case"pointerout":kl.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":zl.delete(e.pointerId)}}function gl(n,e,t,i,r,s){return n===null||n.nativeEvent!==s?(n={blockedOn:e,domEventName:t,eventSystemFlags:i,nativeEvent:s,targetContainers:[r]},e!==null&&(e=tc(e),e!==null&&Am(e)),n):(n.eventSystemFlags|=i,e=n.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),n)}function nE(n,e,t,i,r){switch(e){case"focusin":return is=gl(is,n,e,t,i,r),!0;case"dragenter":return rs=gl(rs,n,e,t,i,r),!0;case"mouseover":return ss=gl(ss,n,e,t,i,r),!0;case"pointerover":var s=r.pointerId;return kl.set(s,gl(kl.get(s)||null,n,e,t,i,r)),!0;case"gotpointercapture":return s=r.pointerId,zl.set(s,gl(zl.get(s)||null,n,e,t,i,r)),!0}return!1}function Lx(n){var e=Ks(n.target);if(e!==null){var t=lo(e);if(t!==null){if(e=t.tag,e===13){if(e=yx(t),e!==null){n.blockedOn=e,Ix(n.priority,function(){Rx(t)});return}}else if(e===3&&t.stateNode.current.memoizedState.isDehydrated){n.blockedOn=t.tag===3?t.stateNode.containerInfo:null;return}}}n.blockedOn=null}function Ru(n){if(n.blockedOn!==null)return!1;for(var e=n.targetContainers;0<e.length;){var t=Wp(n.domEventName,n.eventSystemFlags,e[0],n.nativeEvent);if(t===null){t=n.nativeEvent;var i=new t.constructor(t.type,t);Bp=i,t.target.dispatchEvent(i),Bp=null}else return e=tc(t),e!==null&&Am(e),n.blockedOn=t,!1;e.shift()}return!0}function lv(n,e,t){Ru(n)&&t.delete(e)}function iE(){Hp=!1,is!==null&&Ru(is)&&(is=null),rs!==null&&Ru(rs)&&(rs=null),ss!==null&&Ru(ss)&&(ss=null),kl.forEach(lv),zl.forEach(lv)}function _l(n,e){n.blockedOn===e&&(n.blockedOn=null,Hp||(Hp=!0,ii.unstable_scheduleCallback(ii.unstable_NormalPriority,iE)))}function Vl(n){function e(r){return _l(r,n)}if(0<mu.length){_l(mu[0],n);for(var t=1;t<mu.length;t++){var i=mu[t];i.blockedOn===n&&(i.blockedOn=null)}}for(is!==null&&_l(is,n),rs!==null&&_l(rs,n),ss!==null&&_l(ss,n),kl.forEach(e),zl.forEach(e),t=0;t<Qr.length;t++)i=Qr[t],i.blockedOn===n&&(i.blockedOn=null);for(;0<Qr.length&&(t=Qr[0],t.blockedOn===null);)Lx(t),t.blockedOn===null&&Qr.shift()}var ta=Lr.ReactCurrentBatchConfig,Wu=!0;function rE(n,e,t,i){var r=pt,s=ta.transition;ta.transition=null;try{pt=1,Cm(n,e,t,i)}finally{pt=r,ta.transition=s}}function sE(n,e,t,i){var r=pt,s=ta.transition;ta.transition=null;try{pt=4,Cm(n,e,t,i)}finally{pt=r,ta.transition=s}}function Cm(n,e,t,i){if(Wu){var r=Wp(n,e,t,i);if(r===null)mp(n,e,i,Xu,t),av(n,i);else if(nE(r,n,e,t,i))i.stopPropagation();else if(av(n,i),e&4&&-1<tE.indexOf(n)){for(;r!==null;){var s=tc(r);if(s!==null&&Cx(s),s=Wp(n,e,t,i),s===null&&mp(n,e,i,Xu,t),s===r)break;r=s}r!==null&&i.stopPropagation()}else mp(n,e,i,null,t)}}var Xu=null;function Wp(n,e,t,i){if(Xu=null,n=Em(i),n=Ks(n),n!==null)if(e=lo(n),e===null)n=null;else if(t=e.tag,t===13){if(n=yx(e),n!==null)return n;n=null}else if(t===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;n=null}else e!==n&&(n=null);return Xu=n,null}function Dx(n){switch(n){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(qw()){case Tm:return 1;case Ex:return 4;case Gu:case Yw:return 16;case Tx:return 536870912;default:return 16}default:return 16}}var ts=null,Rm=null,Pu=null;function Nx(){if(Pu)return Pu;var n,e=Rm,t=e.length,i,r="value"in ts?ts.value:ts.textContent,s=r.length;for(n=0;n<t&&e[n]===r[n];n++);var o=t-n;for(i=1;i<=o&&e[t-i]===r[s-i];i++);return Pu=r.slice(n,1<i?1-i:void 0)}function Iu(n){var e=n.keyCode;return"charCode"in n?(n=n.charCode,n===0&&e===13&&(n=13)):n=e,n===10&&(n=13),32<=n||n===13?n:0}function gu(){return!0}function cv(){return!1}function ri(n){function e(t,i,r,s,o){this._reactName=t,this._targetInst=r,this.type=i,this.nativeEvent=s,this.target=o,this.currentTarget=null;for(var a in n)n.hasOwnProperty(a)&&(t=n[a],this[a]=t?t(s):s[a]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?gu:cv,this.isPropagationStopped=cv,this}return It(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var t=this.nativeEvent;t&&(t.preventDefault?t.preventDefault():typeof t.returnValue!="unknown"&&(t.returnValue=!1),this.isDefaultPrevented=gu)},stopPropagation:function(){var t=this.nativeEvent;t&&(t.stopPropagation?t.stopPropagation():typeof t.cancelBubble!="unknown"&&(t.cancelBubble=!0),this.isPropagationStopped=gu)},persist:function(){},isPersistent:gu}),e}var ha={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(n){return n.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Pm=ri(ha),ec=It({},ha,{view:0,detail:0}),oE=ri(ec),cp,up,vl,uh=It({},ec,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Im,button:0,buttons:0,relatedTarget:function(n){return n.relatedTarget===void 0?n.fromElement===n.srcElement?n.toElement:n.fromElement:n.relatedTarget},movementX:function(n){return"movementX"in n?n.movementX:(n!==vl&&(vl&&n.type==="mousemove"?(cp=n.screenX-vl.screenX,up=n.screenY-vl.screenY):up=cp=0,vl=n),cp)},movementY:function(n){return"movementY"in n?n.movementY:up}}),uv=ri(uh),aE=It({},uh,{dataTransfer:0}),lE=ri(aE),cE=It({},ec,{relatedTarget:0}),hp=ri(cE),uE=It({},ha,{animationName:0,elapsedTime:0,pseudoElement:0}),hE=ri(uE),fE=It({},ha,{clipboardData:function(n){return"clipboardData"in n?n.clipboardData:window.clipboardData}}),dE=ri(fE),pE=It({},ha,{data:0}),hv=ri(pE),mE={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},gE={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},_E={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function vE(n){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(n):(n=_E[n])?!!e[n]:!1}function Im(){return vE}var xE=It({},ec,{key:function(n){if(n.key){var e=mE[n.key]||n.key;if(e!=="Unidentified")return e}return n.type==="keypress"?(n=Iu(n),n===13?"Enter":String.fromCharCode(n)):n.type==="keydown"||n.type==="keyup"?gE[n.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Im,charCode:function(n){return n.type==="keypress"?Iu(n):0},keyCode:function(n){return n.type==="keydown"||n.type==="keyup"?n.keyCode:0},which:function(n){return n.type==="keypress"?Iu(n):n.type==="keydown"||n.type==="keyup"?n.keyCode:0}}),yE=ri(xE),SE=It({},uh,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),fv=ri(SE),ME=It({},ec,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Im}),wE=ri(ME),EE=It({},ha,{propertyName:0,elapsedTime:0,pseudoElement:0}),TE=ri(EE),bE=It({},uh,{deltaX:function(n){return"deltaX"in n?n.deltaX:"wheelDeltaX"in n?-n.wheelDeltaX:0},deltaY:function(n){return"deltaY"in n?n.deltaY:"wheelDeltaY"in n?-n.wheelDeltaY:"wheelDelta"in n?-n.wheelDelta:0},deltaZ:0,deltaMode:0}),AE=ri(bE),CE=[9,13,27,32],Lm=Cr&&"CompositionEvent"in window,Rl=null;Cr&&"documentMode"in document&&(Rl=document.documentMode);var RE=Cr&&"TextEvent"in window&&!Rl,Ux=Cr&&(!Lm||Rl&&8<Rl&&11>=Rl),dv=" ",pv=!1;function Fx(n,e){switch(n){case"keyup":return CE.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Ox(n){return n=n.detail,typeof n=="object"&&"data"in n?n.data:null}var Go=!1;function PE(n,e){switch(n){case"compositionend":return Ox(e);case"keypress":return e.which!==32?null:(pv=!0,dv);case"textInput":return n=e.data,n===dv&&pv?null:n;default:return null}}function IE(n,e){if(Go)return n==="compositionend"||!Lm&&Fx(n,e)?(n=Nx(),Pu=Rm=ts=null,Go=!1,n):null;switch(n){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return Ux&&e.locale!=="ko"?null:e.data;default:return null}}var LE={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function mv(n){var e=n&&n.nodeName&&n.nodeName.toLowerCase();return e==="input"?!!LE[n.type]:e==="textarea"}function Bx(n,e,t,i){mx(i),e=qu(e,"onChange"),0<e.length&&(t=new Pm("onChange","change",null,t,i),n.push({event:t,listeners:e}))}var Pl=null,Gl=null;function DE(n){$x(n,0)}function hh(n){var e=Xo(n);if(lx(e))return n}function NE(n,e){if(n==="change")return e}var kx=!1;Cr&&(Cr?(vu="oninput"in document,vu||(fp=document.createElement("div"),fp.setAttribute("oninput","return;"),vu=typeof fp.oninput=="function"),_u=vu):_u=!1,kx=_u&&(!document.documentMode||9<document.documentMode));var _u,vu,fp;function gv(){Pl&&(Pl.detachEvent("onpropertychange",zx),Gl=Pl=null)}function zx(n){if(n.propertyName==="value"&&hh(Gl)){var e=[];Bx(e,Gl,n,Em(n)),xx(DE,e)}}function UE(n,e,t){n==="focusin"?(gv(),Pl=e,Gl=t,Pl.attachEvent("onpropertychange",zx)):n==="focusout"&&gv()}function FE(n){if(n==="selectionchange"||n==="keyup"||n==="keydown")return hh(Gl)}function OE(n,e){if(n==="click")return hh(e)}function BE(n,e){if(n==="input"||n==="change")return hh(e)}function kE(n,e){return n===e&&(n!==0||1/n===1/e)||n!==n&&e!==e}var zi=typeof Object.is=="function"?Object.is:kE;function Hl(n,e){if(zi(n,e))return!0;if(typeof n!="object"||n===null||typeof e!="object"||e===null)return!1;var t=Object.keys(n),i=Object.keys(e);if(t.length!==i.length)return!1;for(i=0;i<t.length;i++){var r=t[i];if(!bp.call(e,r)||!zi(n[r],e[r]))return!1}return!0}function _v(n){for(;n&&n.firstChild;)n=n.firstChild;return n}function vv(n,e){var t=_v(n);n=0;for(var i;t;){if(t.nodeType===3){if(i=n+t.textContent.length,n<=e&&i>=e)return{node:t,offset:e-n};n=i}e:{for(;t;){if(t.nextSibling){t=t.nextSibling;break e}t=t.parentNode}t=void 0}t=_v(t)}}function Vx(n,e){return n&&e?n===e?!0:n&&n.nodeType===3?!1:e&&e.nodeType===3?Vx(n,e.parentNode):"contains"in n?n.contains(e):n.compareDocumentPosition?!!(n.compareDocumentPosition(e)&16):!1:!1}function Gx(){for(var n=window,e=ku();e instanceof n.HTMLIFrameElement;){try{var t=typeof e.contentWindow.location.href=="string"}catch{t=!1}if(t)n=e.contentWindow;else break;e=ku(n.document)}return e}function Dm(n){var e=n&&n.nodeName&&n.nodeName.toLowerCase();return e&&(e==="input"&&(n.type==="text"||n.type==="search"||n.type==="tel"||n.type==="url"||n.type==="password")||e==="textarea"||n.contentEditable==="true")}function zE(n){var e=Gx(),t=n.focusedElem,i=n.selectionRange;if(e!==t&&t&&t.ownerDocument&&Vx(t.ownerDocument.documentElement,t)){if(i!==null&&Dm(t)){if(e=i.start,n=i.end,n===void 0&&(n=e),"selectionStart"in t)t.selectionStart=e,t.selectionEnd=Math.min(n,t.value.length);else if(n=(e=t.ownerDocument||document)&&e.defaultView||window,n.getSelection){n=n.getSelection();var r=t.textContent.length,s=Math.min(i.start,r);i=i.end===void 0?s:Math.min(i.end,r),!n.extend&&s>i&&(r=i,i=s,s=r),r=vv(t,s);var o=vv(t,i);r&&o&&(n.rangeCount!==1||n.anchorNode!==r.node||n.anchorOffset!==r.offset||n.focusNode!==o.node||n.focusOffset!==o.offset)&&(e=e.createRange(),e.setStart(r.node,r.offset),n.removeAllRanges(),s>i?(n.addRange(e),n.extend(o.node,o.offset)):(e.setEnd(o.node,o.offset),n.addRange(e)))}}for(e=[],n=t;n=n.parentNode;)n.nodeType===1&&e.push({element:n,left:n.scrollLeft,top:n.scrollTop});for(typeof t.focus=="function"&&t.focus(),t=0;t<e.length;t++)n=e[t],n.element.scrollLeft=n.left,n.element.scrollTop=n.top}}var VE=Cr&&"documentMode"in document&&11>=document.documentMode,Ho=null,Xp=null,Il=null,qp=!1;function xv(n,e,t){var i=t.window===t?t.document:t.nodeType===9?t:t.ownerDocument;qp||Ho==null||Ho!==ku(i)||(i=Ho,"selectionStart"in i&&Dm(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),Il&&Hl(Il,i)||(Il=i,i=qu(Xp,"onSelect"),0<i.length&&(e=new Pm("onSelect","select",null,e,t),n.push({event:e,listeners:i}),e.target=Ho)))}function xu(n,e){var t={};return t[n.toLowerCase()]=e.toLowerCase(),t["Webkit"+n]="webkit"+e,t["Moz"+n]="moz"+e,t}var Wo={animationend:xu("Animation","AnimationEnd"),animationiteration:xu("Animation","AnimationIteration"),animationstart:xu("Animation","AnimationStart"),transitionend:xu("Transition","TransitionEnd")},dp={},Hx={};Cr&&(Hx=document.createElement("div").style,"AnimationEvent"in window||(delete Wo.animationend.animation,delete Wo.animationiteration.animation,delete Wo.animationstart.animation),"TransitionEvent"in window||delete Wo.transitionend.transition);function fh(n){if(dp[n])return dp[n];if(!Wo[n])return n;var e=Wo[n],t;for(t in e)if(e.hasOwnProperty(t)&&t in Hx)return dp[n]=e[t];return n}var Wx=fh("animationend"),Xx=fh("animationiteration"),qx=fh("animationstart"),Yx=fh("transitionend"),Zx=new Map,yv="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function ds(n,e){Zx.set(n,e),ao(e,[n])}for(yu=0;yu<yv.length;yu++)Su=yv[yu],Sv=Su.toLowerCase(),Mv=Su[0].toUpperCase()+Su.slice(1),ds(Sv,"on"+Mv);var Su,Sv,Mv,yu;ds(Wx,"onAnimationEnd");ds(Xx,"onAnimationIteration");ds(qx,"onAnimationStart");ds("dblclick","onDoubleClick");ds("focusin","onFocus");ds("focusout","onBlur");ds(Yx,"onTransitionEnd");ra("onMouseEnter",["mouseout","mouseover"]);ra("onMouseLeave",["mouseout","mouseover"]);ra("onPointerEnter",["pointerout","pointerover"]);ra("onPointerLeave",["pointerout","pointerover"]);ao("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));ao("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));ao("onBeforeInput",["compositionend","keypress","textInput","paste"]);ao("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));ao("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));ao("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var bl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),GE=new Set("cancel close invalid load scroll toggle".split(" ").concat(bl));function wv(n,e,t){var i=n.type||"unknown-event";n.currentTarget=t,Gw(i,e,void 0,n),n.currentTarget=null}function $x(n,e){e=(e&4)!==0;for(var t=0;t<n.length;t++){var i=n[t],r=i.event;i=i.listeners;e:{var s=void 0;if(e)for(var o=i.length-1;0<=o;o--){var a=i[o],l=a.instance,c=a.currentTarget;if(a=a.listener,l!==s&&r.isPropagationStopped())break e;wv(r,a,c),s=l}else for(o=0;o<i.length;o++){if(a=i[o],l=a.instance,c=a.currentTarget,a=a.listener,l!==s&&r.isPropagationStopped())break e;wv(r,a,c),s=l}}}if(Vu)throw n=Vp,Vu=!1,Vp=null,n}function St(n,e){var t=e[Kp];t===void 0&&(t=e[Kp]=new Set);var i=n+"__bubble";t.has(i)||(Jx(e,n,2,!1),t.add(i))}function pp(n,e,t){var i=0;e&&(i|=4),Jx(t,n,i,e)}var Mu="_reactListening"+Math.random().toString(36).slice(2);function Wl(n){if(!n[Mu]){n[Mu]=!0,ix.forEach(function(t){t!=="selectionchange"&&(GE.has(t)||pp(t,!1,n),pp(t,!0,n))});var e=n.nodeType===9?n:n.ownerDocument;e===null||e[Mu]||(e[Mu]=!0,pp("selectionchange",!1,e))}}function Jx(n,e,t,i){switch(Dx(e)){case 1:var r=rE;break;case 4:r=sE;break;default:r=Cm}t=r.bind(null,e,t,n),r=void 0,!zp||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),i?r!==void 0?n.addEventListener(e,t,{capture:!0,passive:r}):n.addEventListener(e,t,!0):r!==void 0?n.addEventListener(e,t,{passive:r}):n.addEventListener(e,t,!1)}function mp(n,e,t,i,r){var s=i;if((e&1)===0&&(e&2)===0&&i!==null)e:for(;;){if(i===null)return;var o=i.tag;if(o===3||o===4){var a=i.stateNode.containerInfo;if(a===r||a.nodeType===8&&a.parentNode===r)break;if(o===4)for(o=i.return;o!==null;){var l=o.tag;if((l===3||l===4)&&(l=o.stateNode.containerInfo,l===r||l.nodeType===8&&l.parentNode===r))return;o=o.return}for(;a!==null;){if(o=Ks(a),o===null)return;if(l=o.tag,l===5||l===6){i=s=o;continue e}a=a.parentNode}}i=i.return}xx(function(){var c=s,u=Em(t),d=[];e:{var h=Zx.get(n);if(h!==void 0){var p=Pm,g=n;switch(n){case"keypress":if(Iu(t)===0)break e;case"keydown":case"keyup":p=yE;break;case"focusin":g="focus",p=hp;break;case"focusout":g="blur",p=hp;break;case"beforeblur":case"afterblur":p=hp;break;case"click":if(t.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":p=uv;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":p=lE;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":p=wE;break;case Wx:case Xx:case qx:p=hE;break;case Yx:p=TE;break;case"scroll":p=oE;break;case"wheel":p=AE;break;case"copy":case"cut":case"paste":p=dE;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":p=fv}var _=(e&4)!==0,m=!_&&n==="scroll",f=_?h!==null?h+"Capture":null:h;_=[];for(var v=c,M;v!==null;){M=v;var y=M.stateNode;if(M.tag===5&&y!==null&&(M=y,f!==null&&(y=Bl(v,f),y!=null&&_.push(Xl(v,y,M)))),m)break;v=v.return}0<_.length&&(h=new p(h,g,null,t,u),d.push({event:h,listeners:_}))}}if((e&7)===0){e:{if(h=n==="mouseover"||n==="pointerover",p=n==="mouseout"||n==="pointerout",h&&t!==Bp&&(g=t.relatedTarget||t.fromElement)&&(Ks(g)||g[Rr]))break e;if((p||h)&&(h=u.window===u?u:(h=u.ownerDocument)?h.defaultView||h.parentWindow:window,p?(g=t.relatedTarget||t.toElement,p=c,g=g?Ks(g):null,g!==null&&(m=lo(g),g!==m||g.tag!==5&&g.tag!==6)&&(g=null)):(p=null,g=c),p!==g)){if(_=uv,y="onMouseLeave",f="onMouseEnter",v="mouse",(n==="pointerout"||n==="pointerover")&&(_=fv,y="onPointerLeave",f="onPointerEnter",v="pointer"),m=p==null?h:Xo(p),M=g==null?h:Xo(g),h=new _(y,v+"leave",p,t,u),h.target=m,h.relatedTarget=M,y=null,Ks(u)===c&&(_=new _(f,v+"enter",g,t,u),_.target=M,_.relatedTarget=m,y=_),m=y,p&&g)t:{for(_=p,f=g,v=0,M=_;M;M=ko(M))v++;for(M=0,y=f;y;y=ko(y))M++;for(;0<v-M;)_=ko(_),v--;for(;0<M-v;)f=ko(f),M--;for(;v--;){if(_===f||f!==null&&_===f.alternate)break t;_=ko(_),f=ko(f)}_=null}else _=null;p!==null&&Ev(d,h,p,_,!1),g!==null&&m!==null&&Ev(d,m,g,_,!0)}}e:{if(h=c?Xo(c):window,p=h.nodeName&&h.nodeName.toLowerCase(),p==="select"||p==="input"&&h.type==="file")var w=NE;else if(mv(h))if(kx)w=BE;else{w=FE;var E=UE}else(p=h.nodeName)&&p.toLowerCase()==="input"&&(h.type==="checkbox"||h.type==="radio")&&(w=OE);if(w&&(w=w(n,c))){Bx(d,w,t,u);break e}E&&E(n,h,c),n==="focusout"&&(E=h._wrapperState)&&E.controlled&&h.type==="number"&&Dp(h,"number",h.value)}switch(E=c?Xo(c):window,n){case"focusin":(mv(E)||E.contentEditable==="true")&&(Ho=E,Xp=c,Il=null);break;case"focusout":Il=Xp=Ho=null;break;case"mousedown":qp=!0;break;case"contextmenu":case"mouseup":case"dragend":qp=!1,xv(d,t,u);break;case"selectionchange":if(VE)break;case"keydown":case"keyup":xv(d,t,u)}var A;if(Lm)e:{switch(n){case"compositionstart":var x="onCompositionStart";break e;case"compositionend":x="onCompositionEnd";break e;case"compositionupdate":x="onCompositionUpdate";break e}x=void 0}else Go?Fx(n,t)&&(x="onCompositionEnd"):n==="keydown"&&t.keyCode===229&&(x="onCompositionStart");x&&(Ux&&t.locale!=="ko"&&(Go||x!=="onCompositionStart"?x==="onCompositionEnd"&&Go&&(A=Nx()):(ts=u,Rm="value"in ts?ts.value:ts.textContent,Go=!0)),E=qu(c,x),0<E.length&&(x=new hv(x,n,null,t,u),d.push({event:x,listeners:E}),A?x.data=A:(A=Ox(t),A!==null&&(x.data=A)))),(A=RE?PE(n,t):IE(n,t))&&(c=qu(c,"onBeforeInput"),0<c.length&&(u=new hv("onBeforeInput","beforeinput",null,t,u),d.push({event:u,listeners:c}),u.data=A))}$x(d,e)})}function Xl(n,e,t){return{instance:n,listener:e,currentTarget:t}}function qu(n,e){for(var t=e+"Capture",i=[];n!==null;){var r=n,s=r.stateNode;r.tag===5&&s!==null&&(r=s,s=Bl(n,t),s!=null&&i.unshift(Xl(n,s,r)),s=Bl(n,e),s!=null&&i.push(Xl(n,s,r))),n=n.return}return i}function ko(n){if(n===null)return null;do n=n.return;while(n&&n.tag!==5);return n||null}function Ev(n,e,t,i,r){for(var s=e._reactName,o=[];t!==null&&t!==i;){var a=t,l=a.alternate,c=a.stateNode;if(l!==null&&l===i)break;a.tag===5&&c!==null&&(a=c,r?(l=Bl(t,s),l!=null&&o.unshift(Xl(t,l,a))):r||(l=Bl(t,s),l!=null&&o.push(Xl(t,l,a)))),t=t.return}o.length!==0&&n.push({event:e,listeners:o})}var HE=/\r\n?/g,WE=/\u0000|\uFFFD/g;function Tv(n){return(typeof n=="string"?n:""+n).replace(HE,`
`).replace(WE,"")}function wu(n,e,t){if(e=Tv(e),Tv(n)!==e&&t)throw Error(ae(425))}function Yu(){}var Yp=null,Zp=null;function $p(n,e){return n==="textarea"||n==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var Jp=typeof setTimeout=="function"?setTimeout:void 0,XE=typeof clearTimeout=="function"?clearTimeout:void 0,bv=typeof Promise=="function"?Promise:void 0,qE=typeof queueMicrotask=="function"?queueMicrotask:typeof bv<"u"?function(n){return bv.resolve(null).then(n).catch(YE)}:Jp;function YE(n){setTimeout(function(){throw n})}function gp(n,e){var t=e,i=0;do{var r=t.nextSibling;if(n.removeChild(t),r&&r.nodeType===8)if(t=r.data,t==="/$"){if(i===0){n.removeChild(r),Vl(e);return}i--}else t!=="$"&&t!=="$?"&&t!=="$!"||i++;t=r}while(t);Vl(e)}function os(n){for(;n!=null;n=n.nextSibling){var e=n.nodeType;if(e===1||e===3)break;if(e===8){if(e=n.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return n}function Av(n){n=n.previousSibling;for(var e=0;n;){if(n.nodeType===8){var t=n.data;if(t==="$"||t==="$!"||t==="$?"){if(e===0)return n;e--}else t==="/$"&&e++}n=n.previousSibling}return null}var fa=Math.random().toString(36).slice(2),nr="__reactFiber$"+fa,ql="__reactProps$"+fa,Rr="__reactContainer$"+fa,Kp="__reactEvents$"+fa,ZE="__reactListeners$"+fa,$E="__reactHandles$"+fa;function Ks(n){var e=n[nr];if(e)return e;for(var t=n.parentNode;t;){if(e=t[Rr]||t[nr]){if(t=e.alternate,e.child!==null||t!==null&&t.child!==null)for(n=Av(n);n!==null;){if(t=n[nr])return t;n=Av(n)}return e}n=t,t=n.parentNode}return null}function tc(n){return n=n[nr]||n[Rr],!n||n.tag!==5&&n.tag!==6&&n.tag!==13&&n.tag!==3?null:n}function Xo(n){if(n.tag===5||n.tag===6)return n.stateNode;throw Error(ae(33))}function dh(n){return n[ql]||null}var jp=[],qo=-1;function ps(n){return{current:n}}function Mt(n){0>qo||(n.current=jp[qo],jp[qo]=null,qo--)}function vt(n,e){qo++,jp[qo]=n.current,n.current=e}var fs={},_n=ps(fs),Gn=ps(!1),no=fs;function sa(n,e){var t=n.type.contextTypes;if(!t)return fs;var i=n.stateNode;if(i&&i.__reactInternalMemoizedUnmaskedChildContext===e)return i.__reactInternalMemoizedMaskedChildContext;var r={},s;for(s in t)r[s]=e[s];return i&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=e,n.__reactInternalMemoizedMaskedChildContext=r),r}function Hn(n){return n=n.childContextTypes,n!=null}function Zu(){Mt(Gn),Mt(_n)}function Cv(n,e,t){if(_n.current!==fs)throw Error(ae(168));vt(_n,e),vt(Gn,t)}function Kx(n,e,t){var i=n.stateNode;if(e=e.childContextTypes,typeof i.getChildContext!="function")return t;i=i.getChildContext();for(var r in i)if(!(r in e))throw Error(ae(108,Uw(n)||"Unknown",r));return It({},t,i)}function $u(n){return n=(n=n.stateNode)&&n.__reactInternalMemoizedMergedChildContext||fs,no=_n.current,vt(_n,n),vt(Gn,Gn.current),!0}function Rv(n,e,t){var i=n.stateNode;if(!i)throw Error(ae(169));t?(n=Kx(n,e,no),i.__reactInternalMemoizedMergedChildContext=n,Mt(Gn),Mt(_n),vt(_n,n)):Mt(Gn),vt(Gn,t)}var Er=null,ph=!1,_p=!1;function jx(n){Er===null?Er=[n]:Er.push(n)}function JE(n){ph=!0,jx(n)}function ms(){if(!_p&&Er!==null){_p=!0;var n=0,e=pt;try{var t=Er;for(pt=1;n<t.length;n++){var i=t[n];do i=i(!0);while(i!==null)}Er=null,ph=!1}catch(r){throw Er!==null&&(Er=Er.slice(n+1)),wx(Tm,ms),r}finally{pt=e,_p=!1}}return null}var Yo=[],Zo=0,Ju=null,Ku=0,gi=[],_i=0,io=null,Tr=1,br="";function $s(n,e){Yo[Zo++]=Ku,Yo[Zo++]=Ju,Ju=n,Ku=e}function Qx(n,e,t){gi[_i++]=Tr,gi[_i++]=br,gi[_i++]=io,io=n;var i=Tr;n=br;var r=32-Bi(i)-1;i&=~(1<<r),t+=1;var s=32-Bi(e)+r;if(30<s){var o=r-r%5;s=(i&(1<<o)-1).toString(32),i>>=o,r-=o,Tr=1<<32-Bi(e)+r|t<<r|i,br=s+n}else Tr=1<<s|t<<r|i,br=n}function Nm(n){n.return!==null&&($s(n,1),Qx(n,1,0))}function Um(n){for(;n===Ju;)Ju=Yo[--Zo],Yo[Zo]=null,Ku=Yo[--Zo],Yo[Zo]=null;for(;n===io;)io=gi[--_i],gi[_i]=null,br=gi[--_i],gi[_i]=null,Tr=gi[--_i],gi[_i]=null}var ni=null,ti=null,bt=!1,Oi=null;function ey(n,e){var t=vi(5,null,null,0);t.elementType="DELETED",t.stateNode=e,t.return=n,e=n.deletions,e===null?(n.deletions=[t],n.flags|=16):e.push(t)}function Pv(n,e){switch(n.tag){case 5:var t=n.type;return e=e.nodeType!==1||t.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(n.stateNode=e,ni=n,ti=os(e.firstChild),!0):!1;case 6:return e=n.pendingProps===""||e.nodeType!==3?null:e,e!==null?(n.stateNode=e,ni=n,ti=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(t=io!==null?{id:Tr,overflow:br}:null,n.memoizedState={dehydrated:e,treeContext:t,retryLane:1073741824},t=vi(18,null,null,0),t.stateNode=e,t.return=n,n.child=t,ni=n,ti=null,!0):!1;default:return!1}}function Qp(n){return(n.mode&1)!==0&&(n.flags&128)===0}function em(n){if(bt){var e=ti;if(e){var t=e;if(!Pv(n,e)){if(Qp(n))throw Error(ae(418));e=os(t.nextSibling);var i=ni;e&&Pv(n,e)?ey(i,t):(n.flags=n.flags&-4097|2,bt=!1,ni=n)}}else{if(Qp(n))throw Error(ae(418));n.flags=n.flags&-4097|2,bt=!1,ni=n}}}function Iv(n){for(n=n.return;n!==null&&n.tag!==5&&n.tag!==3&&n.tag!==13;)n=n.return;ni=n}function Eu(n){if(n!==ni)return!1;if(!bt)return Iv(n),bt=!0,!1;var e;if((e=n.tag!==3)&&!(e=n.tag!==5)&&(e=n.type,e=e!=="head"&&e!=="body"&&!$p(n.type,n.memoizedProps)),e&&(e=ti)){if(Qp(n))throw ty(),Error(ae(418));for(;e;)ey(n,e),e=os(e.nextSibling)}if(Iv(n),n.tag===13){if(n=n.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(ae(317));e:{for(n=n.nextSibling,e=0;n;){if(n.nodeType===8){var t=n.data;if(t==="/$"){if(e===0){ti=os(n.nextSibling);break e}e--}else t!=="$"&&t!=="$!"&&t!=="$?"||e++}n=n.nextSibling}ti=null}}else ti=ni?os(n.stateNode.nextSibling):null;return!0}function ty(){for(var n=ti;n;)n=os(n.nextSibling)}function oa(){ti=ni=null,bt=!1}function Fm(n){Oi===null?Oi=[n]:Oi.push(n)}var KE=Lr.ReactCurrentBatchConfig;function xl(n,e,t){if(n=t.ref,n!==null&&typeof n!="function"&&typeof n!="object"){if(t._owner){if(t=t._owner,t){if(t.tag!==1)throw Error(ae(309));var i=t.stateNode}if(!i)throw Error(ae(147,n));var r=i,s=""+n;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===s?e.ref:(e=function(o){var a=r.refs;o===null?delete a[s]:a[s]=o},e._stringRef=s,e)}if(typeof n!="string")throw Error(ae(284));if(!t._owner)throw Error(ae(290,n))}return n}function Tu(n,e){throw n=Object.prototype.toString.call(e),Error(ae(31,n==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":n))}function Lv(n){var e=n._init;return e(n._payload)}function ny(n){function e(f,v){if(n){var M=f.deletions;M===null?(f.deletions=[v],f.flags|=16):M.push(v)}}function t(f,v){if(!n)return null;for(;v!==null;)e(f,v),v=v.sibling;return null}function i(f,v){for(f=new Map;v!==null;)v.key!==null?f.set(v.key,v):f.set(v.index,v),v=v.sibling;return f}function r(f,v){return f=us(f,v),f.index=0,f.sibling=null,f}function s(f,v,M){return f.index=M,n?(M=f.alternate,M!==null?(M=M.index,M<v?(f.flags|=2,v):M):(f.flags|=2,v)):(f.flags|=1048576,v)}function o(f){return n&&f.alternate===null&&(f.flags|=2),f}function a(f,v,M,y){return v===null||v.tag!==6?(v=Ep(M,f.mode,y),v.return=f,v):(v=r(v,M),v.return=f,v)}function l(f,v,M,y){var w=M.type;return w===Vo?u(f,v,M.props.children,y,M.key):v!==null&&(v.elementType===w||typeof w=="object"&&w!==null&&w.$$typeof===Kr&&Lv(w)===v.type)?(y=r(v,M.props),y.ref=xl(f,v,M),y.return=f,y):(y=Bu(M.type,M.key,M.props,null,f.mode,y),y.ref=xl(f,v,M),y.return=f,y)}function c(f,v,M,y){return v===null||v.tag!==4||v.stateNode.containerInfo!==M.containerInfo||v.stateNode.implementation!==M.implementation?(v=Tp(M,f.mode,y),v.return=f,v):(v=r(v,M.children||[]),v.return=f,v)}function u(f,v,M,y,w){return v===null||v.tag!==7?(v=to(M,f.mode,y,w),v.return=f,v):(v=r(v,M),v.return=f,v)}function d(f,v,M){if(typeof v=="string"&&v!==""||typeof v=="number")return v=Ep(""+v,f.mode,M),v.return=f,v;if(typeof v=="object"&&v!==null){switch(v.$$typeof){case uu:return M=Bu(v.type,v.key,v.props,null,f.mode,M),M.ref=xl(f,null,v),M.return=f,M;case zo:return v=Tp(v,f.mode,M),v.return=f,v;case Kr:var y=v._init;return d(f,y(v._payload),M)}if(El(v)||ml(v))return v=to(v,f.mode,M,null),v.return=f,v;Tu(f,v)}return null}function h(f,v,M,y){var w=v!==null?v.key:null;if(typeof M=="string"&&M!==""||typeof M=="number")return w!==null?null:a(f,v,""+M,y);if(typeof M=="object"&&M!==null){switch(M.$$typeof){case uu:return M.key===w?l(f,v,M,y):null;case zo:return M.key===w?c(f,v,M,y):null;case Kr:return w=M._init,h(f,v,w(M._payload),y)}if(El(M)||ml(M))return w!==null?null:u(f,v,M,y,null);Tu(f,M)}return null}function p(f,v,M,y,w){if(typeof y=="string"&&y!==""||typeof y=="number")return f=f.get(M)||null,a(v,f,""+y,w);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case uu:return f=f.get(y.key===null?M:y.key)||null,l(v,f,y,w);case zo:return f=f.get(y.key===null?M:y.key)||null,c(v,f,y,w);case Kr:var E=y._init;return p(f,v,M,E(y._payload),w)}if(El(y)||ml(y))return f=f.get(M)||null,u(v,f,y,w,null);Tu(v,y)}return null}function g(f,v,M,y){for(var w=null,E=null,A=v,x=v=0,b=null;A!==null&&x<M.length;x++){A.index>x?(b=A,A=null):b=A.sibling;var P=h(f,A,M[x],y);if(P===null){A===null&&(A=b);break}n&&A&&P.alternate===null&&e(f,A),v=s(P,v,x),E===null?w=P:E.sibling=P,E=P,A=b}if(x===M.length)return t(f,A),bt&&$s(f,x),w;if(A===null){for(;x<M.length;x++)A=d(f,M[x],y),A!==null&&(v=s(A,v,x),E===null?w=A:E.sibling=A,E=A);return bt&&$s(f,x),w}for(A=i(f,A);x<M.length;x++)b=p(A,f,x,M[x],y),b!==null&&(n&&b.alternate!==null&&A.delete(b.key===null?x:b.key),v=s(b,v,x),E===null?w=b:E.sibling=b,E=b);return n&&A.forEach(function(L){return e(f,L)}),bt&&$s(f,x),w}function _(f,v,M,y){var w=ml(M);if(typeof w!="function")throw Error(ae(150));if(M=w.call(M),M==null)throw Error(ae(151));for(var E=w=null,A=v,x=v=0,b=null,P=M.next();A!==null&&!P.done;x++,P=M.next()){A.index>x?(b=A,A=null):b=A.sibling;var L=h(f,A,P.value,y);if(L===null){A===null&&(A=b);break}n&&A&&L.alternate===null&&e(f,A),v=s(L,v,x),E===null?w=L:E.sibling=L,E=L,A=b}if(P.done)return t(f,A),bt&&$s(f,x),w;if(A===null){for(;!P.done;x++,P=M.next())P=d(f,P.value,y),P!==null&&(v=s(P,v,x),E===null?w=P:E.sibling=P,E=P);return bt&&$s(f,x),w}for(A=i(f,A);!P.done;x++,P=M.next())P=p(A,f,x,P.value,y),P!==null&&(n&&P.alternate!==null&&A.delete(P.key===null?x:P.key),v=s(P,v,x),E===null?w=P:E.sibling=P,E=P);return n&&A.forEach(function(D){return e(f,D)}),bt&&$s(f,x),w}function m(f,v,M,y){if(typeof M=="object"&&M!==null&&M.type===Vo&&M.key===null&&(M=M.props.children),typeof M=="object"&&M!==null){switch(M.$$typeof){case uu:e:{for(var w=M.key,E=v;E!==null;){if(E.key===w){if(w=M.type,w===Vo){if(E.tag===7){t(f,E.sibling),v=r(E,M.props.children),v.return=f,f=v;break e}}else if(E.elementType===w||typeof w=="object"&&w!==null&&w.$$typeof===Kr&&Lv(w)===E.type){t(f,E.sibling),v=r(E,M.props),v.ref=xl(f,E,M),v.return=f,f=v;break e}t(f,E);break}else e(f,E);E=E.sibling}M.type===Vo?(v=to(M.props.children,f.mode,y,M.key),v.return=f,f=v):(y=Bu(M.type,M.key,M.props,null,f.mode,y),y.ref=xl(f,v,M),y.return=f,f=y)}return o(f);case zo:e:{for(E=M.key;v!==null;){if(v.key===E)if(v.tag===4&&v.stateNode.containerInfo===M.containerInfo&&v.stateNode.implementation===M.implementation){t(f,v.sibling),v=r(v,M.children||[]),v.return=f,f=v;break e}else{t(f,v);break}else e(f,v);v=v.sibling}v=Tp(M,f.mode,y),v.return=f,f=v}return o(f);case Kr:return E=M._init,m(f,v,E(M._payload),y)}if(El(M))return g(f,v,M,y);if(ml(M))return _(f,v,M,y);Tu(f,M)}return typeof M=="string"&&M!==""||typeof M=="number"?(M=""+M,v!==null&&v.tag===6?(t(f,v.sibling),v=r(v,M),v.return=f,f=v):(t(f,v),v=Ep(M,f.mode,y),v.return=f,f=v),o(f)):t(f,v)}return m}var aa=ny(!0),iy=ny(!1),ju=ps(null),Qu=null,$o=null,Om=null;function Bm(){Om=$o=Qu=null}function km(n){var e=ju.current;Mt(ju),n._currentValue=e}function tm(n,e,t){for(;n!==null;){var i=n.alternate;if((n.childLanes&e)!==e?(n.childLanes|=e,i!==null&&(i.childLanes|=e)):i!==null&&(i.childLanes&e)!==e&&(i.childLanes|=e),n===t)break;n=n.return}}function na(n,e){Qu=n,Om=$o=null,n=n.dependencies,n!==null&&n.firstContext!==null&&((n.lanes&e)!==0&&(Vn=!0),n.firstContext=null)}function yi(n){var e=n._currentValue;if(Om!==n)if(n={context:n,memoizedValue:e,next:null},$o===null){if(Qu===null)throw Error(ae(308));$o=n,Qu.dependencies={lanes:0,firstContext:n}}else $o=$o.next=n;return e}var js=null;function zm(n){js===null?js=[n]:js.push(n)}function ry(n,e,t,i){var r=e.interleaved;return r===null?(t.next=t,zm(e)):(t.next=r.next,r.next=t),e.interleaved=t,Pr(n,i)}function Pr(n,e){n.lanes|=e;var t=n.alternate;for(t!==null&&(t.lanes|=e),t=n,n=n.return;n!==null;)n.childLanes|=e,t=n.alternate,t!==null&&(t.childLanes|=e),t=n,n=n.return;return t.tag===3?t.stateNode:null}var jr=!1;function Vm(n){n.updateQueue={baseState:n.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function sy(n,e){n=n.updateQueue,e.updateQueue===n&&(e.updateQueue={baseState:n.baseState,firstBaseUpdate:n.firstBaseUpdate,lastBaseUpdate:n.lastBaseUpdate,shared:n.shared,effects:n.effects})}function Ar(n,e){return{eventTime:n,lane:e,tag:0,payload:null,callback:null,next:null}}function as(n,e,t){var i=n.updateQueue;if(i===null)return null;if(i=i.shared,(st&2)!==0){var r=i.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),i.pending=e,Pr(n,t)}return r=i.interleaved,r===null?(e.next=e,zm(i)):(e.next=r.next,r.next=e),i.interleaved=e,Pr(n,t)}function Lu(n,e,t){if(e=e.updateQueue,e!==null&&(e=e.shared,(t&4194240)!==0)){var i=e.lanes;i&=n.pendingLanes,t|=i,e.lanes=t,bm(n,t)}}function Dv(n,e){var t=n.updateQueue,i=n.alternate;if(i!==null&&(i=i.updateQueue,t===i)){var r=null,s=null;if(t=t.firstBaseUpdate,t!==null){do{var o={eventTime:t.eventTime,lane:t.lane,tag:t.tag,payload:t.payload,callback:t.callback,next:null};s===null?r=s=o:s=s.next=o,t=t.next}while(t!==null);s===null?r=s=e:s=s.next=e}else r=s=e;t={baseState:i.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:i.shared,effects:i.effects},n.updateQueue=t;return}n=t.lastBaseUpdate,n===null?t.firstBaseUpdate=e:n.next=e,t.lastBaseUpdate=e}function eh(n,e,t,i){var r=n.updateQueue;jr=!1;var s=r.firstBaseUpdate,o=r.lastBaseUpdate,a=r.shared.pending;if(a!==null){r.shared.pending=null;var l=a,c=l.next;l.next=null,o===null?s=c:o.next=c,o=l;var u=n.alternate;u!==null&&(u=u.updateQueue,a=u.lastBaseUpdate,a!==o&&(a===null?u.firstBaseUpdate=c:a.next=c,u.lastBaseUpdate=l))}if(s!==null){var d=r.baseState;o=0,u=c=l=null,a=s;do{var h=a.lane,p=a.eventTime;if((i&h)===h){u!==null&&(u=u.next={eventTime:p,lane:0,tag:a.tag,payload:a.payload,callback:a.callback,next:null});e:{var g=n,_=a;switch(h=e,p=t,_.tag){case 1:if(g=_.payload,typeof g=="function"){d=g.call(p,d,h);break e}d=g;break e;case 3:g.flags=g.flags&-65537|128;case 0:if(g=_.payload,h=typeof g=="function"?g.call(p,d,h):g,h==null)break e;d=It({},d,h);break e;case 2:jr=!0}}a.callback!==null&&a.lane!==0&&(n.flags|=64,h=r.effects,h===null?r.effects=[a]:h.push(a))}else p={eventTime:p,lane:h,tag:a.tag,payload:a.payload,callback:a.callback,next:null},u===null?(c=u=p,l=d):u=u.next=p,o|=h;if(a=a.next,a===null){if(a=r.shared.pending,a===null)break;h=a,a=h.next,h.next=null,r.lastBaseUpdate=h,r.shared.pending=null}}while(!0);if(u===null&&(l=d),r.baseState=l,r.firstBaseUpdate=c,r.lastBaseUpdate=u,e=r.shared.interleaved,e!==null){r=e;do o|=r.lane,r=r.next;while(r!==e)}else s===null&&(r.shared.lanes=0);so|=o,n.lanes=o,n.memoizedState=d}}function Nv(n,e,t){if(n=e.effects,e.effects=null,n!==null)for(e=0;e<n.length;e++){var i=n[e],r=i.callback;if(r!==null){if(i.callback=null,i=t,typeof r!="function")throw Error(ae(191,r));r.call(i)}}}var nc={},rr=ps(nc),Yl=ps(nc),Zl=ps(nc);function Qs(n){if(n===nc)throw Error(ae(174));return n}function Gm(n,e){switch(vt(Zl,e),vt(Yl,n),vt(rr,nc),n=e.nodeType,n){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:Up(null,"");break;default:n=n===8?e.parentNode:e,e=n.namespaceURI||null,n=n.tagName,e=Up(e,n)}Mt(rr),vt(rr,e)}function la(){Mt(rr),Mt(Yl),Mt(Zl)}function oy(n){Qs(Zl.current);var e=Qs(rr.current),t=Up(e,n.type);e!==t&&(vt(Yl,n),vt(rr,t))}function Hm(n){Yl.current===n&&(Mt(rr),Mt(Yl))}var Rt=ps(0);function th(n){for(var e=n;e!==null;){if(e.tag===13){var t=e.memoizedState;if(t!==null&&(t=t.dehydrated,t===null||t.data==="$?"||t.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if((e.flags&128)!==0)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===n)break;for(;e.sibling===null;){if(e.return===null||e.return===n)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var vp=[];function Wm(){for(var n=0;n<vp.length;n++)vp[n]._workInProgressVersionPrimary=null;vp.length=0}var Du=Lr.ReactCurrentDispatcher,xp=Lr.ReactCurrentBatchConfig,ro=0,Pt=null,Zt=null,Qt=null,nh=!1,Ll=!1,$l=0,jE=0;function pn(){throw Error(ae(321))}function Xm(n,e){if(e===null)return!1;for(var t=0;t<e.length&&t<n.length;t++)if(!zi(n[t],e[t]))return!1;return!0}function qm(n,e,t,i,r,s){if(ro=s,Pt=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,Du.current=n===null||n.memoizedState===null?nT:iT,n=t(i,r),Ll){s=0;do{if(Ll=!1,$l=0,25<=s)throw Error(ae(301));s+=1,Qt=Zt=null,e.updateQueue=null,Du.current=rT,n=t(i,r)}while(Ll)}if(Du.current=ih,e=Zt!==null&&Zt.next!==null,ro=0,Qt=Zt=Pt=null,nh=!1,e)throw Error(ae(300));return n}function Ym(){var n=$l!==0;return $l=0,n}function tr(){var n={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Qt===null?Pt.memoizedState=Qt=n:Qt=Qt.next=n,Qt}function Si(){if(Zt===null){var n=Pt.alternate;n=n!==null?n.memoizedState:null}else n=Zt.next;var e=Qt===null?Pt.memoizedState:Qt.next;if(e!==null)Qt=e,Zt=n;else{if(n===null)throw Error(ae(310));Zt=n,n={memoizedState:Zt.memoizedState,baseState:Zt.baseState,baseQueue:Zt.baseQueue,queue:Zt.queue,next:null},Qt===null?Pt.memoizedState=Qt=n:Qt=Qt.next=n}return Qt}function Jl(n,e){return typeof e=="function"?e(n):e}function yp(n){var e=Si(),t=e.queue;if(t===null)throw Error(ae(311));t.lastRenderedReducer=n;var i=Zt,r=i.baseQueue,s=t.pending;if(s!==null){if(r!==null){var o=r.next;r.next=s.next,s.next=o}i.baseQueue=r=s,t.pending=null}if(r!==null){s=r.next,i=i.baseState;var a=o=null,l=null,c=s;do{var u=c.lane;if((ro&u)===u)l!==null&&(l=l.next={lane:0,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),i=c.hasEagerState?c.eagerState:n(i,c.action);else{var d={lane:u,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null};l===null?(a=l=d,o=i):l=l.next=d,Pt.lanes|=u,so|=u}c=c.next}while(c!==null&&c!==s);l===null?o=i:l.next=a,zi(i,e.memoizedState)||(Vn=!0),e.memoizedState=i,e.baseState=o,e.baseQueue=l,t.lastRenderedState=i}if(n=t.interleaved,n!==null){r=n;do s=r.lane,Pt.lanes|=s,so|=s,r=r.next;while(r!==n)}else r===null&&(t.lanes=0);return[e.memoizedState,t.dispatch]}function Sp(n){var e=Si(),t=e.queue;if(t===null)throw Error(ae(311));t.lastRenderedReducer=n;var i=t.dispatch,r=t.pending,s=e.memoizedState;if(r!==null){t.pending=null;var o=r=r.next;do s=n(s,o.action),o=o.next;while(o!==r);zi(s,e.memoizedState)||(Vn=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),t.lastRenderedState=s}return[s,i]}function ay(){}function ly(n,e){var t=Pt,i=Si(),r=e(),s=!zi(i.memoizedState,r);if(s&&(i.memoizedState=r,Vn=!0),i=i.queue,Zm(hy.bind(null,t,i,n),[n]),i.getSnapshot!==e||s||Qt!==null&&Qt.memoizedState.tag&1){if(t.flags|=2048,Kl(9,uy.bind(null,t,i,r,e),void 0,null),en===null)throw Error(ae(349));(ro&30)!==0||cy(t,e,r)}return r}function cy(n,e,t){n.flags|=16384,n={getSnapshot:e,value:t},e=Pt.updateQueue,e===null?(e={lastEffect:null,stores:null},Pt.updateQueue=e,e.stores=[n]):(t=e.stores,t===null?e.stores=[n]:t.push(n))}function uy(n,e,t,i){e.value=t,e.getSnapshot=i,fy(e)&&dy(n)}function hy(n,e,t){return t(function(){fy(e)&&dy(n)})}function fy(n){var e=n.getSnapshot;n=n.value;try{var t=e();return!zi(n,t)}catch{return!0}}function dy(n){var e=Pr(n,1);e!==null&&ki(e,n,1,-1)}function Uv(n){var e=tr();return typeof n=="function"&&(n=n()),e.memoizedState=e.baseState=n,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Jl,lastRenderedState:n},e.queue=n,n=n.dispatch=tT.bind(null,Pt,n),[e.memoizedState,n]}function Kl(n,e,t,i){return n={tag:n,create:e,destroy:t,deps:i,next:null},e=Pt.updateQueue,e===null?(e={lastEffect:null,stores:null},Pt.updateQueue=e,e.lastEffect=n.next=n):(t=e.lastEffect,t===null?e.lastEffect=n.next=n:(i=t.next,t.next=n,n.next=i,e.lastEffect=n)),n}function py(){return Si().memoizedState}function Nu(n,e,t,i){var r=tr();Pt.flags|=n,r.memoizedState=Kl(1|e,t,void 0,i===void 0?null:i)}function mh(n,e,t,i){var r=Si();i=i===void 0?null:i;var s=void 0;if(Zt!==null){var o=Zt.memoizedState;if(s=o.destroy,i!==null&&Xm(i,o.deps)){r.memoizedState=Kl(e,t,s,i);return}}Pt.flags|=n,r.memoizedState=Kl(1|e,t,s,i)}function Fv(n,e){return Nu(8390656,8,n,e)}function Zm(n,e){return mh(2048,8,n,e)}function my(n,e){return mh(4,2,n,e)}function gy(n,e){return mh(4,4,n,e)}function _y(n,e){if(typeof e=="function")return n=n(),e(n),function(){e(null)};if(e!=null)return n=n(),e.current=n,function(){e.current=null}}function vy(n,e,t){return t=t!=null?t.concat([n]):null,mh(4,4,_y.bind(null,e,n),t)}function $m(){}function xy(n,e){var t=Si();e=e===void 0?null:e;var i=t.memoizedState;return i!==null&&e!==null&&Xm(e,i[1])?i[0]:(t.memoizedState=[n,e],n)}function yy(n,e){var t=Si();e=e===void 0?null:e;var i=t.memoizedState;return i!==null&&e!==null&&Xm(e,i[1])?i[0]:(n=n(),t.memoizedState=[n,e],n)}function Sy(n,e,t){return(ro&21)===0?(n.baseState&&(n.baseState=!1,Vn=!0),n.memoizedState=t):(zi(t,e)||(t=bx(),Pt.lanes|=t,so|=t,n.baseState=!0),e)}function QE(n,e){var t=pt;pt=t!==0&&4>t?t:4,n(!0);var i=xp.transition;xp.transition={};try{n(!1),e()}finally{pt=t,xp.transition=i}}function My(){return Si().memoizedState}function eT(n,e,t){var i=cs(n);if(t={lane:i,action:t,hasEagerState:!1,eagerState:null,next:null},wy(n))Ey(e,t);else if(t=ry(n,e,t,i),t!==null){var r=In();ki(t,n,i,r),Ty(t,e,i)}}function tT(n,e,t){var i=cs(n),r={lane:i,action:t,hasEagerState:!1,eagerState:null,next:null};if(wy(n))Ey(e,r);else{var s=n.alternate;if(n.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var o=e.lastRenderedState,a=s(o,t);if(r.hasEagerState=!0,r.eagerState=a,zi(a,o)){var l=e.interleaved;l===null?(r.next=r,zm(e)):(r.next=l.next,l.next=r),e.interleaved=r;return}}catch{}t=ry(n,e,r,i),t!==null&&(r=In(),ki(t,n,i,r),Ty(t,e,i))}}function wy(n){var e=n.alternate;return n===Pt||e!==null&&e===Pt}function Ey(n,e){Ll=nh=!0;var t=n.pending;t===null?e.next=e:(e.next=t.next,t.next=e),n.pending=e}function Ty(n,e,t){if((t&4194240)!==0){var i=e.lanes;i&=n.pendingLanes,t|=i,e.lanes=t,bm(n,t)}}var ih={readContext:yi,useCallback:pn,useContext:pn,useEffect:pn,useImperativeHandle:pn,useInsertionEffect:pn,useLayoutEffect:pn,useMemo:pn,useReducer:pn,useRef:pn,useState:pn,useDebugValue:pn,useDeferredValue:pn,useTransition:pn,useMutableSource:pn,useSyncExternalStore:pn,useId:pn,unstable_isNewReconciler:!1},nT={readContext:yi,useCallback:function(n,e){return tr().memoizedState=[n,e===void 0?null:e],n},useContext:yi,useEffect:Fv,useImperativeHandle:function(n,e,t){return t=t!=null?t.concat([n]):null,Nu(4194308,4,_y.bind(null,e,n),t)},useLayoutEffect:function(n,e){return Nu(4194308,4,n,e)},useInsertionEffect:function(n,e){return Nu(4,2,n,e)},useMemo:function(n,e){var t=tr();return e=e===void 0?null:e,n=n(),t.memoizedState=[n,e],n},useReducer:function(n,e,t){var i=tr();return e=t!==void 0?t(e):e,i.memoizedState=i.baseState=e,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:n,lastRenderedState:e},i.queue=n,n=n.dispatch=eT.bind(null,Pt,n),[i.memoizedState,n]},useRef:function(n){var e=tr();return n={current:n},e.memoizedState=n},useState:Uv,useDebugValue:$m,useDeferredValue:function(n){return tr().memoizedState=n},useTransition:function(){var n=Uv(!1),e=n[0];return n=QE.bind(null,n[1]),tr().memoizedState=n,[e,n]},useMutableSource:function(){},useSyncExternalStore:function(n,e,t){var i=Pt,r=tr();if(bt){if(t===void 0)throw Error(ae(407));t=t()}else{if(t=e(),en===null)throw Error(ae(349));(ro&30)!==0||cy(i,e,t)}r.memoizedState=t;var s={value:t,getSnapshot:e};return r.queue=s,Fv(hy.bind(null,i,s,n),[n]),i.flags|=2048,Kl(9,uy.bind(null,i,s,t,e),void 0,null),t},useId:function(){var n=tr(),e=en.identifierPrefix;if(bt){var t=br,i=Tr;t=(i&~(1<<32-Bi(i)-1)).toString(32)+t,e=":"+e+"R"+t,t=$l++,0<t&&(e+="H"+t.toString(32)),e+=":"}else t=jE++,e=":"+e+"r"+t.toString(32)+":";return n.memoizedState=e},unstable_isNewReconciler:!1},iT={readContext:yi,useCallback:xy,useContext:yi,useEffect:Zm,useImperativeHandle:vy,useInsertionEffect:my,useLayoutEffect:gy,useMemo:yy,useReducer:yp,useRef:py,useState:function(){return yp(Jl)},useDebugValue:$m,useDeferredValue:function(n){var e=Si();return Sy(e,Zt.memoizedState,n)},useTransition:function(){var n=yp(Jl)[0],e=Si().memoizedState;return[n,e]},useMutableSource:ay,useSyncExternalStore:ly,useId:My,unstable_isNewReconciler:!1},rT={readContext:yi,useCallback:xy,useContext:yi,useEffect:Zm,useImperativeHandle:vy,useInsertionEffect:my,useLayoutEffect:gy,useMemo:yy,useReducer:Sp,useRef:py,useState:function(){return Sp(Jl)},useDebugValue:$m,useDeferredValue:function(n){var e=Si();return Zt===null?e.memoizedState=n:Sy(e,Zt.memoizedState,n)},useTransition:function(){var n=Sp(Jl)[0],e=Si().memoizedState;return[n,e]},useMutableSource:ay,useSyncExternalStore:ly,useId:My,unstable_isNewReconciler:!1};function Ui(n,e){if(n&&n.defaultProps){e=It({},e),n=n.defaultProps;for(var t in n)e[t]===void 0&&(e[t]=n[t]);return e}return e}function nm(n,e,t,i){e=n.memoizedState,t=t(i,e),t=t==null?e:It({},e,t),n.memoizedState=t,n.lanes===0&&(n.updateQueue.baseState=t)}var gh={isMounted:function(n){return(n=n._reactInternals)?lo(n)===n:!1},enqueueSetState:function(n,e,t){n=n._reactInternals;var i=In(),r=cs(n),s=Ar(i,r);s.payload=e,t!=null&&(s.callback=t),e=as(n,s,r),e!==null&&(ki(e,n,r,i),Lu(e,n,r))},enqueueReplaceState:function(n,e,t){n=n._reactInternals;var i=In(),r=cs(n),s=Ar(i,r);s.tag=1,s.payload=e,t!=null&&(s.callback=t),e=as(n,s,r),e!==null&&(ki(e,n,r,i),Lu(e,n,r))},enqueueForceUpdate:function(n,e){n=n._reactInternals;var t=In(),i=cs(n),r=Ar(t,i);r.tag=2,e!=null&&(r.callback=e),e=as(n,r,i),e!==null&&(ki(e,n,i,t),Lu(e,n,i))}};function Ov(n,e,t,i,r,s,o){return n=n.stateNode,typeof n.shouldComponentUpdate=="function"?n.shouldComponentUpdate(i,s,o):e.prototype&&e.prototype.isPureReactComponent?!Hl(t,i)||!Hl(r,s):!0}function by(n,e,t){var i=!1,r=fs,s=e.contextType;return typeof s=="object"&&s!==null?s=yi(s):(r=Hn(e)?no:_n.current,i=e.contextTypes,s=(i=i!=null)?sa(n,r):fs),e=new e(t,s),n.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=gh,n.stateNode=e,e._reactInternals=n,i&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=r,n.__reactInternalMemoizedMaskedChildContext=s),e}function Bv(n,e,t,i){n=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(t,i),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(t,i),e.state!==n&&gh.enqueueReplaceState(e,e.state,null)}function im(n,e,t,i){var r=n.stateNode;r.props=t,r.state=n.memoizedState,r.refs={},Vm(n);var s=e.contextType;typeof s=="object"&&s!==null?r.context=yi(s):(s=Hn(e)?no:_n.current,r.context=sa(n,s)),r.state=n.memoizedState,s=e.getDerivedStateFromProps,typeof s=="function"&&(nm(n,e,s,t),r.state=n.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof r.getSnapshotBeforeUpdate=="function"||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(e=r.state,typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount(),e!==r.state&&gh.enqueueReplaceState(r,r.state,null),eh(n,t,r,i),r.state=n.memoizedState),typeof r.componentDidMount=="function"&&(n.flags|=4194308)}function ca(n,e){try{var t="",i=e;do t+=Nw(i),i=i.return;while(i);var r=t}catch(s){r=`
Error generating stack: `+s.message+`
`+s.stack}return{value:n,source:e,stack:r,digest:null}}function Mp(n,e,t){return{value:n,source:null,stack:t??null,digest:e??null}}function rm(n,e){try{console.error(e.value)}catch(t){setTimeout(function(){throw t})}}var sT=typeof WeakMap=="function"?WeakMap:Map;function Ay(n,e,t){t=Ar(-1,t),t.tag=3,t.payload={element:null};var i=e.value;return t.callback=function(){sh||(sh=!0,pm=i),rm(n,e)},t}function Cy(n,e,t){t=Ar(-1,t),t.tag=3;var i=n.type.getDerivedStateFromError;if(typeof i=="function"){var r=e.value;t.payload=function(){return i(r)},t.callback=function(){rm(n,e)}}var s=n.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(t.callback=function(){rm(n,e),typeof i!="function"&&(ls===null?ls=new Set([this]):ls.add(this));var o=e.stack;this.componentDidCatch(e.value,{componentStack:o!==null?o:""})}),t}function kv(n,e,t){var i=n.pingCache;if(i===null){i=n.pingCache=new sT;var r=new Set;i.set(e,r)}else r=i.get(e),r===void 0&&(r=new Set,i.set(e,r));r.has(t)||(r.add(t),n=xT.bind(null,n,e,t),e.then(n,n))}function zv(n){do{var e;if((e=n.tag===13)&&(e=n.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return n;n=n.return}while(n!==null);return null}function Vv(n,e,t,i,r){return(n.mode&1)===0?(n===e?n.flags|=65536:(n.flags|=128,t.flags|=131072,t.flags&=-52805,t.tag===1&&(t.alternate===null?t.tag=17:(e=Ar(-1,1),e.tag=2,as(t,e,1))),t.lanes|=1),n):(n.flags|=65536,n.lanes=r,n)}var oT=Lr.ReactCurrentOwner,Vn=!1;function Pn(n,e,t,i){e.child=n===null?iy(e,null,t,i):aa(e,n.child,t,i)}function Gv(n,e,t,i,r){t=t.render;var s=e.ref;return na(e,r),i=qm(n,e,t,i,s,r),t=Ym(),n!==null&&!Vn?(e.updateQueue=n.updateQueue,e.flags&=-2053,n.lanes&=~r,Ir(n,e,r)):(bt&&t&&Nm(e),e.flags|=1,Pn(n,e,i,r),e.child)}function Hv(n,e,t,i,r){if(n===null){var s=t.type;return typeof s=="function"&&!ig(s)&&s.defaultProps===void 0&&t.compare===null&&t.defaultProps===void 0?(e.tag=15,e.type=s,Ry(n,e,s,i,r)):(n=Bu(t.type,null,i,e,e.mode,r),n.ref=e.ref,n.return=e,e.child=n)}if(s=n.child,(n.lanes&r)===0){var o=s.memoizedProps;if(t=t.compare,t=t!==null?t:Hl,t(o,i)&&n.ref===e.ref)return Ir(n,e,r)}return e.flags|=1,n=us(s,i),n.ref=e.ref,n.return=e,e.child=n}function Ry(n,e,t,i,r){if(n!==null){var s=n.memoizedProps;if(Hl(s,i)&&n.ref===e.ref)if(Vn=!1,e.pendingProps=i=s,(n.lanes&r)!==0)(n.flags&131072)!==0&&(Vn=!0);else return e.lanes=n.lanes,Ir(n,e,r)}return sm(n,e,t,i,r)}function Py(n,e,t){var i=e.pendingProps,r=i.children,s=n!==null?n.memoizedState:null;if(i.mode==="hidden")if((e.mode&1)===0)e.memoizedState={baseLanes:0,cachePool:null,transitions:null},vt(Ko,ei),ei|=t;else{if((t&1073741824)===0)return n=s!==null?s.baseLanes|t:t,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:n,cachePool:null,transitions:null},e.updateQueue=null,vt(Ko,ei),ei|=n,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},i=s!==null?s.baseLanes:t,vt(Ko,ei),ei|=i}else s!==null?(i=s.baseLanes|t,e.memoizedState=null):i=t,vt(Ko,ei),ei|=i;return Pn(n,e,r,t),e.child}function Iy(n,e){var t=e.ref;(n===null&&t!==null||n!==null&&n.ref!==t)&&(e.flags|=512,e.flags|=2097152)}function sm(n,e,t,i,r){var s=Hn(t)?no:_n.current;return s=sa(e,s),na(e,r),t=qm(n,e,t,i,s,r),i=Ym(),n!==null&&!Vn?(e.updateQueue=n.updateQueue,e.flags&=-2053,n.lanes&=~r,Ir(n,e,r)):(bt&&i&&Nm(e),e.flags|=1,Pn(n,e,t,r),e.child)}function Wv(n,e,t,i,r){if(Hn(t)){var s=!0;$u(e)}else s=!1;if(na(e,r),e.stateNode===null)Uu(n,e),by(e,t,i),im(e,t,i,r),i=!0;else if(n===null){var o=e.stateNode,a=e.memoizedProps;o.props=a;var l=o.context,c=t.contextType;typeof c=="object"&&c!==null?c=yi(c):(c=Hn(t)?no:_n.current,c=sa(e,c));var u=t.getDerivedStateFromProps,d=typeof u=="function"||typeof o.getSnapshotBeforeUpdate=="function";d||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(a!==i||l!==c)&&Bv(e,o,i,c),jr=!1;var h=e.memoizedState;o.state=h,eh(e,i,o,r),l=e.memoizedState,a!==i||h!==l||Gn.current||jr?(typeof u=="function"&&(nm(e,t,u,i),l=e.memoizedState),(a=jr||Ov(e,t,a,i,h,l,c))?(d||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount()),typeof o.componentDidMount=="function"&&(e.flags|=4194308)):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=i,e.memoizedState=l),o.props=i,o.state=l,o.context=c,i=a):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),i=!1)}else{o=e.stateNode,sy(n,e),a=e.memoizedProps,c=e.type===e.elementType?a:Ui(e.type,a),o.props=c,d=e.pendingProps,h=o.context,l=t.contextType,typeof l=="object"&&l!==null?l=yi(l):(l=Hn(t)?no:_n.current,l=sa(e,l));var p=t.getDerivedStateFromProps;(u=typeof p=="function"||typeof o.getSnapshotBeforeUpdate=="function")||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(a!==d||h!==l)&&Bv(e,o,i,l),jr=!1,h=e.memoizedState,o.state=h,eh(e,i,o,r);var g=e.memoizedState;a!==d||h!==g||Gn.current||jr?(typeof p=="function"&&(nm(e,t,p,i),g=e.memoizedState),(c=jr||Ov(e,t,c,i,h,g,l)||!1)?(u||typeof o.UNSAFE_componentWillUpdate!="function"&&typeof o.componentWillUpdate!="function"||(typeof o.componentWillUpdate=="function"&&o.componentWillUpdate(i,g,l),typeof o.UNSAFE_componentWillUpdate=="function"&&o.UNSAFE_componentWillUpdate(i,g,l)),typeof o.componentDidUpdate=="function"&&(e.flags|=4),typeof o.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof o.componentDidUpdate!="function"||a===n.memoizedProps&&h===n.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||a===n.memoizedProps&&h===n.memoizedState||(e.flags|=1024),e.memoizedProps=i,e.memoizedState=g),o.props=i,o.state=g,o.context=l,i=c):(typeof o.componentDidUpdate!="function"||a===n.memoizedProps&&h===n.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||a===n.memoizedProps&&h===n.memoizedState||(e.flags|=1024),i=!1)}return om(n,e,t,i,s,r)}function om(n,e,t,i,r,s){Iy(n,e);var o=(e.flags&128)!==0;if(!i&&!o)return r&&Rv(e,t,!1),Ir(n,e,s);i=e.stateNode,oT.current=e;var a=o&&typeof t.getDerivedStateFromError!="function"?null:i.render();return e.flags|=1,n!==null&&o?(e.child=aa(e,n.child,null,s),e.child=aa(e,null,a,s)):Pn(n,e,a,s),e.memoizedState=i.state,r&&Rv(e,t,!0),e.child}function Ly(n){var e=n.stateNode;e.pendingContext?Cv(n,e.pendingContext,e.pendingContext!==e.context):e.context&&Cv(n,e.context,!1),Gm(n,e.containerInfo)}function Xv(n,e,t,i,r){return oa(),Fm(r),e.flags|=256,Pn(n,e,t,i),e.child}var am={dehydrated:null,treeContext:null,retryLane:0};function lm(n){return{baseLanes:n,cachePool:null,transitions:null}}function Dy(n,e,t){var i=e.pendingProps,r=Rt.current,s=!1,o=(e.flags&128)!==0,a;if((a=o)||(a=n!==null&&n.memoizedState===null?!1:(r&2)!==0),a?(s=!0,e.flags&=-129):(n===null||n.memoizedState!==null)&&(r|=1),vt(Rt,r&1),n===null)return em(e),n=e.memoizedState,n!==null&&(n=n.dehydrated,n!==null)?((e.mode&1)===0?e.lanes=1:n.data==="$!"?e.lanes=8:e.lanes=1073741824,null):(o=i.children,n=i.fallback,s?(i=e.mode,s=e.child,o={mode:"hidden",children:o},(i&1)===0&&s!==null?(s.childLanes=0,s.pendingProps=o):s=xh(o,i,0,null),n=to(n,i,t,null),s.return=e,n.return=e,s.sibling=n,e.child=s,e.child.memoizedState=lm(t),e.memoizedState=am,n):Jm(e,o));if(r=n.memoizedState,r!==null&&(a=r.dehydrated,a!==null))return aT(n,e,o,i,a,r,t);if(s){s=i.fallback,o=e.mode,r=n.child,a=r.sibling;var l={mode:"hidden",children:i.children};return(o&1)===0&&e.child!==r?(i=e.child,i.childLanes=0,i.pendingProps=l,e.deletions=null):(i=us(r,l),i.subtreeFlags=r.subtreeFlags&14680064),a!==null?s=us(a,s):(s=to(s,o,t,null),s.flags|=2),s.return=e,i.return=e,i.sibling=s,e.child=i,i=s,s=e.child,o=n.child.memoizedState,o=o===null?lm(t):{baseLanes:o.baseLanes|t,cachePool:null,transitions:o.transitions},s.memoizedState=o,s.childLanes=n.childLanes&~t,e.memoizedState=am,i}return s=n.child,n=s.sibling,i=us(s,{mode:"visible",children:i.children}),(e.mode&1)===0&&(i.lanes=t),i.return=e,i.sibling=null,n!==null&&(t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)),e.child=i,e.memoizedState=null,i}function Jm(n,e){return e=xh({mode:"visible",children:e},n.mode,0,null),e.return=n,n.child=e}function bu(n,e,t,i){return i!==null&&Fm(i),aa(e,n.child,null,t),n=Jm(e,e.pendingProps.children),n.flags|=2,e.memoizedState=null,n}function aT(n,e,t,i,r,s,o){if(t)return e.flags&256?(e.flags&=-257,i=Mp(Error(ae(422))),bu(n,e,o,i)):e.memoizedState!==null?(e.child=n.child,e.flags|=128,null):(s=i.fallback,r=e.mode,i=xh({mode:"visible",children:i.children},r,0,null),s=to(s,r,o,null),s.flags|=2,i.return=e,s.return=e,i.sibling=s,e.child=i,(e.mode&1)!==0&&aa(e,n.child,null,o),e.child.memoizedState=lm(o),e.memoizedState=am,s);if((e.mode&1)===0)return bu(n,e,o,null);if(r.data==="$!"){if(i=r.nextSibling&&r.nextSibling.dataset,i)var a=i.dgst;return i=a,s=Error(ae(419)),i=Mp(s,i,void 0),bu(n,e,o,i)}if(a=(o&n.childLanes)!==0,Vn||a){if(i=en,i!==null){switch(o&-o){case 4:r=2;break;case 16:r=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:r=32;break;case 536870912:r=268435456;break;default:r=0}r=(r&(i.suspendedLanes|o))!==0?0:r,r!==0&&r!==s.retryLane&&(s.retryLane=r,Pr(n,r),ki(i,n,r,-1))}return ng(),i=Mp(Error(ae(421))),bu(n,e,o,i)}return r.data==="$?"?(e.flags|=128,e.child=n.child,e=yT.bind(null,n),r._reactRetry=e,null):(n=s.treeContext,ti=os(r.nextSibling),ni=e,bt=!0,Oi=null,n!==null&&(gi[_i++]=Tr,gi[_i++]=br,gi[_i++]=io,Tr=n.id,br=n.overflow,io=e),e=Jm(e,i.children),e.flags|=4096,e)}function qv(n,e,t){n.lanes|=e;var i=n.alternate;i!==null&&(i.lanes|=e),tm(n.return,e,t)}function wp(n,e,t,i,r){var s=n.memoizedState;s===null?n.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:i,tail:t,tailMode:r}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=i,s.tail=t,s.tailMode=r)}function Ny(n,e,t){var i=e.pendingProps,r=i.revealOrder,s=i.tail;if(Pn(n,e,i.children,t),i=Rt.current,(i&2)!==0)i=i&1|2,e.flags|=128;else{if(n!==null&&(n.flags&128)!==0)e:for(n=e.child;n!==null;){if(n.tag===13)n.memoizedState!==null&&qv(n,t,e);else if(n.tag===19)qv(n,t,e);else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break e;for(;n.sibling===null;){if(n.return===null||n.return===e)break e;n=n.return}n.sibling.return=n.return,n=n.sibling}i&=1}if(vt(Rt,i),(e.mode&1)===0)e.memoizedState=null;else switch(r){case"forwards":for(t=e.child,r=null;t!==null;)n=t.alternate,n!==null&&th(n)===null&&(r=t),t=t.sibling;t=r,t===null?(r=e.child,e.child=null):(r=t.sibling,t.sibling=null),wp(e,!1,r,t,s);break;case"backwards":for(t=null,r=e.child,e.child=null;r!==null;){if(n=r.alternate,n!==null&&th(n)===null){e.child=r;break}n=r.sibling,r.sibling=t,t=r,r=n}wp(e,!0,t,null,s);break;case"together":wp(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function Uu(n,e){(e.mode&1)===0&&n!==null&&(n.alternate=null,e.alternate=null,e.flags|=2)}function Ir(n,e,t){if(n!==null&&(e.dependencies=n.dependencies),so|=e.lanes,(t&e.childLanes)===0)return null;if(n!==null&&e.child!==n.child)throw Error(ae(153));if(e.child!==null){for(n=e.child,t=us(n,n.pendingProps),e.child=t,t.return=e;n.sibling!==null;)n=n.sibling,t=t.sibling=us(n,n.pendingProps),t.return=e;t.sibling=null}return e.child}function lT(n,e,t){switch(e.tag){case 3:Ly(e),oa();break;case 5:oy(e);break;case 1:Hn(e.type)&&$u(e);break;case 4:Gm(e,e.stateNode.containerInfo);break;case 10:var i=e.type._context,r=e.memoizedProps.value;vt(ju,i._currentValue),i._currentValue=r;break;case 13:if(i=e.memoizedState,i!==null)return i.dehydrated!==null?(vt(Rt,Rt.current&1),e.flags|=128,null):(t&e.child.childLanes)!==0?Dy(n,e,t):(vt(Rt,Rt.current&1),n=Ir(n,e,t),n!==null?n.sibling:null);vt(Rt,Rt.current&1);break;case 19:if(i=(t&e.childLanes)!==0,(n.flags&128)!==0){if(i)return Ny(n,e,t);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),vt(Rt,Rt.current),i)break;return null;case 22:case 23:return e.lanes=0,Py(n,e,t)}return Ir(n,e,t)}var Uy,cm,Fy,Oy;Uy=function(n,e){for(var t=e.child;t!==null;){if(t.tag===5||t.tag===6)n.appendChild(t.stateNode);else if(t.tag!==4&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return;t=t.return}t.sibling.return=t.return,t=t.sibling}};cm=function(){};Fy=function(n,e,t,i){var r=n.memoizedProps;if(r!==i){n=e.stateNode,Qs(rr.current);var s=null;switch(t){case"input":r=Ip(n,r),i=Ip(n,i),s=[];break;case"select":r=It({},r,{value:void 0}),i=It({},i,{value:void 0}),s=[];break;case"textarea":r=Np(n,r),i=Np(n,i),s=[];break;default:typeof r.onClick!="function"&&typeof i.onClick=="function"&&(n.onclick=Yu)}Fp(t,i);var o;t=null;for(c in r)if(!i.hasOwnProperty(c)&&r.hasOwnProperty(c)&&r[c]!=null)if(c==="style"){var a=r[c];for(o in a)a.hasOwnProperty(o)&&(t||(t={}),t[o]="")}else c!=="dangerouslySetInnerHTML"&&c!=="children"&&c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&c!=="autoFocus"&&(Fl.hasOwnProperty(c)?s||(s=[]):(s=s||[]).push(c,null));for(c in i){var l=i[c];if(a=r?.[c],i.hasOwnProperty(c)&&l!==a&&(l!=null||a!=null))if(c==="style")if(a){for(o in a)!a.hasOwnProperty(o)||l&&l.hasOwnProperty(o)||(t||(t={}),t[o]="");for(o in l)l.hasOwnProperty(o)&&a[o]!==l[o]&&(t||(t={}),t[o]=l[o])}else t||(s||(s=[]),s.push(c,t)),t=l;else c==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,a=a?a.__html:void 0,l!=null&&a!==l&&(s=s||[]).push(c,l)):c==="children"?typeof l!="string"&&typeof l!="number"||(s=s||[]).push(c,""+l):c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&(Fl.hasOwnProperty(c)?(l!=null&&c==="onScroll"&&St("scroll",n),s||a===l||(s=[])):(s=s||[]).push(c,l))}t&&(s=s||[]).push("style",t);var c=s;(e.updateQueue=c)&&(e.flags|=4)}};Oy=function(n,e,t,i){t!==i&&(e.flags|=4)};function yl(n,e){if(!bt)switch(n.tailMode){case"hidden":e=n.tail;for(var t=null;e!==null;)e.alternate!==null&&(t=e),e=e.sibling;t===null?n.tail=null:t.sibling=null;break;case"collapsed":t=n.tail;for(var i=null;t!==null;)t.alternate!==null&&(i=t),t=t.sibling;i===null?e||n.tail===null?n.tail=null:n.tail.sibling=null:i.sibling=null}}function mn(n){var e=n.alternate!==null&&n.alternate.child===n.child,t=0,i=0;if(e)for(var r=n.child;r!==null;)t|=r.lanes|r.childLanes,i|=r.subtreeFlags&14680064,i|=r.flags&14680064,r.return=n,r=r.sibling;else for(r=n.child;r!==null;)t|=r.lanes|r.childLanes,i|=r.subtreeFlags,i|=r.flags,r.return=n,r=r.sibling;return n.subtreeFlags|=i,n.childLanes=t,e}function cT(n,e,t){var i=e.pendingProps;switch(Um(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return mn(e),null;case 1:return Hn(e.type)&&Zu(),mn(e),null;case 3:return i=e.stateNode,la(),Mt(Gn),Mt(_n),Wm(),i.pendingContext&&(i.context=i.pendingContext,i.pendingContext=null),(n===null||n.child===null)&&(Eu(e)?e.flags|=4:n===null||n.memoizedState.isDehydrated&&(e.flags&256)===0||(e.flags|=1024,Oi!==null&&(_m(Oi),Oi=null))),cm(n,e),mn(e),null;case 5:Hm(e);var r=Qs(Zl.current);if(t=e.type,n!==null&&e.stateNode!=null)Fy(n,e,t,i,r),n.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!i){if(e.stateNode===null)throw Error(ae(166));return mn(e),null}if(n=Qs(rr.current),Eu(e)){i=e.stateNode,t=e.type;var s=e.memoizedProps;switch(i[nr]=e,i[ql]=s,n=(e.mode&1)!==0,t){case"dialog":St("cancel",i),St("close",i);break;case"iframe":case"object":case"embed":St("load",i);break;case"video":case"audio":for(r=0;r<bl.length;r++)St(bl[r],i);break;case"source":St("error",i);break;case"img":case"image":case"link":St("error",i),St("load",i);break;case"details":St("toggle",i);break;case"input":ev(i,s),St("invalid",i);break;case"select":i._wrapperState={wasMultiple:!!s.multiple},St("invalid",i);break;case"textarea":nv(i,s),St("invalid",i)}Fp(t,s),r=null;for(var o in s)if(s.hasOwnProperty(o)){var a=s[o];o==="children"?typeof a=="string"?i.textContent!==a&&(s.suppressHydrationWarning!==!0&&wu(i.textContent,a,n),r=["children",a]):typeof a=="number"&&i.textContent!==""+a&&(s.suppressHydrationWarning!==!0&&wu(i.textContent,a,n),r=["children",""+a]):Fl.hasOwnProperty(o)&&a!=null&&o==="onScroll"&&St("scroll",i)}switch(t){case"input":hu(i),tv(i,s,!0);break;case"textarea":hu(i),iv(i);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(i.onclick=Yu)}i=r,e.updateQueue=i,i!==null&&(e.flags|=4)}else{o=r.nodeType===9?r:r.ownerDocument,n==="http://www.w3.org/1999/xhtml"&&(n=hx(t)),n==="http://www.w3.org/1999/xhtml"?t==="script"?(n=o.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild)):typeof i.is=="string"?n=o.createElement(t,{is:i.is}):(n=o.createElement(t),t==="select"&&(o=n,i.multiple?o.multiple=!0:i.size&&(o.size=i.size))):n=o.createElementNS(n,t),n[nr]=e,n[ql]=i,Uy(n,e,!1,!1),e.stateNode=n;e:{switch(o=Op(t,i),t){case"dialog":St("cancel",n),St("close",n),r=i;break;case"iframe":case"object":case"embed":St("load",n),r=i;break;case"video":case"audio":for(r=0;r<bl.length;r++)St(bl[r],n);r=i;break;case"source":St("error",n),r=i;break;case"img":case"image":case"link":St("error",n),St("load",n),r=i;break;case"details":St("toggle",n),r=i;break;case"input":ev(n,i),r=Ip(n,i),St("invalid",n);break;case"option":r=i;break;case"select":n._wrapperState={wasMultiple:!!i.multiple},r=It({},i,{value:void 0}),St("invalid",n);break;case"textarea":nv(n,i),r=Np(n,i),St("invalid",n);break;default:r=i}Fp(t,r),a=r;for(s in a)if(a.hasOwnProperty(s)){var l=a[s];s==="style"?px(n,l):s==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,l!=null&&fx(n,l)):s==="children"?typeof l=="string"?(t!=="textarea"||l!=="")&&Ol(n,l):typeof l=="number"&&Ol(n,""+l):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(Fl.hasOwnProperty(s)?l!=null&&s==="onScroll"&&St("scroll",n):l!=null&&ym(n,s,l,o))}switch(t){case"input":hu(n),tv(n,i,!1);break;case"textarea":hu(n),iv(n);break;case"option":i.value!=null&&n.setAttribute("value",""+hs(i.value));break;case"select":n.multiple=!!i.multiple,s=i.value,s!=null?jo(n,!!i.multiple,s,!1):i.defaultValue!=null&&jo(n,!!i.multiple,i.defaultValue,!0);break;default:typeof r.onClick=="function"&&(n.onclick=Yu)}switch(t){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}}i&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return mn(e),null;case 6:if(n&&e.stateNode!=null)Oy(n,e,n.memoizedProps,i);else{if(typeof i!="string"&&e.stateNode===null)throw Error(ae(166));if(t=Qs(Zl.current),Qs(rr.current),Eu(e)){if(i=e.stateNode,t=e.memoizedProps,i[nr]=e,(s=i.nodeValue!==t)&&(n=ni,n!==null))switch(n.tag){case 3:wu(i.nodeValue,t,(n.mode&1)!==0);break;case 5:n.memoizedProps.suppressHydrationWarning!==!0&&wu(i.nodeValue,t,(n.mode&1)!==0)}s&&(e.flags|=4)}else i=(t.nodeType===9?t:t.ownerDocument).createTextNode(i),i[nr]=e,e.stateNode=i}return mn(e),null;case 13:if(Mt(Rt),i=e.memoizedState,n===null||n.memoizedState!==null&&n.memoizedState.dehydrated!==null){if(bt&&ti!==null&&(e.mode&1)!==0&&(e.flags&128)===0)ty(),oa(),e.flags|=98560,s=!1;else if(s=Eu(e),i!==null&&i.dehydrated!==null){if(n===null){if(!s)throw Error(ae(318));if(s=e.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(ae(317));s[nr]=e}else oa(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;mn(e),s=!1}else Oi!==null&&(_m(Oi),Oi=null),s=!0;if(!s)return e.flags&65536?e:null}return(e.flags&128)!==0?(e.lanes=t,e):(i=i!==null,i!==(n!==null&&n.memoizedState!==null)&&i&&(e.child.flags|=8192,(e.mode&1)!==0&&(n===null||(Rt.current&1)!==0?$t===0&&($t=3):ng())),e.updateQueue!==null&&(e.flags|=4),mn(e),null);case 4:return la(),cm(n,e),n===null&&Wl(e.stateNode.containerInfo),mn(e),null;case 10:return km(e.type._context),mn(e),null;case 17:return Hn(e.type)&&Zu(),mn(e),null;case 19:if(Mt(Rt),s=e.memoizedState,s===null)return mn(e),null;if(i=(e.flags&128)!==0,o=s.rendering,o===null)if(i)yl(s,!1);else{if($t!==0||n!==null&&(n.flags&128)!==0)for(n=e.child;n!==null;){if(o=th(n),o!==null){for(e.flags|=128,yl(s,!1),i=o.updateQueue,i!==null&&(e.updateQueue=i,e.flags|=4),e.subtreeFlags=0,i=t,t=e.child;t!==null;)s=t,n=i,s.flags&=14680066,o=s.alternate,o===null?(s.childLanes=0,s.lanes=n,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=o.childLanes,s.lanes=o.lanes,s.child=o.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=o.memoizedProps,s.memoizedState=o.memoizedState,s.updateQueue=o.updateQueue,s.type=o.type,n=o.dependencies,s.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),t=t.sibling;return vt(Rt,Rt.current&1|2),e.child}n=n.sibling}s.tail!==null&&Vt()>ua&&(e.flags|=128,i=!0,yl(s,!1),e.lanes=4194304)}else{if(!i)if(n=th(o),n!==null){if(e.flags|=128,i=!0,t=n.updateQueue,t!==null&&(e.updateQueue=t,e.flags|=4),yl(s,!0),s.tail===null&&s.tailMode==="hidden"&&!o.alternate&&!bt)return mn(e),null}else 2*Vt()-s.renderingStartTime>ua&&t!==1073741824&&(e.flags|=128,i=!0,yl(s,!1),e.lanes=4194304);s.isBackwards?(o.sibling=e.child,e.child=o):(t=s.last,t!==null?t.sibling=o:e.child=o,s.last=o)}return s.tail!==null?(e=s.tail,s.rendering=e,s.tail=e.sibling,s.renderingStartTime=Vt(),e.sibling=null,t=Rt.current,vt(Rt,i?t&1|2:t&1),e):(mn(e),null);case 22:case 23:return tg(),i=e.memoizedState!==null,n!==null&&n.memoizedState!==null!==i&&(e.flags|=8192),i&&(e.mode&1)!==0?(ei&1073741824)!==0&&(mn(e),e.subtreeFlags&6&&(e.flags|=8192)):mn(e),null;case 24:return null;case 25:return null}throw Error(ae(156,e.tag))}function uT(n,e){switch(Um(e),e.tag){case 1:return Hn(e.type)&&Zu(),n=e.flags,n&65536?(e.flags=n&-65537|128,e):null;case 3:return la(),Mt(Gn),Mt(_n),Wm(),n=e.flags,(n&65536)!==0&&(n&128)===0?(e.flags=n&-65537|128,e):null;case 5:return Hm(e),null;case 13:if(Mt(Rt),n=e.memoizedState,n!==null&&n.dehydrated!==null){if(e.alternate===null)throw Error(ae(340));oa()}return n=e.flags,n&65536?(e.flags=n&-65537|128,e):null;case 19:return Mt(Rt),null;case 4:return la(),null;case 10:return km(e.type._context),null;case 22:case 23:return tg(),null;case 24:return null;default:return null}}var Au=!1,gn=!1,hT=typeof WeakSet=="function"?WeakSet:Set,be=null;function Jo(n,e){var t=n.ref;if(t!==null)if(typeof t=="function")try{t(null)}catch(i){Bt(n,e,i)}else t.current=null}function um(n,e,t){try{t()}catch(i){Bt(n,e,i)}}var Yv=!1;function fT(n,e){if(Yp=Wu,n=Gx(),Dm(n)){if("selectionStart"in n)var t={start:n.selectionStart,end:n.selectionEnd};else e:{t=(t=n.ownerDocument)&&t.defaultView||window;var i=t.getSelection&&t.getSelection();if(i&&i.rangeCount!==0){t=i.anchorNode;var r=i.anchorOffset,s=i.focusNode;i=i.focusOffset;try{t.nodeType,s.nodeType}catch{t=null;break e}var o=0,a=-1,l=-1,c=0,u=0,d=n,h=null;t:for(;;){for(var p;d!==t||r!==0&&d.nodeType!==3||(a=o+r),d!==s||i!==0&&d.nodeType!==3||(l=o+i),d.nodeType===3&&(o+=d.nodeValue.length),(p=d.firstChild)!==null;)h=d,d=p;for(;;){if(d===n)break t;if(h===t&&++c===r&&(a=o),h===s&&++u===i&&(l=o),(p=d.nextSibling)!==null)break;d=h,h=d.parentNode}d=p}t=a===-1||l===-1?null:{start:a,end:l}}else t=null}t=t||{start:0,end:0}}else t=null;for(Zp={focusedElem:n,selectionRange:t},Wu=!1,be=e;be!==null;)if(e=be,n=e.child,(e.subtreeFlags&1028)!==0&&n!==null)n.return=e,be=n;else for(;be!==null;){e=be;try{var g=e.alternate;if((e.flags&1024)!==0)switch(e.tag){case 0:case 11:case 15:break;case 1:if(g!==null){var _=g.memoizedProps,m=g.memoizedState,f=e.stateNode,v=f.getSnapshotBeforeUpdate(e.elementType===e.type?_:Ui(e.type,_),m);f.__reactInternalSnapshotBeforeUpdate=v}break;case 3:var M=e.stateNode.containerInfo;M.nodeType===1?M.textContent="":M.nodeType===9&&M.documentElement&&M.removeChild(M.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(ae(163))}}catch(y){Bt(e,e.return,y)}if(n=e.sibling,n!==null){n.return=e.return,be=n;break}be=e.return}return g=Yv,Yv=!1,g}function Dl(n,e,t){var i=e.updateQueue;if(i=i!==null?i.lastEffect:null,i!==null){var r=i=i.next;do{if((r.tag&n)===n){var s=r.destroy;r.destroy=void 0,s!==void 0&&um(e,t,s)}r=r.next}while(r!==i)}}function _h(n,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var t=e=e.next;do{if((t.tag&n)===n){var i=t.create;t.destroy=i()}t=t.next}while(t!==e)}}function hm(n){var e=n.ref;if(e!==null){var t=n.stateNode;n.tag,n=t,typeof e=="function"?e(n):e.current=n}}function By(n){var e=n.alternate;e!==null&&(n.alternate=null,By(e)),n.child=null,n.deletions=null,n.sibling=null,n.tag===5&&(e=n.stateNode,e!==null&&(delete e[nr],delete e[ql],delete e[Kp],delete e[ZE],delete e[$E])),n.stateNode=null,n.return=null,n.dependencies=null,n.memoizedProps=null,n.memoizedState=null,n.pendingProps=null,n.stateNode=null,n.updateQueue=null}function ky(n){return n.tag===5||n.tag===3||n.tag===4}function Zv(n){e:for(;;){for(;n.sibling===null;){if(n.return===null||ky(n.return))return null;n=n.return}for(n.sibling.return=n.return,n=n.sibling;n.tag!==5&&n.tag!==6&&n.tag!==18;){if(n.flags&2||n.child===null||n.tag===4)continue e;n.child.return=n,n=n.child}if(!(n.flags&2))return n.stateNode}}function fm(n,e,t){var i=n.tag;if(i===5||i===6)n=n.stateNode,e?t.nodeType===8?t.parentNode.insertBefore(n,e):t.insertBefore(n,e):(t.nodeType===8?(e=t.parentNode,e.insertBefore(n,t)):(e=t,e.appendChild(n)),t=t._reactRootContainer,t!=null||e.onclick!==null||(e.onclick=Yu));else if(i!==4&&(n=n.child,n!==null))for(fm(n,e,t),n=n.sibling;n!==null;)fm(n,e,t),n=n.sibling}function dm(n,e,t){var i=n.tag;if(i===5||i===6)n=n.stateNode,e?t.insertBefore(n,e):t.appendChild(n);else if(i!==4&&(n=n.child,n!==null))for(dm(n,e,t),n=n.sibling;n!==null;)dm(n,e,t),n=n.sibling}var an=null,Fi=!1;function Jr(n,e,t){for(t=t.child;t!==null;)zy(n,e,t),t=t.sibling}function zy(n,e,t){if(ir&&typeof ir.onCommitFiberUnmount=="function")try{ir.onCommitFiberUnmount(ch,t)}catch{}switch(t.tag){case 5:gn||Jo(t,e);case 6:var i=an,r=Fi;an=null,Jr(n,e,t),an=i,Fi=r,an!==null&&(Fi?(n=an,t=t.stateNode,n.nodeType===8?n.parentNode.removeChild(t):n.removeChild(t)):an.removeChild(t.stateNode));break;case 18:an!==null&&(Fi?(n=an,t=t.stateNode,n.nodeType===8?gp(n.parentNode,t):n.nodeType===1&&gp(n,t),Vl(n)):gp(an,t.stateNode));break;case 4:i=an,r=Fi,an=t.stateNode.containerInfo,Fi=!0,Jr(n,e,t),an=i,Fi=r;break;case 0:case 11:case 14:case 15:if(!gn&&(i=t.updateQueue,i!==null&&(i=i.lastEffect,i!==null))){r=i=i.next;do{var s=r,o=s.destroy;s=s.tag,o!==void 0&&((s&2)!==0||(s&4)!==0)&&um(t,e,o),r=r.next}while(r!==i)}Jr(n,e,t);break;case 1:if(!gn&&(Jo(t,e),i=t.stateNode,typeof i.componentWillUnmount=="function"))try{i.props=t.memoizedProps,i.state=t.memoizedState,i.componentWillUnmount()}catch(a){Bt(t,e,a)}Jr(n,e,t);break;case 21:Jr(n,e,t);break;case 22:t.mode&1?(gn=(i=gn)||t.memoizedState!==null,Jr(n,e,t),gn=i):Jr(n,e,t);break;default:Jr(n,e,t)}}function $v(n){var e=n.updateQueue;if(e!==null){n.updateQueue=null;var t=n.stateNode;t===null&&(t=n.stateNode=new hT),e.forEach(function(i){var r=ST.bind(null,n,i);t.has(i)||(t.add(i),i.then(r,r))})}}function Ni(n,e){var t=e.deletions;if(t!==null)for(var i=0;i<t.length;i++){var r=t[i];try{var s=n,o=e,a=o;e:for(;a!==null;){switch(a.tag){case 5:an=a.stateNode,Fi=!1;break e;case 3:an=a.stateNode.containerInfo,Fi=!0;break e;case 4:an=a.stateNode.containerInfo,Fi=!0;break e}a=a.return}if(an===null)throw Error(ae(160));zy(s,o,r),an=null,Fi=!1;var l=r.alternate;l!==null&&(l.return=null),r.return=null}catch(c){Bt(r,e,c)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)Vy(e,n),e=e.sibling}function Vy(n,e){var t=n.alternate,i=n.flags;switch(n.tag){case 0:case 11:case 14:case 15:if(Ni(e,n),er(n),i&4){try{Dl(3,n,n.return),_h(3,n)}catch(_){Bt(n,n.return,_)}try{Dl(5,n,n.return)}catch(_){Bt(n,n.return,_)}}break;case 1:Ni(e,n),er(n),i&512&&t!==null&&Jo(t,t.return);break;case 5:if(Ni(e,n),er(n),i&512&&t!==null&&Jo(t,t.return),n.flags&32){var r=n.stateNode;try{Ol(r,"")}catch(_){Bt(n,n.return,_)}}if(i&4&&(r=n.stateNode,r!=null)){var s=n.memoizedProps,o=t!==null?t.memoizedProps:s,a=n.type,l=n.updateQueue;if(n.updateQueue=null,l!==null)try{a==="input"&&s.type==="radio"&&s.name!=null&&cx(r,s),Op(a,o);var c=Op(a,s);for(o=0;o<l.length;o+=2){var u=l[o],d=l[o+1];u==="style"?px(r,d):u==="dangerouslySetInnerHTML"?fx(r,d):u==="children"?Ol(r,d):ym(r,u,d,c)}switch(a){case"input":Lp(r,s);break;case"textarea":ux(r,s);break;case"select":var h=r._wrapperState.wasMultiple;r._wrapperState.wasMultiple=!!s.multiple;var p=s.value;p!=null?jo(r,!!s.multiple,p,!1):h!==!!s.multiple&&(s.defaultValue!=null?jo(r,!!s.multiple,s.defaultValue,!0):jo(r,!!s.multiple,s.multiple?[]:"",!1))}r[ql]=s}catch(_){Bt(n,n.return,_)}}break;case 6:if(Ni(e,n),er(n),i&4){if(n.stateNode===null)throw Error(ae(162));r=n.stateNode,s=n.memoizedProps;try{r.nodeValue=s}catch(_){Bt(n,n.return,_)}}break;case 3:if(Ni(e,n),er(n),i&4&&t!==null&&t.memoizedState.isDehydrated)try{Vl(e.containerInfo)}catch(_){Bt(n,n.return,_)}break;case 4:Ni(e,n),er(n);break;case 13:Ni(e,n),er(n),r=n.child,r.flags&8192&&(s=r.memoizedState!==null,r.stateNode.isHidden=s,!s||r.alternate!==null&&r.alternate.memoizedState!==null||(Qm=Vt())),i&4&&$v(n);break;case 22:if(u=t!==null&&t.memoizedState!==null,n.mode&1?(gn=(c=gn)||u,Ni(e,n),gn=c):Ni(e,n),er(n),i&8192){if(c=n.memoizedState!==null,(n.stateNode.isHidden=c)&&!u&&(n.mode&1)!==0)for(be=n,u=n.child;u!==null;){for(d=be=u;be!==null;){switch(h=be,p=h.child,h.tag){case 0:case 11:case 14:case 15:Dl(4,h,h.return);break;case 1:Jo(h,h.return);var g=h.stateNode;if(typeof g.componentWillUnmount=="function"){i=h,t=h.return;try{e=i,g.props=e.memoizedProps,g.state=e.memoizedState,g.componentWillUnmount()}catch(_){Bt(i,t,_)}}break;case 5:Jo(h,h.return);break;case 22:if(h.memoizedState!==null){Kv(d);continue}}p!==null?(p.return=h,be=p):Kv(d)}u=u.sibling}e:for(u=null,d=n;;){if(d.tag===5){if(u===null){u=d;try{r=d.stateNode,c?(s=r.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(a=d.stateNode,l=d.memoizedProps.style,o=l!=null&&l.hasOwnProperty("display")?l.display:null,a.style.display=dx("display",o))}catch(_){Bt(n,n.return,_)}}}else if(d.tag===6){if(u===null)try{d.stateNode.nodeValue=c?"":d.memoizedProps}catch(_){Bt(n,n.return,_)}}else if((d.tag!==22&&d.tag!==23||d.memoizedState===null||d===n)&&d.child!==null){d.child.return=d,d=d.child;continue}if(d===n)break e;for(;d.sibling===null;){if(d.return===null||d.return===n)break e;u===d&&(u=null),d=d.return}u===d&&(u=null),d.sibling.return=d.return,d=d.sibling}}break;case 19:Ni(e,n),er(n),i&4&&$v(n);break;case 21:break;default:Ni(e,n),er(n)}}function er(n){var e=n.flags;if(e&2){try{e:{for(var t=n.return;t!==null;){if(ky(t)){var i=t;break e}t=t.return}throw Error(ae(160))}switch(i.tag){case 5:var r=i.stateNode;i.flags&32&&(Ol(r,""),i.flags&=-33);var s=Zv(n);dm(n,s,r);break;case 3:case 4:var o=i.stateNode.containerInfo,a=Zv(n);fm(n,a,o);break;default:throw Error(ae(161))}}catch(l){Bt(n,n.return,l)}n.flags&=-3}e&4096&&(n.flags&=-4097)}function dT(n,e,t){be=n,Gy(n,e,t)}function Gy(n,e,t){for(var i=(n.mode&1)!==0;be!==null;){var r=be,s=r.child;if(r.tag===22&&i){var o=r.memoizedState!==null||Au;if(!o){var a=r.alternate,l=a!==null&&a.memoizedState!==null||gn;a=Au;var c=gn;if(Au=o,(gn=l)&&!c)for(be=r;be!==null;)o=be,l=o.child,o.tag===22&&o.memoizedState!==null?jv(r):l!==null?(l.return=o,be=l):jv(r);for(;s!==null;)be=s,Gy(s,e,t),s=s.sibling;be=r,Au=a,gn=c}Jv(n,e,t)}else(r.subtreeFlags&8772)!==0&&s!==null?(s.return=r,be=s):Jv(n,e,t)}}function Jv(n){for(;be!==null;){var e=be;if((e.flags&8772)!==0){var t=e.alternate;try{if((e.flags&8772)!==0)switch(e.tag){case 0:case 11:case 15:gn||_h(5,e);break;case 1:var i=e.stateNode;if(e.flags&4&&!gn)if(t===null)i.componentDidMount();else{var r=e.elementType===e.type?t.memoizedProps:Ui(e.type,t.memoizedProps);i.componentDidUpdate(r,t.memoizedState,i.__reactInternalSnapshotBeforeUpdate)}var s=e.updateQueue;s!==null&&Nv(e,s,i);break;case 3:var o=e.updateQueue;if(o!==null){if(t=null,e.child!==null)switch(e.child.tag){case 5:t=e.child.stateNode;break;case 1:t=e.child.stateNode}Nv(e,o,t)}break;case 5:var a=e.stateNode;if(t===null&&e.flags&4){t=a;var l=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":l.autoFocus&&t.focus();break;case"img":l.src&&(t.src=l.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var c=e.alternate;if(c!==null){var u=c.memoizedState;if(u!==null){var d=u.dehydrated;d!==null&&Vl(d)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(ae(163))}gn||e.flags&512&&hm(e)}catch(h){Bt(e,e.return,h)}}if(e===n){be=null;break}if(t=e.sibling,t!==null){t.return=e.return,be=t;break}be=e.return}}function Kv(n){for(;be!==null;){var e=be;if(e===n){be=null;break}var t=e.sibling;if(t!==null){t.return=e.return,be=t;break}be=e.return}}function jv(n){for(;be!==null;){var e=be;try{switch(e.tag){case 0:case 11:case 15:var t=e.return;try{_h(4,e)}catch(l){Bt(e,t,l)}break;case 1:var i=e.stateNode;if(typeof i.componentDidMount=="function"){var r=e.return;try{i.componentDidMount()}catch(l){Bt(e,r,l)}}var s=e.return;try{hm(e)}catch(l){Bt(e,s,l)}break;case 5:var o=e.return;try{hm(e)}catch(l){Bt(e,o,l)}}}catch(l){Bt(e,e.return,l)}if(e===n){be=null;break}var a=e.sibling;if(a!==null){a.return=e.return,be=a;break}be=e.return}}var pT=Math.ceil,rh=Lr.ReactCurrentDispatcher,Km=Lr.ReactCurrentOwner,xi=Lr.ReactCurrentBatchConfig,st=0,en=null,Xt=null,ln=0,ei=0,Ko=ps(0),$t=0,jl=null,so=0,vh=0,jm=0,Nl=null,zn=null,Qm=0,ua=1/0,wr=null,sh=!1,pm=null,ls=null,Cu=!1,ns=null,oh=0,Ul=0,mm=null,Fu=-1,Ou=0;function In(){return(st&6)!==0?Vt():Fu!==-1?Fu:Fu=Vt()}function cs(n){return(n.mode&1)===0?1:(st&2)!==0&&ln!==0?ln&-ln:KE.transition!==null?(Ou===0&&(Ou=bx()),Ou):(n=pt,n!==0||(n=window.event,n=n===void 0?16:Dx(n.type)),n)}function ki(n,e,t,i){if(50<Ul)throw Ul=0,mm=null,Error(ae(185));Ql(n,t,i),((st&2)===0||n!==en)&&(n===en&&((st&2)===0&&(vh|=t),$t===4&&es(n,ln)),Wn(n,i),t===1&&st===0&&(e.mode&1)===0&&(ua=Vt()+500,ph&&ms()))}function Wn(n,e){var t=n.callbackNode;Qw(n,e);var i=Hu(n,n===en?ln:0);if(i===0)t!==null&&ov(t),n.callbackNode=null,n.callbackPriority=0;else if(e=i&-i,n.callbackPriority!==e){if(t!=null&&ov(t),e===1)n.tag===0?JE(Qv.bind(null,n)):jx(Qv.bind(null,n)),qE(function(){(st&6)===0&&ms()}),t=null;else{switch(Ax(i)){case 1:t=Tm;break;case 4:t=Ex;break;case 16:t=Gu;break;case 536870912:t=Tx;break;default:t=Gu}t=Jy(t,Hy.bind(null,n))}n.callbackPriority=e,n.callbackNode=t}}function Hy(n,e){if(Fu=-1,Ou=0,(st&6)!==0)throw Error(ae(327));var t=n.callbackNode;if(ia()&&n.callbackNode!==t)return null;var i=Hu(n,n===en?ln:0);if(i===0)return null;if((i&30)!==0||(i&n.expiredLanes)!==0||e)e=ah(n,i);else{e=i;var r=st;st|=2;var s=Xy();(en!==n||ln!==e)&&(wr=null,ua=Vt()+500,eo(n,e));do try{_T();break}catch(a){Wy(n,a)}while(!0);Bm(),rh.current=s,st=r,Xt!==null?e=0:(en=null,ln=0,e=$t)}if(e!==0){if(e===2&&(r=Gp(n),r!==0&&(i=r,e=gm(n,r))),e===1)throw t=jl,eo(n,0),es(n,i),Wn(n,Vt()),t;if(e===6)es(n,i);else{if(r=n.current.alternate,(i&30)===0&&!mT(r)&&(e=ah(n,i),e===2&&(s=Gp(n),s!==0&&(i=s,e=gm(n,s))),e===1))throw t=jl,eo(n,0),es(n,i),Wn(n,Vt()),t;switch(n.finishedWork=r,n.finishedLanes=i,e){case 0:case 1:throw Error(ae(345));case 2:Js(n,zn,wr);break;case 3:if(es(n,i),(i&130023424)===i&&(e=Qm+500-Vt(),10<e)){if(Hu(n,0)!==0)break;if(r=n.suspendedLanes,(r&i)!==i){In(),n.pingedLanes|=n.suspendedLanes&r;break}n.timeoutHandle=Jp(Js.bind(null,n,zn,wr),e);break}Js(n,zn,wr);break;case 4:if(es(n,i),(i&4194240)===i)break;for(e=n.eventTimes,r=-1;0<i;){var o=31-Bi(i);s=1<<o,o=e[o],o>r&&(r=o),i&=~s}if(i=r,i=Vt()-i,i=(120>i?120:480>i?480:1080>i?1080:1920>i?1920:3e3>i?3e3:4320>i?4320:1960*pT(i/1960))-i,10<i){n.timeoutHandle=Jp(Js.bind(null,n,zn,wr),i);break}Js(n,zn,wr);break;case 5:Js(n,zn,wr);break;default:throw Error(ae(329))}}}return Wn(n,Vt()),n.callbackNode===t?Hy.bind(null,n):null}function gm(n,e){var t=Nl;return n.current.memoizedState.isDehydrated&&(eo(n,e).flags|=256),n=ah(n,e),n!==2&&(e=zn,zn=t,e!==null&&_m(e)),n}function _m(n){zn===null?zn=n:zn.push.apply(zn,n)}function mT(n){for(var e=n;;){if(e.flags&16384){var t=e.updateQueue;if(t!==null&&(t=t.stores,t!==null))for(var i=0;i<t.length;i++){var r=t[i],s=r.getSnapshot;r=r.value;try{if(!zi(s(),r))return!1}catch{return!1}}}if(t=e.child,e.subtreeFlags&16384&&t!==null)t.return=e,e=t;else{if(e===n)break;for(;e.sibling===null;){if(e.return===null||e.return===n)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function es(n,e){for(e&=~jm,e&=~vh,n.suspendedLanes|=e,n.pingedLanes&=~e,n=n.expirationTimes;0<e;){var t=31-Bi(e),i=1<<t;n[t]=-1,e&=~i}}function Qv(n){if((st&6)!==0)throw Error(ae(327));ia();var e=Hu(n,0);if((e&1)===0)return Wn(n,Vt()),null;var t=ah(n,e);if(n.tag!==0&&t===2){var i=Gp(n);i!==0&&(e=i,t=gm(n,i))}if(t===1)throw t=jl,eo(n,0),es(n,e),Wn(n,Vt()),t;if(t===6)throw Error(ae(345));return n.finishedWork=n.current.alternate,n.finishedLanes=e,Js(n,zn,wr),Wn(n,Vt()),null}function eg(n,e){var t=st;st|=1;try{return n(e)}finally{st=t,st===0&&(ua=Vt()+500,ph&&ms())}}function oo(n){ns!==null&&ns.tag===0&&(st&6)===0&&ia();var e=st;st|=1;var t=xi.transition,i=pt;try{if(xi.transition=null,pt=1,n)return n()}finally{pt=i,xi.transition=t,st=e,(st&6)===0&&ms()}}function tg(){ei=Ko.current,Mt(Ko)}function eo(n,e){n.finishedWork=null,n.finishedLanes=0;var t=n.timeoutHandle;if(t!==-1&&(n.timeoutHandle=-1,XE(t)),Xt!==null)for(t=Xt.return;t!==null;){var i=t;switch(Um(i),i.tag){case 1:i=i.type.childContextTypes,i!=null&&Zu();break;case 3:la(),Mt(Gn),Mt(_n),Wm();break;case 5:Hm(i);break;case 4:la();break;case 13:Mt(Rt);break;case 19:Mt(Rt);break;case 10:km(i.type._context);break;case 22:case 23:tg()}t=t.return}if(en=n,Xt=n=us(n.current,null),ln=ei=e,$t=0,jl=null,jm=vh=so=0,zn=Nl=null,js!==null){for(e=0;e<js.length;e++)if(t=js[e],i=t.interleaved,i!==null){t.interleaved=null;var r=i.next,s=t.pending;if(s!==null){var o=s.next;s.next=r,i.next=o}t.pending=i}js=null}return n}function Wy(n,e){do{var t=Xt;try{if(Bm(),Du.current=ih,nh){for(var i=Pt.memoizedState;i!==null;){var r=i.queue;r!==null&&(r.pending=null),i=i.next}nh=!1}if(ro=0,Qt=Zt=Pt=null,Ll=!1,$l=0,Km.current=null,t===null||t.return===null){$t=1,jl=e,Xt=null;break}e:{var s=n,o=t.return,a=t,l=e;if(e=ln,a.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){var c=l,u=a,d=u.tag;if((u.mode&1)===0&&(d===0||d===11||d===15)){var h=u.alternate;h?(u.updateQueue=h.updateQueue,u.memoizedState=h.memoizedState,u.lanes=h.lanes):(u.updateQueue=null,u.memoizedState=null)}var p=zv(o);if(p!==null){p.flags&=-257,Vv(p,o,a,s,e),p.mode&1&&kv(s,c,e),e=p,l=c;var g=e.updateQueue;if(g===null){var _=new Set;_.add(l),e.updateQueue=_}else g.add(l);break e}else{if((e&1)===0){kv(s,c,e),ng();break e}l=Error(ae(426))}}else if(bt&&a.mode&1){var m=zv(o);if(m!==null){(m.flags&65536)===0&&(m.flags|=256),Vv(m,o,a,s,e),Fm(ca(l,a));break e}}s=l=ca(l,a),$t!==4&&($t=2),Nl===null?Nl=[s]:Nl.push(s),s=o;do{switch(s.tag){case 3:s.flags|=65536,e&=-e,s.lanes|=e;var f=Ay(s,l,e);Dv(s,f);break e;case 1:a=l;var v=s.type,M=s.stateNode;if((s.flags&128)===0&&(typeof v.getDerivedStateFromError=="function"||M!==null&&typeof M.componentDidCatch=="function"&&(ls===null||!ls.has(M)))){s.flags|=65536,e&=-e,s.lanes|=e;var y=Cy(s,a,e);Dv(s,y);break e}}s=s.return}while(s!==null)}Yy(t)}catch(w){e=w,Xt===t&&t!==null&&(Xt=t=t.return);continue}break}while(!0)}function Xy(){var n=rh.current;return rh.current=ih,n===null?ih:n}function ng(){($t===0||$t===3||$t===2)&&($t=4),en===null||(so&268435455)===0&&(vh&268435455)===0||es(en,ln)}function ah(n,e){var t=st;st|=2;var i=Xy();(en!==n||ln!==e)&&(wr=null,eo(n,e));do try{gT();break}catch(r){Wy(n,r)}while(!0);if(Bm(),st=t,rh.current=i,Xt!==null)throw Error(ae(261));return en=null,ln=0,$t}function gT(){for(;Xt!==null;)qy(Xt)}function _T(){for(;Xt!==null&&!Ww();)qy(Xt)}function qy(n){var e=$y(n.alternate,n,ei);n.memoizedProps=n.pendingProps,e===null?Yy(n):Xt=e,Km.current=null}function Yy(n){var e=n;do{var t=e.alternate;if(n=e.return,(e.flags&32768)===0){if(t=cT(t,e,ei),t!==null){Xt=t;return}}else{if(t=uT(t,e),t!==null){t.flags&=32767,Xt=t;return}if(n!==null)n.flags|=32768,n.subtreeFlags=0,n.deletions=null;else{$t=6,Xt=null;return}}if(e=e.sibling,e!==null){Xt=e;return}Xt=e=n}while(e!==null);$t===0&&($t=5)}function Js(n,e,t){var i=pt,r=xi.transition;try{xi.transition=null,pt=1,vT(n,e,t,i)}finally{xi.transition=r,pt=i}return null}function vT(n,e,t,i){do ia();while(ns!==null);if((st&6)!==0)throw Error(ae(327));t=n.finishedWork;var r=n.finishedLanes;if(t===null)return null;if(n.finishedWork=null,n.finishedLanes=0,t===n.current)throw Error(ae(177));n.callbackNode=null,n.callbackPriority=0;var s=t.lanes|t.childLanes;if(eE(n,s),n===en&&(Xt=en=null,ln=0),(t.subtreeFlags&2064)===0&&(t.flags&2064)===0||Cu||(Cu=!0,Jy(Gu,function(){return ia(),null})),s=(t.flags&15990)!==0,(t.subtreeFlags&15990)!==0||s){s=xi.transition,xi.transition=null;var o=pt;pt=1;var a=st;st|=4,Km.current=null,fT(n,t),Vy(t,n),zE(Zp),Wu=!!Yp,Zp=Yp=null,n.current=t,dT(t,n,r),Xw(),st=a,pt=o,xi.transition=s}else n.current=t;if(Cu&&(Cu=!1,ns=n,oh=r),s=n.pendingLanes,s===0&&(ls=null),Zw(t.stateNode,i),Wn(n,Vt()),e!==null)for(i=n.onRecoverableError,t=0;t<e.length;t++)r=e[t],i(r.value,{componentStack:r.stack,digest:r.digest});if(sh)throw sh=!1,n=pm,pm=null,n;return(oh&1)!==0&&n.tag!==0&&ia(),s=n.pendingLanes,(s&1)!==0?n===mm?Ul++:(Ul=0,mm=n):Ul=0,ms(),null}function ia(){if(ns!==null){var n=Ax(oh),e=xi.transition,t=pt;try{if(xi.transition=null,pt=16>n?16:n,ns===null)var i=!1;else{if(n=ns,ns=null,oh=0,(st&6)!==0)throw Error(ae(331));var r=st;for(st|=4,be=n.current;be!==null;){var s=be,o=s.child;if((be.flags&16)!==0){var a=s.deletions;if(a!==null){for(var l=0;l<a.length;l++){var c=a[l];for(be=c;be!==null;){var u=be;switch(u.tag){case 0:case 11:case 15:Dl(8,u,s)}var d=u.child;if(d!==null)d.return=u,be=d;else for(;be!==null;){u=be;var h=u.sibling,p=u.return;if(By(u),u===c){be=null;break}if(h!==null){h.return=p,be=h;break}be=p}}}var g=s.alternate;if(g!==null){var _=g.child;if(_!==null){g.child=null;do{var m=_.sibling;_.sibling=null,_=m}while(_!==null)}}be=s}}if((s.subtreeFlags&2064)!==0&&o!==null)o.return=s,be=o;else e:for(;be!==null;){if(s=be,(s.flags&2048)!==0)switch(s.tag){case 0:case 11:case 15:Dl(9,s,s.return)}var f=s.sibling;if(f!==null){f.return=s.return,be=f;break e}be=s.return}}var v=n.current;for(be=v;be!==null;){o=be;var M=o.child;if((o.subtreeFlags&2064)!==0&&M!==null)M.return=o,be=M;else e:for(o=v;be!==null;){if(a=be,(a.flags&2048)!==0)try{switch(a.tag){case 0:case 11:case 15:_h(9,a)}}catch(w){Bt(a,a.return,w)}if(a===o){be=null;break e}var y=a.sibling;if(y!==null){y.return=a.return,be=y;break e}be=a.return}}if(st=r,ms(),ir&&typeof ir.onPostCommitFiberRoot=="function")try{ir.onPostCommitFiberRoot(ch,n)}catch{}i=!0}return i}finally{pt=t,xi.transition=e}}return!1}function ex(n,e,t){e=ca(t,e),e=Ay(n,e,1),n=as(n,e,1),e=In(),n!==null&&(Ql(n,1,e),Wn(n,e))}function Bt(n,e,t){if(n.tag===3)ex(n,n,t);else for(;e!==null;){if(e.tag===3){ex(e,n,t);break}else if(e.tag===1){var i=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(ls===null||!ls.has(i))){n=ca(t,n),n=Cy(e,n,1),e=as(e,n,1),n=In(),e!==null&&(Ql(e,1,n),Wn(e,n));break}}e=e.return}}function xT(n,e,t){var i=n.pingCache;i!==null&&i.delete(e),e=In(),n.pingedLanes|=n.suspendedLanes&t,en===n&&(ln&t)===t&&($t===4||$t===3&&(ln&130023424)===ln&&500>Vt()-Qm?eo(n,0):jm|=t),Wn(n,e)}function Zy(n,e){e===0&&((n.mode&1)===0?e=1:(e=pu,pu<<=1,(pu&130023424)===0&&(pu=4194304)));var t=In();n=Pr(n,e),n!==null&&(Ql(n,e,t),Wn(n,t))}function yT(n){var e=n.memoizedState,t=0;e!==null&&(t=e.retryLane),Zy(n,t)}function ST(n,e){var t=0;switch(n.tag){case 13:var i=n.stateNode,r=n.memoizedState;r!==null&&(t=r.retryLane);break;case 19:i=n.stateNode;break;default:throw Error(ae(314))}i!==null&&i.delete(e),Zy(n,t)}var $y;$y=function(n,e,t){if(n!==null)if(n.memoizedProps!==e.pendingProps||Gn.current)Vn=!0;else{if((n.lanes&t)===0&&(e.flags&128)===0)return Vn=!1,lT(n,e,t);Vn=(n.flags&131072)!==0}else Vn=!1,bt&&(e.flags&1048576)!==0&&Qx(e,Ku,e.index);switch(e.lanes=0,e.tag){case 2:var i=e.type;Uu(n,e),n=e.pendingProps;var r=sa(e,_n.current);na(e,t),r=qm(null,e,i,n,r,t);var s=Ym();return e.flags|=1,typeof r=="object"&&r!==null&&typeof r.render=="function"&&r.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,Hn(i)?(s=!0,$u(e)):s=!1,e.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,Vm(e),r.updater=gh,e.stateNode=r,r._reactInternals=e,im(e,i,n,t),e=om(null,e,i,!0,s,t)):(e.tag=0,bt&&s&&Nm(e),Pn(null,e,r,t),e=e.child),e;case 16:i=e.elementType;e:{switch(Uu(n,e),n=e.pendingProps,r=i._init,i=r(i._payload),e.type=i,r=e.tag=wT(i),n=Ui(i,n),r){case 0:e=sm(null,e,i,n,t);break e;case 1:e=Wv(null,e,i,n,t);break e;case 11:e=Gv(null,e,i,n,t);break e;case 14:e=Hv(null,e,i,Ui(i.type,n),t);break e}throw Error(ae(306,i,""))}return e;case 0:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Ui(i,r),sm(n,e,i,r,t);case 1:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Ui(i,r),Wv(n,e,i,r,t);case 3:e:{if(Ly(e),n===null)throw Error(ae(387));i=e.pendingProps,s=e.memoizedState,r=s.element,sy(n,e),eh(e,i,null,t);var o=e.memoizedState;if(i=o.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:o.cache,pendingSuspenseBoundaries:o.pendingSuspenseBoundaries,transitions:o.transitions},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){r=ca(Error(ae(423)),e),e=Xv(n,e,i,t,r);break e}else if(i!==r){r=ca(Error(ae(424)),e),e=Xv(n,e,i,t,r);break e}else for(ti=os(e.stateNode.containerInfo.firstChild),ni=e,bt=!0,Oi=null,t=iy(e,null,i,t),e.child=t;t;)t.flags=t.flags&-3|4096,t=t.sibling;else{if(oa(),i===r){e=Ir(n,e,t);break e}Pn(n,e,i,t)}e=e.child}return e;case 5:return oy(e),n===null&&em(e),i=e.type,r=e.pendingProps,s=n!==null?n.memoizedProps:null,o=r.children,$p(i,r)?o=null:s!==null&&$p(i,s)&&(e.flags|=32),Iy(n,e),Pn(n,e,o,t),e.child;case 6:return n===null&&em(e),null;case 13:return Dy(n,e,t);case 4:return Gm(e,e.stateNode.containerInfo),i=e.pendingProps,n===null?e.child=aa(e,null,i,t):Pn(n,e,i,t),e.child;case 11:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Ui(i,r),Gv(n,e,i,r,t);case 7:return Pn(n,e,e.pendingProps,t),e.child;case 8:return Pn(n,e,e.pendingProps.children,t),e.child;case 12:return Pn(n,e,e.pendingProps.children,t),e.child;case 10:e:{if(i=e.type._context,r=e.pendingProps,s=e.memoizedProps,o=r.value,vt(ju,i._currentValue),i._currentValue=o,s!==null)if(zi(s.value,o)){if(s.children===r.children&&!Gn.current){e=Ir(n,e,t);break e}}else for(s=e.child,s!==null&&(s.return=e);s!==null;){var a=s.dependencies;if(a!==null){o=s.child;for(var l=a.firstContext;l!==null;){if(l.context===i){if(s.tag===1){l=Ar(-1,t&-t),l.tag=2;var c=s.updateQueue;if(c!==null){c=c.shared;var u=c.pending;u===null?l.next=l:(l.next=u.next,u.next=l),c.pending=l}}s.lanes|=t,l=s.alternate,l!==null&&(l.lanes|=t),tm(s.return,t,e),a.lanes|=t;break}l=l.next}}else if(s.tag===10)o=s.type===e.type?null:s.child;else if(s.tag===18){if(o=s.return,o===null)throw Error(ae(341));o.lanes|=t,a=o.alternate,a!==null&&(a.lanes|=t),tm(o,t,e),o=s.sibling}else o=s.child;if(o!==null)o.return=s;else for(o=s;o!==null;){if(o===e){o=null;break}if(s=o.sibling,s!==null){s.return=o.return,o=s;break}o=o.return}s=o}Pn(n,e,r.children,t),e=e.child}return e;case 9:return r=e.type,i=e.pendingProps.children,na(e,t),r=yi(r),i=i(r),e.flags|=1,Pn(n,e,i,t),e.child;case 14:return i=e.type,r=Ui(i,e.pendingProps),r=Ui(i.type,r),Hv(n,e,i,r,t);case 15:return Ry(n,e,e.type,e.pendingProps,t);case 17:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Ui(i,r),Uu(n,e),e.tag=1,Hn(i)?(n=!0,$u(e)):n=!1,na(e,t),by(e,i,r),im(e,i,r,t),om(null,e,i,!0,n,t);case 19:return Ny(n,e,t);case 22:return Py(n,e,t)}throw Error(ae(156,e.tag))};function Jy(n,e){return wx(n,e)}function MT(n,e,t,i){this.tag=n,this.key=t,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function vi(n,e,t,i){return new MT(n,e,t,i)}function ig(n){return n=n.prototype,!(!n||!n.isReactComponent)}function wT(n){if(typeof n=="function")return ig(n)?1:0;if(n!=null){if(n=n.$$typeof,n===Mm)return 11;if(n===wm)return 14}return 2}function us(n,e){var t=n.alternate;return t===null?(t=vi(n.tag,e,n.key,n.mode),t.elementType=n.elementType,t.type=n.type,t.stateNode=n.stateNode,t.alternate=n,n.alternate=t):(t.pendingProps=e,t.type=n.type,t.flags=0,t.subtreeFlags=0,t.deletions=null),t.flags=n.flags&14680064,t.childLanes=n.childLanes,t.lanes=n.lanes,t.child=n.child,t.memoizedProps=n.memoizedProps,t.memoizedState=n.memoizedState,t.updateQueue=n.updateQueue,e=n.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},t.sibling=n.sibling,t.index=n.index,t.ref=n.ref,t}function Bu(n,e,t,i,r,s){var o=2;if(i=n,typeof n=="function")ig(n)&&(o=1);else if(typeof n=="string")o=5;else e:switch(n){case Vo:return to(t.children,r,s,e);case Sm:o=8,r|=8;break;case Ap:return n=vi(12,t,e,r|2),n.elementType=Ap,n.lanes=s,n;case Cp:return n=vi(13,t,e,r),n.elementType=Cp,n.lanes=s,n;case Rp:return n=vi(19,t,e,r),n.elementType=Rp,n.lanes=s,n;case ox:return xh(t,r,s,e);default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case rx:o=10;break e;case sx:o=9;break e;case Mm:o=11;break e;case wm:o=14;break e;case Kr:o=16,i=null;break e}throw Error(ae(130,n==null?n:typeof n,""))}return e=vi(o,t,e,r),e.elementType=n,e.type=i,e.lanes=s,e}function to(n,e,t,i){return n=vi(7,n,i,e),n.lanes=t,n}function xh(n,e,t,i){return n=vi(22,n,i,e),n.elementType=ox,n.lanes=t,n.stateNode={isHidden:!1},n}function Ep(n,e,t){return n=vi(6,n,null,e),n.lanes=t,n}function Tp(n,e,t){return e=vi(4,n.children!==null?n.children:[],n.key,e),e.lanes=t,e.stateNode={containerInfo:n.containerInfo,pendingChildren:null,implementation:n.implementation},e}function ET(n,e,t,i,r){this.tag=e,this.containerInfo=n,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=lp(0),this.expirationTimes=lp(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=lp(0),this.identifierPrefix=i,this.onRecoverableError=r,this.mutableSourceEagerHydrationData=null}function rg(n,e,t,i,r,s,o,a,l){return n=new ET(n,e,t,a,l),e===1?(e=1,s===!0&&(e|=8)):e=0,s=vi(3,null,null,e),n.current=s,s.stateNode=n,s.memoizedState={element:i,isDehydrated:t,cache:null,transitions:null,pendingSuspenseBoundaries:null},Vm(s),n}function TT(n,e,t){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:zo,key:i==null?null:""+i,children:n,containerInfo:e,implementation:t}}function Ky(n){if(!n)return fs;n=n._reactInternals;e:{if(lo(n)!==n||n.tag!==1)throw Error(ae(170));var e=n;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if(Hn(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(ae(171))}if(n.tag===1){var t=n.type;if(Hn(t))return Kx(n,t,e)}return e}function jy(n,e,t,i,r,s,o,a,l){return n=rg(t,i,!0,n,r,s,o,a,l),n.context=Ky(null),t=n.current,i=In(),r=cs(t),s=Ar(i,r),s.callback=e??null,as(t,s,r),n.current.lanes=r,Ql(n,r,i),Wn(n,i),n}function yh(n,e,t,i){var r=e.current,s=In(),o=cs(r);return t=Ky(t),e.context===null?e.context=t:e.pendingContext=t,e=Ar(s,o),e.payload={element:n},i=i===void 0?null:i,i!==null&&(e.callback=i),n=as(r,e,o),n!==null&&(ki(n,r,o,s),Lu(n,r,o)),o}function lh(n){return n=n.current,n.child?(n.child.tag===5,n.child.stateNode):null}function tx(n,e){if(n=n.memoizedState,n!==null&&n.dehydrated!==null){var t=n.retryLane;n.retryLane=t!==0&&t<e?t:e}}function sg(n,e){tx(n,e),(n=n.alternate)&&tx(n,e)}function bT(){return null}var Qy=typeof reportError=="function"?reportError:function(n){console.error(n)};function og(n){this._internalRoot=n}Sh.prototype.render=og.prototype.render=function(n){var e=this._internalRoot;if(e===null)throw Error(ae(409));yh(n,e,null,null)};Sh.prototype.unmount=og.prototype.unmount=function(){var n=this._internalRoot;if(n!==null){this._internalRoot=null;var e=n.containerInfo;oo(function(){yh(null,n,null,null)}),e[Rr]=null}};function Sh(n){this._internalRoot=n}Sh.prototype.unstable_scheduleHydration=function(n){if(n){var e=Px();n={blockedOn:null,target:n,priority:e};for(var t=0;t<Qr.length&&e!==0&&e<Qr[t].priority;t++);Qr.splice(t,0,n),t===0&&Lx(n)}};function ag(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11)}function Mh(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11&&(n.nodeType!==8||n.nodeValue!==" react-mount-point-unstable "))}function nx(){}function AT(n,e,t,i,r){if(r){if(typeof i=="function"){var s=i;i=function(){var c=lh(o);s.call(c)}}var o=jy(e,i,n,0,null,!1,!1,"",nx);return n._reactRootContainer=o,n[Rr]=o.current,Wl(n.nodeType===8?n.parentNode:n),oo(),o}for(;r=n.lastChild;)n.removeChild(r);if(typeof i=="function"){var a=i;i=function(){var c=lh(l);a.call(c)}}var l=rg(n,0,!1,null,null,!1,!1,"",nx);return n._reactRootContainer=l,n[Rr]=l.current,Wl(n.nodeType===8?n.parentNode:n),oo(function(){yh(e,l,t,i)}),l}function wh(n,e,t,i,r){var s=t._reactRootContainer;if(s){var o=s;if(typeof r=="function"){var a=r;r=function(){var l=lh(o);a.call(l)}}yh(e,o,n,r)}else o=AT(t,e,n,r,i);return lh(o)}Cx=function(n){switch(n.tag){case 3:var e=n.stateNode;if(e.current.memoizedState.isDehydrated){var t=Tl(e.pendingLanes);t!==0&&(bm(e,t|1),Wn(e,Vt()),(st&6)===0&&(ua=Vt()+500,ms()))}break;case 13:oo(function(){var i=Pr(n,1);if(i!==null){var r=In();ki(i,n,1,r)}}),sg(n,1)}};Am=function(n){if(n.tag===13){var e=Pr(n,134217728);if(e!==null){var t=In();ki(e,n,134217728,t)}sg(n,134217728)}};Rx=function(n){if(n.tag===13){var e=cs(n),t=Pr(n,e);if(t!==null){var i=In();ki(t,n,e,i)}sg(n,e)}};Px=function(){return pt};Ix=function(n,e){var t=pt;try{return pt=n,e()}finally{pt=t}};kp=function(n,e,t){switch(e){case"input":if(Lp(n,t),e=t.name,t.type==="radio"&&e!=null){for(t=n;t.parentNode;)t=t.parentNode;for(t=t.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<t.length;e++){var i=t[e];if(i!==n&&i.form===n.form){var r=dh(i);if(!r)throw Error(ae(90));lx(i),Lp(i,r)}}}break;case"textarea":ux(n,t);break;case"select":e=t.value,e!=null&&jo(n,!!t.multiple,e,!1)}};_x=eg;vx=oo;var CT={usingClientEntryPoint:!1,Events:[tc,Xo,dh,mx,gx,eg]},Sl={findFiberByHostInstance:Ks,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},RT={bundleType:Sl.bundleType,version:Sl.version,rendererPackageName:Sl.rendererPackageName,rendererConfig:Sl.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:Lr.ReactCurrentDispatcher,findHostInstanceByFiber:function(n){return n=Sx(n),n===null?null:n.stateNode},findFiberByHostInstance:Sl.findFiberByHostInstance||bT,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Ml=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Ml.isDisabled&&Ml.supportsFiber))try{ch=Ml.inject(RT),ir=Ml}catch{}var Ml;si.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=CT;si.createPortal=function(n,e){var t=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!ag(e))throw Error(ae(200));return TT(n,e,null,t)};si.createRoot=function(n,e){if(!ag(n))throw Error(ae(299));var t=!1,i="",r=Qy;return e!=null&&(e.unstable_strictMode===!0&&(t=!0),e.identifierPrefix!==void 0&&(i=e.identifierPrefix),e.onRecoverableError!==void 0&&(r=e.onRecoverableError)),e=rg(n,1,!1,null,null,t,!1,i,r),n[Rr]=e.current,Wl(n.nodeType===8?n.parentNode:n),new og(e)};si.findDOMNode=function(n){if(n==null)return null;if(n.nodeType===1)return n;var e=n._reactInternals;if(e===void 0)throw typeof n.render=="function"?Error(ae(188)):(n=Object.keys(n).join(","),Error(ae(268,n)));return n=Sx(e),n=n===null?null:n.stateNode,n};si.flushSync=function(n){return oo(n)};si.hydrate=function(n,e,t){if(!Mh(e))throw Error(ae(200));return wh(null,n,e,!0,t)};si.hydrateRoot=function(n,e,t){if(!ag(n))throw Error(ae(405));var i=t!=null&&t.hydratedSources||null,r=!1,s="",o=Qy;if(t!=null&&(t.unstable_strictMode===!0&&(r=!0),t.identifierPrefix!==void 0&&(s=t.identifierPrefix),t.onRecoverableError!==void 0&&(o=t.onRecoverableError)),e=jy(e,null,n,1,t??null,r,!1,s,o),n[Rr]=e.current,Wl(n),i)for(n=0;n<i.length;n++)t=i[n],r=t._getVersion,r=r(t._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[t,r]:e.mutableSourceEagerHydrationData.push(t,r);return new Sh(e)};si.render=function(n,e,t){if(!Mh(e))throw Error(ae(200));return wh(null,n,e,!1,t)};si.unmountComponentAtNode=function(n){if(!Mh(n))throw Error(ae(40));return n._reactRootContainer?(oo(function(){wh(null,null,n,!1,function(){n._reactRootContainer=null,n[Rr]=null})}),!0):!1};si.unstable_batchedUpdates=eg;si.unstable_renderSubtreeIntoContainer=function(n,e,t,i){if(!Mh(t))throw Error(ae(200));if(n==null||n._reactInternals===void 0)throw Error(ae(38));return wh(n,e,t,!1,i)};si.version="18.3.1-next-f1338f8080-20240426"});var iS=ji((a3,nS)=>{"use strict";function tS(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(tS)}catch(n){console.error(n)}}tS(),nS.exports=eS()});var sS=ji(lg=>{"use strict";var rS=iS();lg.createRoot=rS.createRoot,lg.hydrateRoot=rS.hydrateRoot;var l3});function Dr(n){if(n===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return n}function pS(n,e){n.prototype=Object.create(e.prototype),n.prototype.constructor=n,n.__proto__=e}var Zn,lc,bg,un,At,wi,gt,gg,PT,IT,mS,LT,DT,Jt,kt,Ur,Dh,ar,Yn,Ag,Eh,gS,xn,NT,UT,oS,Cg,fo,cg,Rg,FT,OT,Dt,sr,_g,Pg,ai,Ch,_S,vS,Nh,cc,xS,uc,BT,Th,kT,Ig,_s,vg,yS,Xn,ug,aS,bh,Lg,Dg,vs,Ng,Dn,zt,Lt,po,zT,Rh,Ug,SS,MS,wS,li,VT,pa,lS,Ph,sc,GT,ES,Uh,xs,co,HT,xg,WT,cS,ma,Ih,Fh,Oh,TS,or,bS,AS,XT,yg,qT,YT,ga,uS,ZT,Mi,oc,ys,dc,hn,$T,Sg,CS,JT,Ei,Mg,RS,PS,wg,IS,LS,KT,jT,QT,DS,eb,tb,va,NS,nb,hS,oi,ic,da,US,FS,mt,rc,hg,OS,BS,fS,Nr,ib,Fg,hc,qn,_a,tt,rb,sb,ob,ab,lb,cb,uo,mo,kS,fg,dg,Og,fc,vn,ub,Bg,hb,kg,gs,Eg,zg,fb,db,pb,ac,zS,VS,Gt,Vg,GS,mb,gb,Bh,HS,_b,Gg,Hg,vb,xb,yb,Wg,Nn,ho,Ah,Sb,dS,Mb,pg,Tg,WS,wb,Lh,Eb,Tb,mg,yn,bb,Ab,Cb,Rb,Pb,Ib,Lb,Db,Nb,Ub,Fb,Ob,Bb,kb,zb,Vb,Gb,Hb,Xg=Zr(()=>{Zn={autoSleep:120,force3D:"auto",nullTargetWarn:1,units:{lineHeight:""}},lc={duration:.5,overwrite:!1,delay:0},wi=1e8,gt=1/wi,gg=Math.PI*2,PT=gg/4,IT=0,mS=Math.sqrt,LT=Math.cos,DT=Math.sin,Jt=function(e){return typeof e=="string"},kt=function(e){return typeof e=="function"},Ur=function(e){return typeof e=="number"},Dh=function(e){return typeof e>"u"},ar=function(e){return typeof e=="object"},Yn=function(e){return e!==!1},Ag=function(){return typeof window<"u"},Eh=function(e){return kt(e)||Jt(e)},gS=typeof ArrayBuffer=="function"&&ArrayBuffer.isView||function(){},xn=Array.isArray,NT=/random\([^)]+\)/g,UT=/,\s*/g,oS=/(?:-?\.?\d|\.)+/gi,Cg=/[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,fo=/[-+=.]*\d+[.e-]*\d*[a-z%]*/g,cg=/[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,Rg=/[+-]=-?[.\d]+/,FT=/[^,'"\[\]\s]+/gi,OT=/^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,ai={},Ch={},vS=function(e){return(Ch=pa(e,ai))&&yn},Nh=function(e,t){return console.warn("Invalid property",e,"set to",t,"Missing plugin? gsap.registerPlugin()")},cc=function(e,t){return!t&&console.warn(e)},xS=function(e,t){return e&&(ai[e]=t)&&Ch&&(Ch[e]=t)||ai},uc=function(){return 0},BT={suppressEvents:!0,isStart:!0,kill:!1},Th={suppressEvents:!0,kill:!1},kT={suppressEvents:!0},Ig={},_s=[],vg={},Xn={},ug={},aS=30,bh=[],Lg="",Dg=function(e){var t=e[0],i,r;if(ar(t)||kt(t)||(e=[e]),!(i=(t._gsap||{}).harness)){for(r=bh.length;r--&&!bh[r].targetTest(t););i=bh[r]}for(r=e.length;r--;)e[r]&&(e[r]._gsap||(e[r]._gsap=new Og(e[r],i)))||e.splice(r,1);return e},vs=function(e){return e._gsap||Dg(Ei(e))[0]._gsap},Ng=function(e,t,i){return(i=e[t])&&kt(i)?e[t]():Dh(i)&&e.getAttribute&&e.getAttribute(t)||i},Dn=function(e,t){return(e=e.split(",")).forEach(t)||e},zt=function(e){return Math.round(e*1e5)/1e5||0},Lt=function(e){return Math.round(e*1e7)/1e7||0},po=function(e,t){var i=t.charAt(0),r=parseFloat(t.substr(2));return e=parseFloat(e),i==="+"?e+r:i==="-"?e-r:i==="*"?e*r:e/r},zT=function(e,t){for(var i=t.length,r=0;e.indexOf(t[r])<0&&++r<i;);return r<i},Rh=function(){var e=_s.length,t=_s.slice(0),i,r;for(vg={},_s.length=0,i=0;i<e;i++)r=t[i],r&&r._lazy&&(r.render(r._lazy[0],r._lazy[1],!0)._lazy=0)},Ug=function(e){return!!(e._initted||e._startAt||e.add)},SS=function(e,t,i,r){_s.length&&!un&&Rh(),e.render(t,i,r||!!(un&&t<0&&Ug(e))),_s.length&&!un&&Rh()},MS=function(e){var t=parseFloat(e);return(t||t===0)&&(e+"").match(FT).length<2?t:Jt(e)?e.trim():e},wS=function(e){return e},li=function(e,t){for(var i in t)i in e||(e[i]=t[i]);return e},VT=function(e){return function(t,i){for(var r in i)r in t||r==="duration"&&e||r==="ease"||(t[r]=i[r])}},pa=function(e,t){for(var i in t)e[i]=t[i];return e},lS=function n(e,t){for(var i in t)i!=="__proto__"&&i!=="constructor"&&i!=="prototype"&&(e[i]=ar(t[i])?n(e[i]||(e[i]={}),t[i]):t[i]);return e},Ph=function(e,t){var i={},r;for(r in e)r in t||(i[r]=e[r]);return i},sc=function(e){var t=e.parent||Dt,i=e.keyframes?VT(xn(e.keyframes)):li;if(Yn(e.inherit))for(;t;)i(e,t.vars.defaults),t=t.parent||t._dp;return e},GT=function(e,t){for(var i=e.length,r=i===t.length;r&&i--&&e[i]===t[i];);return i<0},ES=function(e,t,i,r,s){i===void 0&&(i="_first"),r===void 0&&(r="_last");var o=e[r],a;if(s)for(a=t[s];o&&o[s]>a;)o=o._prev;return o?(t._next=o._next,o._next=t):(t._next=e[i],e[i]=t),t._next?t._next._prev=t:e[r]=t,t._prev=o,t.parent=t._dp=e,t},Uh=function(e,t,i,r){i===void 0&&(i="_first"),r===void 0&&(r="_last");var s=t._prev,o=t._next;s?s._next=o:e[i]===t&&(e[i]=o),o?o._prev=s:e[r]===t&&(e[r]=s),t._next=t._prev=t.parent=null},xs=function(e,t){e.parent&&(!t||e.parent.autoRemoveChildren)&&e.parent.remove&&e.parent.remove(e),e._act=0},co=function(e,t){if(e&&(!t||t._end>e._dur||t._start<0))for(var i=e;i;)i._dirty=1,i=i.parent;return e},HT=function(e){for(var t=e.parent;t&&t.parent;)t._dirty=1,t.totalDuration(),t=t.parent;return e},xg=function(e,t,i,r){return e._startAt&&(un?e._startAt.revert(Th):e.vars.immediateRender&&!e.vars.autoRevert||e._startAt.render(t,!0,r))},WT=function n(e){return!e||e._ts&&n(e.parent)},cS=function(e){return e._repeat?ma(e._tTime,e=e.duration()+e._rDelay)*e:0},ma=function(e,t){var i=Math.floor(e=Lt(e/t));return e&&i===e?i-1:i},Ih=function(e,t){return(e-t._start)*t._ts+(t._ts>=0?0:t._dirty?t.totalDuration():t._tDur)},Fh=function(e){return e._end=Lt(e._start+(e._tDur/Math.abs(e._ts||e._rts||gt)||0))},Oh=function(e,t){var i=e._dp;return i&&i.smoothChildTiming&&e._ts&&(e._start=Lt(i._time-(e._ts>0?t/e._ts:((e._dirty?e.totalDuration():e._tDur)-t)/-e._ts)),Fh(e),i._dirty||co(i,e)),e},TS=function(e,t){var i;if((t._time||!t._dur&&t._initted||t._start<e._time&&(t._dur||!t.add))&&(i=Ih(e.rawTime(),t),(!t._dur||dc(0,t.totalDuration(),i)-t._tTime>gt)&&t.render(i,!0)),co(e,t)._dp&&e._initted&&e._time>=e._dur&&e._ts){if(e._dur<e.duration())for(i=e;i._dp;)i.rawTime()>=0&&i.totalTime(i._tTime),i=i._dp;e._zTime=-gt}},or=function(e,t,i,r){return t.parent&&xs(t),t._start=Lt((Ur(i)?i:i||e!==Dt?Mi(e,i,t):e._time)+t._delay),t._end=Lt(t._start+(t.totalDuration()/Math.abs(t.timeScale())||0)),ES(e,t,"_first","_last",e._sort?"_start":0),yg(t)||(e._recent=t),r||TS(e,t),e._ts<0&&Oh(e,e._tTime),e},bS=function(e,t){return(ai.ScrollTrigger||Nh("scrollTrigger",t))&&ai.ScrollTrigger.create(t,e)},AS=function(e,t,i,r,s){if(zg(e,t,s),!e._initted)return 1;if(!i&&e._pt&&!un&&(e._dur&&e.vars.lazy!==!1||!e._dur&&e.vars.lazy)&&yS!==qn.frame)return _s.push(e),e._lazy=[s,r],1},XT=function n(e){var t=e.parent;return t&&t._ts&&t._initted&&!t._lock&&(t.rawTime()<0||n(t))},yg=function(e){var t=e.data;return t==="isFromStart"||t==="isStart"},qT=function(e,t,i,r){var s=e.ratio,o=t<0||!t&&(!e._start&&XT(e)&&!(!e._initted&&yg(e))||(e._ts<0||e._dp._ts<0)&&!yg(e))?0:1,a=e._rDelay,l=0,c,u,d;if(a&&e._repeat&&(l=dc(0,e._tDur,t),u=ma(l,a),e._yoyo&&u&1&&(o=1-o),u!==ma(e._tTime,a)&&(s=1-o,e.vars.repeatRefresh&&e._initted&&e.invalidate())),o!==s||un||r||e._zTime===gt||!t&&e._zTime){if(!e._initted&&AS(e,t,r,i,l))return;for(d=e._zTime,e._zTime=t||(i?gt:0),i||(i=t&&!d),e.ratio=o,e._from&&(o=1-o),e._time=0,e._tTime=l,c=e._pt;c;)c.r(o,c.d),c=c._next;t<0&&xg(e,t,i,!0),e._onUpdate&&!i&&oi(e,"onUpdate"),l&&e._repeat&&!i&&e.parent&&oi(e,"onRepeat"),(t>=e._tDur||t<0)&&e.ratio===o&&(o&&xs(e,1),!i&&!un&&(oi(e,o?"onComplete":"onReverseComplete",!0),e._prom&&e._prom()))}else e._zTime||(e._zTime=t)},YT=function(e,t,i){var r;if(i>t)for(r=e._first;r&&r._start<=i;){if(r.data==="isPause"&&r._start>t)return r;r=r._next}else for(r=e._last;r&&r._start>=i;){if(r.data==="isPause"&&r._start<t)return r;r=r._prev}},ga=function(e,t,i,r){var s=e._repeat,o=Lt(t)||0,a=e._tTime/e._tDur;return a&&!r&&(e._time*=o/e._dur),e._dur=o,e._tDur=s?s<0?1e10:Lt(o*(s+1)+e._rDelay*s):o,a>0&&!r&&Oh(e,e._tTime=e._tDur*a),e.parent&&Fh(e),i||co(e.parent,e),e},uS=function(e){return e instanceof vn?co(e):ga(e,e._dur)},ZT={_start:0,endTime:uc,totalDuration:uc},Mi=function n(e,t,i){var r=e.labels,s=e._recent||ZT,o=e.duration()>=wi?s.endTime(!1):e._dur,a,l,c;return Jt(t)&&(isNaN(t)||t in r)?(l=t.charAt(0),c=t.substr(-1)==="%",a=t.indexOf("="),l==="<"||l===">"?(a>=0&&(t=t.replace(/=/,"")),(l==="<"?s._start:s.endTime(s._repeat>=0))+(parseFloat(t.substr(1))||0)*(c?(a<0?s:i).totalDuration()/100:1)):a<0?(t in r||(r[t]=o),r[t]):(l=parseFloat(t.charAt(a-1)+t.substr(a+1)),c&&i&&(l=l/100*(xn(i)?i[0]:i).totalDuration()),a>1?n(e,t.substr(0,a-1),i)+l:o+l)):t==null?o:+t},oc=function(e,t,i){var r=Ur(t[1]),s=(r?2:1)+(e<2?0:1),o=t[s],a,l;if(r&&(o.duration=t[1]),o.parent=i,e){for(a=o,l=i;l&&!("immediateRender"in a);)a=l.vars.defaults||{},l=Yn(l.vars.inherit)&&l.parent;o.immediateRender=Yn(a.immediateRender),e<2?o.runBackwards=1:o.startAt=t[s-1]}return new Gt(t[0],o,t[s+1])},ys=function(e,t){return e||e===0?t(e):t},dc=function(e,t,i){return i<e?e:i>t?t:i},hn=function(e,t){return!Jt(e)||!(t=OT.exec(e))?"":t[1]},$T=function(e,t,i){return ys(i,function(r){return dc(e,t,r)})},Sg=[].slice,CS=function(e,t){return e&&ar(e)&&"length"in e&&(!t&&!e.length||e.length-1 in e&&ar(e[0]))&&!e.nodeType&&e!==sr},JT=function(e,t,i){return i===void 0&&(i=[]),e.forEach(function(r){var s;return Jt(r)&&!t||CS(r,1)?(s=i).push.apply(s,Ei(r)):i.push(r)})||i},Ei=function(e,t,i){return At&&!t&&At.selector?At.selector(e):Jt(e)&&!i&&(_g||!_a())?Sg.call((t||Pg).querySelectorAll(e),0):xn(e)?JT(e,i):CS(e)?Sg.call(e,0):e?[e]:[]},Mg=function(e){return e=Ei(e)[0]||cc("Invalid scope")||{},function(t){var i=e.current||e.nativeElement||e;return Ei(t,i.querySelectorAll?i:i===e?cc("Invalid scope")||Pg.createElement("div"):e)}},RS=function(e){return e.sort(function(){return .5-Math.random()})},PS=function(e){if(kt(e))return e;var t=ar(e)?e:{each:e},i=uo(t.ease),r=t.from||0,s=parseFloat(t.base)||0,o={},a=r>0&&r<1,l=isNaN(r)||a,c=t.axis,u=r,d=r;return Jt(r)?u=d={center:.5,edges:.5,end:1}[r]||0:!a&&l&&(u=r[0],d=r[1]),function(h,p,g){var _=(g||t).length,m=o[_],f,v,M,y,w,E,A,x,b;if(!m){if(b=t.grid==="auto"?0:(t.grid||[1,wi])[1],!b){for(A=-wi;A<(A=g[b++].getBoundingClientRect().left)&&b<_;);b<_&&b--}for(m=o[_]=[],f=l?Math.min(b,_)*u-.5:r%b,v=b===wi?0:l?_*d/b-.5:r/b|0,A=0,x=wi,E=0;E<_;E++)M=E%b-f,y=v-(E/b|0),m[E]=w=c?Math.abs(c==="y"?y:M):mS(M*M+y*y),w>A&&(A=w),w<x&&(x=w);r==="random"&&RS(m),m.max=A-x,m.min=x,m.v=_=(parseFloat(t.amount)||parseFloat(t.each)*(b>_?_-1:c?c==="y"?_/b:b:Math.max(b,_/b))||0)*(r==="edges"?-1:1),m.b=_<0?s-_:s,m.u=hn(t.amount||t.each)||0,i=i&&_<0?cb(i):i}return _=(m[h]-m.min)/m.max||0,Lt(m.b+(i?i(_):_)*m.v)+m.u}},wg=function(e){var t=Math.pow(10,((e+"").split(".")[1]||"").length);return function(i){var r=Lt(Math.round(parseFloat(i)/e)*e*t);return(r-r%1)/t+(Ur(i)?0:hn(i))}},IS=function(e,t){var i=xn(e),r,s;return!i&&ar(e)&&(r=i=e.radius||wi,e.values?(e=Ei(e.values),(s=!Ur(e[0]))&&(r*=r)):e=wg(e.increment)),ys(t,i?kt(e)?function(o){return s=e(o),Math.abs(s-o)<=r?s:o}:function(o){for(var a=parseFloat(s?o.x:o),l=parseFloat(s?o.y:0),c=wi,u=0,d=e.length,h,p;d--;)s?(h=e[d].x-a,p=e[d].y-l,h=h*h+p*p):h=Math.abs(e[d]-a),h<c&&(c=h,u=d);return u=!r||c<=r?e[u]:o,s||u===o||Ur(o)?u:u+hn(o)}:wg(e))},LS=function(e,t,i,r){return ys(xn(e)?!t:i===!0?!!(i=0):!r,function(){return xn(e)?e[~~(Math.random()*e.length)]:(i=i||1e-5)&&(r=i<1?Math.pow(10,(i+"").length-2):1)&&Math.floor(Math.round((e-i/2+Math.random()*(t-e+i*.99))/i)*i*r)/r})},KT=function(){for(var e=arguments.length,t=new Array(e),i=0;i<e;i++)t[i]=arguments[i];return function(r){return t.reduce(function(s,o){return o(s)},r)}},jT=function(e,t){return function(i){return e(parseFloat(i))+(t||hn(i))}},QT=function(e,t,i){return NS(e,t,0,1,i)},DS=function(e,t,i){return ys(i,function(r){return e[~~t(r)]})},eb=function n(e,t,i){var r=t-e;return xn(e)?DS(e,n(0,e.length),t):ys(i,function(s){return(r+(s-e)%r)%r+e})},tb=function n(e,t,i){var r=t-e,s=r*2;return xn(e)?DS(e,n(0,e.length-1),t):ys(i,function(o){return o=(s+(o-e)%s)%s||0,e+(o>r?s-o:o)})},va=function(e){return e.replace(NT,function(t){var i=t.indexOf("[")+1,r=t.substring(i||7,i?t.indexOf("]"):t.length-1).split(UT);return LS(i?r:+r[0],i?0:+r[1],+r[2]||1e-5)})},NS=function(e,t,i,r,s){var o=t-e,a=r-i;return ys(s,function(l){return i+((l-e)/o*a||0)})},nb=function n(e,t,i,r){var s=isNaN(e+t)?0:function(p){return(1-p)*e+p*t};if(!s){var o=Jt(e),a={},l,c,u,d,h;if(i===!0&&(r=1)&&(i=null),o)e={p:e},t={p:t};else if(xn(e)&&!xn(t)){for(u=[],d=e.length,h=d-2,c=1;c<d;c++)u.push(n(e[c-1],e[c]));d--,s=function(g){g*=d;var _=Math.min(h,~~g);return u[_](g-_)},i=t}else r||(e=pa(xn(e)?[]:{},e));if(!u){for(l in t)Bg.call(a,e,l,"get",t[l]);s=function(g){return Hg(g,a)||(o?e.p:e)}}}return ys(i,s)},hS=function(e,t,i){var r=e.labels,s=wi,o,a,l;for(o in r)a=r[o]-t,a<0==!!i&&a&&s>(a=Math.abs(a))&&(l=o,s=a);return l},oi=function(e,t,i){var r=e.vars,s=r[t],o=At,a=e._ctx,l,c,u;if(s)return l=r[t+"Params"],c=r.callbackScope||e,i&&_s.length&&Rh(),a&&(At=a),u=l?s.apply(c,l):s.call(c),At=o,u},ic=function(e){return xs(e),e.scrollTrigger&&e.scrollTrigger.kill(!!un),e.progress()<1&&oi(e,"onInterrupt"),e},US=[],FS=function(e){if(e)if(e=!e.name&&e.default||e,Ag()||e.headless){var t=e.name,i=kt(e),r=t&&!i&&e.init?function(){this._props=[]}:e,s={init:uc,render:Hg,add:Bg,kill:xb,modifier:vb,rawVars:0},o={targetTest:0,get:0,getSetter:Bh,aliases:{},register:0};if(_a(),e!==r){if(Xn[t])return;li(r,li(Ph(e,s),o)),pa(r.prototype,pa(s,Ph(e,o))),Xn[r.prop=t]=r,e.targetTest&&(bh.push(r),Ig[t]=1),t=(t==="css"?"CSS":t.charAt(0).toUpperCase()+t.substr(1))+"Plugin"}xS(t,r),e.register&&e.register(yn,r,Nn)}else US.push(e)},mt=255,rc={aqua:[0,mt,mt],lime:[0,mt,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,mt],navy:[0,0,128],white:[mt,mt,mt],olive:[128,128,0],yellow:[mt,mt,0],orange:[mt,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[mt,0,0],pink:[mt,192,203],cyan:[0,mt,mt],transparent:[mt,mt,mt,0]},hg=function(e,t,i){return e+=e<0?1:e>1?-1:0,(e*6<1?t+(i-t)*e*6:e<.5?i:e*3<2?t+(i-t)*(2/3-e)*6:t)*mt+.5|0},OS=function(e,t,i){var r=e?Ur(e)?[e>>16,e>>8&mt,e&mt]:0:rc.black,s,o,a,l,c,u,d,h,p,g;if(!r){if(e.substr(-1)===","&&(e=e.substr(0,e.length-1)),rc[e])r=rc[e];else if(e.charAt(0)==="#"){if(e.length<6&&(s=e.charAt(1),o=e.charAt(2),a=e.charAt(3),e="#"+s+s+o+o+a+a+(e.length===5?e.charAt(4)+e.charAt(4):"")),e.length===9)return r=parseInt(e.substr(1,6),16),[r>>16,r>>8&mt,r&mt,parseInt(e.substr(7),16)/255];e=parseInt(e.substr(1),16),r=[e>>16,e>>8&mt,e&mt]}else if(e.substr(0,3)==="hsl"){if(r=g=e.match(oS),!t)l=+r[0]%360/360,c=+r[1]/100,u=+r[2]/100,o=u<=.5?u*(c+1):u+c-u*c,s=u*2-o,r.length>3&&(r[3]*=1),r[0]=hg(l+1/3,s,o),r[1]=hg(l,s,o),r[2]=hg(l-1/3,s,o);else if(~e.indexOf("="))return r=e.match(Cg),i&&r.length<4&&(r[3]=1),r}else r=e.match(oS)||rc.transparent;r=r.map(Number)}return t&&!g&&(s=r[0]/mt,o=r[1]/mt,a=r[2]/mt,d=Math.max(s,o,a),h=Math.min(s,o,a),u=(d+h)/2,d===h?l=c=0:(p=d-h,c=u>.5?p/(2-d-h):p/(d+h),l=d===s?(o-a)/p+(o<a?6:0):d===o?(a-s)/p+2:(s-o)/p+4,l*=60),r[0]=~~(l+.5),r[1]=~~(c*100+.5),r[2]=~~(u*100+.5)),i&&r.length<4&&(r[3]=1),r},BS=function(e){var t=[],i=[],r=-1;return e.split(Nr).forEach(function(s){var o=s.match(fo)||[];t.push.apply(t,o),i.push(r+=o.length+1)}),t.c=i,t},fS=function(e,t,i){var r="",s=(e+r).match(Nr),o=t?"hsla(":"rgba(",a=0,l,c,u,d;if(!s)return e;if(s=s.map(function(h){return(h=OS(h,t,1))&&o+(t?h[0]+","+h[1]+"%,"+h[2]+"%,"+h[3]:h.join(","))+")"}),i&&(u=BS(e),l=i.c,l.join(r)!==u.c.join(r)))for(c=e.replace(Nr,"1").split(fo),d=c.length-1;a<d;a++)r+=c[a]+(~l.indexOf(a)?s.shift()||o+"0,0,0,0)":(u.length?u:s.length?s:i).shift());if(!c)for(c=e.split(Nr),d=c.length-1;a<d;a++)r+=c[a]+s[a];return r+c[d]},Nr=(function(){var n="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",e;for(e in rc)n+="|"+e+"\\b";return new RegExp(n+")","gi")})(),ib=/hsl[a]?\(/,Fg=function(e){var t=e.join(" "),i;if(Nr.lastIndex=0,Nr.test(t))return i=ib.test(t),e[1]=fS(e[1],i),e[0]=fS(e[0],i,BS(e[1])),!0},qn=(function(){var n=Date.now,e=500,t=33,i=n(),r=i,s=1e3/240,o=s,a=[],l,c,u,d,h,p,g=function _(m){var f=n()-r,v=m===!0,M,y,w,E;if((f>e||f<0)&&(i+=f-t),r+=f,w=r-i,M=w-o,(M>0||v)&&(E=++d.frame,h=w-d.time*1e3,d.time=w=w/1e3,o+=M+(M>=s?4:s-M),y=1),v||(l=c(_)),y)for(p=0;p<a.length;p++)a[p](w,h,E,m)};return d={time:0,frame:0,tick:function(){g(!0)},deltaRatio:function(m){return h/(1e3/(m||60))},wake:function(){_S&&(!_g&&Ag()&&(sr=_g=window,Pg=sr.document||{},ai.gsap=yn,(sr.gsapVersions||(sr.gsapVersions=[])).push(yn.version),vS(Ch||sr.GreenSockGlobals||!sr.gsap&&sr||{}),US.forEach(FS)),u=typeof requestAnimationFrame<"u"&&requestAnimationFrame,l&&d.sleep(),c=u||function(m){return setTimeout(m,o-d.time*1e3+1|0)},hc=1,g(2))},sleep:function(){(u?cancelAnimationFrame:clearTimeout)(l),hc=0,c=uc},lagSmoothing:function(m,f){e=m||1/0,t=Math.min(f||33,e)},fps:function(m){s=1e3/(m||240),o=d.time*1e3+s},add:function(m,f,v){var M=f?function(y,w,E,A){m(y,w,E,A),d.remove(M)}:m;return d.remove(m),a[v?"unshift":"push"](M),_a(),M},remove:function(m,f){~(f=a.indexOf(m))&&a.splice(f,1)&&p>=f&&p--},_listeners:a},d})(),_a=function(){return!hc&&qn.wake()},tt={},rb=/^[\d.\-M][\d.\-,\s]/,sb=/["']/g,ob=function(e){for(var t={},i=e.substr(1,e.length-3).split(":"),r=i[0],s=1,o=i.length,a,l,c;s<o;s++)l=i[s],a=s!==o-1?l.lastIndexOf(","):l.length,c=l.substr(0,a),t[r]=isNaN(c)?c.replace(sb,"").trim():+c,r=l.substr(a+1).trim();return t},ab=function(e){var t=e.indexOf("(")+1,i=e.indexOf(")"),r=e.indexOf("(",t);return e.substring(t,~r&&r<i?e.indexOf(")",i+1):i)},lb=function(e){var t=(e+"").split("("),i=tt[t[0]];return i&&t.length>1&&i.config?i.config.apply(null,~e.indexOf("{")?[ob(t[1])]:ab(e).split(",").map(MS)):tt._CE&&rb.test(e)?tt._CE("",e):i},cb=function(e){return function(t){return 1-e(1-t)}},uo=function(e,t){return e&&(kt(e)?e:tt[e]||lb(e))||t},mo=function(e,t,i,r){i===void 0&&(i=function(l){return 1-t(1-l)}),r===void 0&&(r=function(l){return l<.5?t(l*2)/2:1-t((1-l)*2)/2});var s={easeIn:t,easeOut:i,easeInOut:r},o;return Dn(e,function(a){tt[a]=ai[a]=s,tt[o=a.toLowerCase()]=i;for(var l in s)tt[o+(l==="easeIn"?".in":l==="easeOut"?".out":".inOut")]=tt[a+"."+l]=s[l]}),s},kS=function(e){return function(t){return t<.5?(1-e(1-t*2))/2:.5+e((t-.5)*2)/2}},fg=function n(e,t,i){var r=t>=1?t:1,s=(i||(e?.3:.45))/(t<1?t:1),o=s/gg*(Math.asin(1/r)||0),a=function(u){return u===1?1:r*Math.pow(2,-10*u)*DT((u-o)*s)+1},l=e==="out"?a:e==="in"?function(c){return 1-a(1-c)}:kS(a);return s=gg/s,l.config=function(c,u){return n(e,c,u)},l},dg=function n(e,t){t===void 0&&(t=1.70158);var i=function(o){return o?--o*o*((t+1)*o+t)+1:0},r=e==="out"?i:e==="in"?function(s){return 1-i(1-s)}:kS(i);return r.config=function(s){return n(e,s)},r};Dn("Linear,Quad,Cubic,Quart,Quint,Strong",function(n,e){var t=e<5?e+1:e;mo(n+",Power"+(t-1),e?function(i){return Math.pow(i,t)}:function(i){return i},function(i){return 1-Math.pow(1-i,t)},function(i){return i<.5?Math.pow(i*2,t)/2:1-Math.pow((1-i)*2,t)/2})});tt.Linear.easeNone=tt.none=tt.Linear.easeIn;mo("Elastic",fg("in"),fg("out"),fg());(function(n,e){var t=1/e,i=2*t,r=2.5*t,s=function(a){return a<t?n*a*a:a<i?n*Math.pow(a-1.5/e,2)+.75:a<r?n*(a-=2.25/e)*a+.9375:n*Math.pow(a-2.625/e,2)+.984375};mo("Bounce",function(o){return 1-s(1-o)},s)})(7.5625,2.75);mo("Expo",function(n){return Math.pow(2,10*(n-1))*n+n*n*n*n*n*n*(1-n)});mo("Circ",function(n){return-(mS(1-n*n)-1)});mo("Sine",function(n){return n===1?1:-LT(n*PT)+1});mo("Back",dg("in"),dg("out"),dg());tt.SteppedEase=tt.steps=ai.SteppedEase={config:function(e,t){e===void 0&&(e=1);var i=1/e,r=e+(t?0:1),s=t?1:0,o=1-gt;return function(a){return((r*dc(0,o,a)|0)+s)*i}}};lc.ease=tt["quad.out"];Dn("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt",function(n){return Lg+=n+","+n+"Params,"});Og=function(e,t){this.id=IT++,e._gsap=this,this.target=e,this.harness=t,this.get=t?t.get:Ng,this.set=t?t.getSetter:Bh},fc=(function(){function n(t){this.vars=t,this._delay=+t.delay||0,(this._repeat=t.repeat===1/0?-2:t.repeat||0)&&(this._rDelay=t.repeatDelay||0,this._yoyo=!!t.yoyo||!!t.yoyoEase),this._ts=1,ga(this,+t.duration,1,1),this.data=t.data,At&&(this._ctx=At,At.data.push(this)),hc||qn.wake()}var e=n.prototype;return e.delay=function(i){return i||i===0?(this.parent&&this.parent.smoothChildTiming&&this.startTime(this._start+i-this._delay),this._delay=i,this):this._delay},e.duration=function(i){return arguments.length?this.totalDuration(this._repeat>0?i+(i+this._rDelay)*this._repeat:i):this.totalDuration()&&this._dur},e.totalDuration=function(i){return arguments.length?(this._dirty=0,ga(this,this._repeat<0?i:(i-this._repeat*this._rDelay)/(this._repeat+1))):this._tDur},e.totalTime=function(i,r){if(_a(),!arguments.length)return this._tTime;var s=this._dp;if(s&&s.smoothChildTiming&&this._ts){for(Oh(this,i),!s._dp||s.parent||TS(s,this);s&&s.parent;)s.parent._time!==s._start+(s._ts>=0?s._tTime/s._ts:(s.totalDuration()-s._tTime)/-s._ts)&&s.totalTime(s._tTime,!0),s=s.parent;!this.parent&&this._dp.autoRemoveChildren&&(this._ts>0&&i<this._tDur||this._ts<0&&i>0||!this._tDur&&!i)&&or(this._dp,this,this._start-this._delay)}return(this._tTime!==i||!this._dur&&!r||this._initted&&Math.abs(this._zTime)===gt||!this._initted&&this._dur&&i||!i&&!this._initted&&(this.add||this._ptLookup))&&(this._ts||(this._pTime=i),SS(this,i,r)),this},e.time=function(i,r){return arguments.length?this.totalTime(Math.min(this.totalDuration(),i+cS(this))%(this._dur+this._rDelay)||(i?this._dur:0),r):this._time},e.totalProgress=function(i,r){return arguments.length?this.totalTime(this.totalDuration()*i,r):this.totalDuration()?Math.min(1,this._tTime/this._tDur):this.rawTime()>=0&&this._initted?1:0},e.progress=function(i,r){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&!(this.iteration()&1)?1-i:i)+cS(this),r):this.duration()?Math.min(1,this._time/this._dur):this.rawTime()>0?1:0},e.iteration=function(i,r){var s=this.duration()+this._rDelay;return arguments.length?this.totalTime(this._time+(i-1)*s,r):this._repeat?ma(this._tTime,s)+1:1},e.timeScale=function(i,r){if(!arguments.length)return this._rts===-gt?0:this._rts;if(this._rts===i)return this;var s=this.parent&&this._ts?Ih(this.parent._time,this):this._tTime;return this._rts=+i||0,this._ts=this._ps||i===-gt?0:this._rts,this.totalTime(dc(-Math.abs(this._delay),this.totalDuration(),s),r!==!1),Fh(this),HT(this)},e.paused=function(i){return arguments.length?(this._ps!==i&&(this._ps=i,i?(this._pTime=this._tTime||Math.max(-this._delay,this.rawTime()),this._ts=this._act=0):(_a(),this._ts=this._rts,this.totalTime(this.parent&&!this.parent.smoothChildTiming?this.rawTime():this._tTime||this._pTime,this.progress()===1&&Math.abs(this._zTime)!==gt&&(this._tTime-=gt)))),this):this._ps},e.startTime=function(i){if(arguments.length){this._start=Lt(i);var r=this.parent||this._dp;return r&&(r._sort||!this.parent)&&or(r,this,this._start-this._delay),this}return this._start},e.endTime=function(i){return this._start+(Yn(i)?this.totalDuration():this.duration())/Math.abs(this._ts||1)},e.rawTime=function(i){var r=this.parent||this._dp;return r?i&&(!this._ts||this._repeat&&this._time&&this.totalProgress()<1)?this._tTime%(this._dur+this._rDelay):this._ts?Ih(r.rawTime(i),this):this._tTime:this._tTime},e.revert=function(i){i===void 0&&(i=kT);var r=un;return un=i,Ug(this)&&(this.timeline&&this.timeline.revert(i),this.totalTime(-.01,i.suppressEvents)),this.data!=="nested"&&i.kill!==!1&&this.kill(),un=r,this},e.globalTime=function(i){for(var r=this,s=arguments.length?i:r.rawTime();r;)s=r._start+s/(Math.abs(r._ts)||1),r=r._dp;return!this.parent&&this._sat?this._sat.globalTime(i):s},e.repeat=function(i){return arguments.length?(this._repeat=i===1/0?-2:i,uS(this)):this._repeat===-2?1/0:this._repeat},e.repeatDelay=function(i){if(arguments.length){var r=this._time;return this._rDelay=i,uS(this),r?this.time(r):this}return this._rDelay},e.yoyo=function(i){return arguments.length?(this._yoyo=i,this):this._yoyo},e.seek=function(i,r){return this.totalTime(Mi(this,i),Yn(r))},e.restart=function(i,r){return this.play().totalTime(i?-this._delay:0,Yn(r)),this._dur||(this._zTime=-gt),this},e.play=function(i,r){return i!=null&&this.seek(i,r),this.reversed(!1).paused(!1)},e.reverse=function(i,r){return i!=null&&this.seek(i||this.totalDuration(),r),this.reversed(!0).paused(!1)},e.pause=function(i,r){return i!=null&&this.seek(i,r),this.paused(!0)},e.resume=function(){return this.paused(!1)},e.reversed=function(i){return arguments.length?(!!i!==this.reversed()&&this.timeScale(-this._rts||(i?-gt:0)),this):this._rts<0},e.invalidate=function(){return this._initted=this._act=0,this._zTime=-gt,this},e.isActive=function(){var i=this.parent||this._dp,r=this._start,s;return!!(!i||this._ts&&this._initted&&i.isActive()&&(s=i.rawTime(!0))>=r&&s<this.endTime(!0)-gt)},e.eventCallback=function(i,r,s){var o=this.vars;return arguments.length>1?(r?(o[i]=r,s&&(o[i+"Params"]=s),i==="onUpdate"&&(this._onUpdate=r)):delete o[i],this):o[i]},e.then=function(i){var r=this,s=r._prom;return new Promise(function(o){var a=kt(i)?i:wS,l=function(){var u=r.then;r.then=null,s&&s(),kt(a)&&(a=a(r))&&(a.then||a===r)&&(r.then=u),o(a),r.then=u};r._initted&&r.totalProgress()===1&&r._ts>=0||!r._tTime&&r._ts<0?l():r._prom=l})},e.kill=function(){ic(this)},n})();li(fc.prototype,{_time:0,_start:0,_end:0,_tTime:0,_tDur:0,_dirty:0,_repeat:0,_yoyo:!1,parent:null,_initted:!1,_rDelay:0,_ts:1,_dp:0,ratio:0,_zTime:-gt,_prom:0,_ps:!1,_rts:1});vn=(function(n){pS(e,n);function e(i,r){var s;return i===void 0&&(i={}),s=n.call(this,i)||this,s.labels={},s.smoothChildTiming=!!i.smoothChildTiming,s.autoRemoveChildren=!!i.autoRemoveChildren,s._sort=Yn(i.sortChildren),Dt&&or(i.parent||Dt,Dr(s),r),i.reversed&&s.reverse(),i.paused&&s.paused(!0),i.scrollTrigger&&bS(Dr(s),i.scrollTrigger),s}var t=e.prototype;return t.to=function(r,s,o){return oc(0,arguments,this),this},t.from=function(r,s,o){return oc(1,arguments,this),this},t.fromTo=function(r,s,o,a){return oc(2,arguments,this),this},t.set=function(r,s,o){return s.duration=0,s.parent=this,sc(s).repeatDelay||(s.repeat=0),s.immediateRender=!!s.immediateRender,new Gt(r,s,Mi(this,o),1),this},t.call=function(r,s,o){return or(this,Gt.delayedCall(0,r,s),o)},t.staggerTo=function(r,s,o,a,l,c,u){return o.duration=s,o.stagger=o.stagger||a,o.onComplete=c,o.onCompleteParams=u,o.parent=this,new Gt(r,o,Mi(this,l)),this},t.staggerFrom=function(r,s,o,a,l,c,u){return o.runBackwards=1,sc(o).immediateRender=Yn(o.immediateRender),this.staggerTo(r,s,o,a,l,c,u)},t.staggerFromTo=function(r,s,o,a,l,c,u,d){return a.startAt=o,sc(a).immediateRender=Yn(a.immediateRender),this.staggerTo(r,s,a,l,c,u,d)},t.render=function(r,s,o){var a=this._time,l=this._dirty?this.totalDuration():this._tDur,c=this._dur,u=r<=0?0:Lt(r),d=this._zTime<0!=r<0&&(this._initted||!c),h,p,g,_,m,f,v,M,y,w,E,A;if(this!==Dt&&u>l&&r>=0&&(u=l),u!==this._tTime||o||d){if(a!==this._time&&c&&(u+=this._time-a,r+=this._time-a),h=u,y=this._start,M=this._ts,f=!M,d&&(c||(a=this._zTime),(r||!s)&&(this._zTime=r)),this._repeat){if(E=this._yoyo,m=c+this._rDelay,this._repeat<-1&&r<0)return this.totalTime(m*100+r,s,o);if(h=Lt(u%m),u===l?(_=this._repeat,h=c):(w=Lt(u/m),_=~~w,_&&_===w&&(h=c,_--),h>c&&(h=c)),w=ma(this._tTime,m),!a&&this._tTime&&w!==_&&this._tTime-w*m-this._dur<=0&&(w=_),E&&_&1&&(h=c-h,A=1),_!==w&&!this._lock){var x=E&&w&1,b=x===(E&&_&1);if(_<w&&(x=!x),a=x?0:u%c?c:u,this._lock=1,this.render(a||(A?0:Lt(_*m)),s,!c)._lock=0,this._tTime=u,!s&&this.parent&&oi(this,"onRepeat"),this.vars.repeatRefresh&&!A&&(this.invalidate()._lock=1,w=_),a&&a!==this._time||f!==!this._ts||this.vars.onRepeat&&!this.parent&&!this._act)return this;if(c=this._dur,l=this._tDur,b&&(this._lock=2,a=x?c:-1e-4,this.render(a,!0),this.vars.repeatRefresh&&!A&&this.invalidate()),this._lock=0,!this._ts&&!f)return this}}if(this._hasPause&&!this._forcing&&this._lock<2&&(v=YT(this,Lt(a),Lt(h)),v&&(u-=h-(h=v._start))),this._tTime=u,this._time=h,this._act=!!M,this._initted||(this._onUpdate=this.vars.onUpdate,this._initted=1,this._zTime=r,a=0),!a&&u&&c&&!s&&!w&&(oi(this,"onStart"),this._tTime!==u))return this;if(h>=a&&r>=0)for(p=this._first;p;){if(g=p._next,(p._act||h>=p._start)&&p._ts&&v!==p){if(p.parent!==this)return this.render(r,s,o);if(p.render(p._ts>0?(h-p._start)*p._ts:(p._dirty?p.totalDuration():p._tDur)+(h-p._start)*p._ts,s,o),h!==this._time||!this._ts&&!f){v=0,g&&(u+=this._zTime=-gt);break}}p=g}else{p=this._last;for(var P=r<0?r:h;p;){if(g=p._prev,(p._act||P<=p._end)&&p._ts&&v!==p){if(p.parent!==this)return this.render(r,s,o);if(p.render(p._ts>0?(P-p._start)*p._ts:(p._dirty?p.totalDuration():p._tDur)+(P-p._start)*p._ts,s,o||un&&Ug(p)),h!==this._time||!this._ts&&!f){v=0,g&&(u+=this._zTime=P?-gt:gt);break}}p=g}}if(v&&!s&&(this.pause(),v.render(h>=a?0:-gt)._zTime=h>=a?1:-1,this._ts))return this._start=y,Fh(this),this.render(r,s,o);this._onUpdate&&!s&&oi(this,"onUpdate",!0),(u===l&&this._tTime>=this.totalDuration()||!u&&a)&&(y===this._start||Math.abs(M)!==Math.abs(this._ts))&&(this._lock||((r||!c)&&(u===l&&this._ts>0||!u&&this._ts<0)&&xs(this,1),!s&&!(r<0&&!a)&&(u||a||!l)&&(oi(this,u===l&&r>=0?"onComplete":"onReverseComplete",!0),this._prom&&!(u<l&&this.timeScale()>0)&&this._prom())))}return this},t.add=function(r,s){var o=this;if(Ur(s)||(s=Mi(this,s,r)),!(r instanceof fc)){if(xn(r))return r.forEach(function(a){return o.add(a,s)}),this;if(Jt(r))return this.addLabel(r,s);if(kt(r))r=Gt.delayedCall(0,r);else return this}return this!==r?or(this,r,s):this},t.getChildren=function(r,s,o,a){r===void 0&&(r=!0),s===void 0&&(s=!0),o===void 0&&(o=!0),a===void 0&&(a=-wi);for(var l=[],c=this._first;c;)c._start>=a&&(c instanceof Gt?s&&l.push(c):(o&&l.push(c),r&&l.push.apply(l,c.getChildren(!0,s,o)))),c=c._next;return l},t.getById=function(r){for(var s=this.getChildren(1,1,1),o=s.length;o--;)if(s[o].vars.id===r)return s[o]},t.remove=function(r){return Jt(r)?this.removeLabel(r):kt(r)?this.killTweensOf(r):(r.parent===this&&Uh(this,r),r===this._recent&&(this._recent=this._last),co(this))},t.totalTime=function(r,s){return arguments.length?(this._forcing=1,!this._dp&&this._ts&&(this._start=Lt(qn.time-(this._ts>0?r/this._ts:(this.totalDuration()-r)/-this._ts))),n.prototype.totalTime.call(this,r,s),this._forcing=0,this):this._tTime},t.addLabel=function(r,s){return this.labels[r]=Mi(this,s),this},t.removeLabel=function(r){return delete this.labels[r],this},t.addPause=function(r,s,o){var a=Gt.delayedCall(0,s||uc,o);return a.data="isPause",this._hasPause=1,or(this,a,Mi(this,r))},t.removePause=function(r){var s=this._first;for(r=Mi(this,r);s;)s._start===r&&s.data==="isPause"&&xs(s),s=s._next},t.killTweensOf=function(r,s,o){for(var a=this.getTweensOf(r,o),l=a.length;l--;)gs!==a[l]&&a[l].kill(r,s);return this},t.getTweensOf=function(r,s){for(var o=[],a=Ei(r),l=this._first,c=Ur(s),u;l;)l instanceof Gt?zT(l._targets,a)&&(c?(!gs||l._initted&&l._ts)&&l.globalTime(0)<=s&&l.globalTime(l.totalDuration())>s:!s||l.isActive())&&o.push(l):(u=l.getTweensOf(a,s)).length&&o.push.apply(o,u),l=l._next;return o},t.tweenTo=function(r,s){s=s||{};var o=this,a=Mi(o,r),l=s,c=l.startAt,u=l.onStart,d=l.onStartParams,h=l.immediateRender,p,g=Gt.to(o,li({ease:s.ease||"none",lazy:!1,immediateRender:!1,time:a,overwrite:"auto",duration:s.duration||Math.abs((a-(c&&"time"in c?c.time:o._time))/o.timeScale())||gt,onStart:function(){if(o.pause(),!p){var m=s.duration||Math.abs((a-(c&&"time"in c?c.time:o._time))/o.timeScale());g._dur!==m&&ga(g,m,0,1).render(g._time,!0,!0),p=1}u&&u.apply(g,d||[])}},s));return h?g.render(0):g},t.tweenFromTo=function(r,s,o){return this.tweenTo(s,li({startAt:{time:Mi(this,r)}},o))},t.recent=function(){return this._recent},t.nextLabel=function(r){return r===void 0&&(r=this._time),hS(this,Mi(this,r))},t.previousLabel=function(r){return r===void 0&&(r=this._time),hS(this,Mi(this,r),1)},t.currentLabel=function(r){return arguments.length?this.seek(r,!0):this.previousLabel(this._time+gt)},t.shiftChildren=function(r,s,o){o===void 0&&(o=0);var a=this._first,l=this.labels,c;for(r=Lt(r);a;)a._start>=o&&(a._start+=r,a._end+=r),a=a._next;if(s)for(c in l)l[c]>=o&&(l[c]+=r);return co(this)},t.invalidate=function(r){var s=this._first;for(this._lock=0;s;)s.invalidate(r),s=s._next;return n.prototype.invalidate.call(this,r)},t.clear=function(r){r===void 0&&(r=!0);for(var s=this._first,o;s;)o=s._next,this.remove(s),s=o;return this._dp&&(this._time=this._tTime=this._pTime=0),r&&(this.labels={}),co(this)},t.totalDuration=function(r){var s=0,o=this,a=o._last,l=wi,c,u,d;if(arguments.length)return o.timeScale((o._repeat<0?o.duration():o.totalDuration())/(o.reversed()?-r:r));if(o._dirty){for(d=o.parent;a;)c=a._prev,a._dirty&&a.totalDuration(),u=a._start,u>l&&o._sort&&a._ts&&!o._lock?(o._lock=1,or(o,a,u-a._delay,1)._lock=0):l=u,u<0&&a._ts&&(s-=u,(!d&&!o._dp||d&&d.smoothChildTiming)&&(o._start+=Lt(u/o._ts),o._time-=u,o._tTime-=u),o.shiftChildren(-u,!1,-1/0),l=0),a._end>s&&a._ts&&(s=a._end),a=c;ga(o,o===Dt&&o._time>s?o._time:s,1,1),o._dirty=0}return o._tDur},e.updateRoot=function(r){if(Dt._ts&&(SS(Dt,Ih(r,Dt)),yS=qn.frame),qn.frame>=aS){aS+=Zn.autoSleep||120;var s=Dt._first;if((!s||!s._ts)&&Zn.autoSleep&&qn._listeners.length<2){for(;s&&!s._ts;)s=s._next;s||qn.sleep()}}},e})(fc);li(vn.prototype,{_lock:0,_hasPause:0,_forcing:0});ub=function(e,t,i,r,s,o,a){var l=new Nn(this._pt,e,t,0,1,Gg,null,s),c=0,u=0,d,h,p,g,_,m,f,v;for(l.b=i,l.e=r,i+="",r+="",(f=~r.indexOf("random("))&&(r=va(r)),o&&(v=[i,r],o(v,e,t),i=v[0],r=v[1]),h=i.match(cg)||[];d=cg.exec(r);)g=d[0],_=r.substring(c,d.index),p?p=(p+1)%5:_.substr(-5)==="rgba("&&(p=1),g!==h[u++]&&(m=parseFloat(h[u-1])||0,l._pt={_next:l._pt,p:_||u===1?_:",",s:m,c:g.charAt(1)==="="?po(m,g)-m:parseFloat(g)-m,m:p&&p<4?Math.round:0},c=cg.lastIndex);return l.c=c<r.length?r.substring(c,r.length):"",l.fp=a,(Rg.test(r)||f)&&(l.e=0),this._pt=l,l},Bg=function(e,t,i,r,s,o,a,l,c,u){kt(r)&&(r=r(s||0,e,o));var d=e[t],h=i!=="get"?i:kt(d)?c?e[t.indexOf("set")||!kt(e["get"+t.substr(3)])?t:"get"+t.substr(3)](c):e[t]():d,p=kt(d)?c?mb:GS:Vg,g;if(Jt(r)&&(~r.indexOf("random(")&&(r=va(r)),r.charAt(1)==="="&&(g=po(h,r)+(hn(h)||0),(g||g===0)&&(r=g))),!u||h!==r||Eg)return!isNaN(h*r)&&r!==""?(g=new Nn(this._pt,e,t,+h||0,r-(h||0),typeof d=="boolean"?_b:HS,0,p),c&&(g.fp=c),a&&g.modifier(a,this,e),this._pt=g):(!d&&!(t in e)&&Nh(t,r),ub.call(this,e,t,h,r,p,l||Zn.stringFilter,c))},hb=function(e,t,i,r,s){if(kt(e)&&(e=ac(e,s,t,i,r)),!ar(e)||e.style&&e.nodeType||xn(e)||gS(e))return Jt(e)?ac(e,s,t,i,r):e;var o={},a;for(a in e)o[a]=ac(e[a],s,t,i,r);return o},kg=function(e,t,i,r,s,o){var a,l,c,u;if(Xn[e]&&(a=new Xn[e]).init(s,a.rawVars?t[e]:hb(t[e],r,s,o,i),i,r,o)!==!1&&(i._pt=l=new Nn(i._pt,s,e,0,1,a.render,a,0,a.priority),i!==da))for(c=i._ptLookup[i._targets.indexOf(s)],u=a._props.length;u--;)c[a._props[u]]=l;return a},zg=function n(e,t,i){var r=e.vars,s=r.ease,o=r.startAt,a=r.immediateRender,l=r.lazy,c=r.onUpdate,u=r.runBackwards,d=r.yoyoEase,h=r.keyframes,p=r.autoRevert,g=e._dur,_=e._startAt,m=e._targets,f=e.parent,v=f&&f.data==="nested"?f.vars.targets:m,M=e._overwrite==="auto"&&!bg,y=e.timeline,w=r.easeReverse||d,E,A,x,b,P,L,D,B,I,O,Y,H,ne;if(y&&(!h||!s)&&(s="none"),e._ease=uo(s,lc.ease),e._rEase=w&&(uo(w)||e._ease),e._from=!y&&!!r.runBackwards,e._from&&(e.ratio=1),!y||h&&!r.stagger){if(B=m[0]?vs(m[0]).harness:0,H=B&&r[B.prop],E=Ph(r,Ig),_&&(_._zTime<0&&_.progress(1),t<0&&u&&a&&!p?_.render(-1,!0):_.revert(u&&g?Th:BT),_._lazy=0),o){if(xs(e._startAt=Gt.set(m,li({data:"isStart",overwrite:!1,parent:f,immediateRender:!0,lazy:!_&&Yn(l),startAt:null,delay:0,onUpdate:c&&function(){return oi(e,"onUpdate")},stagger:0},o))),e._startAt._dp=0,e._startAt._sat=e,t<0&&(un||!a&&!p)&&e._startAt.revert(Th),a&&g&&t<=0&&i<=0){t&&(e._zTime=t);return}}else if(u&&g&&!_){if(t&&(a=!1),x=li({overwrite:!1,data:"isFromStart",lazy:a&&!_&&Yn(l),immediateRender:a,stagger:0,parent:f},E),H&&(x[B.prop]=H),xs(e._startAt=Gt.set(m,x)),e._startAt._dp=0,e._startAt._sat=e,t<0&&(un?e._startAt.revert(Th):e._startAt.render(-1,!0)),e._zTime=t,!a)n(e._startAt,gt,gt);else if(!t)return}for(e._pt=e._ptCache=0,l=g&&Yn(l)||l&&!g,A=0;A<m.length;A++){if(P=m[A],D=P._gsap||Dg(m)[A]._gsap,e._ptLookup[A]=O={},vg[D.id]&&_s.length&&Rh(),Y=v===m?A:v.indexOf(P),B&&(I=new B).init(P,H||E,e,Y,v)!==!1&&(e._pt=b=new Nn(e._pt,P,I.name,0,1,I.render,I,0,I.priority),I._props.forEach(function(Z){O[Z]=b}),I.priority&&(L=1)),!B||H)for(x in E)Xn[x]&&(I=kg(x,E,e,Y,P,v))?I.priority&&(L=1):O[x]=b=Bg.call(e,P,x,"get",E[x],Y,v,0,r.stringFilter);e._op&&e._op[A]&&e.kill(P,e._op[A]),M&&e._pt&&(gs=e,Dt.killTweensOf(P,O,e.globalTime(t)),ne=!e.parent,gs=0),e._pt&&l&&(vg[D.id]=1)}L&&Wg(e),e._onInit&&e._onInit(e)}e._onUpdate=c,e._initted=(!e._op||e._pt)&&!ne,h&&t<=0&&y.render(wi,!0,!0)},fb=function(e,t,i,r,s,o,a,l){var c=(e._pt&&e._ptCache||(e._ptCache={}))[t],u,d,h,p;if(!c)for(c=e._ptCache[t]=[],h=e._ptLookup,p=e._targets.length;p--;){if(u=h[p][t],u&&u.d&&u.d._pt)for(u=u.d._pt;u&&u.p!==t&&u.fp!==t;)u=u._next;if(!u)return Eg=1,e.vars[t]="+=0",zg(e,a),Eg=0,l?cc(t+" not eligible for reset. Try splitting into individual properties"):1;c.push(u)}for(p=c.length;p--;)d=c[p],u=d._pt||d,u.s=(r||r===0)&&!s?r:u.s+(r||0)+o*u.c,u.c=i-u.s,d.e&&(d.e=zt(i)+hn(d.e)),d.b&&(d.b=u.s+hn(d.b))},db=function(e,t){var i=e[0]?vs(e[0]).harness:0,r=i&&i.aliases,s,o,a,l;if(!r)return t;s=pa({},t);for(o in r)if(o in s)for(l=r[o].split(","),a=l.length;a--;)s[l[a]]=s[o];return s},pb=function(e,t,i,r){var s=t.ease||r||"power1.inOut",o,a;if(xn(t))a=i[e]||(i[e]=[]),t.forEach(function(l,c){return a.push({t:c/(t.length-1)*100,v:l,e:s})});else for(o in t)a=i[o]||(i[o]=[]),o==="ease"||a.push({t:parseFloat(e),v:t[o],e:s})},ac=function(e,t,i,r,s){return kt(e)?e.call(t,i,r,s):Jt(e)&&~e.indexOf("random(")?va(e):e},zS=Lg+"repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert",VS={};Dn(zS+",id,stagger,delay,duration,paused,scrollTrigger",function(n){return VS[n]=1});Gt=(function(n){pS(e,n);function e(i,r,s,o){var a;typeof r=="number"&&(s.duration=r,r=s,s=null),a=n.call(this,o?r:sc(r))||this;var l=a.vars,c=l.duration,u=l.delay,d=l.immediateRender,h=l.stagger,p=l.overwrite,g=l.keyframes,_=l.defaults,m=l.scrollTrigger,f=r.parent||Dt,v=(xn(i)||gS(i)?Ur(i[0]):"length"in r)?[i]:Ei(i),M,y,w,E,A,x,b,P;if(a._targets=v.length?Dg(v):cc("GSAP target "+i+" not found. https://gsap.com",!Zn.nullTargetWarn)||[],a._ptLookup=[],a._overwrite=p,g||h||Eh(c)||Eh(u)){r=a.vars;var L=r.easeReverse||r.yoyoEase;if(M=a.timeline=new vn({data:"nested",defaults:_||{},targets:f&&f.data==="nested"?f.vars.targets:v}),M.kill(),M.parent=M._dp=Dr(a),M._start=0,h||Eh(c)||Eh(u)){if(E=v.length,b=h&&PS(h),ar(h))for(A in h)~zS.indexOf(A)&&(P||(P={}),P[A]=h[A]);for(y=0;y<E;y++)w=Ph(r,VS),w.stagger=0,L&&(w.easeReverse=L),P&&pa(w,P),x=v[y],w.duration=+ac(c,Dr(a),y,x,v),w.delay=(+ac(u,Dr(a),y,x,v)||0)-a._delay,!h&&E===1&&w.delay&&(a._delay=u=w.delay,a._start+=u,w.delay=0),M.to(x,w,b?b(y,x,v):0),M._ease=tt.none;M.duration()?c=u=0:a.timeline=0}else if(g){sc(li(M.vars.defaults,{ease:"none"})),M._ease=uo(g.ease||r.ease||"none");var D=0,B,I,O;if(xn(g))g.forEach(function(Y){return M.to(v,Y,">")}),M.duration();else{w={};for(A in g)A==="ease"||A==="easeEach"||pb(A,g[A],w,g.easeEach);for(A in w)for(B=w[A].sort(function(Y,H){return Y.t-H.t}),D=0,y=0;y<B.length;y++)I=B[y],O={ease:I.e,duration:(I.t-(y?B[y-1].t:0))/100*c},O[A]=I.v,M.to(v,O,D),D+=O.duration;M.duration()<c&&M.to({},{duration:c-M.duration()})}}c||a.duration(c=M.duration())}else a.timeline=0;return p===!0&&!bg&&(gs=Dr(a),Dt.killTweensOf(v),gs=0),or(f,Dr(a),s),r.reversed&&a.reverse(),r.paused&&a.paused(!0),(d||!c&&!g&&a._start===Lt(f._time)&&Yn(d)&&WT(Dr(a))&&f.data!=="nested")&&(a._tTime=-gt,a.render(Math.max(0,-u)||0)),m&&bS(Dr(a),m),a}var t=e.prototype;return t.render=function(r,s,o){var a=this._time,l=this._tDur,c=this._dur,u=r<0,d=r>l-gt&&!u?l:r<gt?0:r,h,p,g,_,m,f,v,M;if(!c)qT(this,r,s,o);else if(d!==this._tTime||!r||o||!this._initted&&this._tTime||this._startAt&&this._zTime<0!==u||this._lazy){if(h=d,M=this.timeline,this._repeat){if(_=c+this._rDelay,this._repeat<-1&&u)return this.totalTime(_*100+r,s,o);if(h=Lt(d%_),d===l?(g=this._repeat,h=c):(m=Lt(d/_),g=~~m,g&&g===m?(h=c,g--):h>c&&(h=c)),f=this._yoyo&&g&1,f&&(h=c-h),m=ma(this._tTime,_),h===a&&!o&&this._initted&&g===m)return this._tTime=d,this;g!==m&&this.vars.repeatRefresh&&!f&&!this._lock&&h!==_&&this._initted&&(this._lock=o=1,this.render(Lt(_*g),!0).invalidate()._lock=0)}if(!this._initted){if(AS(this,u?r:h,o,s,d))return this._tTime=0,this;if(a!==this._time&&!(o&&this.vars.repeatRefresh&&g!==m))return this;if(c!==this._dur)return this.render(r,s,o)}if(this._rEase){var y=h<a;if(y!==this._inv){var w=y?a:c-a;this._inv=y,this._from&&(this.ratio=1-this.ratio),this._invRatio=this.ratio,this._invTime=a,this._invRecip=w?(y?-1:1)/w:0,this._invScale=y?-this.ratio:1-this.ratio,this._invEase=y?this._rEase:this._ease}this.ratio=v=this._invRatio+this._invScale*this._invEase((h-this._invTime)*this._invRecip)}else this.ratio=v=this._ease(h/c);if(this._from&&(this.ratio=v=1-v),this._tTime=d,this._time=h,!this._act&&this._ts&&(this._act=1,this._lazy=0),!a&&d&&!s&&!m&&(oi(this,"onStart"),this._tTime!==d))return this;for(p=this._pt;p;)p.r(v,p.d),p=p._next;M&&M.render(r<0?r:M._dur*M._ease(h/this._dur),s,o)||this._startAt&&(this._zTime=r),this._onUpdate&&!s&&(u&&xg(this,r,s,o),oi(this,"onUpdate")),this._repeat&&g!==m&&this.vars.onRepeat&&!s&&this.parent&&oi(this,"onRepeat"),(d===this._tDur||!d)&&this._tTime===d&&(u&&!this._onUpdate&&xg(this,r,!0,!0),(r||!c)&&(d===this._tDur&&this._ts>0||!d&&this._ts<0)&&xs(this,1),!s&&!(u&&!a)&&(d||a||f)&&(oi(this,d===l?"onComplete":"onReverseComplete",!0),this._prom&&!(d<l&&this.timeScale()>0)&&this._prom()))}return this},t.targets=function(){return this._targets},t.invalidate=function(r){return(!r||!this.vars.runBackwards)&&(this._startAt=0),this._pt=this._op=this._onUpdate=this._lazy=this.ratio=0,this._ptLookup=[],this.timeline&&this.timeline.invalidate(r),n.prototype.invalidate.call(this,r)},t.resetTo=function(r,s,o,a,l){hc||qn.wake(),this._ts||this.play();var c=Math.min(this._dur,(this._dp._time-this._start)*this._ts),u;return this._initted||zg(this,c),u=this._ease(c/this._dur),fb(this,r,s,o,a,u,c,l)?this.resetTo(r,s,o,a,1):(Oh(this,0),this.parent||ES(this._dp,this,"_first","_last",this._dp._sort?"_start":0),this.render(0))},t.kill=function(r,s){if(s===void 0&&(s="all"),!r&&(!s||s==="all"))return this._lazy=this._pt=0,this.parent?ic(this):this.scrollTrigger&&this.scrollTrigger.kill(!!un),this;if(this.timeline){var o=this.timeline.totalDuration();return this.timeline.killTweensOf(r,s,gs&&gs.vars.overwrite!==!0)._first||ic(this),this.parent&&o!==this.timeline.totalDuration()&&ga(this,this._dur*this.timeline._tDur/o,0,1),this}var a=this._targets,l=r?Ei(r):a,c=this._ptLookup,u=this._pt,d,h,p,g,_,m,f;if((!s||s==="all")&&GT(a,l))return s==="all"&&(this._pt=0),ic(this);for(d=this._op=this._op||[],s!=="all"&&(Jt(s)&&(_={},Dn(s,function(v){return _[v]=1}),s=_),s=db(a,s)),f=a.length;f--;)if(~l.indexOf(a[f])){h=c[f],s==="all"?(d[f]=s,g=h,p={}):(p=d[f]=d[f]||{},g=s);for(_ in g)m=h&&h[_],m&&((!("kill"in m.d)||m.d.kill(_)===!0)&&Uh(this,m,"_pt"),delete h[_]),p!=="all"&&(p[_]=1)}return this._initted&&!this._pt&&u&&ic(this),this},e.to=function(r,s){return new e(r,s,arguments[2])},e.from=function(r,s){return oc(1,arguments)},e.delayedCall=function(r,s,o,a){return new e(s,0,{immediateRender:!1,lazy:!1,overwrite:!1,delay:r,onComplete:s,onReverseComplete:s,onCompleteParams:o,onReverseCompleteParams:o,callbackScope:a})},e.fromTo=function(r,s,o){return oc(2,arguments)},e.set=function(r,s){return s.duration=0,s.repeatDelay||(s.repeat=0),new e(r,s)},e.killTweensOf=function(r,s,o){return Dt.killTweensOf(r,s,o)},e})(fc);li(Gt.prototype,{_targets:[],_lazy:0,_startAt:0,_op:0,_onInit:0});Dn("staggerTo,staggerFrom,staggerFromTo",function(n){Gt[n]=function(){var e=new vn,t=Sg.call(arguments,0);return t.splice(n==="staggerFromTo"?5:4,0,0),e[n].apply(e,t)}});Vg=function(e,t,i){return e[t]=i},GS=function(e,t,i){return e[t](i)},mb=function(e,t,i,r){return e[t](r.fp,i)},gb=function(e,t,i){return e.setAttribute(t,i)},Bh=function(e,t){return kt(e[t])?GS:Dh(e[t])&&e.setAttribute?gb:Vg},HS=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e6)/1e6,t)},_b=function(e,t){return t.set(t.t,t.p,!!(t.s+t.c*e),t)},Gg=function(e,t){var i=t._pt,r="";if(!e&&t.b)r=t.b;else if(e===1&&t.e)r=t.e;else{for(;i;)r=i.p+(i.m?i.m(i.s+i.c*e):Math.round((i.s+i.c*e)*1e4)/1e4)+r,i=i._next;r+=t.c}t.set(t.t,t.p,r,t)},Hg=function(e,t){for(var i=t._pt;i;)i.r(e,i.d),i=i._next},vb=function(e,t,i,r){for(var s=this._pt,o;s;)o=s._next,s.p===r&&s.modifier(e,t,i),s=o},xb=function(e){for(var t=this._pt,i,r;t;)r=t._next,t.p===e&&!t.op||t.op===e?Uh(this,t,"_pt"):t.dep||(i=1),t=r;return!i},yb=function(e,t,i,r){r.mSet(e,t,r.m.call(r.tween,i,r.mt),r)},Wg=function(e){for(var t=e._pt,i,r,s,o;t;){for(i=t._next,r=s;r&&r.pr>t.pr;)r=r._next;(t._prev=r?r._prev:o)?t._prev._next=t:s=t,(t._next=r)?r._prev=t:o=t,t=i}e._pt=s},Nn=(function(){function n(t,i,r,s,o,a,l,c,u){this.t=i,this.s=s,this.c=o,this.p=r,this.r=a||HS,this.d=l||this,this.set=c||Vg,this.pr=u||0,this._next=t,t&&(t._prev=this)}var e=n.prototype;return e.modifier=function(i,r,s){this.mSet=this.mSet||this.set,this.set=yb,this.m=i,this.mt=s,this.tween=r},n})();Dn(Lg+"parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse",function(n){return Ig[n]=1});ai.TweenMax=ai.TweenLite=Gt;ai.TimelineLite=ai.TimelineMax=vn;Dt=new vn({sortChildren:!1,defaults:lc,autoRemoveChildren:!0,id:"root",smoothChildTiming:!0});Zn.stringFilter=Fg;ho=[],Ah={},Sb=[],dS=0,Mb=0,pg=function(e){return(Ah[e]||Sb).map(function(t){return t()})},Tg=function(){var e=Date.now(),t=[];e-dS>2&&(pg("matchMediaInit"),ho.forEach(function(i){var r=i.queries,s=i.conditions,o,a,l,c;for(a in r)o=sr.matchMedia(r[a]).matches,o&&(l=1),o!==s[a]&&(s[a]=o,c=1);c&&(i.revert(),l&&t.push(i))}),pg("matchMediaRevert"),t.forEach(function(i){return i.onMatch(i,function(r){return i.add(null,r)})}),dS=e,pg("matchMedia"))},WS=(function(){function n(t,i){this.selector=i&&Mg(i),this.data=[],this._r=[],this.isReverted=!1,this.id=Mb++,t&&this.add(t)}var e=n.prototype;return e.add=function(i,r,s){kt(i)&&(s=r,r=i,i=kt);var o=this,a=function(){var c=At,u=o.selector,d;return c&&c!==o&&c.data.push(o),s&&(o.selector=Mg(s)),At=o,d=r.apply(o,arguments),kt(d)&&o._r.push(d),At=c,o.selector=u,o.isReverted=!1,d};return o.last=a,i===kt?a(o,function(l){return o.add(null,l)}):i?o[i]=a:a},e.ignore=function(i){var r=At;At=null,i(this),At=r},e.getTweens=function(){var i=[];return this.data.forEach(function(r){return r instanceof n?i.push.apply(i,r.getTweens()):r instanceof Gt&&!(r.parent&&r.parent.data==="nested")&&i.push(r)}),i},e.clear=function(){this._r.length=this.data.length=0},e.kill=function(i,r){var s=this;if(i?(function(){for(var a=s.getTweens(),l=s.data.length,c;l--;)c=s.data[l],c.data==="isFlip"&&(c.revert(),c.getChildren(!0,!0,!1).forEach(function(u){return a.splice(a.indexOf(u),1)}));for(a.map(function(u){return{g:u._dur||u._delay||u._sat&&!u._sat.vars.immediateRender?u.globalTime(0):-1/0,t:u}}).sort(function(u,d){return d.g-u.g||-1/0}).forEach(function(u){return u.t.revert(i)}),l=s.data.length;l--;)c=s.data[l],c instanceof vn?c.data!=="nested"&&(c.scrollTrigger&&c.scrollTrigger.revert(),c.kill()):!(c instanceof Gt)&&c.revert&&c.revert(i);s._r.forEach(function(u){return u(i,s)}),s.isReverted=!0})():this.data.forEach(function(a){return a.kill&&a.kill()}),this.clear(),r)for(var o=ho.length;o--;)ho[o].id===this.id&&ho.splice(o,1)},e.revert=function(i){this.kill(i||{})},n})(),wb=(function(){function n(t){this.contexts=[],this.scope=t,At&&At.data.push(this)}var e=n.prototype;return e.add=function(i,r,s){ar(i)||(i={matches:i});var o=new WS(0,s||this.scope),a=o.conditions={},l,c,u;At&&!o.selector&&(o.selector=At.selector),this.contexts.push(o),r=o.add("onMatch",r),o.queries=i;for(c in i)c==="all"?u=1:(l=sr.matchMedia(i[c]),l&&(ho.indexOf(o)<0&&ho.push(o),(a[c]=l.matches)&&(u=1),l.addListener?l.addListener(Tg):l.addEventListener("change",Tg)));return u&&r(o,function(d){return o.add(null,d)}),this},e.revert=function(i){this.kill(i||{})},e.kill=function(i){this.contexts.forEach(function(r){return r.kill(i,!0)})},n})(),Lh={registerPlugin:function(){for(var e=arguments.length,t=new Array(e),i=0;i<e;i++)t[i]=arguments[i];t.forEach(function(r){return FS(r)})},timeline:function(e){return new vn(e)},getTweensOf:function(e,t){return Dt.getTweensOf(e,t)},getProperty:function(e,t,i,r){Jt(e)&&(e=Ei(e)[0]);var s=vs(e||{}).get,o=i?wS:MS;return i==="native"&&(i=""),e&&(t?o((Xn[t]&&Xn[t].get||s)(e,t,i,r)):function(a,l,c){return o((Xn[a]&&Xn[a].get||s)(e,a,l,c))})},quickSetter:function(e,t,i){if(e=Ei(e),e.length>1){var r=e.map(function(u){return yn.quickSetter(u,t,i)}),s=r.length;return function(u){for(var d=s;d--;)r[d](u)}}e=e[0]||{};var o=Xn[t],a=vs(e),l=a.harness&&(a.harness.aliases||{})[t]||t,c=o?function(u){var d=new o;da._pt=0,d.init(e,i?u+i:u,da,0,[e]),d.render(1,d),da._pt&&Hg(1,da)}:a.set(e,l);return o?c:function(u){return c(e,l,i?u+i:u,a,1)}},quickTo:function(e,t,i){var r,s=yn.to(e,li((r={},r[t]="+=0.1",r.paused=!0,r.stagger=0,r),i||{})),o=function(l,c,u){return s.resetTo(t,l,c,u)};return o.tween=s,o},isTweening:function(e){return Dt.getTweensOf(e,!0).length>0},defaults:function(e){return e&&e.ease&&(e.ease=uo(e.ease,lc.ease)),lS(lc,e||{})},config:function(e){return lS(Zn,e||{})},registerEffect:function(e){var t=e.name,i=e.effect,r=e.plugins,s=e.defaults,o=e.extendTimeline;(r||"").split(",").forEach(function(a){return a&&!Xn[a]&&!ai[a]&&cc(t+" effect requires "+a+" plugin.")}),ug[t]=function(a,l,c){return i(Ei(a),li(l||{},s),c)},o&&(vn.prototype[t]=function(a,l,c){return this.add(ug[t](a,ar(l)?l:(c=l)&&{},this),c)})},registerEase:function(e,t){tt[e]=uo(t)},parseEase:function(e,t){return arguments.length?uo(e,t):tt},getById:function(e){return Dt.getById(e)},exportRoot:function(e,t){e===void 0&&(e={});var i=new vn(e),r,s;for(i.smoothChildTiming=Yn(e.smoothChildTiming),Dt.remove(i),i._dp=0,i._time=i._tTime=Dt._time,r=Dt._first;r;)s=r._next,(t||!(!r._dur&&r instanceof Gt&&r.vars.onComplete===r._targets[0]))&&or(i,r,r._start-r._delay),r=s;return or(Dt,i,0),i},context:function(e,t){return e?new WS(e,t):At},matchMedia:function(e){return new wb(e)},matchMediaRefresh:function(){return ho.forEach(function(e){var t=e.conditions,i,r;for(r in t)t[r]&&(t[r]=!1,i=1);i&&e.revert()})||Tg()},addEventListener:function(e,t){var i=Ah[e]||(Ah[e]=[]);~i.indexOf(t)||i.push(t)},removeEventListener:function(e,t){var i=Ah[e],r=i&&i.indexOf(t);r>=0&&i.splice(r,1)},utils:{wrap:eb,wrapYoyo:tb,distribute:PS,random:LS,snap:IS,normalize:QT,getUnit:hn,clamp:$T,splitColor:OS,toArray:Ei,selector:Mg,mapRange:NS,pipe:KT,unitize:jT,interpolate:nb,shuffle:RS},install:vS,effects:ug,ticker:qn,updateRoot:vn.updateRoot,plugins:Xn,globalTimeline:Dt,core:{PropTween:Nn,globals:xS,Tween:Gt,Timeline:vn,Animation:fc,getCache:vs,_removeLinkedListItem:Uh,reverting:function(){return un},context:function(e){return e&&At&&(At.data.push(e),e._ctx=At),At},suppressOverwrites:function(e){return bg=e}}};Dn("to,from,fromTo,delayedCall,set,killTweensOf",function(n){return Lh[n]=Gt[n]});qn.add(vn.updateRoot);da=Lh.to({},{duration:0});Eb=function(e,t){for(var i=e._pt;i&&i.p!==t&&i.op!==t&&i.fp!==t;)i=i._next;return i},Tb=function(e,t){var i=e._targets,r,s,o;for(r in t)for(s=i.length;s--;)o=e._ptLookup[s][r],o&&(o=o.d)&&(o._pt&&(o=Eb(o,r)),o&&o.modifier&&o.modifier(t[r],e,i[s],r))},mg=function(e,t){return{name:e,headless:1,rawVars:1,init:function(r,s,o){o._onInit=function(a){var l,c;if(Jt(s)&&(l={},Dn(s,function(u){return l[u]=1}),s=l),t){l={};for(c in s)l[c]=t(s[c]);s=l}Tb(a,s)}}}},yn=Lh.registerPlugin({name:"attr",init:function(e,t,i,r,s){var o,a,l;this.tween=i;for(o in t)l=e.getAttribute(o)||"",a=this.add(e,"setAttribute",(l||0)+"",t[o],r,s,0,0,o),a.op=o,a.b=l,this._props.push(o)},render:function(e,t){for(var i=t._pt;i;)un?i.set(i.t,i.p,i.b,i):i.r(e,i.d),i=i._next}},{name:"endArray",headless:1,init:function(e,t){for(var i=t.length;i--;)this.add(e,i,e[i]||0,t[i],0,0,0,0,0,1)}},mg("roundProps",wg),mg("modifiers"),mg("snap",IS))||Lh;Gt.version=vn.version=yn.version="3.15.0";_S=1;Ag()&&_a();bb=tt.Power0,Ab=tt.Power1,Cb=tt.Power2,Rb=tt.Power3,Pb=tt.Power4,Ib=tt.Linear,Lb=tt.Quad,Db=tt.Cubic,Nb=tt.Quart,Ub=tt.Quint,Fb=tt.Strong,Ob=tt.Elastic,Bb=tt.Back,kb=tt.SteppedEase,zb=tt.Bounce,Vb=tt.Sine,Gb=tt.Expo,Hb=tt.Circ});var XS,Ss,ya,Kg,xo,Wb,qS,jg,Xb,Or,vo,Sa,xa,YS,Qg,qb,Yb,lr,Yg,Zb,$b,Jb,Kb,tM,nM,jb,Qb,eA,tA,nA,iA,Nt,$n,rA,iM,sA,rM,sM,Zg,ci,ZS,Ma,$g,$S,JS,oM,aM,ws,Ms,KS,oA,Es,Fr,aA,jS,lA,cA,kh,mc,lM,cM,QS,e0,Jg,gc,zh,qg,uA,go,pc,_o,uM,hA,fA,eM,dA,t0,hM=Zr(()=>{Xg();Xb=function(){return typeof window<"u"},Or={},vo=180/Math.PI,Sa=Math.PI/180,xa=Math.atan2,YS=1e8,Qg=/([A-Z])/g,qb=/(left|right|width|margin|padding|x)/i,Yb=/[\s,\(]\S/,lr={autoAlpha:"opacity,visibility",scale:"scaleX,scaleY",alpha:"opacity"},Yg=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},Zb=function(e,t){return t.set(t.t,t.p,e===1?t.e:Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},$b=function(e,t){return t.set(t.t,t.p,e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},Jb=function(e,t){return t.set(t.t,t.p,e===1?t.e:e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},Kb=function(e,t){var i=t.s+t.c*e;t.set(t.t,t.p,~~(i+(i<0?-.5:.5))+t.u,t)},tM=function(e,t){return t.set(t.t,t.p,e?t.e:t.b,t)},nM=function(e,t){return t.set(t.t,t.p,e!==1?t.b:t.e,t)},jb=function(e,t,i){return e.style[t]=i},Qb=function(e,t,i){return e.style.setProperty(t,i)},eA=function(e,t,i){return e._gsap[t]=i},tA=function(e,t,i){return e._gsap.scaleX=e._gsap.scaleY=i},nA=function(e,t,i,r,s){var o=e._gsap;o.scaleX=o.scaleY=i,o.renderTransform(s,o)},iA=function(e,t,i,r,s){var o=e._gsap;o[t]=i,o.renderTransform(s,o)},Nt="transform",$n=Nt+"Origin",rA=function n(e,t){var i=this,r=this.target,s=r.style,o=r._gsap;if(e in Or&&s){if(this.tfm=this.tfm||{},e!=="transform")e=lr[e]||e,~e.indexOf(",")?e.split(",").forEach(function(a){return i.tfm[a]=Fr(r,a)}):this.tfm[e]=o.x?o[e]:Fr(r,e),e===$n&&(this.tfm.zOrigin=o.zOrigin);else return lr.transform.split(",").forEach(function(a){return n.call(i,a,t)});if(this.props.indexOf(Nt)>=0)return;o.svg&&(this.svgo=r.getAttribute("data-svg-origin"),this.props.push($n,t,"")),e=Nt}(s||t)&&this.props.push(e,t,s[e])},iM=function(e){e.translate&&(e.removeProperty("translate"),e.removeProperty("scale"),e.removeProperty("rotate"))},sA=function(){var e=this.props,t=this.target,i=t.style,r=t._gsap,s,o;for(s=0;s<e.length;s+=3)e[s+1]?e[s+1]===2?t[e[s]](e[s+2]):t[e[s]]=e[s+2]:e[s+2]?i[e[s]]=e[s+2]:i.removeProperty(e[s].substr(0,2)==="--"?e[s]:e[s].replace(Qg,"-$1").toLowerCase());if(this.tfm){for(o in this.tfm)r[o]=this.tfm[o];r.svg&&(r.renderTransform(),t.setAttribute("data-svg-origin",this.svgo||"")),s=jg(),(!s||!s.isStart)&&!i[Nt]&&(iM(i),r.zOrigin&&i[$n]&&(i[$n]+=" "+r.zOrigin+"px",r.zOrigin=0,r.renderTransform()),r.uncache=1)}},rM=function(e,t){var i={target:e,props:[],revert:sA,save:rA};return e._gsap||yn.core.getCache(e),t&&e.style&&e.nodeType&&t.split(",").forEach(function(r){return i.save(r)}),i},Zg=function(e,t){var i=Ss.createElementNS?Ss.createElementNS((t||"http://www.w3.org/1999/xhtml").replace(/^https/,"http"),e):Ss.createElement(e);return i&&i.style?i:Ss.createElement(e)},ci=function n(e,t,i){var r=getComputedStyle(e);return r[t]||r.getPropertyValue(t.replace(Qg,"-$1").toLowerCase())||r.getPropertyValue(t)||!i&&n(e,Ma(t)||t,1)||""},ZS="O,Moz,ms,Ms,Webkit".split(","),Ma=function(e,t,i){var r=t||xo,s=r.style,o=5;if(e in s&&!i)return e;for(e=e.charAt(0).toUpperCase()+e.substr(1);o--&&!(ZS[o]+e in s););return o<0?null:(o===3?"ms":o>=0?ZS[o]:"")+e},$g=function(){Xb()&&window.document&&(XS=window,Ss=XS.document,ya=Ss.documentElement,xo=Zg("div")||{style:{}},Wb=Zg("div"),Nt=Ma(Nt),$n=Nt+"Origin",xo.style.cssText="border-width:0;line-height:0;position:absolute;padding:0",sM=!!Ma("perspective"),jg=yn.core.reverting,Kg=1)},$S=function(e){var t=e.ownerSVGElement,i=Zg("svg",t&&t.getAttribute("xmlns")||"http://www.w3.org/2000/svg"),r=e.cloneNode(!0),s;r.style.display="block",i.appendChild(r),ya.appendChild(i);try{s=r.getBBox()}catch{}return i.removeChild(r),ya.removeChild(i),s},JS=function(e,t){for(var i=t.length;i--;)if(e.hasAttribute(t[i]))return e.getAttribute(t[i])},oM=function(e){var t,i;try{t=e.getBBox()}catch{t=$S(e),i=1}return t&&(t.width||t.height)||i||(t=$S(e)),t&&!t.width&&!t.x&&!t.y?{x:+JS(e,["x","cx","x1"])||0,y:+JS(e,["y","cy","y1"])||0,width:0,height:0}:t},aM=function(e){return!!(e.getCTM&&(!e.parentNode||e.ownerSVGElement)&&oM(e))},ws=function(e,t){if(t){var i=e.style,r;t in Or&&t!==$n&&(t=Nt),i.removeProperty?(r=t.substr(0,2),(r==="ms"||t.substr(0,6)==="webkit")&&(t="-"+t),i.removeProperty(r==="--"?t:t.replace(Qg,"-$1").toLowerCase())):i.removeAttribute(t)}},Ms=function(e,t,i,r,s,o){var a=new Nn(e._pt,t,i,0,1,o?nM:tM);return e._pt=a,a.b=r,a.e=s,e._props.push(i),a},KS={deg:1,rad:1,turn:1},oA={grid:1,flex:1},Es=function n(e,t,i,r){var s=parseFloat(i)||0,o=(i+"").trim().substr((s+"").length)||"px",a=xo.style,l=qb.test(t),c=e.tagName.toLowerCase()==="svg",u=(c?"client":"offset")+(l?"Width":"Height"),d=100,h=r==="px",p=r==="%",g,_,m,f;if(r===o||!s||KS[r]||KS[o])return s;if(o!=="px"&&!h&&(s=n(e,t,i,"px")),f=e.getCTM&&aM(e),(p||o==="%")&&(Or[t]||~t.indexOf("adius")))return g=f?e.getBBox()[l?"width":"height"]:e[u],zt(p?s/g*d:s/100*g);if(a[l?"width":"height"]=d+(h?o:r),_=r!=="rem"&&~t.indexOf("adius")||r==="em"&&e.appendChild&&!c?e:e.parentNode,f&&(_=(e.ownerSVGElement||{}).parentNode),(!_||_===Ss||!_.appendChild)&&(_=Ss.body),m=_._gsap,m&&p&&m.width&&l&&m.time===qn.time&&!m.uncache)return zt(s/m.width*d);if(p&&(t==="height"||t==="width")){var v=e.style[t];e.style[t]=d+r,g=e[u],v?e.style[t]=v:ws(e,t)}else(p||o==="%")&&!oA[ci(_,"display")]&&(a.position=ci(e,"position")),_===e&&(a.position="static"),_.appendChild(xo),g=xo[u],_.removeChild(xo),a.position="absolute";return l&&p&&(m=vs(_),m.time=qn.time,m.width=_[u]),zt(h?g*s/d:g&&s?d/g*s:0)},Fr=function(e,t,i,r){var s;return Kg||$g(),t in lr&&t!=="transform"&&(t=lr[t],~t.indexOf(",")&&(t=t.split(",")[0])),Or[t]&&t!=="transform"?(s=gc(e,r),s=t!=="transformOrigin"?s[t]:s.svg?s.origin:zh(ci(e,$n))+" "+s.zOrigin+"px"):(s=e.style[t],(!s||s==="auto"||r||~(s+"").indexOf("calc("))&&(s=kh[t]&&kh[t](e,t,i)||ci(e,t)||Ng(e,t)||(t==="opacity"?1:0))),i&&!~(s+"").trim().indexOf(" ")?Es(e,t,s,i)+i:s},aA=function(e,t,i,r){if(!i||i==="none"){var s=Ma(t,e,1),o=s&&ci(e,s,1);o&&o!==i?(t=s,i=o):t==="borderColor"&&(i=ci(e,"borderTopColor"))}var a=new Nn(this._pt,e.style,t,0,1,Gg),l=0,c=0,u,d,h,p,g,_,m,f,v,M,y,w;if(a.b=i,a.e=r,i+="",r+="",r.substring(0,6)==="var(--"&&(r=ci(e,r.substring(4,r.indexOf(")")))),r==="auto"&&(_=e.style[t],e.style[t]=r,r=ci(e,t)||r,_?e.style[t]=_:ws(e,t)),u=[i,r],Fg(u),i=u[0],r=u[1],h=i.match(fo)||[],w=r.match(fo)||[],w.length){for(;d=fo.exec(r);)m=d[0],v=r.substring(l,d.index),g?g=(g+1)%5:(v.substr(-5)==="rgba("||v.substr(-5)==="hsla(")&&(g=1),m!==(_=h[c++]||"")&&(p=parseFloat(_)||0,y=_.substr((p+"").length),m.charAt(1)==="="&&(m=po(p,m)+y),f=parseFloat(m),M=m.substr((f+"").length),l=fo.lastIndex-M.length,M||(M=M||Zn.units[t]||y,l===r.length&&(r+=M,a.e+=M)),y!==M&&(p=Es(e,t,_,M)||0),a._pt={_next:a._pt,p:v||c===1?v:",",s:p,c:f-p,m:g&&g<4||t==="zIndex"?Math.round:0});a.c=l<r.length?r.substring(l,r.length):""}else a.r=t==="display"&&r==="none"?nM:tM;return Rg.test(r)&&(a.e=0),this._pt=a,a},jS={top:"0%",bottom:"100%",left:"0%",right:"100%",center:"50%"},lA=function(e){var t=e.split(" "),i=t[0],r=t[1]||"50%";return(i==="top"||i==="bottom"||r==="left"||r==="right")&&(e=i,i=r,r=e),t[0]=jS[i]||i,t[1]=jS[r]||r,t.join(" ")},cA=function(e,t){if(t.tween&&t.tween._time===t.tween._dur){var i=t.t,r=i.style,s=t.u,o=i._gsap,a,l,c;if(s==="all"||s===!0)r.cssText="",l=1;else for(s=s.split(","),c=s.length;--c>-1;)a=s[c],Or[a]&&(l=1,a=a==="transformOrigin"?$n:Nt),ws(i,a);l&&(ws(i,Nt),o&&(o.svg&&i.removeAttribute("transform"),r.scale=r.rotate=r.translate="none",gc(i,1),o.uncache=1,iM(r)))}},kh={clearProps:function(e,t,i,r,s){if(s.data!=="isFromStart"){var o=e._pt=new Nn(e._pt,t,i,0,0,cA);return o.u=r,o.pr=-10,o.tween=s,e._props.push(i),1}}},mc=[1,0,0,1,0,0],lM={},cM=function(e){return e==="matrix(1, 0, 0, 1, 0, 0)"||e==="none"||!e},QS=function(e){var t=ci(e,Nt);return cM(t)?mc:t.substr(7).match(Cg).map(zt)},e0=function(e,t){var i=e._gsap||vs(e),r=e.style,s=QS(e),o,a,l,c;return i.svg&&e.getAttribute("transform")?(l=e.transform.baseVal.consolidate().matrix,s=[l.a,l.b,l.c,l.d,l.e,l.f],s.join(",")==="1,0,0,1,0,0"?mc:s):(s===mc&&!e.offsetParent&&e!==ya&&!i.svg&&(l=r.display,r.display="block",o=e.parentNode,(!o||!e.offsetParent&&!e.getBoundingClientRect().width)&&(c=1,a=e.nextElementSibling,ya.appendChild(e)),s=QS(e),l?r.display=l:ws(e,"display"),c&&(a?o.insertBefore(e,a):o?o.appendChild(e):ya.removeChild(e))),t&&s.length>6?[s[0],s[1],s[4],s[5],s[12],s[13]]:s)},Jg=function(e,t,i,r,s,o){var a=e._gsap,l=s||e0(e,!0),c=a.xOrigin||0,u=a.yOrigin||0,d=a.xOffset||0,h=a.yOffset||0,p=l[0],g=l[1],_=l[2],m=l[3],f=l[4],v=l[5],M=t.split(" "),y=parseFloat(M[0])||0,w=parseFloat(M[1])||0,E,A,x,b;i?l!==mc&&(A=p*m-g*_)&&(x=y*(m/A)+w*(-_/A)+(_*v-m*f)/A,b=y*(-g/A)+w*(p/A)-(p*v-g*f)/A,y=x,w=b):(E=oM(e),y=E.x+(~M[0].indexOf("%")?y/100*E.width:y),w=E.y+(~(M[1]||M[0]).indexOf("%")?w/100*E.height:w)),r||r!==!1&&a.smooth?(f=y-c,v=w-u,a.xOffset=d+(f*p+v*_)-f,a.yOffset=h+(f*g+v*m)-v):a.xOffset=a.yOffset=0,a.xOrigin=y,a.yOrigin=w,a.smooth=!!r,a.origin=t,a.originIsAbsolute=!!i,e.style[$n]="0px 0px",o&&(Ms(o,a,"xOrigin",c,y),Ms(o,a,"yOrigin",u,w),Ms(o,a,"xOffset",d,a.xOffset),Ms(o,a,"yOffset",h,a.yOffset)),e.setAttribute("data-svg-origin",y+" "+w)},gc=function(e,t){var i=e._gsap||new Og(e);if("x"in i&&!t&&!i.uncache)return i;var r=e.style,s=i.scaleX<0,o="px",a="deg",l=getComputedStyle(e),c=ci(e,$n)||"0",u,d,h,p,g,_,m,f,v,M,y,w,E,A,x,b,P,L,D,B,I,O,Y,H,ne,Z,te,re,Te,fe,Ue,Oe;return u=d=h=_=m=f=v=M=y=0,p=g=1,i.svg=!!(e.getCTM&&aM(e)),l.translate&&((l.translate!=="none"||l.scale!=="none"||l.rotate!=="none")&&(r[Nt]=(l.translate!=="none"?"translate3d("+(l.translate+" 0 0").split(" ").slice(0,3).join(", ")+") ":"")+(l.rotate!=="none"?"rotate("+l.rotate+") ":"")+(l.scale!=="none"?"scale("+l.scale.split(" ").join(",")+") ":"")+(l[Nt]!=="none"?l[Nt]:"")),r.scale=r.rotate=r.translate="none"),A=e0(e,i.svg),i.svg&&(i.uncache?(ne=e.getBBox(),c=i.xOrigin-ne.x+"px "+(i.yOrigin-ne.y)+"px",H=""):H=!t&&e.getAttribute("data-svg-origin"),Jg(e,H||c,!!H||i.originIsAbsolute,i.smooth!==!1,A)),w=i.xOrigin||0,E=i.yOrigin||0,A!==mc&&(L=A[0],D=A[1],B=A[2],I=A[3],u=O=A[4],d=Y=A[5],A.length===6?(p=Math.sqrt(L*L+D*D),g=Math.sqrt(I*I+B*B),_=L||D?xa(D,L)*vo:0,v=B||I?xa(B,I)*vo+_:0,v&&(g*=Math.abs(Math.cos(v*Sa))),i.svg&&(u-=w-(w*L+E*B),d-=E-(w*D+E*I))):(Oe=A[6],fe=A[7],te=A[8],re=A[9],Te=A[10],Ue=A[11],u=A[12],d=A[13],h=A[14],x=xa(Oe,Te),m=x*vo,x&&(b=Math.cos(-x),P=Math.sin(-x),H=O*b+te*P,ne=Y*b+re*P,Z=Oe*b+Te*P,te=O*-P+te*b,re=Y*-P+re*b,Te=Oe*-P+Te*b,Ue=fe*-P+Ue*b,O=H,Y=ne,Oe=Z),x=xa(-B,Te),f=x*vo,x&&(b=Math.cos(-x),P=Math.sin(-x),H=L*b-te*P,ne=D*b-re*P,Z=B*b-Te*P,Ue=I*P+Ue*b,L=H,D=ne,B=Z),x=xa(D,L),_=x*vo,x&&(b=Math.cos(x),P=Math.sin(x),H=L*b+D*P,ne=O*b+Y*P,D=D*b-L*P,Y=Y*b-O*P,L=H,O=ne),m&&Math.abs(m)+Math.abs(_)>359.9&&(m=_=0,f=180-f),p=zt(Math.sqrt(L*L+D*D+B*B)),g=zt(Math.sqrt(Y*Y+Oe*Oe)),x=xa(O,Y),v=Math.abs(x)>2e-4?x*vo:0,y=Ue?1/(Ue<0?-Ue:Ue):0),i.svg&&(H=e.getAttribute("transform"),i.forceCSS=e.setAttribute("transform","")||!cM(ci(e,Nt)),H&&e.setAttribute("transform",H))),Math.abs(v)>90&&Math.abs(v)<270&&(s?(p*=-1,v+=_<=0?180:-180,_+=_<=0?180:-180):(g*=-1,v+=v<=0?180:-180)),t=t||i.uncache,i.x=u-((i.xPercent=u&&(!t&&i.xPercent||(Math.round(e.offsetWidth/2)===Math.round(-u)?-50:0)))?e.offsetWidth*i.xPercent/100:0)+o,i.y=d-((i.yPercent=d&&(!t&&i.yPercent||(Math.round(e.offsetHeight/2)===Math.round(-d)?-50:0)))?e.offsetHeight*i.yPercent/100:0)+o,i.z=h+o,i.scaleX=zt(p),i.scaleY=zt(g),i.rotation=zt(_)+a,i.rotationX=zt(m)+a,i.rotationY=zt(f)+a,i.skewX=v+a,i.skewY=M+a,i.transformPerspective=y+o,(i.zOrigin=parseFloat(c.split(" ")[2])||!t&&i.zOrigin||0)&&(r[$n]=zh(c)),i.xOffset=i.yOffset=0,i.force3D=Zn.force3D,i.renderTransform=i.svg?hA:sM?uM:uA,i.uncache=0,i},zh=function(e){return(e=e.split(" "))[0]+" "+e[1]},qg=function(e,t,i){var r=hn(t);return zt(parseFloat(t)+parseFloat(Es(e,"x",i+"px",r)))+r},uA=function(e,t){t.z="0px",t.rotationY=t.rotationX="0deg",t.force3D=0,uM(e,t)},go="0deg",pc="0px",_o=") ",uM=function(e,t){var i=t||this,r=i.xPercent,s=i.yPercent,o=i.x,a=i.y,l=i.z,c=i.rotation,u=i.rotationY,d=i.rotationX,h=i.skewX,p=i.skewY,g=i.scaleX,_=i.scaleY,m=i.transformPerspective,f=i.force3D,v=i.target,M=i.zOrigin,y="",w=f==="auto"&&e&&e!==1||f===!0;if(M&&(d!==go||u!==go)){var E=parseFloat(u)*Sa,A=Math.sin(E),x=Math.cos(E),b;E=parseFloat(d)*Sa,b=Math.cos(E),o=qg(v,o,A*b*-M),a=qg(v,a,-Math.sin(E)*-M),l=qg(v,l,x*b*-M+M)}m!==pc&&(y+="perspective("+m+_o),(r||s)&&(y+="translate("+r+"%, "+s+"%) "),(w||o!==pc||a!==pc||l!==pc)&&(y+=l!==pc||w?"translate3d("+o+", "+a+", "+l+") ":"translate("+o+", "+a+_o),c!==go&&(y+="rotate("+c+_o),u!==go&&(y+="rotateY("+u+_o),d!==go&&(y+="rotateX("+d+_o),(h!==go||p!==go)&&(y+="skew("+h+", "+p+_o),(g!==1||_!==1)&&(y+="scale("+g+", "+_+_o),v.style[Nt]=y||"translate(0, 0)"},hA=function(e,t){var i=t||this,r=i.xPercent,s=i.yPercent,o=i.x,a=i.y,l=i.rotation,c=i.skewX,u=i.skewY,d=i.scaleX,h=i.scaleY,p=i.target,g=i.xOrigin,_=i.yOrigin,m=i.xOffset,f=i.yOffset,v=i.forceCSS,M=parseFloat(o),y=parseFloat(a),w,E,A,x,b;l=parseFloat(l),c=parseFloat(c),u=parseFloat(u),u&&(u=parseFloat(u),c+=u,l+=u),l||c?(l*=Sa,c*=Sa,w=Math.cos(l)*d,E=Math.sin(l)*d,A=Math.sin(l-c)*-h,x=Math.cos(l-c)*h,c&&(u*=Sa,b=Math.tan(c-u),b=Math.sqrt(1+b*b),A*=b,x*=b,u&&(b=Math.tan(u),b=Math.sqrt(1+b*b),w*=b,E*=b)),w=zt(w),E=zt(E),A=zt(A),x=zt(x)):(w=d,x=h,E=A=0),(M&&!~(o+"").indexOf("px")||y&&!~(a+"").indexOf("px"))&&(M=Es(p,"x",o,"px"),y=Es(p,"y",a,"px")),(g||_||m||f)&&(M=zt(M+g-(g*w+_*A)+m),y=zt(y+_-(g*E+_*x)+f)),(r||s)&&(b=p.getBBox(),M=zt(M+r/100*b.width),y=zt(y+s/100*b.height)),b="matrix("+w+","+E+","+A+","+x+","+M+","+y+")",p.setAttribute("transform",b),v&&(p.style[Nt]=b)},fA=function(e,t,i,r,s){var o=360,a=Jt(s),l=parseFloat(s)*(a&&~s.indexOf("rad")?vo:1),c=l-r,u=r+c+"deg",d,h;return a&&(d=s.split("_")[1],d==="short"&&(c%=o,c!==c%(o/2)&&(c+=c<0?o:-o)),d==="cw"&&c<0?c=(c+o*YS)%o-~~(c/o)*o:d==="ccw"&&c>0&&(c=(c-o*YS)%o-~~(c/o)*o)),e._pt=h=new Nn(e._pt,t,i,r,c,Zb),h.e=u,h.u="deg",e._props.push(i),h},eM=function(e,t){for(var i in t)e[i]=t[i];return e},dA=function(e,t,i){var r=eM({},i._gsap),s="perspective,force3D,transformOrigin,svgOrigin",o=i.style,a,l,c,u,d,h,p,g;r.svg?(c=i.getAttribute("transform"),i.setAttribute("transform",""),o[Nt]=t,a=gc(i,1),ws(i,Nt),i.setAttribute("transform",c)):(c=getComputedStyle(i)[Nt],o[Nt]=t,a=gc(i,1),o[Nt]=c);for(l in Or)c=r[l],u=a[l],c!==u&&s.indexOf(l)<0&&(p=hn(c),g=hn(u),d=p!==g?Es(i,l,c,g):parseFloat(c),h=parseFloat(u),e._pt=new Nn(e._pt,a,l,d,h-d,Yg),e._pt.u=g||0,e._props.push(l));eM(a,r)};Dn("padding,margin,Width,Radius",function(n,e){var t="Top",i="Right",r="Bottom",s="Left",o=(e<3?[t,i,r,s]:[t+s,t+i,r+i,r+s]).map(function(a){return e<2?n+a:"border"+a+n});kh[e>1?"border"+n:n]=function(a,l,c,u,d){var h,p;if(arguments.length<4)return h=o.map(function(g){return Fr(a,g,c)}),p=h.join(" "),p.split(h[0]).length===5?h[0]:p;h=(u+"").split(" "),p={},o.forEach(function(g,_){return p[g]=h[_]=h[_]||h[(_-1)/2|0]}),a.init(l,p,d)}});t0={name:"css",register:$g,targetTest:function(e){return e.style&&e.nodeType},init:function(e,t,i,r,s){var o=this._props,a=e.style,l=i.vars.startAt,c,u,d,h,p,g,_,m,f,v,M,y,w,E,A,x,b;Kg||$g(),this.styles=this.styles||rM(e),x=this.styles.props,this.tween=i;for(_ in t)if(_!=="autoRound"&&(u=t[_],!(Xn[_]&&kg(_,t,i,r,e,s)))){if(p=typeof u,g=kh[_],p==="function"&&(u=u.call(i,r,e,s),p=typeof u),p==="string"&&~u.indexOf("random(")&&(u=va(u)),g)g(this,e,_,u,i)&&(A=1);else if(_.substr(0,2)==="--")c=(getComputedStyle(e).getPropertyValue(_)+"").trim(),u+="",Nr.lastIndex=0,Nr.test(c)||(m=hn(c),f=hn(u),f?m!==f&&(c=Es(e,_,c,f)+f):m&&(u+=m)),this.add(a,"setProperty",c,u,r,s,0,0,_),o.push(_),x.push(_,0,a[_]);else if(p!=="undefined"){if(l&&_ in l?(c=typeof l[_]=="function"?l[_].call(i,r,e,s):l[_],Jt(c)&&~c.indexOf("random(")&&(c=va(c)),hn(c+"")||c==="auto"||(c+=Zn.units[_]||hn(Fr(e,_))||""),(c+"").charAt(1)==="="&&(c=Fr(e,_))):c=Fr(e,_),h=parseFloat(c),v=p==="string"&&u.charAt(1)==="="&&u.substr(0,2),v&&(u=u.substr(2)),d=parseFloat(u),_ in lr&&(_==="autoAlpha"&&(h===1&&Fr(e,"visibility")==="hidden"&&d&&(h=0),x.push("visibility",0,a.visibility),Ms(this,a,"visibility",h?"inherit":"hidden",d?"inherit":"hidden",!d)),_!=="scale"&&_!=="transform"&&(_=lr[_],~_.indexOf(",")&&(_=_.split(",")[0]))),M=_ in Or,M){if(this.styles.save(_),b=u,p==="string"&&u.substring(0,6)==="var(--"){if(u=ci(e,u.substring(4,u.indexOf(")"))),u.substring(0,5)==="calc("){var P=e.style.perspective;e.style.perspective=u,u=ci(e,"perspective"),P?e.style.perspective=P:ws(e,"perspective")}d=parseFloat(u)}if(y||(w=e._gsap,w.renderTransform&&!t.parseTransform||gc(e,t.parseTransform),E=t.smoothOrigin!==!1&&w.smooth,y=this._pt=new Nn(this._pt,a,Nt,0,1,w.renderTransform,w,0,-1),y.dep=1),_==="scale")this._pt=new Nn(this._pt,w,"scaleY",w.scaleY,(v?po(w.scaleY,v+d):d)-w.scaleY||0,Yg),this._pt.u=0,o.push("scaleY",_),_+="X";else if(_==="transformOrigin"){x.push($n,0,a[$n]),u=lA(u),w.svg?Jg(e,u,0,E,0,this):(f=parseFloat(u.split(" ")[2])||0,f!==w.zOrigin&&Ms(this,w,"zOrigin",w.zOrigin,f),Ms(this,a,_,zh(c),zh(u)));continue}else if(_==="svgOrigin"){Jg(e,u,1,E,0,this);continue}else if(_ in lM){fA(this,w,_,h,v?po(h,v+u):u);continue}else if(_==="smoothOrigin"){Ms(this,w,"smooth",w.smooth,u);continue}else if(_==="force3D"){w[_]=u;continue}else if(_==="transform"){dA(this,u,e);continue}}else _ in a||(_=Ma(_)||_);if(M||(d||d===0)&&(h||h===0)&&!Yb.test(u)&&_ in a)m=(c+"").substr((h+"").length),d||(d=0),f=hn(u)||(_ in Zn.units?Zn.units[_]:m),m!==f&&(h=Es(e,_,c,f)),this._pt=new Nn(this._pt,M?w:a,_,h,(v?po(h,v+d):d)-h,!M&&(f==="px"||_==="zIndex")&&t.autoRound!==!1?Kb:Yg),this._pt.u=f||0,M&&b!==u?(this._pt.b=c,this._pt.e=b,this._pt.r=Jb):m!==f&&f!=="%"&&(this._pt.b=c,this._pt.r=$b);else if(_ in a)aA.call(this,e,_,c,v?v+u:u);else if(_ in e)this.add(e,_,c||e[_],v?v+u:u,r,s);else if(_!=="parseTransform"){Nh(_,u);continue}M||(_ in a?x.push(_,0,a[_]):typeof e[_]=="function"?x.push(_,2,e[_]()):x.push(_,1,c||e[_])),o.push(_)}}A&&Wg(this)},render:function(e,t){if(t.tween._time||!jg())for(var i=t._pt;i;)i.r(e,i.d),i=i._next;else t.styles.revert()},get:Fr,aliases:lr,getSetter:function(e,t,i){var r=lr[t];return r&&r.indexOf(",")<0&&(t=r),t in Or&&t!==$n&&(e._gsap.x||Fr(e,"x"))?i&&qS===i?t==="scale"?tA:eA:(qS=i||{})&&(t==="scale"?nA:iA):e.style&&!Dh(e.style[t])?jb:~t.indexOf("-")?Qb:Bh(e,t)},core:{_removeProperty:ws,_getMatrix:e0}};yn.utils.checkPrefix=Ma;yn.core.getStyleSaver=rM;(function(n,e,t,i){var r=Dn(n+","+e+","+t,function(s){Or[s]=1});Dn(e,function(s){Zn.units[s]="deg",lM[s]=1}),lr[r[13]]=n+","+e,Dn(i,function(s){var o=s.split(":");lr[o[1]]=r[o[0]]})})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent","rotation,rotationX,rotationY,skewX,skewY","transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective","0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");Dn("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective",function(n){Zn.units[n]="px"});yn.registerPlugin(t0)});var tn,_3,fM=Zr(()=>{Xg();hM();tn=yn.registerPlugin(t0)||yn,_3=tn.core.Tween});function pA(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function mA(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function ka(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function d1(){let n=ka("canvas");return n.style.display="block",n}function e_(...n){let e="THREE."+n.shift();za?za("log",e,...n):console.log(e,...n)}function p1(n){let e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function ke(...n){n=p1(n);let e="THREE."+n.shift();if(za)za("warn",e,...n);else{let t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function Ve(...n){n=p1(n);let e="THREE."+n.shift();if(za)za("error",e,...n);else{let t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function To(...n){let e=n.join(" ");e in dM||(dM[e]=!0,ke(...n))}function m1(n,e,t){return new Promise(function(i,r){function s(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:r();break;case n.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:i()}}setTimeout(s,t)})}function qc(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Sn[n&255]+Sn[n>>8&255]+Sn[n>>16&255]+Sn[n>>24&255]+"-"+Sn[e&255]+Sn[e>>8&255]+"-"+Sn[e>>16&15|64]+Sn[e>>24&255]+"-"+Sn[t&63|128]+Sn[t>>8&255]+"-"+Sn[t>>16&255]+Sn[t>>24&255]+Sn[i&255]+Sn[i>>8&255]+Sn[i>>16&255]+Sn[i>>24&255]).toLowerCase()}function nt(n,e,t){return Math.max(e,Math.min(t,n))}function gA(n,e){return(n%e+e)%e}function i0(n,e,t){return(1-t)*n+t*e}function _c(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:case Uint8ClampedArray:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Jn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function _A(){let n={enabled:!0,workingColorSpace:wc,spaces:{},convert:function(r,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===ut&&(r.r=Hr(r.r),r.g=Hr(r.g),r.b=Hr(r.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ut&&(r.r=Oa(r.r),r.g=Oa(r.g),r.b=Oa(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Wr?Ec:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,o){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return To("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return To("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(r,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[wc]:{primaries:e,whitePoint:i,transfer:Ec,toXYZ:mM,fromXYZ:gM,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:wn},outputColorSpaceConfig:{drawingBufferColorSpace:wn}},[wn]:{primaries:e,whitePoint:i,transfer:ut,toXYZ:mM,fromXYZ:gM,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:wn}}}),n}function Hr(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Oa(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}function o0(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Sf.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(ke("Texture: Unable to serialize Texture."),{})}function c0(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}function _0(n,e,t,i,r){for(let s=0,o=n.length-3;s<=o;s+=3){So.fromArray(n,s);let a=r.x*Math.abs(So.x)+r.y*Math.abs(So.y)+r.z*Math.abs(So.z),l=e.dot(So),c=t.dot(So),u=i.dot(So);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}function DA(n,e,t,i,r,s,o,a){let l;if(e.side===On?l=i.intersectTriangle(o,s,r,!0,a):l=i.intersectTriangle(r,s,o,e.side===ks,a),l===null)return null;tf.copy(a),tf.applyMatrix4(n.matrixWorld);let c=t.ray.origin.distanceTo(tf);return c<t.near||c>t.far?null:{distance:c,point:tf.clone(),object:n}}function nf(n,e,t,i,r,s,o,a,l,c){n.getVertexPosition(a,Kh),n.getVertexPosition(l,jh),n.getVertexPosition(c,Qh);let u=DA(n,e,t,i,Kh,jh,Qh,AM);if(u){let d=new q;Ps.getBarycoord(AM,Kh,jh,Qh,d),r&&(u.uv=Ps.getInterpolatedAttribute(r,a,l,c,d,new it)),s&&(u.uv1=Ps.getInterpolatedAttribute(s,a,l,c,d,new it)),o&&(u.normal=Ps.getInterpolatedAttribute(o,a,l,c,d,new q),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let h={a,b:l,c,normal:new q,materialIndex:0};Ps.getNormal(Kh,jh,Qh,h.normal),u.face=h,u.barycoord=d}return u}function Po(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let r=n[t][i];if(CM(r))r.isRenderTargetTexture?(ke("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone();else if(Array.isArray(r))if(CM(r[0])){let s=[];for(let o=0,a=r.length;o<a;o++)s[o]=r[o].clone();e[t][i]=s}else e[t][i]=r.slice();else e[t][i]=r}}return e}function bn(n){let e={};for(let t=0;t<n.length;t++){let i=Po(n[t]);for(let r in i)e[r]=i[r]}return e}function CM(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function UA(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function t_(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Qe.workingColorSpace}function Da(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function w0(n){return n!==void 0&&n.inTangents!==void 0&&n.outTangents!==void 0}function x1(n,e,t,i,r){let s=1-n;return s*s*s*e+3*s*s*n*t+3*s*n*n*i+n*n*n*r}function BA(n,e,t,i,r){let s=1-n;return 3*s*s*(t-e)+6*s*n*(i-t)+3*n*n*(r-i)}function kA(n,e,t,i,r){let s=(n-e)/(r-e);for(let o=0;o<8;o++){let a=x1(s,e,t,i,r)-n;if(Math.abs(a)<1e-10)break;let l=BA(s,e,t,i,r);if(Math.abs(l)<1e-10)break;s=Math.max(0,Math.min(1,s-a/l))}return s}function RM(n,e){for(let t=0,i=n.length;t!==i;t+=2)n[t]*=e}function PM(n){try{let e=n.slice(n.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}function r_(n,e,t,i){let r=ZA(i);switch(t){case $0:return n*e;case K0:return n*e/r.components*r.byteLength;case Yf:return n*e/r.components*r.byteLength;case Gs:return n*e*2/r.components*r.byteLength;case Zf:return n*e*2/r.components*r.byteLength;case J0:return n*e*3/r.components*r.byteLength;case jn:return n*e*4/r.components*r.byteLength;case $f:return n*e*4/r.components*r.byteLength;case zc:case Vc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Gc:case Hc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Kf:case Qf:return Math.max(n,16)*Math.max(e,8)/4;case Jf:case jf:return Math.max(n,8)*Math.max(e,8)/2;case ed:case td:case id:case rd:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case nd:case Wc:case sd:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case od:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case ad:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case ld:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case cd:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case ud:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case hd:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case fd:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case dd:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case pd:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case md:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case gd:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case _d:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case vd:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case xd:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case yd:case Sd:case Md:return Math.ceil(n/4)*Math.ceil(e/4)*16;case wd:case Ed:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Xc:case Td:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function ZA(n){switch(n){case di:case X0:return{byteLength:1,components:1};case Ja:case q0:case $i:return{byteLength:2,components:1};case Xf:case qf:return{byteLength:2,components:4};case Yi:case Wf:case Zi:return{byteLength:4,components:1};case Y0:case Z0:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}var DM,P0,NM,Oc,UM,Za,ks,On,mr,gr,$a,I0,L0,D0,FM,Co,OM,BM,kM,zM,VM,GM,HM,WM,N0,U0,XM,qM,YM,ZM,$M,JM,KM,jM,QM,uf,hf,ff,Ba,df,pf,mf,gf,F0,e1,t1,qi,O0,B0,k0,z0,V0,G0,H0,W0,zs,Ro,Vf,Gf,Bc,_f,ur,vf,rn,n1,kc,Et,Hf,_r,di,X0,q0,Ja,Wf,Yi,Zi,$i,Xf,qf,Ka,Y0,Z0,$0,J0,jn,hr,Vs,K0,Yf,Gs,Zf,$f,zc,Vc,Gc,Hc,Jf,Kf,jf,Qf,ed,td,nd,id,rd,Wc,sd,od,ad,ld,cd,ud,hd,fd,dd,pd,md,gd,_d,vd,xd,yd,Sd,Md,wd,Ed,Xc,Td,Mc,xf,af,E0,T0,b0,A0,i1,j0,r1,Wr,wn,wc,Ec,ut,lf,s1,o1,a1,l1,bd,c1,u1,Ad,h1,f1,Q0,Xi,Tc,dM,za,g1,fr,Sn,n0,yf,it,dr,q,r0,pM,Ge,s0,mM,gM,Qe,wa,Sf,vA,Va,xA,a0,En,Ut,Mf,Tn,bc,wf,Ht,Ea,Vi,yA,SA,Ts,Vh,ui,_M,vM,Is,Ac,MA,xM,Ta,Br,Gh,vc,wA,EA,yM,SM,MM,wM,TA,ba,l0,Ci,Eo,bA,Ga,_1,bs,Hh,rt,Mn,Ha,Gi,kr,u0,zr,Aa,Ca,EM,h0,f0,d0,p0,m0,g0,Ps,Ls,Vr,Hi,Wh,Ra,Pa,Ia,As,Cs,yo,xc,Xh,qh,So,qt,Yh,AA,bi,Cc,Rc,Ai,CA,yc,v0,Wa,RA,Ti,x0,La,hi,Sc,nn,pr,y0,PA,IA,Wi,LA,bo,Gr,S0,Zh,$h,Ef,Ao,TM,Mo,Jh,bM,Kh,jh,Qh,M0,ef,AM,tf,Un,Xa,wo,NA,rf,Pc,Ic,Lc,Ds,Tf,Dc,qa,Ns,v1,FA,OA,Fn,bf,Af,Cf,Us,Rf,Pf,If,Lf,fi,Fs,Df,Nf,Uf,Nc,Os,Ff,cf,Of,y1,Ya,Na,Bf,Uc,sf,of,cr,Fc,Rs,IM,LM,Kn,Bs,Ua,Fa,kf,zf,n_,zA,i_,VA,GA,HA,WA,XA,qA,YA,C0,wt,x3,R0,s_=Zr(()=>{DM=0,P0=1,NM=2,Oc=1,UM=2,Za=3,ks=0,On=1,mr=2,gr=0,$a=1,I0=2,L0=3,D0=4,FM=5,Co=100,OM=101,BM=102,kM=103,zM=104,VM=200,GM=201,HM=202,WM=203,N0=204,U0=205,XM=206,qM=207,YM=208,ZM=209,$M=210,JM=211,KM=212,jM=213,QM=214,uf=0,hf=1,ff=2,Ba=3,df=4,pf=5,mf=6,gf=7,F0=0,e1=1,t1=2,qi=0,O0=1,B0=2,k0=3,z0=4,V0=5,G0=6,H0=7,W0=300,zs=301,Ro=302,Vf=303,Gf=304,Bc=306,_f=1e3,ur=1001,vf=1002,rn=1003,n1=1004,kc=1005,Et=1006,Hf=1007,_r=1008,di=1009,X0=1010,q0=1011,Ja=1012,Wf=1013,Yi=1014,Zi=1015,$i=1016,Xf=1017,qf=1018,Ka=1020,Y0=35902,Z0=35899,$0=1021,J0=1022,jn=1023,hr=1026,Vs=1027,K0=1028,Yf=1029,Gs=1030,Zf=1031,$f=1033,zc=33776,Vc=33777,Gc=33778,Hc=33779,Jf=35840,Kf=35841,jf=35842,Qf=35843,ed=36196,td=37492,nd=37496,id=37488,rd=37489,Wc=37490,sd=37491,od=37808,ad=37809,ld=37810,cd=37811,ud=37812,hd=37813,fd=37814,dd=37815,pd=37816,md=37817,gd=37818,_d=37819,vd=37820,xd=37821,yd=36492,Sd=36494,Md=36495,wd=36283,Ed=36284,Xc=36285,Td=36286,Mc=2300,xf=2301,af=2302,E0=2303,T0=2400,b0=2401,A0=2402,i1=3200,j0=0,r1=1,Wr="",wn="srgb",wc="srgb-linear",Ec="linear",ut="srgb",lf=7680,s1=519,o1=512,a1=513,l1=514,bd=515,c1=516,u1=517,Ad=518,h1=519,f1=35044,Q0="300 es",Xi=2e3,Tc=2001;dM={},za=null;g1={[uf]:hf,[ff]:mf,[df]:gf,[Ba]:pf,[hf]:uf,[mf]:ff,[gf]:df,[pf]:Ba},fr=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let r=i[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let r=i.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},Sn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],n0=Math.PI/180,yf=180/Math.PI;it=class n{static{n.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(nt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(nt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*i-o*r+e.x,this.y=s*r+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},dr=class{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,s,o,a){let l=i[r+0],c=i[r+1],u=i[r+2],d=i[r+3],h=s[o+0],p=s[o+1],g=s[o+2],_=s[o+3];if(d!==_||l!==h||c!==p||u!==g){let m=l*h+c*p+u*g+d*_;m<0&&(h=-h,p=-p,g=-g,_=-_,m=-m);let f=1-a;if(m<.9995){let v=Math.acos(m),M=Math.sin(v);f=Math.sin(f*v)/M,a=Math.sin(a*v)/M,l=l*f+h*a,c=c*f+p*a,u=u*f+g*a,d=d*f+_*a}else{l=l*f+h*a,c=c*f+p*a,u=u*f+g*a,d=d*f+_*a;let v=1/Math.sqrt(l*l+c*c+u*u+d*d);l*=v,c*=v,u*=v,d*=v}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,i,r,s,o){let a=i[r],l=i[r+1],c=i[r+2],u=i[r+3],d=s[o],h=s[o+1],p=s[o+2],g=s[o+3];return e[t]=a*g+u*d+l*p-c*h,e[t+1]=l*g+u*h+c*d-a*p,e[t+2]=c*g+u*p+a*h-l*d,e[t+3]=u*g-a*d-l*h-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),u=a(r/2),d=a(s/2),h=l(i/2),p=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=h*u*d+c*p*g,this._y=c*p*d-h*u*g,this._z=c*u*g+h*p*d,this._w=c*u*d-h*p*g;break;case"YXZ":this._x=h*u*d+c*p*g,this._y=c*p*d-h*u*g,this._z=c*u*g-h*p*d,this._w=c*u*d+h*p*g;break;case"ZXY":this._x=h*u*d-c*p*g,this._y=c*p*d+h*u*g,this._z=c*u*g+h*p*d,this._w=c*u*d-h*p*g;break;case"ZYX":this._x=h*u*d-c*p*g,this._y=c*p*d+h*u*g,this._z=c*u*g-h*p*d,this._w=c*u*d+h*p*g;break;case"YZX":this._x=h*u*d+c*p*g,this._y=c*p*d+h*u*g,this._z=c*u*g-h*p*d,this._w=c*u*d-h*p*g;break;case"XZY":this._x=h*u*d-c*p*g,this._y=c*p*d-h*u*g,this._z=c*u*g+h*p*d,this._w=c*u*d+h*p*g;break;default:ke("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],d=t[10],h=i+a+d;if(h>0){let p=.5/Math.sqrt(h+1);this._w=.25/p,this._x=(u-l)*p,this._y=(s-c)*p,this._z=(o-r)*p}else if(i>a&&i>d){let p=2*Math.sqrt(1+i-a-d);this._w=(u-l)/p,this._x=.25*p,this._y=(r+o)/p,this._z=(s+c)/p}else if(a>d){let p=2*Math.sqrt(1+a-i-d);this._w=(s-c)/p,this._x=(r+o)/p,this._y=.25*p,this._z=(l+u)/p}else{let p=2*Math.sqrt(1+d-i-a);this._w=(o-r)/p,this._x=(s+c)/p,this._y=(l+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(nt(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=i*u+o*a+r*c-s*l,this._y=r*u+o*l+s*a-i*c,this._z=s*u+o*c+i*l-r*a,this._w=o*u-i*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){let i=e._x,r=e._y,s=e._z,o=e._w,a=this.dot(e);a<0&&(i=-i,r=-r,s=-s,o=-o,a=-a);let l=1-t;if(a<.9995){let c=Math.acos(a),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+i*t,this._y=this._y*l+r*t,this._z=this._z*l+s*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+i*t,this._y=this._y*l+r*t,this._z=this._z*l+s*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},q=class n{static{n.prototype.isVector3=!0}constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(pM.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(pM.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*r,this.y=s[1]*t+s[4]*i+s[7]*r,this.z=s[2]*t+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*i+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*i+s[10]*r+s[14])*o,this}applyQuaternion(e){let t=this.x,i=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*i),u=2*(a*t-s*r),d=2*(s*i-o*t);return this.x=t+l*c+o*d-a*u,this.y=i+l*u+a*c-s*d,this.z=r+l*d+s*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r,this.y=s[1]*t+s[5]*i+s[9]*r,this.z=s[2]*t+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(nt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-i*l,this.z=i*a-r*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return r0.copy(this).projectOnVector(e),this.sub(r0)}reflect(e){return this.sub(r0.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(nt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},r0=new q,pM=new dr,Ge=class n{static{n.prototype.isMatrix3=!0}constructor(e,t,i,r,s,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c)}set(e,t,i,r,s,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=s,u[5]=l,u[6]=i,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],u=i[4],d=i[7],h=i[2],p=i[5],g=i[8],_=r[0],m=r[3],f=r[6],v=r[1],M=r[4],y=r[7],w=r[2],E=r[5],A=r[8];return s[0]=o*_+a*v+l*w,s[3]=o*m+a*M+l*E,s[6]=o*f+a*y+l*A,s[1]=c*_+u*v+d*w,s[4]=c*m+u*M+d*E,s[7]=c*f+u*y+d*A,s[2]=h*_+p*v+g*w,s[5]=h*m+p*M+g*E,s[8]=h*f+p*y+g*A,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-i*s*u+i*a*l+r*s*c-r*o*l}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],d=u*o-a*c,h=a*l-u*s,p=c*s-o*l,g=t*d+i*h+r*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return e[0]=d*_,e[1]=(r*c-u*i)*_,e[2]=(a*i-r*o)*_,e[3]=h*_,e[4]=(u*t-r*l)*_,e[5]=(r*s-a*t)*_,e[6]=p*_,e[7]=(i*l-c*t)*_,e[8]=(o*t-i*s)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,s,o,a){let l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return To("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(s0.makeScale(e,t)),this}rotate(e){return To("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(s0.makeRotation(-e)),this}translate(e,t){return To("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(s0.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},s0=new Ge,mM=new Ge().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),gM=new Ge().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Qe=_A();Sf=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{wa===void 0&&(wa=ka("canvas")),wa.width=e.width,wa.height=e.height;let r=wa.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),i=wa}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=ka("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=Hr(s[o]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Hr(t[i]/255)*255):t[i]=Hr(t[i]);return{data:t,width:e.width,height:e.height}}else return ke("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},vA=0,Va=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:vA++}),this.uuid=qc(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(o0(r[o].image)):s.push(o0(r[o]))}else s=o0(r);i.url=s}return t||(e.images[this.uuid]=i),i}};xA=0,a0=new q,En=class n extends fr{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=ur,r=ur,s=Et,o=_r,a=jn,l=di,c=n.DEFAULT_ANISOTROPY,u=Wr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:xA++}),this.uuid=qc(),this.name="",this.source=new Va(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new it(0,0),this.repeat=new it(1,1),this.center=new it(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ge,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(a0).x}get height(){return this.source.getSize(a0).y}get depth(){return this.source.getSize(a0).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){ke(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){ke(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&i&&r.isVector2&&i.isVector2||r&&i&&r.isVector3&&i.isVector3||r&&i&&r.isMatrix3&&i.isMatrix3?r.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==W0)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case _f:e.x=e.x-Math.floor(e.x);break;case ur:e.x=e.x<0?0:1;break;case vf:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case _f:e.y=e.y-Math.floor(e.y);break;case ur:e.y=e.y<0?0:1;break;case vf:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};En.DEFAULT_IMAGE=null;En.DEFAULT_MAPPING=W0;En.DEFAULT_ANISOTROPY=1;Ut=class n{static{n.prototype.isVector4=!0}constructor(e=0,t=0,i=0,r=1){this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*i+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*i+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*i+o[11]*r+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,s,l=e.elements,c=l[0],u=l[4],d=l[8],h=l[1],p=l[5],g=l[9],_=l[2],m=l[6],f=l[10];if(Math.abs(u-h)<.01&&Math.abs(d-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(d+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let M=(c+1)/2,y=(p+1)/2,w=(f+1)/2,E=(u+h)/4,A=(d+_)/4,x=(g+m)/4;return M>y&&M>w?M<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(M),r=E/i,s=A/i):y>w?y<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(y),i=E/r,s=x/r):w<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(w),i=A/s,r=x/s),this.set(i,r,s,t),this}let v=Math.sqrt((m-g)*(m-g)+(d-_)*(d-_)+(h-u)*(h-u));return Math.abs(v)<.001&&(v=1),this.x=(m-g)/v,this.y=(d-_)/v,this.z=(h-u)/v,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this.w=nt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this.w=nt(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(nt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Mf=class extends fr{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Et,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new Ut(0,0,e,t),this.scissorTest=!1,this.viewport=new Ut(0,0,e,t),this.textures=[];let r={width:e,height:t,depth:i.depth},s=new En(r),o=i.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Et,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let r=Object.assign({},e.textures[t].image);this.textures[t].source=new Va(r)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Tn=class extends Mf{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},bc=class extends En{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=rn,this.minFilter=rn,this.wrapR=ur,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},wf=class extends En{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=rn,this.minFilter=rn,this.wrapR=ur,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},Ht=class n{static{n.prototype.isMatrix4=!0}constructor(e,t,i,r,s,o,a,l,c,u,d,h,p,g,_,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c,u,d,h,p,g,_,m)}set(e,t,i,r,s,o,a,l,c,u,d,h,p,g,_,m){let f=this.elements;return f[0]=e,f[4]=t,f[8]=i,f[12]=r,f[1]=s,f[5]=o,f[9]=a,f[13]=l,f[2]=c,f[6]=u,f[10]=d,f[14]=h,f[3]=p,f[7]=g,f[11]=_,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,i=e.elements,r=1/Ea.setFromMatrixColumn(e,0).length(),s=1/Ea.setFromMatrixColumn(e,1).length(),o=1/Ea.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,r=e.y,s=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),d=Math.sin(s);if(e.order==="XYZ"){let h=o*u,p=o*d,g=a*u,_=a*d;t[0]=l*u,t[4]=-l*d,t[8]=c,t[1]=p+g*c,t[5]=h-_*c,t[9]=-a*l,t[2]=_-h*c,t[6]=g+p*c,t[10]=o*l}else if(e.order==="YXZ"){let h=l*u,p=l*d,g=c*u,_=c*d;t[0]=h+_*a,t[4]=g*a-p,t[8]=o*c,t[1]=o*d,t[5]=o*u,t[9]=-a,t[2]=p*a-g,t[6]=_+h*a,t[10]=o*l}else if(e.order==="ZXY"){let h=l*u,p=l*d,g=c*u,_=c*d;t[0]=h-_*a,t[4]=-o*d,t[8]=g+p*a,t[1]=p+g*a,t[5]=o*u,t[9]=_-h*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let h=o*u,p=o*d,g=a*u,_=a*d;t[0]=l*u,t[4]=g*c-p,t[8]=h*c+_,t[1]=l*d,t[5]=_*c+h,t[9]=p*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let h=o*l,p=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=_-h*d,t[8]=g*d+p,t[1]=d,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=p*d+g,t[10]=h-_*d}else if(e.order==="XZY"){let h=o*l,p=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=-d,t[8]=c*u,t[1]=h*d+_,t[5]=o*u,t[9]=p*d-g,t[2]=g*d-p,t[6]=a*u,t[10]=_*d+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(yA,e,SA)}lookAt(e,t,i){let r=this.elements;return ui.subVectors(e,t),ui.lengthSq()===0&&(ui.z=1),ui.normalize(),Ts.crossVectors(i,ui),Ts.lengthSq()===0&&(Math.abs(i.z)===1?ui.x+=1e-4:ui.z+=1e-4,ui.normalize(),Ts.crossVectors(i,ui)),Ts.normalize(),Vh.crossVectors(ui,Ts),r[0]=Ts.x,r[4]=Vh.x,r[8]=ui.x,r[1]=Ts.y,r[5]=Vh.y,r[9]=ui.y,r[2]=Ts.z,r[6]=Vh.z,r[10]=ui.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],u=i[1],d=i[5],h=i[9],p=i[13],g=i[2],_=i[6],m=i[10],f=i[14],v=i[3],M=i[7],y=i[11],w=i[15],E=r[0],A=r[4],x=r[8],b=r[12],P=r[1],L=r[5],D=r[9],B=r[13],I=r[2],O=r[6],Y=r[10],H=r[14],ne=r[3],Z=r[7],te=r[11],re=r[15];return s[0]=o*E+a*P+l*I+c*ne,s[4]=o*A+a*L+l*O+c*Z,s[8]=o*x+a*D+l*Y+c*te,s[12]=o*b+a*B+l*H+c*re,s[1]=u*E+d*P+h*I+p*ne,s[5]=u*A+d*L+h*O+p*Z,s[9]=u*x+d*D+h*Y+p*te,s[13]=u*b+d*B+h*H+p*re,s[2]=g*E+_*P+m*I+f*ne,s[6]=g*A+_*L+m*O+f*Z,s[10]=g*x+_*D+m*Y+f*te,s[14]=g*b+_*B+m*H+f*re,s[3]=v*E+M*P+y*I+w*ne,s[7]=v*A+M*L+y*O+w*Z,s[11]=v*x+M*D+y*Y+w*te,s[15]=v*b+M*B+y*H+w*re,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],d=e[6],h=e[10],p=e[14],g=e[3],_=e[7],m=e[11],f=e[15],v=l*p-c*h,M=a*p-c*d,y=a*h-l*d,w=o*p-c*u,E=o*h-l*u,A=o*d-a*u;return t*(_*v-m*M+f*y)-i*(g*v-m*w+f*E)+r*(g*M-_*w+f*A)-s*(g*y-_*E+m*A)}determinantAffine(){let e=this.elements,t=e[0],i=e[4],r=e[8],s=e[1],o=e[5],a=e[9],l=e[2],c=e[6],u=e[10];return t*(o*u-a*c)-i*(s*u-a*l)+r*(s*c-o*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],d=e[9],h=e[10],p=e[11],g=e[12],_=e[13],m=e[14],f=e[15],v=t*a-i*o,M=t*l-r*o,y=t*c-s*o,w=i*l-r*a,E=i*c-s*a,A=r*c-s*l,x=u*_-d*g,b=u*m-h*g,P=u*f-p*g,L=d*m-h*_,D=d*f-p*_,B=h*f-p*m,I=v*B-M*D+y*L+w*P-E*b+A*x;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let O=1/I;return e[0]=(a*B-l*D+c*L)*O,e[1]=(r*D-i*B-s*L)*O,e[2]=(_*A-m*E+f*w)*O,e[3]=(h*E-d*A-p*w)*O,e[4]=(l*P-o*B-c*b)*O,e[5]=(t*B-r*P+s*b)*O,e[6]=(m*y-g*A-f*M)*O,e[7]=(u*A-h*y+p*M)*O,e[8]=(o*D-a*P+c*x)*O,e[9]=(i*P-t*D-s*x)*O,e[10]=(g*E-_*y+f*v)*O,e[11]=(d*y-u*E-p*v)*O,e[12]=(a*b-o*L-l*x)*O,e[13]=(t*L-i*b+r*x)*O,e[14]=(_*M-g*w-m*v)*O,e[15]=(u*w-d*M+h*v)*O,this}scale(e){let t=this.elements,i=e.x,r=e.y,s=e.z;return t[0]*=i,t[4]*=r,t[8]*=s,t[1]*=i,t[5]*=r,t[9]*=s,t[2]*=i,t[6]*=r,t[10]*=s,t[3]*=i,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),r=Math.sin(t),s=1-i,o=e.x,a=e.y,l=e.z,c=s*o,u=s*a;return this.set(c*o+i,c*a-r*l,c*l+r*a,0,c*a+r*l,u*a+i,u*l-r*o,0,c*l-r*a,u*l+r*o,s*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,s,o){return this.set(1,i,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){let r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,u=o+o,d=a+a,h=s*c,p=s*u,g=s*d,_=o*u,m=o*d,f=a*d,v=l*c,M=l*u,y=l*d,w=i.x,E=i.y,A=i.z;return r[0]=(1-(_+f))*w,r[1]=(p+y)*w,r[2]=(g-M)*w,r[3]=0,r[4]=(p-y)*E,r[5]=(1-(h+f))*E,r[6]=(m+v)*E,r[7]=0,r[8]=(g+M)*A,r[9]=(m-v)*A,r[10]=(1-(h+_))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let s=this.determinantAffine();if(s===0)return i.set(1,1,1),t.identity(),this;let o=Ea.set(r[0],r[1],r[2]).length(),a=Ea.set(r[4],r[5],r[6]).length(),l=Ea.set(r[8],r[9],r[10]).length();s<0&&(o=-o),Vi.copy(this);let c=1/o,u=1/a,d=1/l;return Vi.elements[0]*=c,Vi.elements[1]*=c,Vi.elements[2]*=c,Vi.elements[4]*=u,Vi.elements[5]*=u,Vi.elements[6]*=u,Vi.elements[8]*=d,Vi.elements[9]*=d,Vi.elements[10]*=d,t.setFromRotationMatrix(Vi),i.x=o,i.y=a,i.z=l,this}makePerspective(e,t,i,r,s,o,a=Xi,l=!1){let c=this.elements,u=2*s/(t-e),d=2*s/(i-r),h=(t+e)/(t-e),p=(i+r)/(i-r),g,_;if(l)g=s/(o-s),_=o*s/(o-s);else if(a===Xi)g=-(o+s)/(o-s),_=-2*o*s/(o-s);else if(a===Tc)g=-o/(o-s),_=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=d,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,r,s,o,a=Xi,l=!1){let c=this.elements,u=2/(t-e),d=2/(i-r),h=-(t+e)/(t-e),p=-(i+r)/(i-r),g,_;if(l)g=1/(o-s),_=o/(o-s);else if(a===Xi)g=-2/(o-s),_=-(o+s)/(o-s);else if(a===Tc)g=-1/(o-s),_=-s/(o-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=d,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},Ea=new q,Vi=new Ht,yA=new q(0,0,0),SA=new q(1,1,1),Ts=new q,Vh=new q,ui=new q,_M=new Ht,vM=new dr,Is=class n{constructor(e=0,t=0,i=0,r=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],u=r[9],d=r[2],h=r[6],p=r[10];switch(t){case"XYZ":this._y=Math.asin(nt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-nt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,s),this._z=0);break;case"ZXY":this._x=Math.asin(nt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-d,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-nt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(h,p),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(nt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-d,s)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-nt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,p),this._y=0);break;default:ke("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return _M.makeRotationFromQuaternion(e),this.setFromRotationMatrix(_M,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return vM.setFromEuler(this),this.setFromQuaternion(vM,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Is.DEFAULT_ORDER="XYZ";Ac=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},MA=0,xM=new q,Ta=new dr,Br=new Ht,Gh=new q,vc=new q,wA=new q,EA=new dr,yM=new q(1,0,0),SM=new q(0,1,0),MM=new q(0,0,1),wM={type:"added"},TA={type:"removed"},ba={type:"childadded",child:null},l0={type:"childremoved",child:null},Ci=class n extends fr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:MA++}),this.uuid=qc(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new q,t=new Is,i=new dr,r=new q(1,1,1);function s(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Ht},normalMatrix:{value:new Ge}}),this.matrix=new Ht,this.matrixWorld=new Ht,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ac,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ta.setFromAxisAngle(e,t),this.quaternion.multiply(Ta),this}rotateOnWorldAxis(e,t){return Ta.setFromAxisAngle(e,t),this.quaternion.premultiply(Ta),this}rotateX(e){return this.rotateOnAxis(yM,e)}rotateY(e){return this.rotateOnAxis(SM,e)}rotateZ(e){return this.rotateOnAxis(MM,e)}translateOnAxis(e,t){return xM.copy(e).applyQuaternion(this.quaternion),this.position.add(xM.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(yM,e)}translateY(e){return this.translateOnAxis(SM,e)}translateZ(e){return this.translateOnAxis(MM,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Br.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Gh.copy(e):Gh.set(e,t,i);let r=this.parent;this.updateWorldMatrix(!0,!1),vc.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Br.lookAt(vc,Gh,this.up):Br.lookAt(Gh,vc,this.up),this.quaternion.setFromRotationMatrix(Br),r&&(Br.extractRotation(r.matrixWorld),Ta.setFromRotationMatrix(Br),this.quaternion.premultiply(Ta.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ve("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(wM),ba.child=e,this.dispatchEvent(ba),ba.child=null):Ve("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(TA),l0.child=e,this.dispatchEvent(l0),l0.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Br.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Br.multiply(e.parent.matrixWorld)),e.applyMatrix4(Br),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(wM),ba.child=e,this.dispatchEvent(ba),ba.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){let o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vc,e,wA),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vc,EA,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,i=e.y,r=e.z,s=this.matrix.elements;s[12]+=t-s[0]*t-s[4]*i-s[8]*r,s[13]+=i-s[1]*t-s[5]*i-s[9]*r,s[14]+=r-s[2]*t-s[6]*i-s[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){let s=this.children;for(let o=0,a=s.length;o<a;o++)s[o].updateWorldMatrix(!1,!0,i)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(a=>({...a})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let d=l[c];s(e.shapes,d)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),d=o(e.shapes),h=o(e.skeletons),p=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),d.length>0&&(i.shapes=d),h.length>0&&(i.skeletons=h),p.length>0&&(i.animations=p),g.length>0&&(i.nodes=g)}return i.object=r,i;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let r=e.children[i];this.add(r.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Ci.DEFAULT_UP=new q(0,1,0);Ci.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ci.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;Eo=class extends Ci{constructor(){super(),this.isGroup=!0,this.type="Group"}},bA={type:"move"},Ga=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Eo,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Eo,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new q,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new q),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Eo,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new q,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new q,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,s=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let _ of e.hand.values()){let m=t.getJointPose(_,i),f=this._getHandJoint(c,_);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}let u=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],h=u.position.distanceTo(d.position),p=.02,g=.005;c.inputState.pinching&&h>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(bA)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new Eo;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},_1={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},bs={h:0,s:0,l:0},Hh={h:0,s:0,l:0};rt=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=wn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Qe.colorSpaceToWorking(this,t),this}setRGB(e,t,i,r=Qe.workingColorSpace){return this.r=e,this.g=t,this.b=i,Qe.colorSpaceToWorking(this,r),this}setHSL(e,t,i,r=Qe.workingColorSpace){if(e=gA(e,1),t=nt(t,0,1),i=nt(i,0,1),t===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+t):i+t-i*t,o=2*i-s;this.r=c0(o,s,e+1/3),this.g=c0(o,s,e),this.b=c0(o,s,e-1/3)}return Qe.colorSpaceToWorking(this,r),this}setStyle(e,t=wn){function i(s){s!==void 0&&parseFloat(s)<1&&ke("Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:ke("Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);ke("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=wn){let i=_1[e.toLowerCase()];return i!==void 0?this.setHex(i,t):ke("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Hr(e.r),this.g=Hr(e.g),this.b=Hr(e.b),this}copyLinearToSRGB(e){return this.r=Oa(e.r),this.g=Oa(e.g),this.b=Oa(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=wn){return Qe.workingToColorSpace(Mn.copy(this),e),Math.round(nt(Mn.r*255,0,255))*65536+Math.round(nt(Mn.g*255,0,255))*256+Math.round(nt(Mn.b*255,0,255))}getHexString(e=wn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Qe.workingColorSpace){Qe.workingToColorSpace(Mn.copy(this),t);let i=Mn.r,r=Mn.g,s=Mn.b,o=Math.max(i,r,s),a=Math.min(i,r,s),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let d=o-a;switch(c=u<=.5?d/(o+a):d/(2-o-a),o){case i:l=(r-s)/d+(r<s?6:0);break;case r:l=(s-i)/d+2;break;case s:l=(i-r)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Qe.workingColorSpace){return Qe.workingToColorSpace(Mn.copy(this),t),e.r=Mn.r,e.g=Mn.g,e.b=Mn.b,e}getStyle(e=wn){Qe.workingToColorSpace(Mn.copy(this),e);let t=Mn.r,i=Mn.g,r=Mn.b;return e!==wn?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(bs),this.setHSL(bs.h+e,bs.s+t,bs.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(bs),e.getHSL(Hh);let i=i0(bs.h,Hh.h,t),r=i0(bs.s,Hh.s,t),s=i0(bs.l,Hh.l,t);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*r,this.g=s[1]*t+s[4]*i+s[7]*r,this.b=s[2]*t+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Mn=new rt;rt.NAMES=_1;Ha=class extends Ci{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Is,this.environmentIntensity=1,this.environmentRotation=new Is,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Gi=new q,kr=new q,u0=new q,zr=new q,Aa=new q,Ca=new q,EM=new q,h0=new q,f0=new q,d0=new q,p0=new Ut,m0=new Ut,g0=new Ut,Ps=class n{constructor(e=new q,t=new q,i=new q){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),Gi.subVectors(e,t),r.cross(Gi);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,i,r,s){Gi.subVectors(r,t),kr.subVectors(i,t),u0.subVectors(e,t);let o=Gi.dot(Gi),a=Gi.dot(kr),l=Gi.dot(u0),c=kr.dot(kr),u=kr.dot(u0),d=o*c-a*a;if(d===0)return s.set(0,0,0),null;let h=1/d,p=(c*l-a*u)*h,g=(o*u-a*l)*h;return s.set(1-p-g,g,p)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,zr)===null?!1:zr.x>=0&&zr.y>=0&&zr.x+zr.y<=1}static getInterpolation(e,t,i,r,s,o,a,l){return this.getBarycoord(e,t,i,r,zr)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,zr.x),l.addScaledVector(o,zr.y),l.addScaledVector(a,zr.z),l)}static getInterpolatedAttribute(e,t,i,r,s,o){return p0.setScalar(0),m0.setScalar(0),g0.setScalar(0),p0.fromBufferAttribute(e,t),m0.fromBufferAttribute(e,i),g0.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(p0,s.x),o.addScaledVector(m0,s.y),o.addScaledVector(g0,s.z),o}static isFrontFacing(e,t,i,r){return Gi.subVectors(i,t),kr.subVectors(e,t),Gi.cross(kr).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Gi.subVectors(this.c,this.b),kr.subVectors(this.a,this.b),Gi.cross(kr).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,r,s){return n.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,r=this.b,s=this.c,o,a;Aa.subVectors(r,i),Ca.subVectors(s,i),h0.subVectors(e,i);let l=Aa.dot(h0),c=Ca.dot(h0);if(l<=0&&c<=0)return t.copy(i);f0.subVectors(e,r);let u=Aa.dot(f0),d=Ca.dot(f0);if(u>=0&&d<=u)return t.copy(r);let h=l*d-u*c;if(h<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(i).addScaledVector(Aa,o);d0.subVectors(e,s);let p=Aa.dot(d0),g=Ca.dot(d0);if(g>=0&&p<=g)return t.copy(s);let _=p*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(i).addScaledVector(Ca,a);let m=u*g-p*d;if(m<=0&&d-u>=0&&p-g>=0)return EM.subVectors(s,r),a=(d-u)/(d-u+(p-g)),t.copy(r).addScaledVector(EM,a);let f=1/(m+_+h);return o=_*f,a=h*f,t.copy(i).addScaledVector(Aa,o).addScaledVector(Ca,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Ls=class{constructor(e=new q(1/0,1/0,1/0),t=new q(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Hi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Hi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=Hi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Hi):Hi.fromBufferAttribute(s,o),Hi.applyMatrix4(e.matrixWorld),this.expandByPoint(Hi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Wh.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Wh.copy(i.boundingBox)),Wh.applyMatrix4(e.matrixWorld),this.union(Wh)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Hi),Hi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(xc),Xh.subVectors(this.max,xc),Ra.subVectors(e.a,xc),Pa.subVectors(e.b,xc),Ia.subVectors(e.c,xc),As.subVectors(Pa,Ra),Cs.subVectors(Ia,Pa),yo.subVectors(Ra,Ia);let t=[0,-As.z,As.y,0,-Cs.z,Cs.y,0,-yo.z,yo.y,As.z,0,-As.x,Cs.z,0,-Cs.x,yo.z,0,-yo.x,-As.y,As.x,0,-Cs.y,Cs.x,0,-yo.y,yo.x,0];return!_0(t,Ra,Pa,Ia,Xh)||(t=[1,0,0,0,1,0,0,0,1],!_0(t,Ra,Pa,Ia,Xh))?!1:(qh.crossVectors(As,Cs),t=[qh.x,qh.y,qh.z],_0(t,Ra,Pa,Ia,Xh))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Hi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Hi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Vr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Vr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Vr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Vr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Vr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Vr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Vr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Vr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Vr),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Vr=[new q,new q,new q,new q,new q,new q,new q,new q],Hi=new q,Wh=new Ls,Ra=new q,Pa=new q,Ia=new q,As=new q,Cs=new q,yo=new q,xc=new q,Xh=new q,qh=new q,So=new q;qt=new q,Yh=new it,AA=0,bi=class extends fr{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:AA++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=f1,this.updateRanges=[],this.gpuType=Zi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Yh.fromBufferAttribute(this,t),Yh.applyMatrix3(e),this.setXY(t,Yh.x,Yh.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)qt.fromBufferAttribute(this,t),qt.applyMatrix3(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)qt.fromBufferAttribute(this,t),qt.applyMatrix4(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)qt.fromBufferAttribute(this,t),qt.applyNormalMatrix(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)qt.fromBufferAttribute(this,t),qt.transformDirection(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=_c(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Jn(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=_c(t,this.array)),t}setX(e,t){return this.normalized&&(t=Jn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=_c(t,this.array)),t}setY(e,t){return this.normalized&&(t=Jn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=_c(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Jn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=_c(t,this.array)),t}setW(e,t){return this.normalized&&(t=Jn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Jn(t,this.array),i=Jn(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=Jn(t,this.array),i=Jn(i,this.array),r=Jn(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e*=this.itemSize,this.normalized&&(t=Jn(t,this.array),i=Jn(i,this.array),r=Jn(r,this.array),s=Jn(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}},Cc=class extends bi{constructor(e,t,i){super(new Uint16Array(e),t,i)}},Rc=class extends bi{constructor(e,t,i){super(new Uint32Array(e),t,i)}},Ai=class extends bi{constructor(e,t,i){super(new Float32Array(e),t,i)}},CA=new Ls,yc=new q,v0=new q,Wa=class{constructor(e=new q,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):CA.setFromPoints(e).getCenter(i);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;yc.subVectors(e,this.center);let t=yc.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(yc,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(v0.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(yc.copy(e.center).add(v0)),this.expandByPoint(yc.copy(e.center).sub(v0))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},RA=0,Ti=new Ht,x0=new Ci,La=new q,hi=new Ls,Sc=new Ls,nn=new q,pr=class n extends fr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:RA++}),this.uuid=qc(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(pA(e)?Rc:Cc)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let s=new Ge().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Ti.makeRotationFromQuaternion(e),this.applyMatrix4(Ti),this}rotateX(e){return Ti.makeRotationX(e),this.applyMatrix4(Ti),this}rotateY(e){return Ti.makeRotationY(e),this.applyMatrix4(Ti),this}rotateZ(e){return Ti.makeRotationZ(e),this.applyMatrix4(Ti),this}translate(e,t,i){return Ti.makeTranslation(e,t,i),this.applyMatrix4(Ti),this}scale(e,t,i){return Ti.makeScale(e,t,i),this.applyMatrix4(Ti),this}lookAt(e){return x0.lookAt(e),x0.updateMatrix(),this.applyMatrix4(x0.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(La).negate(),this.translate(La.x,La.y,La.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let r=0,s=e.length;r<s;r++){let o=e[r];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Ai(i,3))}else{let i=Math.min(e.length,t.count);for(let r=0;r<i;r++){let s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&ke("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ls);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ve("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new q(-1/0,-1/0,-1/0),new q(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){let s=t[i];hi.setFromBufferAttribute(s),this.morphTargetsRelative?(nn.addVectors(this.boundingBox.min,hi.min),this.boundingBox.expandByPoint(nn),nn.addVectors(this.boundingBox.max,hi.max),this.boundingBox.expandByPoint(nn)):(this.boundingBox.expandByPoint(hi.min),this.boundingBox.expandByPoint(hi.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ve('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Wa);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ve("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new q,1/0);return}if(e){let i=this.boundingSphere.center;if(hi.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){let a=t[s];Sc.setFromBufferAttribute(a),this.morphTargetsRelative?(nn.addVectors(hi.min,Sc.min),hi.expandByPoint(nn),nn.addVectors(hi.max,Sc.max),hi.expandByPoint(nn)):(hi.expandByPoint(Sc.min),hi.expandByPoint(Sc.max))}hi.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)nn.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(nn));if(t)for(let s=0,o=t.length;s<o;s++){let a=t[s],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)nn.fromBufferAttribute(a,c),l&&(La.fromBufferAttribute(e,c),nn.add(La)),r=Math.max(r,i.distanceToSquared(nn))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&Ve('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ve("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,r=t.normal,s=t.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==i.count)&&(o=new bi(new Float32Array(4*i.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let x=0;x<i.count;x++)a[x]=new q,l[x]=new q;let c=new q,u=new q,d=new q,h=new it,p=new it,g=new it,_=new q,m=new q;function f(x,b,P){c.fromBufferAttribute(i,x),u.fromBufferAttribute(i,b),d.fromBufferAttribute(i,P),h.fromBufferAttribute(s,x),p.fromBufferAttribute(s,b),g.fromBufferAttribute(s,P),u.sub(c),d.sub(c),p.sub(h),g.sub(h);let L=1/(p.x*g.y-g.x*p.y);isFinite(L)&&(_.copy(u).multiplyScalar(g.y).addScaledVector(d,-p.y).multiplyScalar(L),m.copy(d).multiplyScalar(p.x).addScaledVector(u,-g.x).multiplyScalar(L),a[x].add(_),a[b].add(_),a[P].add(_),l[x].add(m),l[b].add(m),l[P].add(m))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let x=0,b=v.length;x<b;++x){let P=v[x],L=P.start,D=P.count;for(let B=L,I=L+D;B<I;B+=3)f(e.getX(B+0),e.getX(B+1),e.getX(B+2))}let M=new q,y=new q,w=new q,E=new q;function A(x){w.fromBufferAttribute(r,x),E.copy(w);let b=a[x];M.copy(b),M.sub(w.multiplyScalar(w.dot(b))).normalize(),y.crossVectors(E,b);let L=y.dot(l[x])<0?-1:1;o.setXYZW(x,M.x,M.y,M.z,L)}for(let x=0,b=v.length;x<b;++x){let P=v[x],L=P.start,D=P.count;for(let B=L,I=L+D;B<I;B+=3)A(e.getX(B+0)),A(e.getX(B+1)),A(e.getX(B+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new bi(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let h=0,p=i.count;h<p;h++)i.setXYZ(h,0,0,0);let r=new q,s=new q,o=new q,a=new q,l=new q,c=new q,u=new q,d=new q;if(e)for(let h=0,p=e.count;h<p;h+=3){let g=e.getX(h+0),_=e.getX(h+1),m=e.getX(h+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),u.subVectors(o,s),d.subVectors(r,s),u.cross(d),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,_),c.fromBufferAttribute(i,m),a.add(u),l.add(u),c.add(u),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,p=t.count;h<p;h+=3)r.fromBufferAttribute(t,h+0),s.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),u.subVectors(o,s),d.subVectors(r,s),u.cross(d),i.setXYZ(h+0,u.x,u.y,u.z),i.setXYZ(h+1,u.x,u.y,u.z),i.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)nn.fromBufferAttribute(e,t),nn.normalize(),e.setXYZ(t,nn.x,nn.y,nn.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,d=a.normalized,h=new c.constructor(l.length*u),p=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?p=l[_]*a.data.stride+a.offset:p=l[_]*u;for(let f=0;f<u;f++)h[g++]=c[p++]}return new bi(h,u,d)}if(this.index===null)return ke("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,r=this.attributes;for(let a in r){let l=r[a],c=e(l,i);t.setAttribute(a,c)}let s=this.morphAttributes;for(let a in s){let l=[],c=s[a];for(let u=0,d=c.length;u<d;u++){let h=c[u],p=e(h,i);l.push(p)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let d=0,h=c.length;d<h;d++){let p=c[d];u.push(p.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let r=e.attributes;for(let c in r){let u=r[c];this.setAttribute(c,u.clone(t))}let s=e.morphAttributes;for(let c in s){let u=[],d=s[c];for(let h=0,p=d.length;h<p;h++)u.push(d[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let d=o[c];this.addGroup(d.start,d.count,d.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},y0=new q,PA=new q,IA=new Ge,Wi=class{constructor(e=new q(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let r=y0.subVectors(i,t).cross(PA.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){let r=e.delta(y0),s=this.normal.dot(r);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/s;return i===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(r,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||IA.getNormalMatrix(e),r=this.coplanarPoint(y0).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},LA=0,bo=class extends fr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:LA++}),this.uuid=qc(),this.name="",this.type="Material",this.blending=$a,this.side=ks,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=N0,this.blendDst=U0,this.blendEquation=Co,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new rt(0,0,0),this.blendAlpha=0,this.depthFunc=Ba,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=s1,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=lf,this.stencilZFail=lf,this.stencilZPass=lf,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){ke(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){ke(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector2&&i&&i.isVector2||r&&r.isEuler&&i&&i.isEuler||r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(s=>s.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(t){let s=r(e.textures),o=r(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new rt().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(i=>new Wi().fromJSON(i))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new it().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new it().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let r=t.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Gr=new q,S0=new q,Zh=new q,$h=new q,Ef=class{constructor(e=new q,t=new q(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Gr)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Gr.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Gr.copy(this.origin).addScaledVector(this.direction,t),Gr.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){S0.copy(e).add(t).multiplyScalar(.5),Zh.copy(t).sub(e).normalize(),$h.copy(this.origin).sub(S0);let s=e.distanceTo(t)*.5,o=-this.direction.dot(Zh),a=$h.dot(this.direction),l=-$h.dot(Zh),c=$h.lengthSq(),u=Math.abs(1-o*o),d,h,p,g;if(u>0)if(d=o*l-a,h=o*a-l,g=s*u,d>=0)if(h>=-g)if(h<=g){let _=1/u;d*=_,h*=_,p=d*(d+o*h+2*a)+h*(o*d+h+2*l)+c}else h=s,d=Math.max(0,-(o*h+a)),p=-d*d+h*(h+2*l)+c;else h=-s,d=Math.max(0,-(o*h+a)),p=-d*d+h*(h+2*l)+c;else h<=-g?(d=Math.max(0,-(-o*s+a)),h=d>0?-s:Math.min(Math.max(-s,-l),s),p=-d*d+h*(h+2*l)+c):h<=g?(d=0,h=Math.min(Math.max(-s,-l),s),p=h*(h+2*l)+c):(d=Math.max(0,-(o*s+a)),h=d>0?s:Math.min(Math.max(-s,-l),s),p=-d*d+h*(h+2*l)+c);else h=o>0?-s:s,d=Math.max(0,-(o*h+a)),p=-d*d+h*(h+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,d),r&&r.copy(S0).addScaledVector(Zh,h),p}intersectSphere(e,t){if(e.radius<0)return null;Gr.subVectors(e.center,this.origin);let i=Gr.dot(this.direction),r=Gr.dot(Gr)-i*i,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,s,o,a,l,c=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,h=this.origin;return c>=0?(i=(e.min.x-h.x)*c,r=(e.max.x-h.x)*c):(i=(e.max.x-h.x)*c,r=(e.min.x-h.x)*c),u>=0?(s=(e.min.y-h.y)*u,o=(e.max.y-h.y)*u):(s=(e.max.y-h.y)*u,o=(e.min.y-h.y)*u),i>o||s>r||((s>i||isNaN(i))&&(i=s),(o<r||isNaN(r))&&(r=o),d>=0?(a=(e.min.z-h.z)*d,l=(e.max.z-h.z)*d):(a=(e.max.z-h.z)*d,l=(e.min.z-h.z)*d),i>l||a>r)||((a>i||i!==i)&&(i=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,Gr)!==null}intersectTriangle(e,t,i,r,s){let o=this.origin,a=this.direction,l=a.x,c=a.y,u=a.z,d=e.x-o.x,h=e.y-o.y,p=e.z-o.z,g=t.x-o.x,_=t.y-o.y,m=t.z-o.z,f=i.x-o.x,v=i.y-o.y,M=i.z-o.z,y=Math.abs(l),w=Math.abs(c),E=Math.abs(u),A,x,b,P,L,D,B,I,O,Y,H,ne;if(y>=w&&y>=E?(b=l,D=d,O=g,ne=f,l>=0?(A=c,x=u,P=h,L=p,B=_,I=m,Y=v,H=M):(A=u,x=c,P=p,L=h,B=m,I=_,Y=M,H=v)):w>=E?(b=c,D=h,O=_,ne=v,c>=0?(A=u,x=l,P=p,L=d,B=m,I=g,Y=M,H=f):(A=l,x=u,P=d,L=p,B=g,I=m,Y=f,H=M)):(b=u,D=p,O=m,ne=M,u>=0?(A=l,x=c,P=d,L=h,B=g,I=_,Y=f,H=v):(A=c,x=l,P=h,L=d,B=_,I=g,Y=v,H=f)),b===0)return null;let Z=A/b,te=x/b,re=1/b,Te=P-Z*D,fe=L-te*D,Ue=B-Z*O,Oe=I-te*O,We=Y-Z*ne,j=H-te*ne,ie=We*Oe-j*Ue,ye=Te*j-fe*We,Fe=Ue*fe-Oe*Te;if(r){if(ie<0||ye<0||Fe<0)return null}else if((ie<0||ye<0||Fe<0)&&(ie>0||ye>0||Fe>0))return null;let _e=ie+ye+Fe;if(_e===0)return null;let He=re*(ie*D+ye*O+Fe*ne);return(_e>0?He<0:He>0)?null:this.at(He/_e,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ao=class extends bo{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new rt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Is,this.combine=F0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},TM=new Ht,Mo=new Ef,Jh=new Wa,bM=new q,Kh=new q,jh=new q,Qh=new q,M0=new q,ef=new q,AM=new q,tf=new q,Un=class extends Ci{constructor(e=new pr,t=new Ao){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){ef.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let u=a[l],d=s[l];u!==0&&(M0.fromBufferAttribute(d,e),o?ef.addScaledVector(M0,u):ef.addScaledVector(M0.sub(t),u))}t.add(ef)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Jh.copy(i.boundingSphere),Jh.applyMatrix4(s),Mo.copy(e.ray).recast(e.near),!(Jh.containsPoint(Mo.origin)===!1&&(Mo.intersectSphere(Jh,bM)===null||Mo.origin.distanceToSquared(bM)>(e.far-e.near)**2))&&(TM.copy(s).invert(),Mo.copy(e.ray).applyMatrix4(TM),!(i.boundingBox!==null&&Mo.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Mo)))}_computeIntersections(e,t,i){let r,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,d=s.attributes.normal,h=s.groups,p=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=h.length;g<_;g++){let m=h[g],f=o[m.materialIndex],v=Math.max(m.start,p.start),M=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let y=v,w=M;y<w;y+=3){let E=a.getX(y),A=a.getX(y+1),x=a.getX(y+2);r=nf(this,f,e,i,c,u,d,E,A,x),r&&(r.faceIndex=Math.floor(y/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let g=Math.max(0,p.start),_=Math.min(a.count,p.start+p.count);for(let m=g,f=_;m<f;m+=3){let v=a.getX(m),M=a.getX(m+1),y=a.getX(m+2);r=nf(this,o,e,i,c,u,d,v,M,y),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=h.length;g<_;g++){let m=h[g],f=o[m.materialIndex],v=Math.max(m.start,p.start),M=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let y=v,w=M;y<w;y+=3){let E=y,A=y+1,x=y+2;r=nf(this,f,e,i,c,u,d,E,A,x),r&&(r.faceIndex=Math.floor(y/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let g=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let m=g,f=_;m<f;m+=3){let v=m,M=m+1,y=m+2;r=nf(this,o,e,i,c,u,d,v,M,y),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}};Xa=class extends En{constructor(e=null,t=1,i=1,r,s,o,a,l,c=rn,u=rn,d,h){super(null,o,a,l,c,u,r,s,d,h),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},wo=new Wa,NA=new it(.5,.5),rf=new q,Pc=class{constructor(e=new Wi,t=new Wi,i=new Wi,r=new Wi,s=new Wi,o=new Wi){this.planes=[e,t,i,r,s,o]}set(e,t,i,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Xi,i=!1){let r=this.planes,s=e.elements,o=s[0],a=s[1],l=s[2],c=s[3],u=s[4],d=s[5],h=s[6],p=s[7],g=s[8],_=s[9],m=s[10],f=s[11],v=s[12],M=s[13],y=s[14],w=s[15];if(r[0].setComponents(c-o,p-u,f-g,w-v).normalize(),r[1].setComponents(c+o,p+u,f+g,w+v).normalize(),r[2].setComponents(c+a,p+d,f+_,w+M).normalize(),r[3].setComponents(c-a,p-d,f-_,w-M).normalize(),i)r[4].setComponents(l,h,m,y).normalize(),r[5].setComponents(c-l,p-h,f-m,w-y).normalize();else if(r[4].setComponents(c-l,p-h,f-m,w-y).normalize(),t===Xi)r[5].setComponents(c+l,p+h,f+m,w+y).normalize();else if(t===Tc)r[5].setComponents(l,h,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),wo.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),wo.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(wo)}intersectsSprite(e){wo.center.set(0,0,0);let t=NA.distanceTo(e.center);return wo.radius=.7071067811865476+t,wo.applyMatrix4(e.matrixWorld),this.intersectsSphere(wo)}intersectsSphere(e){let t=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let r=t[i];if(rf.x=r.normal.x>0?e.max.x:e.min.x,rf.y=r.normal.y>0?e.max.y:e.min.y,rf.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(rf)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Ic=class extends En{constructor(e,t,i,r,s=Et,o=Et,a,l,c){super(e,t,i,r,s,o,a,l,c),this.isVideoTexture=!0,this.generateMipmaps=!1,this._requestVideoFrameCallbackId=0;let u=this;function d(){u.needsUpdate=!0,u._requestVideoFrameCallbackId=e.requestVideoFrameCallback(d)}"requestVideoFrameCallback"in e&&(this._requestVideoFrameCallbackId=e.requestVideoFrameCallback(d))}clone(){return new this.constructor(this.image).copy(this)}update(){let e=this.image;"requestVideoFrameCallback"in e===!1&&e.readyState>=e.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}dispose(){this._requestVideoFrameCallbackId!==0&&(this.source.data.cancelVideoFrameCallback(this._requestVideoFrameCallbackId),this._requestVideoFrameCallbackId=0),super.dispose()}},Lc=class extends En{constructor(e=[],t=zs,i,r,s,o,a,l,c,u){super(e,t,i,r,s,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ds=class extends En{constructor(e,t,i=Yi,r,s,o,a=rn,l=rn,c,u=hr,d=1){if(u!==hr&&u!==Vs)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:e,height:t,depth:d};super(h,r,s,o,a,l,u,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Va(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Tf=class extends Ds{constructor(e,t=Yi,i=zs,r,s,o=rn,a=rn,l,c=hr){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,i,r,s,o,a,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Dc=class extends En{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},qa=class n extends pr{constructor(e=1,t=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let l=[],c=[],u=[],d=[],h=0,p=0;g("z","y","x",-1,-1,i,t,e,o,s,0),g("z","y","x",1,-1,i,t,-e,o,s,1),g("x","z","y",1,1,e,i,t,r,o,2),g("x","z","y",1,-1,e,i,-t,r,o,3),g("x","y","z",1,-1,e,t,i,r,s,4),g("x","y","z",-1,-1,e,t,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new Ai(c,3)),this.setAttribute("normal",new Ai(u,3)),this.setAttribute("uv",new Ai(d,2));function g(_,m,f,v,M,y,w,E,A,x,b){let P=y/A,L=w/x,D=y/2,B=w/2,I=E/2,O=A+1,Y=x+1,H=0,ne=0,Z=new q;for(let te=0;te<Y;te++){let re=te*L-B;for(let Te=0;Te<O;Te++){let fe=Te*P-D;Z[_]=fe*v,Z[m]=re*M,Z[f]=I,c.push(Z.x,Z.y,Z.z),Z[_]=0,Z[m]=0,Z[f]=E>0?1:-1,u.push(Z.x,Z.y,Z.z),d.push(Te/A),d.push(1-te/x),H+=1}}for(let te=0;te<x;te++)for(let re=0;re<A;re++){let Te=h+re+O*te,fe=h+re+O*(te+1),Ue=h+(re+1)+O*(te+1),Oe=h+(re+1)+O*te;l.push(Te,fe,Oe),l.push(fe,Ue,Oe),ne+=6}a.addGroup(p,ne,b),p+=ne,h+=H}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}},Ns=class n extends pr{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};let s=e/2,o=t/2,a=Math.floor(i),l=Math.floor(r),c=a+1,u=l+1,d=e/a,h=t/l,p=[],g=[],_=[],m=[];for(let f=0;f<u;f++){let v=f*h-o;for(let M=0;M<c;M++){let y=M*d-s;g.push(y,-v,0),_.push(0,0,1),m.push(M/a),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let v=0;v<a;v++){let M=v+c*f,y=v+c*(f+1),w=v+1+c*(f+1),E=v+1+c*f;p.push(M,y,E),p.push(y,w,E)}this.setIndex(p),this.setAttribute("position",new Ai(g,3)),this.setAttribute("normal",new Ai(_,3)),this.setAttribute("uv",new Ai(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}};v1={clone:Po,merge:bn},FA=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,OA=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Fn=class extends bo{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=FA,this.fragmentShader=OA,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Po(e.uniforms),this.uniformsGroups=UA(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let i in e.uniforms){let r=e.uniforms[i];switch(this.uniforms[i]={},r.type){case"t":this.uniforms[i].value=t[r.value]||null;break;case"c":this.uniforms[i].value=new rt().setHex(r.value);break;case"v2":this.uniforms[i].value=new it().fromArray(r.value);break;case"v3":this.uniforms[i].value=new q().fromArray(r.value);break;case"v4":this.uniforms[i].value=new Ut().fromArray(r.value);break;case"m3":this.uniforms[i].value=new Ge().fromArray(r.value);break;case"m4":this.uniforms[i].value=new Ht().fromArray(r.value);break;default:this.uniforms[i].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},bf=class extends Fn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Af=class extends bo{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=i1,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Cf=class extends bo{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};Us=class{constructor(e,t,i,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,r=t[i],s=t[i-1];e:{t:{let o;n:{i:if(!(e<r)){for(let a=i+2;;){if(r===void 0){if(e<s)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=r,r=t[++i],e<r)break t}o=t.length;break n}if(!(e>=s)){let a=t[1];e<a&&(i=2,s=a);for(let l=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(r=s,s=t[--i-1],e>=s)break t}o=i,i=0;break n}break e}for(;i<o;){let a=i+o>>>1;e<t[a]?o=a:i=a+1}if(r=t[i],s=t[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,r)}return this.interpolate_(i,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=i[s+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Rf=class extends Us{constructor(e,t,i,r){super(e,t,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:T0,endingEnd:T0}}intervalChanged_(e,t,i){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case b0:s=e,a=2*t-i;break;case A0:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case b0:o=e,l=2*i-t;break;case A0:o=1,l=i+r[1]-r[0];break;default:o=e-1,l=t}let c=(i-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-i),this._offsetPrev=s*u,this._offsetNext=o*u}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,d=this._offsetNext,h=this._weightPrev,p=this._weightNext,g=(i-t)/(r-t),_=g*g,m=_*g,f=-h*m+2*h*_-h*g,v=(1+h)*m+(-1.5-2*h)*_+(-.5+h)*g+1,M=(-1-p)*m+(1.5+p)*_+.5*g,y=p*m-p*_;for(let w=0;w!==a;++w)s[w]=f*o[u+w]+v*o[c+w]+M*o[l+w]+y*o[d+w];return s}},Pf=class extends Us{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(i-t)/(r-t),d=1-u;for(let h=0;h!==a;++h)s[h]=o[c+h]*d+o[l+h]*u;return s}},If=class extends Us{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Lf=class extends Us{interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this.inTangents,d=this.outTangents;if(!u||!d){let g=(i-t)/(r-t),_=1-g;for(let m=0;m!==a;++m)s[m]=o[c+m]*_+o[l+m]*g;return s}let h=a*2,p=e-1;for(let g=0;g!==a;++g){let _=o[c+g],m=o[l+g],f=p*h+g*2,v=d[f],M=d[f+1],y=e*h+g*2,w=u[y],E=u[y+1],A=kA(i,t,v,w,r);s[g]=x1(A,_,M,E,m)}return s}};fi=class{constructor(e,t,i,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Da(t,this.TimeBufferType),this.values=Da(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Da(e.times,Array),values:Da(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(i.interpolation=r),w0(e.settings)&&(i.settings={inTangents:Da(e.settings.inTangents,Array),outTangents:Da(e.settings.outTangents,Array)})}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new If(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Pf(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Rf(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Lf(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Mc:t=this.InterpolantFactoryMethodDiscrete;break;case xf:t=this.InterpolantFactoryMethodLinear;break;case af:t=this.InterpolantFactoryMethodSmooth;break;case E0:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return ke("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Mc;case this.InterpolantFactoryMethodLinear:return xf;case this.InterpolantFactoryMethodSmooth:return af;case this.InterpolantFactoryMethodBezier:return E0}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]*=e;w0(this.settings)&&(RM(this.settings.inTangents,e),RM(this.settings.outTangents,e))}return this}trim(e,t){let i=this.times,r=i.length,s=0,o=r-1;for(;s!==r&&i[s]<e;)++s;for(;o!==-1&&i[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Ve("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,r=this.values,s=i.length;s===0&&(Ve("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){Ve("KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){Ve("KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&mA(r))for(let a=0,l=r.length;a!==l;++a){let c=r[a];if(isNaN(c)){Ve("KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===af,s=e.length-1,o=1;for(let a=1;a<s;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(r)l=!0;else{let d=a*i,h=d-i,p=d+i;for(let g=0;g!==i;++g){let _=t[d+g];if(_!==t[h+g]||_!==t[p+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let d=a*i,h=o*i;for(let p=0;p!==i;++p)t[h+p]=t[d+p]}++o}}if(s>0){e[o]=e[s];for(let a=s*i,l=o*i,c=0;c!==i;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,r=new i(this.name,e,t);return r.createInterpolant=this.createInterpolant,w0(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};fi.prototype.ValueTypeName="";fi.prototype.TimeBufferType=Float32Array;fi.prototype.ValueBufferType=Float32Array;fi.prototype.DefaultInterpolation=xf;Fs=class extends fi{constructor(e,t,i){super(e,t,i)}};Fs.prototype.ValueTypeName="bool";Fs.prototype.ValueBufferType=Array;Fs.prototype.DefaultInterpolation=Mc;Fs.prototype.InterpolantFactoryMethodLinear=void 0;Fs.prototype.InterpolantFactoryMethodSmooth=void 0;Df=class extends fi{constructor(e,t,i,r){super(e,t,i,r)}};Df.prototype.ValueTypeName="color";Nf=class extends fi{constructor(e,t,i,r){super(e,t,i,r)}};Nf.prototype.ValueTypeName="number";Uf=class extends Us{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(r-t),c=e*a;for(let u=c+a;c!==u;c+=4)dr.slerpFlat(s,0,o,c-a,o,c,l);return s}},Nc=class extends fi{constructor(e,t,i,r){super(e,t,i,r)}InterpolantFactoryMethodLinear(e){return new Uf(this.times,this.values,this.getValueSize(),e)}};Nc.prototype.ValueTypeName="quaternion";Nc.prototype.InterpolantFactoryMethodSmooth=void 0;Os=class extends fi{constructor(e,t,i){super(e,t,i)}};Os.prototype.ValueTypeName="string";Os.prototype.ValueBufferType=Array;Os.prototype.DefaultInterpolation=Mc;Os.prototype.InterpolantFactoryMethodLinear=void 0;Os.prototype.InterpolantFactoryMethodSmooth=void 0;Ff=class extends fi{constructor(e,t,i,r){super(e,t,i,r)}};Ff.prototype.ValueTypeName="vector";cf={enabled:!1,files:{},add:function(n,e){this.enabled!==!1&&(PM(n)||(this.files[n]=e))},get:function(n){if(this.enabled!==!1&&!PM(n))return this.files[n]},remove:function(n){delete this.files[n]},clear:function(){this.files={}}};Of=class{constructor(e,t,i){let r=this,s=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(u){a++,s===!1&&r.onStart!==void 0&&r.onStart(u,o,a),s=!0},this.itemEnd=function(u){o++,r.onProgress!==void 0&&r.onProgress(u,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(u){r.onError!==void 0&&r.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,d){return c.push(u,d),this},this.removeHandler=function(u){let d=c.indexOf(u);return d!==-1&&c.splice(d,2),this},this.getHandler=function(u){for(let d=0,h=c.length;d<h;d+=2){let p=c[d],g=c[d+1];if(p.global&&(p.lastIndex=0),p.test(u))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},y1=new Of,Ya=class{constructor(e){this.manager=e!==void 0?e:y1,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let i=this;return new Promise(function(r,s){i.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Ya.DEFAULT_MATERIAL_NAME="__DEFAULT";Na=new WeakMap,Bf=class extends Ya{constructor(e){super(e)}load(e,t,i,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=this,o=cf.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)s.manager.itemStart(e),setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0);else{let d=Na.get(o);d===void 0&&(d=[],Na.set(o,d)),d.push({onLoad:t,onError:r})}return o}let a=ka("img");function l(){u(),t&&t(this);let d=Na.get(this)||[];for(let h=0;h<d.length;h++){let p=d[h];p.onLoad&&p.onLoad(this)}Na.delete(this),s.manager.itemEnd(e)}function c(d){u(),r&&r(d),cf.remove(`image:${e}`);let h=Na.get(this)||[];for(let p=0;p<h.length;p++){let g=h[p];g.onError&&g.onError(d)}Na.delete(this),s.manager.itemError(e),s.manager.itemEnd(e)}function u(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),cf.add(`image:${e}`,a),s.manager.itemStart(e),a.src=e,a}},Uc=class extends Ya{constructor(e){super(e)}load(e,t,i,r){let s=new En,o=new Bf(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){s.image=a,s.needsUpdate=!0,t!==void 0&&t(s)},i,r),s}},sf=new q,of=new dr,cr=new q,Fc=class extends Ci{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ht,this.projectionMatrix=new Ht,this.projectionMatrixInverse=new Ht,this.coordinateSystem=Xi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(sf,of,cr),cr.x===1&&cr.y===1&&cr.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(sf,of,cr.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(sf,of,cr),cr.x===1&&cr.y===1&&cr.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(sf,of,cr.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Rs=new q,IM=new it,LM=new it,Kn=class extends Fc{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=yf*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(n0*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return yf*2*Math.atan(Math.tan(n0*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Rs.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Rs.x,Rs.y).multiplyScalar(-e/Rs.z),Rs.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Rs.x,Rs.y).multiplyScalar(-e/Rs.z)}getViewSize(e,t){return this.getViewBounds(e,IM,LM),t.subVectors(LM,IM)}setViewOffset(e,t,i,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(n0*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*i/c,r*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Bs=class extends Fc{constructor(e=-1,t=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=i-e,o=i+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Ua=-90,Fa=1,kf=class extends Ci{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Kn(Ua,Fa,e,t);r.layers=this.layers,this.add(r);let s=new Kn(Ua,Fa,e,t);s.layers=this.layers,this.add(s);let o=new Kn(Ua,Fa,e,t);o.layers=this.layers,this.add(o);let a=new Kn(Ua,Fa,e,t);a.layers=this.layers,this.add(a);let l=new Kn(Ua,Fa,e,t);l.layers=this.layers,this.add(l);let c=new Kn(Ua,Fa,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,r,s,o,a,l]=t;for(let c of t)this.remove(c);if(e===Xi)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Tc)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,c,u]=this.children,d=e.getRenderTarget(),h=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(i,0,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(i,1,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,2,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,3,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(i,4,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),i.texture.generateMipmaps=_,e.setRenderTarget(i,5,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(d,h,p),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},zf=class extends Kn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},n_="\\[\\]\\.:\\/",zA=new RegExp("["+n_+"]","g"),i_="[^"+n_+"]",VA="[^"+n_.replace("\\.","")+"]",GA=/((?:WC+[\/:])*)/.source.replace("WC",i_),HA=/(WCOD+)?/.source.replace("WCOD",VA),WA=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",i_),XA=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",i_),qA=new RegExp("^"+GA+HA+WA+XA+"$"),YA=["material","materials","bones","map"],C0=class{constructor(e,t,i){let r=i||wt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=i.length;r!==s;++r)i[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},wt=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(zA,"")}static parseTrackName(e){let t=qA.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=i.nodeName.substring(r+1);YA.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===t||a.uuid===t)return a;let l=i(a.children);if(l)return l}return null},r=i(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)e[t++]=i[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){ke("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){Ve("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Ve("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Ve("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Ve("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Ve("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){Ve("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){Ve("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[r];if(o===void 0){let c=t.nodeName;Ve("PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){Ve("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Ve("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};wt.Composite=C0;wt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};wt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};wt.prototype.GetterByBindingType=[wt.prototype._getValue_direct,wt.prototype._getValue_array,wt.prototype._getValue_arrayElement,wt.prototype._getValue_toArray];wt.prototype.SetterByBindingTypeAndVersioning=[[wt.prototype._setValue_direct,wt.prototype._setValue_direct_setNeedsUpdate,wt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[wt.prototype._setValue_array,wt.prototype._setValue_array_setNeedsUpdate,wt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[wt.prototype._setValue_arrayElement,wt.prototype._setValue_arrayElement_setNeedsUpdate,wt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[wt.prototype._setValue_fromArray,wt.prototype._setValue_fromArray_setNeedsUpdate,wt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];x3=new Float32Array(1),R0=class n{static{n.prototype.isMatrix2=!0}constructor(e,t,i,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,r){let s=this.elements;return s[0]=e,s[2]=t,s[1]=i,s[3]=r,this}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?ke("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186")});function G1(){let n=null,e=!1,t=null,i=null;function r(s,o){i=n.requestAnimationFrame(r),t(s,o)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){n=s}}}function JA(n){let e=new WeakMap;function t(a,l){let c=a.array,u=a.usage,d=c.byteLength,h=n.createBuffer();n.bindBuffer(l,h),n.bufferData(l,c,u),a.onUploadCallback();let p;if(c instanceof Float32Array)p=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=n.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=n.HALF_FLOAT:p=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=n.SHORT;else if(c instanceof Uint32Array)p=n.UNSIGNED_INT;else if(c instanceof Int32Array)p=n.INT;else if(c instanceof Int8Array)p=n.BYTE;else if(c instanceof Uint8Array)p=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:d}}function i(a,l,c){let u=l.array,d=l.updateRanges;if(n.bindBuffer(c,a),d.length===0)n.bufferSubData(c,0,u);else{d.sort((p,g)=>p.start-g.start);let h=0;for(let p=1;p<d.length;p++){let g=d[h],_=d[p];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++h,d[h]=_)}d.length=h+1;for(let p=0,g=d.length;p<g;p++){let _=d[p];n.bufferSubData(c,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:r,remove:s,update:o}}function LP(n,e,t,i,r,s){let o=new rt(0),a=r===!0?0:1,l,c,u=null,d=0,h=null;function p(v){let M=v.isScene===!0?v.background:null;if(M&&M.isTexture){let y=v.backgroundBlurriness>0;M=e.get(M,y)}return M}function g(v){let M=!1,y=p(v);y===null?m(o,a):y&&y.isColor&&(m(y,1),M=!0);let w=n.xr.getEnvironmentBlendMode();w==="additive"?t.buffers.color.setClear(0,0,0,1,s):w==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,s),(n.autoClear||M)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function _(v,M){let y=p(M);y&&(y.isCubeTexture||y.mapping===Bc)?(c===void 0&&(c=new Un(new qa(1,1,1),new Fn({name:"BackgroundCubeMaterial",uniforms:Po(xr.backgroundCube.uniforms),vertexShader:xr.backgroundCube.vertexShader,fragmentShader:xr.backgroundCube.fragmentShader,side:On,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(w,E,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(IP.makeRotationFromEuler(M.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(H1),c.material.toneMapped=Qe.getTransfer(y.colorSpace)!==ut,(u!==y||d!==y.version||h!==n.toneMapping)&&(c.material.needsUpdate=!0,u=y,d=y.version,h=n.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new Un(new Ns(2,2),new Fn({name:"BackgroundMaterial",uniforms:Po(xr.background.uniforms),vertexShader:xr.background.vertexShader,fragmentShader:xr.background.fragmentShader,side:ks,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.toneMapped=Qe.getTransfer(y.colorSpace)!==ut,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(u!==y||d!==y.version||h!==n.toneMapping)&&(l.material.needsUpdate=!0,u=y,d=y.version,h=n.toneMapping),l.layers.enableAll(),v.unshift(l,l.geometry,l.material,0,0,null))}function m(v,M){v.getRGB(Cd,t_(n)),t.buffers.color.setClear(Cd.r,Cd.g,Cd.b,M,s)}function f(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(v,M=1){o.set(v),a=M,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(v){a=v,m(o,a)},render:g,addToRenderList:_,dispose:f}}function DP(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},r=h(null),s=r,o=!1;function a(L,D,B,I,O){let Y=!1,H=d(L,I,B,D);s!==H&&(s=H,c(s.object)),Y=p(L,I,B,O),Y&&g(L,I,B,O),O!==null&&e.update(O,n.ELEMENT_ARRAY_BUFFER),(Y||o)&&(o=!1,y(L,D,B,I),O!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function l(){return n.createVertexArray()}function c(L){return n.bindVertexArray(L)}function u(L){return n.deleteVertexArray(L)}function d(L,D,B,I){let O=I.wireframe===!0,Y=i[D.id];Y===void 0&&(Y={},i[D.id]=Y);let H=L.isInstancedMesh===!0?L.id:0,ne=Y[H];ne===void 0&&(ne={},Y[H]=ne);let Z=ne[B.id];Z===void 0&&(Z={},ne[B.id]=Z);let te=Z[O];return te===void 0&&(te=h(l()),Z[O]=te),te}function h(L){let D=[],B=[],I=[];for(let O=0;O<t;O++)D[O]=0,B[O]=0,I[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:D,enabledAttributes:B,attributeDivisors:I,object:L,attributes:{},index:null}}function p(L,D,B,I){let O=s.attributes,Y=D.attributes,H=0,ne=B.getAttributes();for(let Z in ne)if(ne[Z].location>=0){let re=O[Z],Te=Y[Z];if(Te===void 0&&(Z==="instanceMatrix"&&L.instanceMatrix&&(Te=L.instanceMatrix),Z==="instanceColor"&&L.instanceColor&&(Te=L.instanceColor)),re===void 0||re.attribute!==Te||Te&&re.data!==Te.data)return!0;H++}return s.attributesNum!==H||s.index!==I}function g(L,D,B,I){let O={},Y=D.attributes,H=0,ne=B.getAttributes();for(let Z in ne)if(ne[Z].location>=0){let re=Y[Z];re===void 0&&(Z==="instanceMatrix"&&L.instanceMatrix&&(re=L.instanceMatrix),Z==="instanceColor"&&L.instanceColor&&(re=L.instanceColor));let Te={};Te.attribute=re,re&&re.data&&(Te.data=re.data),O[Z]=Te,H++}s.attributes=O,s.attributesNum=H,s.index=I}function _(){let L=s.newAttributes;for(let D=0,B=L.length;D<B;D++)L[D]=0}function m(L){f(L,0)}function f(L,D){let B=s.newAttributes,I=s.enabledAttributes,O=s.attributeDivisors;B[L]=1,I[L]===0&&(n.enableVertexAttribArray(L),I[L]=1),O[L]!==D&&(n.vertexAttribDivisor(L,D),O[L]=D)}function v(){let L=s.newAttributes,D=s.enabledAttributes;for(let B=0,I=D.length;B<I;B++)D[B]!==L[B]&&(n.disableVertexAttribArray(B),D[B]=0)}function M(L,D,B,I,O,Y,H){H===!0?n.vertexAttribIPointer(L,D,B,O,Y):n.vertexAttribPointer(L,D,B,I,O,Y)}function y(L,D,B,I){_();let O=I.attributes,Y=B.getAttributes(),H=D.defaultAttributeValues;for(let ne in Y){let Z=Y[ne];if(Z.location>=0){let te=O[ne];if(te===void 0&&(ne==="instanceMatrix"&&L.instanceMatrix&&(te=L.instanceMatrix),ne==="instanceColor"&&L.instanceColor&&(te=L.instanceColor)),te!==void 0){let re=te.normalized,Te=te.itemSize,fe=e.get(te);if(fe===void 0)continue;let Ue=fe.buffer,Oe=fe.type,We=fe.bytesPerElement,j=Oe===n.INT||Oe===n.UNSIGNED_INT||te.gpuType===Wf;if(te.isInterleavedBufferAttribute){let ie=te.data,ye=ie.stride,Fe=te.offset;if(ie.isInstancedInterleavedBuffer){for(let _e=0;_e<Z.locationSize;_e++)f(Z.location+_e,ie.meshPerAttribute);L.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let _e=0;_e<Z.locationSize;_e++)m(Z.location+_e);n.bindBuffer(n.ARRAY_BUFFER,Ue);for(let _e=0;_e<Z.locationSize;_e++)M(Z.location+_e,Te/Z.locationSize,Oe,re,ye*We,(Fe+Te/Z.locationSize*_e)*We,j)}else{if(te.isInstancedBufferAttribute){for(let ie=0;ie<Z.locationSize;ie++)f(Z.location+ie,te.meshPerAttribute);L.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let ie=0;ie<Z.locationSize;ie++)m(Z.location+ie);n.bindBuffer(n.ARRAY_BUFFER,Ue);for(let ie=0;ie<Z.locationSize;ie++)M(Z.location+ie,Te/Z.locationSize,Oe,re,Te*We,Te/Z.locationSize*ie*We,j)}}else if(H!==void 0){let re=H[ne];if(re!==void 0)switch(re.length){case 2:n.vertexAttrib2fv(Z.location,re);break;case 3:n.vertexAttrib3fv(Z.location,re);break;case 4:n.vertexAttrib4fv(Z.location,re);break;default:n.vertexAttrib1fv(Z.location,re)}}}}v()}function w(){b();for(let L in i){let D=i[L];for(let B in D){let I=D[B];for(let O in I){let Y=I[O];for(let H in Y)u(Y[H].object),delete Y[H];delete I[O]}}delete i[L]}}function E(L){if(i[L.id]===void 0)return;let D=i[L.id];for(let B in D){let I=D[B];for(let O in I){let Y=I[O];for(let H in Y)u(Y[H].object),delete Y[H];delete I[O]}}delete i[L.id]}function A(L){for(let D in i){let B=i[D];for(let I in B){let O=B[I];if(O[L.id]===void 0)continue;let Y=O[L.id];for(let H in Y)u(Y[H].object),delete Y[H];delete O[L.id]}}}function x(L){for(let D in i){let B=i[D],I=L.isInstancedMesh===!0?L.id:0,O=B[I];if(O!==void 0){for(let Y in O){let H=O[Y];for(let ne in H)u(H[ne].object),delete H[ne];delete O[Y]}delete B[I],Object.keys(B).length===0&&delete i[D]}}}function b(){P(),o=!0,s!==r&&(s=r,c(s.object))}function P(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:b,resetDefaultState:P,dispose:w,releaseStatesOfGeometry:E,releaseStatesOfObject:x,releaseStatesOfProgram:A,initAttributes:_,enableAttribute:m,disableUnusedAttributes:v}}function NP(n,e,t){let i;function r(l){i=l}function s(l,c){n.drawArrays(i,l,c),t.update(c,i,1)}function o(l,c,u){u!==0&&(n.drawArraysInstanced(i,l,c,u),t.update(c,i,u))}function a(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,u);let h=0;for(let p=0;p<u;p++)h+=c[p];t.update(h,i,1)}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a}function UP(n,e,t,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){let A=e.get("EXT_texture_filter_anisotropic");r=n.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(A){return!(A!==jn&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){let x=A===$i&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==di&&A!==Zi&&!x&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE))}function l(A){if(A==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(ke("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let d=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&h===!1&&ke("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let p=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),f=n.getParameter(n.MAX_VERTEX_ATTRIBS),v=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),M=n.getParameter(n.MAX_VARYING_VECTORS),y=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),w=n.getParameter(n.MAX_SAMPLES),E=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:h,maxTextures:p,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:v,maxVaryings:M,maxFragmentUniforms:y,maxSamples:w,samples:E}}function FP(n){let e=this,t=null,i=0,r=!1,s=!1,o=new Wi,a=new Ge,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,h){let p=d.length!==0||h||i!==0||r;return r=h,i=d.length,p},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(d,h){t=u(d,h,0)},this.setState=function(d,h,p){let g=d.clippingPlanes,_=d.clipIntersection,m=d.clipShadows,f=n.get(d);if(!r||g===null||g.length===0||s&&!m)s?u(null):c();else{let v=s?0:i,M=v*4,y=f.clippingState||null;l.value=y,y=u(g,h,M,p);for(let w=0;w!==M;++w)y[w]=t[w];f.clippingState=y,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(d,h,p,g){let _=d!==null?d.length:0,m=null;if(_!==0){if(m=l.value,g!==!0||m===null){let f=p+_*4,v=h.matrixWorldInverse;a.getNormalMatrix(v),(m===null||m.length<f)&&(m=new Float32Array(f));for(let M=0,y=p;M!==_;++M,y+=4)o.copy(d[M]).applyMatrix4(v,a),o.normal.toArray(m,y),m[y+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function VP(n){let e=[],t=[],i=n,r=n-Qa+1+OP;for(let s=0;s<r;s++){let o=Math.pow(2,i);e.push(o);let a=1/(o-2),l=-a,c=1+a,u=[l,l,c,l,c,c,l,l,c,c,l,c],d=6,h=6,p=3,g=new Float32Array(p*h*d),_=new Float32Array(p*h*d);for(let f=0;f<d;f++){let v=f%3*2/3-1,M=f>2?0:-1,y=[v,M,0,v+2/3,M,0,v+2/3,M+1,0,v,M,0,v+2/3,M+1,0,v,M+1,0];g.set(y,p*h*f);for(let w=0;w<h;w++){let E=u[w*2]*2-1,A=u[w*2+1]*2-1;f===0?Io.set(1,A,E):f===1?Io.set(-E,1,-A):f===2?Io.set(-E,A,1):f===3?Io.set(-1,A,-E):f===4?Io.set(-E,-1,A):Io.set(E,A,-1),Io.toArray(_,(f*h+w)*p)}}let m=new pr;m.setAttribute("position",new bi(g,p)),m.setAttribute("outputDirection",new bi(_,p)),t.push(new Un(m,null)),i>Qa&&i--}return{lodMeshes:t,sizeLods:e}}function M1(n,e,t){let i=new Tn(n,e,t);return i.texture.mapping=Bc,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function ja(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function GP(n,e,t){return new Fn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:kP,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Dd(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:gr,depthTest:!1,depthWrite:!1})}function HP(n,e,t){return new Fn({name:"SphericalGaussianBlur",defines:{SAMPLES:BP,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Dd(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:gr,depthTest:!1,depthWrite:!1})}function w1(){return new Fn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Dd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:gr,depthTest:!1,depthWrite:!1})}function E1(){return new Fn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Dd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:gr,depthTest:!1,depthWrite:!1})}function Dd(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}function WP(n){let e=new WeakMap,t=new WeakMap,i=null;function r(h,p=!1){return h==null?null:p?o(h):s(h)}function s(h){if(h&&h.isTexture){let p=h.mapping;if(p===Vf||p===Gf)if(e.has(h)){let g=e.get(h).texture;return a(g,h.mapping)}else{let g=h.image;if(g&&g.height>0){let _=new Id(g.height);return _.fromEquirectangularTexture(n,h),e.set(h,_),h.addEventListener("dispose",c),a(_.texture,h.mapping)}else return null}}return h}function o(h){if(h&&h.isTexture){let p=h.mapping,g=p===Vf||p===Gf,_=p===zs||p===Ro;if(g||_){let m=t.get(h),f=m!==void 0?m.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==f)return i===null&&(i=new Pd(n)),m=g?i.fromEquirectangular(h,m):i.fromCubemap(h,m),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),m.texture;if(m!==void 0)return m.texture;{let v=h.image;return g&&v&&v.height>0||_&&v&&l(v)?(i===null&&(i=new Pd(n)),m=g?i.fromEquirectangular(h):i.fromCubemap(h),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),h.addEventListener("dispose",u),m.texture):null}}}return h}function a(h,p){return p===Vf?h.mapping=zs:p===Gf&&(h.mapping=Ro),h}function l(h){let p=0,g=6;for(let _=0;_<g;_++)h[_]!==void 0&&p++;return p===g}function c(h){let p=h.target;p.removeEventListener("dispose",c);let g=e.get(p);g!==void 0&&(e.delete(p),g.dispose())}function u(h){let p=h.target;p.removeEventListener("dispose",u);let g=t.get(p);g!==void 0&&(t.delete(p),g.dispose())}function d(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:r,dispose:d}}function XP(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let r=n.getExtension(i);return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let r=t(i);return r===null&&To("WebGLRenderer: "+i+" extension not supported."),r}}}function qP(n,e,t,i){let r={},s=new WeakMap;function o(d){let h=d.target;h.index!==null&&e.remove(h.index);for(let g in h.attributes)e.remove(h.attributes[g]);h.removeEventListener("dispose",o),delete r[h.id];let p=s.get(h);p&&(e.remove(p),s.delete(h)),i.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function a(d,h){return r[h.id]===!0||(h.addEventListener("dispose",o),r[h.id]=!0,t.memory.geometries++),h}function l(d){let h=d.attributes;for(let p in h)e.update(h[p],n.ARRAY_BUFFER)}function c(d){let h=[],p=d.index,g=d.attributes.position,_=0;if(g===void 0)return;if(p!==null){let v=p.array;_=p.version;for(let M=0,y=v.length;M<y;M+=3){let w=v[M+0],E=v[M+1],A=v[M+2];h.push(w,E,E,A,A,w)}}else{let v=g.array;_=g.version;for(let M=0,y=v.length/3-1;M<y;M+=3){let w=M+0,E=M+1,A=M+2;h.push(w,E,E,A,A,w)}}let m=new(g.count>=65535?Rc:Cc)(h,1);m.version=_;let f=s.get(d);f&&e.remove(f),s.set(d,m)}function u(d){let h=s.get(d);if(h){let p=d.index;p!==null&&h.version<p.version&&c(d)}else c(d);return s.get(d)}return{get:a,update:l,getWireframeAttribute:u}}function YP(n,e,t){let i;function r(d){i=d}let s,o;function a(d){s=d.type,o=d.bytesPerElement}function l(d,h){n.drawElements(i,h,s,d*o),t.update(h,i,1)}function c(d,h,p){p!==0&&(n.drawElementsInstanced(i,h,s,d*o,p),t.update(h,i,p))}function u(d,h,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,h,0,s,d,0,p);let _=0;for(let m=0;m<p;m++)_+=h[m];t.update(_,i,1)}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function ZP(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(s/3);break;case n.LINES:t.lines+=a*(s/2);break;case n.LINE_STRIP:t.lines+=a*(s-1);break;case n.LINE_LOOP:t.lines+=a*s;break;case n.POINTS:t.points+=a*s;break;default:Ve("WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function $P(n,e,t){let i=new WeakMap,r=new Ut;function s(o,a,l){let c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=u!==void 0?u.length:0,h=i.get(a);if(h===void 0||h.count!==d){let b=function(){A.dispose(),i.delete(a),a.removeEventListener("dispose",b)};h!==void 0&&h.texture.dispose();let p=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],f=a.morphAttributes.normal||[],v=a.morphAttributes.color||[],M=0;p===!0&&(M=1),g===!0&&(M=2),_===!0&&(M=3);let y=a.attributes.position.count*M,w=1;y>e.maxTextureSize&&(w=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let E=new Float32Array(y*w*4*d),A=new bc(E,y,w,d);A.type=Zi,A.needsUpdate=!0;let x=M*4;for(let P=0;P<d;P++){let L=m[P],D=f[P],B=v[P],I=y*w*4*P;for(let O=0;O<L.count;O++){let Y=O*x;p===!0&&(r.fromBufferAttribute(L,O),E[I+Y+0]=r.x,E[I+Y+1]=r.y,E[I+Y+2]=r.z,E[I+Y+3]=0),g===!0&&(r.fromBufferAttribute(D,O),E[I+Y+4]=r.x,E[I+Y+5]=r.y,E[I+Y+6]=r.z,E[I+Y+7]=0),_===!0&&(r.fromBufferAttribute(B,O),E[I+Y+8]=r.x,E[I+Y+9]=r.y,E[I+Y+10]=r.z,E[I+Y+11]=B.itemSize===4?r.w:1)}}h={count:d,texture:A,size:new it(y,w)},i.set(a,h),a.addEventListener("dispose",b)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let p=0;for(let _=0;_<c.length;_++)p+=c[_];let g=a.morphTargetsRelative?1:1-p;l.getUniforms().setValue(n,"morphTargetBaseInfluence",g),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",h.size)}return{update:s}}function JP(n,e,t,i,r){let s=new WeakMap;function o(c){let u=r.render.frame,d=c.geometry,h=e.get(c,d);if(s.get(h)!==u&&(e.update(h),s.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),s.get(c)!==u&&(t.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,n.ARRAY_BUFFER),s.set(c,u))),c.isSkinnedMesh){let p=c.skeleton;s.get(p)!==u&&(p.update(),s.set(p,u))}return h}function a(){s=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),i.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:o,dispose:a}}function jP(n,e,t,i,r,s){let o=new Tn(e,t,{type:n,depthBuffer:r,stencilBuffer:s,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=new pr;c.setAttribute("position",new Ai([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Ai([0,2,0,0,2,0],2));let u=new bf({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new Un(c,u),h=new Bs(-1,1,1,-1,0,1),p=null,g=null,_=!1,m,f=null,v=[],M=!1;this.setSize=function(y,w){o.setSize(y,w),a!==null&&a.setSize(y,w),l!==null&&l.setSize(y,w);for(let E=0;E<v.length;E++){let A=v[E];A.setSize&&A.setSize(y,w)}},this.setEffects=function(y){v=y,M=v.length>0&&v[0].isRenderPass===!0;let w=o.width,E=o.height;v.length>0&&a===null&&(a=new Tn(w,E,{type:$i,depthBuffer:!1,stencilBuffer:!1}),l=new Tn(w,E,{type:$i,depthBuffer:!1,stencilBuffer:!1}));for(let A=0;A<v.length;A++){let x=v[A];x.setSize&&x.setSize(w,E)}},this.begin=function(y,w){if(_||y.toneMapping===qi&&v.length===0)return!1;if(f=w,w!==null){let E=w.width,A=w.height;(o.width!==E||o.height!==A)&&this.setSize(E,A)}return M===!1&&y.setRenderTarget(o),m=y.toneMapping,y.toneMapping=qi,!0},this.hasRenderPass=function(){return M},this.end=function(y,w){y.toneMapping=m,_=!0;let E=o,A=a;for(let x=0;x<v.length;x++){let b=v[x];b.enabled!==!1&&(b.render(y,A,E,w),b.needsSwap!==!1&&(E=A,A=A===a?l:a))}if(p!==y.outputColorSpace||g!==y.toneMapping){p=y.outputColorSpace,g=y.toneMapping,u.defines={},Qe.getTransfer(p)===ut&&(u.defines.SRGB_TRANSFER="");let x=KP[g];x&&(u.defines[x]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=E.texture,y.setRenderTarget(f),y.render(d,h),f=null,_=!1},this.isCompositing=function(){return _},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),u.dispose()}}function tl(n,e,t){let i=n[0];if(i<=0||i>0)return n;let r=e*t,s=T1[r];if(s===void 0&&(s=new Float32Array(r),T1[r]=s),e!==0){i.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(s,a)}return s}function Kt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function jt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Nd(n,e){let t=b1[e];t===void 0&&(t=new Int32Array(e),b1[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function QP(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function e2(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Kt(t,e))return;n.uniform2fv(this.addr,e),jt(t,e)}}function t2(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Kt(t,e))return;n.uniform3fv(this.addr,e),jt(t,e)}}function n2(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Kt(t,e))return;n.uniform4fv(this.addr,e),jt(t,e)}}function i2(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Kt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),jt(t,e)}else{if(Kt(t,i))return;R1.set(i),n.uniformMatrix2fv(this.addr,!1,R1),jt(t,i)}}function r2(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Kt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),jt(t,e)}else{if(Kt(t,i))return;C1.set(i),n.uniformMatrix3fv(this.addr,!1,C1),jt(t,i)}}function s2(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Kt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),jt(t,e)}else{if(Kt(t,i))return;A1.set(i),n.uniformMatrix4fv(this.addr,!1,A1),jt(t,i)}}function o2(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function a2(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Kt(t,e))return;n.uniform2iv(this.addr,e),jt(t,e)}}function l2(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Kt(t,e))return;n.uniform3iv(this.addr,e),jt(t,e)}}function c2(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Kt(t,e))return;n.uniform4iv(this.addr,e),jt(t,e)}}function u2(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function h2(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Kt(t,e))return;n.uniform2uiv(this.addr,e),jt(t,e)}}function f2(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Kt(t,e))return;n.uniform3uiv(this.addr,e),jt(t,e)}}function d2(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Kt(t,e))return;n.uniform4uiv(this.addr,e),jt(t,e)}}function p2(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let s;this.type===n.SAMPLER_2D_SHADOW?(f_.compareFunction=t.isReversedDepthBuffer()?Ad:bd,s=f_):s=W1,t.setTexture2D(e||s,r)}function m2(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||q1,r)}function g2(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||Y1,r)}function _2(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||X1,r)}function v2(n){switch(n){case 5126:return QP;case 35664:return e2;case 35665:return t2;case 35666:return n2;case 35674:return i2;case 35675:return r2;case 35676:return s2;case 5124:case 35670:return o2;case 35667:case 35671:return a2;case 35668:case 35672:return l2;case 35669:case 35673:return c2;case 5125:return u2;case 36294:return h2;case 36295:return f2;case 36296:return d2;case 35678:case 36198:case 36298:case 36306:case 35682:return p2;case 35679:case 36299:case 36307:return m2;case 35680:case 36300:case 36308:case 36293:return g2;case 36289:case 36303:case 36311:case 36292:return _2}}function x2(n,e){n.uniform1fv(this.addr,e)}function y2(n,e){let t=tl(e,this.size,2);n.uniform2fv(this.addr,t)}function S2(n,e){let t=tl(e,this.size,3);n.uniform3fv(this.addr,t)}function M2(n,e){let t=tl(e,this.size,4);n.uniform4fv(this.addr,t)}function w2(n,e){let t=tl(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function E2(n,e){let t=tl(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function T2(n,e){let t=tl(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function b2(n,e){n.uniform1iv(this.addr,e)}function A2(n,e){n.uniform2iv(this.addr,e)}function C2(n,e){n.uniform3iv(this.addr,e)}function R2(n,e){n.uniform4iv(this.addr,e)}function P2(n,e){n.uniform1uiv(this.addr,e)}function I2(n,e){n.uniform2uiv(this.addr,e)}function L2(n,e){n.uniform3uiv(this.addr,e)}function D2(n,e){n.uniform4uiv(this.addr,e)}function N2(n,e,t){let i=this.cache,r=e.length,s=Nd(t,r);Kt(i,s)||(n.uniform1iv(this.addr,s),jt(i,s));let o;this.type===n.SAMPLER_2D_SHADOW?o=f_:o=W1;for(let a=0;a!==r;++a)t.setTexture2D(e[a]||o,s[a])}function U2(n,e,t){let i=this.cache,r=e.length,s=Nd(t,r);Kt(i,s)||(n.uniform1iv(this.addr,s),jt(i,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||q1,s[o])}function F2(n,e,t){let i=this.cache,r=e.length,s=Nd(t,r);Kt(i,s)||(n.uniform1iv(this.addr,s),jt(i,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||Y1,s[o])}function O2(n,e,t){let i=this.cache,r=e.length,s=Nd(t,r);Kt(i,s)||(n.uniform1iv(this.addr,s),jt(i,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||X1,s[o])}function B2(n){switch(n){case 5126:return x2;case 35664:return y2;case 35665:return S2;case 35666:return M2;case 35674:return w2;case 35675:return E2;case 35676:return T2;case 5124:case 35670:return b2;case 35667:case 35671:return A2;case 35668:case 35672:return C2;case 35669:case 35673:return R2;case 5125:return P2;case 36294:return I2;case 36295:return L2;case 36296:return D2;case 35678:case 36198:case 36298:case 36306:case 35682:return N2;case 35679:case 36299:case 36307:return U2;case 35680:case 36300:case 36308:case 36293:return F2;case 36289:case 36303:case 36311:case 36292:return O2}}function P1(n,e){n.seq.push(e),n.map[e.id]=e}function k2(n,e,t){let i=n.name,r=i.length;for(u_.lastIndex=0;;){let s=u_.exec(i),o=u_.lastIndex,a=s[1],l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){P1(t,c===void 0?new d_(a,n,e):new p_(a,n,e));break}else{let d=t.map[a];d===void 0&&(d=new m_(a),P1(t,d)),t=d}}}function I1(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}function G2(n,e){let t=n.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}function H2(n){Qe._getMatrix(L1,Qe.workingColorSpace,n);let e=`mat3( ${L1.elements.map(t=>t.toFixed(4))} )`;switch(Qe.getTransfer(n)){case Ec:return[e,"LinearTransferOETF"];case ut:return[e,"sRGBTransferOETF"];default:return ke("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function D1(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),s=(n.getShaderInfoLog(e)||"").trim();if(i&&s==="")return"";let o=/ERROR: 0:(\d+)/.exec(s);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+s+`

`+G2(n.getShaderSource(e),a)}else return s}function W2(n,e){let t=H2(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function q2(n,e){let t=X2[e];return t===void 0?(ke("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function Y2(){Qe.getLuminanceCoefficients(Rd);let n=Rd.x.toFixed(4),e=Rd.y.toFixed(4),t=Rd.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Z2(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter($c).join(`
`)}function $2(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function J2(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){let s=n.getActiveAttrib(e,r),o=s.name,a=1;s.type===n.FLOAT_MAT2&&(a=2),s.type===n.FLOAT_MAT3&&(a=3),s.type===n.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function $c(n){return n!==""}function N1(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function U1(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}function g_(n){return n.replace(K2,Q2)}function Q2(n,e){let t=Xe[e];if(t===void 0){let i=j2.get(e);if(i!==void 0)t=Xe[i],ke('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return g_(t)}function F1(n){return n.replace(eI,tI)}function tI(n,e,t,i){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function O1(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function iI(n){return nI[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}function sI(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":rI[n.envMapMode]||"ENVMAP_TYPE_CUBE"}function aI(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":oI[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}function cI(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":lI[n.combine]||"ENVMAP_BLENDING_NONE"}function uI(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function hI(n,e,t,i){let r=n.getContext(),s=t.defines,o=t.vertexShader,a=t.fragmentShader,l=iI(t),c=sI(t),u=aI(t),d=cI(t),h=uI(t),p=Z2(t),g=$2(s),_=r.createProgram(),m,f,v=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter($c).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter($c).join(`
`),f.length>0&&(f+=`
`)):(m=[O1(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter($c).join(`
`),f=[O1(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==qi?"#define TONE_MAPPING":"",t.toneMapping!==qi?Xe.tonemapping_pars_fragment:"",t.toneMapping!==qi?q2("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Xe.colorspace_pars_fragment,W2("linearToOutputTexel",t.outputColorSpace),Y2(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter($c).join(`
`)),o=g_(o),o=N1(o,t),o=U1(o,t),a=g_(a),a=N1(a,t),a=U1(a,t),o=F1(o),a=F1(a),t.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",t.glslVersion===Q0?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Q0?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let M=v+m+o,y=v+f+a,w=I1(r,r.VERTEX_SHADER,M),E=I1(r,r.FRAGMENT_SHADER,y);r.attachShader(_,w),r.attachShader(_,E),t.index0AttributeName!==void 0?r.bindAttribLocation(_,0,t.index0AttributeName):t.hasPositionAttribute===!0&&r.bindAttribLocation(_,0,"position"),r.linkProgram(_);function A(L){if(n.debug.checkShaderErrors){let D=r.getProgramInfoLog(_)||"",B=r.getShaderInfoLog(w)||"",I=r.getShaderInfoLog(E)||"",O=D.trim(),Y=B.trim(),H=I.trim(),ne=!0,Z=!0;if(r.getProgramParameter(_,r.LINK_STATUS)===!1)if(ne=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,_,w,E);else{let te=D1(r,w,"vertex"),re=D1(r,E,"fragment");Ve("WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(_,r.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+O+`
`+te+`
`+re)}else O!==""?ke("WebGLProgram: Program Info Log:",O):(Y===""||H==="")&&(Z=!1);Z&&(L.diagnostics={runnable:ne,programLog:O,vertexShader:{log:Y,prefix:m},fragmentShader:{log:H,prefix:f}})}r.deleteShader(w),r.deleteShader(E),x=new el(r,_),b=J2(r,_)}let x;this.getUniforms=function(){return x===void 0&&A(this),x};let b;this.getAttributes=function(){return b===void 0&&A(this),b};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=r.getProgramParameter(_,z2)),P},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=V2++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=w,this.fragmentShader=E,this}function dI(n){return n===Gs||n===Wc||n===Xc}function pI(n,e,t,i,r,s){let o=new Ac,a=new __,l=new Set,c=[],u=new Map,d=i.logarithmicDepthBuffer,h=i.precision,p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return l.add(x),x===0?"uv":`uv${x}`}function _(x,b,P,L,D,B){let I=L.fog,O=D.geometry,Y=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?L.environment:null,H=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,ne=e.get(x.envMap||Y,H),Z=ne&&ne.mapping===Bc?ne.image.height:null,te=p[x.type];x.precision!==null&&(h=i.getMaxPrecision(x.precision),h!==x.precision&&ke("WebGLProgram.getParameters:",x.precision,"not supported, using",h,"instead."));let re=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,Te=re!==void 0?re.length:0,fe=0;O.morphAttributes.position!==void 0&&(fe=1),O.morphAttributes.normal!==void 0&&(fe=2),O.morphAttributes.color!==void 0&&(fe=3);let Ue,Oe,We,j;if(te){let ft=xr[te];Ue=ft.vertexShader,Oe=ft.fragmentShader}else{Ue=x.vertexShader,Oe=x.fragmentShader;let ft=a.getVertexShaderStage(x),et=a.getFragmentShaderStage(x);a.update(x,ft,et),We=ft.id,j=et.id}let ie=n.getRenderTarget(),ye=n.state.buffers.depth.getReversed(),Fe=D.isInstancedMesh===!0,_e=D.isBatchedMesh===!0,He=!!x.map,Ft=!!x.matcap,qe=!!ne,Be=!!x.aoMap,ht=!!x.lightMap,Ye=!!x.bumpMap&&x.wireframe===!1,Ne=!!x.normalMap,Ct=!!x.displacementMap,Ot=!!x.emissiveMap,Ke=!!x.metalnessMap,xt=!!x.roughnessMap,F=x.anisotropy>0,yt=x.clearcoat>0,$e=x.dispersion>0,C=x.retroreflectivity>0,S=x.iridescence>0,k=x.sheen>0,z=x.transmission>0,J=F&&!!x.anisotropyMap,le=yt&&!!x.clearcoatMap,de=yt&&!!x.clearcoatNormalMap,W=yt&&!!x.clearcoatRoughnessMap,Q=S&&!!x.iridescenceMap,ue=S&&!!x.iridescenceThicknessMap,Pe=k&&!!x.sheenColorMap,ge=k&&!!x.sheenRoughnessMap,he=!!x.specularMap,Ae=!!x.specularColorMap,De=!!x.specularIntensityMap,ze=z&&!!x.transmissionMap,U=z&&!!x.thicknessMap,pe=!!x.gradientMap,ee=!!x.alphaMap,me=x.alphaTest>0,Se=!!x.alphaHash,se=!!x.extensions,Ie=qi;x.toneMapped&&(ie===null||ie.isXRRenderTarget===!0)&&(Ie=n.toneMapping);let Ce={shaderID:te,shaderType:x.type,shaderName:x.name,vertexShader:Ue,fragmentShader:Oe,defines:x.defines,customVertexShaderID:We,customFragmentShaderID:j,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:h,batching:_e,batchingColor:_e&&D._colorsTexture!==null,instancing:Fe,instancingColor:Fe&&D.instanceColor!==null,instancingMorph:Fe&&D.morphTexture!==null,outputColorSpace:ie===null?n.outputColorSpace:ie.isXRRenderTarget===!0?ie.texture.colorSpace:Qe.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:He,matcap:Ft,envMap:qe,envMapMode:qe&&ne.mapping,envMapCubeUVHeight:Z,aoMap:Be,lightMap:ht,bumpMap:Ye,normalMap:Ne,displacementMap:Ct,emissiveMap:Ot,normalMapObjectSpace:Ne&&x.normalMapType===r1,normalMapTangentSpace:Ne&&x.normalMapType===j0,packedNormalMap:Ne&&x.normalMapType===j0&&dI(x.normalMap.format),metalnessMap:Ke,roughnessMap:xt,anisotropy:F,anisotropyMap:J,clearcoat:yt,clearcoatMap:le,clearcoatNormalMap:de,clearcoatRoughnessMap:W,dispersion:$e,retroreflection:C,iridescence:S,iridescenceMap:Q,iridescenceThicknessMap:ue,sheen:k,sheenColorMap:Pe,sheenRoughnessMap:ge,specularMap:he,specularColorMap:Ae,specularIntensityMap:De,transmission:z,transmissionMap:ze,thicknessMap:U,gradientMap:pe,opaque:x.transparent===!1&&x.blending===$a&&x.alphaToCoverage===!1,alphaMap:ee,alphaTest:me,alphaHash:Se,combine:x.combine,mapUv:He&&g(x.map.channel),aoMapUv:Be&&g(x.aoMap.channel),lightMapUv:ht&&g(x.lightMap.channel),bumpMapUv:Ye&&g(x.bumpMap.channel),normalMapUv:Ne&&g(x.normalMap.channel),displacementMapUv:Ct&&g(x.displacementMap.channel),emissiveMapUv:Ot&&g(x.emissiveMap.channel),metalnessMapUv:Ke&&g(x.metalnessMap.channel),roughnessMapUv:xt&&g(x.roughnessMap.channel),anisotropyMapUv:J&&g(x.anisotropyMap.channel),clearcoatMapUv:le&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:de&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:W&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:Q&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:ue&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:Pe&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:ge&&g(x.sheenRoughnessMap.channel),specularMapUv:he&&g(x.specularMap.channel),specularColorMapUv:Ae&&g(x.specularColorMap.channel),specularIntensityMapUv:De&&g(x.specularIntensityMap.channel),transmissionMapUv:ze&&g(x.transmissionMap.channel),thicknessMapUv:U&&g(x.thicknessMap.channel),alphaMapUv:ee&&g(x.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(Ne||F),vertexNormals:!!O.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:D.isPoints===!0&&!!O.attributes.uv&&(He||ee),fog:!!I,useFog:x.fog===!0,fogExp2:!!I&&I.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||O.attributes.normal===void 0&&Ne===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ye,skinning:D.isSkinnedMesh===!0,hasPositionAttribute:O.attributes.position!==void 0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:Te,morphTextureStride:fe,numSunLights:b.sun.length,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numSunLightShadows:b.sunShadowMap.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numLightProbeGrids:B.length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:x.dithering,shadowMapEnabled:n.shadowMap.enabled&&P.length>0,shadowMapType:n.shadowMap.type,toneMapping:Ie,decodeVideoTexture:He&&x.map.isVideoTexture===!0&&Qe.getTransfer(x.map.colorSpace)===ut,decodeVideoTextureEmissive:Ot&&x.emissiveMap.isVideoTexture===!0&&Qe.getTransfer(x.emissiveMap.colorSpace)===ut,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===mr,flipSided:x.side===On,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:se&&x.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(se&&x.extensions.multiDraw===!0||_e)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Ce.vertexUv1s=l.has(1),Ce.vertexUv2s=l.has(2),Ce.vertexUv3s=l.has(3),l.clear(),Ce}function m(x){let b=[];if(x.shaderID?b.push(x.shaderID):(b.push(x.customVertexShaderID),b.push(x.customFragmentShaderID)),x.defines!==void 0)for(let P in x.defines)b.push(P),b.push(x.defines[P]);return x.isRawShaderMaterial===!1&&(f(b,x),v(b,x),b.push(n.outputColorSpace)),b.push(x.customProgramCacheKey),b.join()}function f(x,b){x.push(b.precision),x.push(b.outputColorSpace),x.push(b.envMapMode),x.push(b.envMapCubeUVHeight),x.push(b.mapUv),x.push(b.alphaMapUv),x.push(b.lightMapUv),x.push(b.aoMapUv),x.push(b.bumpMapUv),x.push(b.normalMapUv),x.push(b.displacementMapUv),x.push(b.emissiveMapUv),x.push(b.metalnessMapUv),x.push(b.roughnessMapUv),x.push(b.anisotropyMapUv),x.push(b.clearcoatMapUv),x.push(b.clearcoatNormalMapUv),x.push(b.clearcoatRoughnessMapUv),x.push(b.iridescenceMapUv),x.push(b.iridescenceThicknessMapUv),x.push(b.sheenColorMapUv),x.push(b.sheenRoughnessMapUv),x.push(b.specularMapUv),x.push(b.specularColorMapUv),x.push(b.specularIntensityMapUv),x.push(b.transmissionMapUv),x.push(b.thicknessMapUv),x.push(b.combine),x.push(b.fogExp2),x.push(b.sizeAttenuation),x.push(b.morphTargetsCount),x.push(b.morphAttributeCount),x.push(b.numSunLights),x.push(b.numDirLights),x.push(b.numPointLights),x.push(b.numSpotLights),x.push(b.numSpotLightMaps),x.push(b.numHemiLights),x.push(b.numRectAreaLights),x.push(b.numSunLightShadows),x.push(b.numDirLightShadows),x.push(b.numPointLightShadows),x.push(b.numSpotLightShadows),x.push(b.numSpotLightShadowsWithMaps),x.push(b.numLightProbes),x.push(b.shadowMapType),x.push(b.toneMapping),x.push(b.numClippingPlanes),x.push(b.numClipIntersection),x.push(b.depthPacking)}function v(x,b){o.disableAll(),b.instancing&&o.enable(0),b.instancingColor&&o.enable(1),b.instancingMorph&&o.enable(2),b.matcap&&o.enable(3),b.envMap&&o.enable(4),b.normalMapObjectSpace&&o.enable(5),b.normalMapTangentSpace&&o.enable(6),b.clearcoat&&o.enable(7),b.iridescence&&o.enable(8),b.alphaTest&&o.enable(9),b.vertexColors&&o.enable(10),b.vertexAlphas&&o.enable(11),b.vertexUv1s&&o.enable(12),b.vertexUv2s&&o.enable(13),b.vertexUv3s&&o.enable(14),b.vertexTangents&&o.enable(15),b.anisotropy&&o.enable(16),b.alphaHash&&o.enable(17),b.batching&&o.enable(18),b.dispersion&&o.enable(19),b.retroreflection&&o.enable(24),b.batchingColor&&o.enable(20),b.gradientMap&&o.enable(21),b.packedNormalMap&&o.enable(22),b.vertexNormals&&o.enable(23),x.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reversedDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.decodeVideoTextureEmissive&&o.enable(20),b.alphaToCoverage&&o.enable(21),b.numLightProbeGrids>0&&o.enable(22),b.hasPositionAttribute&&o.enable(23),x.push(o.mask)}function M(x){let b=p[x.type],P;if(b){let L=xr[b];P=v1.clone(L.uniforms)}else P=x.uniforms;return P}function y(x,b){let P=u.get(b);return P!==void 0?++P.usedTimes:(P=new hI(n,b,x,r),c.push(P),u.set(b,P)),P}function w(x){if(--x.usedTimes===0){let b=c.indexOf(x);c[b]=c[c.length-1],c.pop(),u.delete(x.cacheKey),x.destroy()}}function E(x){a.remove(x)}function A(){a.dispose()}return{getParameters:_,getProgramCacheKey:m,getUniforms:M,acquireProgram:y,releaseProgram:w,releaseShaderCache:E,programs:c,dispose:A}}function mI(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function r(o,a,l){n.get(o)[a]=l}function s(){n=new WeakMap}return{has:e,get:t,remove:i,update:r,dispose:s}}function gI(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function B1(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function k1(){let n=[],e=0,t=[],i=[],r=[];function s(){e=0,t.length=0,i.length=0,r.length=0}function o(h){let p=0;return h.isInstancedMesh&&(p+=2),h.isSkinnedMesh&&(p+=1),p}function a(h,p,g,_,m,f){let v=n[e];return v===void 0?(v={id:h.id,object:h,geometry:p,material:g,materialVariant:o(h),groupOrder:_,renderOrder:h.renderOrder,z:m,group:f},n[e]=v):(v.id=h.id,v.object=h,v.geometry=p,v.material=g,v.materialVariant=o(h),v.groupOrder=_,v.renderOrder=h.renderOrder,v.z=m,v.group=f),e++,v}function l(h,p,g,_,m,f,v){v.reversedDepth===!0&&(m=-m);let M=a(h,p,g,_,m,f);g.transmission>0?i.push(M):g.transparent===!0?r.push(M):t.push(M)}function c(h,p,g,_,m,f){let v=a(h,p,g,_,m,f);g.transmission>0?i.unshift(v):g.transparent===!0?r.unshift(v):t.unshift(v)}function u(h,p){t.length>1&&t.sort(h||gI),i.length>1&&i.sort(p||B1),r.length>1&&r.sort(p||B1)}function d(){for(let h=e,p=n.length;h<p;h++){let g=n[h];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:i,transparent:r,init:s,push:l,unshift:c,finish:d,sort:u}}function _I(){let n=new WeakMap;function e(i,r){let s=n.get(i),o;return s===void 0?(o=new k1,n.set(i,[o])):r>=s.length?(o=new k1,s.push(o)):o=s[r],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function vI(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new q,color:new rt};break;case"SpotLight":t={position:new q,direction:new q,color:new rt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new q,color:new rt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new q,skyColor:new rt,groundColor:new rt};break;case"RectAreaLight":t={color:new rt,position:new q,halfWidth:new q,halfHeight:new q};break}return n[e.id]=t,t}}}function xI(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}function SI(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function MI(n){let e=new vI,t=xI(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new q);let r=new q,s=new Ht,o=new Ht;function a(c){let u=0,d=0,h=0;for(let D=0;D<9;D++)i.probe[D].set(0,0,0);let p=0,g=0,_=0,m=0,f=0,v=0,M=0,y=0,w=0,E=0,A=0,x=0,b=0,P=0;c.sort(SI);for(let D=0,B=c.length;D<B;D++){let I=c[D],O=I.color,Y=I.intensity,H=I.distance,ne=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===Gs?ne=I.shadow.map.texture:ne=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)u+=O.r*Y,d+=O.g*Y,h+=O.b*Y;else if(I.isLightProbe){for(let Z=0;Z<9;Z++)i.probe[Z].addScaledVector(I.sh.coefficients[Z],Y);P++}else if(I.isSunLight){let Z=e.get(I);if(Z.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let te=I.shadow,re=t.get(I);re.shadowIntensity=te.intensity,re.shadowBias=te.bias,re.shadowNormalBias=te.normalBias,re.shadowRadius=te.radius,re.shadowMapSize.copy(te.mapSize).multiply(te.getFrameExtents()),i.sunShadow[g]=re,i.sunShadowMap[g]=ne;let Te=te.getViewportCount();for(let fe=0;fe<Te;fe++)i.sunShadowMatrix[_+fe]=te.getMatrix(fe),i.sunShadowCascade[_+fe]=te._cascadeData[fe];_+=Te,g++}i.sun[p]=Z,p++}else if(I.isDirectionalLight){let Z=e.get(I);if(Z.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let te=I.shadow,re=t.get(I);re.shadowIntensity=te.intensity,re.shadowBias=te.bias,re.shadowNormalBias=te.normalBias,re.shadowRadius=te.radius,re.shadowMapSize=te.mapSize,i.directionalShadow[m]=re,i.directionalShadowMap[m]=ne,i.directionalShadowMatrix[m]=I.shadow.matrix,w++}i.directional[m]=Z,m++}else if(I.isSpotLight){let Z=e.get(I);Z.position.setFromMatrixPosition(I.matrixWorld),Z.color.copy(O).multiplyScalar(Y),Z.distance=H,Z.coneCos=Math.cos(I.angle),Z.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),Z.decay=I.decay,i.spot[v]=Z;let te=I.shadow;if(I.map&&(i.spotLightMap[x]=I.map,x++,te.updateMatrices(I),I.castShadow&&b++),i.spotLightMatrix[v]=te.matrix,I.castShadow){let re=t.get(I);re.shadowIntensity=te.intensity,re.shadowBias=te.bias,re.shadowNormalBias=te.normalBias,re.shadowRadius=te.radius,re.shadowMapSize=te.mapSize,i.spotShadow[v]=re,i.spotShadowMap[v]=ne,A++}v++}else if(I.isRectAreaLight){let Z=e.get(I);Z.color.copy(O).multiplyScalar(Y),Z.halfWidth.set(I.width*.5,0,0),Z.halfHeight.set(0,I.height*.5,0),i.rectArea[M]=Z,M++}else if(I.isPointLight){let Z=e.get(I);if(Z.color.copy(I.color).multiplyScalar(I.intensity),Z.distance=I.distance,Z.decay=I.decay,I.castShadow){let te=I.shadow,re=t.get(I);re.shadowIntensity=te.intensity,re.shadowBias=te.bias,re.shadowNormalBias=te.normalBias,re.shadowRadius=te.radius,re.shadowMapSize=te.mapSize,re.shadowCameraNear=te.camera.near,re.shadowCameraFar=te.camera.far,i.pointShadow[f]=re,i.pointShadowMap[f]=ne,i.pointShadowMatrix[f]=I.shadow.matrix,E++}i.point[f]=Z,f++}else if(I.isHemisphereLight){let Z=e.get(I);Z.skyColor.copy(I.color).multiplyScalar(Y),Z.groundColor.copy(I.groundColor).multiplyScalar(Y),i.hemi[y]=Z,y++}}M>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=xe.LTC_FLOAT_1,i.rectAreaLTC2=xe.LTC_FLOAT_2):(i.rectAreaLTC1=xe.LTC_HALF_1,i.rectAreaLTC2=xe.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=d,i.ambient[2]=h;let L=i.hash;(L.sunLength!==p||L.directionalLength!==m||L.pointLength!==f||L.spotLength!==v||L.rectAreaLength!==M||L.hemiLength!==y||L.numSunShadows!==g||L.numDirectionalShadows!==w||L.numPointShadows!==E||L.numSpotShadows!==A||L.numSpotMaps!==x||L.numLightProbes!==P)&&(i.sun.length=p,i.directional.length=m,i.spot.length=v,i.rectArea.length=M,i.point.length=f,i.hemi.length=y,i.sunShadow.length=g,i.sunShadowMap.length=g,i.sunShadowMatrix.length=_,i.sunShadowCascade.length=_,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.directionalShadowMatrix.length=w,i.pointShadow.length=E,i.pointShadowMap.length=E,i.pointShadowMatrix.length=E,i.spotShadow.length=A,i.spotShadowMap.length=A,i.spotLightMatrix.length=A+x-b,i.spotLightMap.length=x,i.numSpotLightShadowsWithMaps=b,i.numLightProbes=P,L.sunLength=p,L.directionalLength=m,L.pointLength=f,L.spotLength=v,L.rectAreaLength=M,L.hemiLength=y,L.numSunShadows=g,L.numDirectionalShadows=w,L.numPointShadows=E,L.numSpotShadows=A,L.numSpotMaps=x,L.numLightProbes=P,i.version=yI++)}function l(c,u){let d=0,h=0,p=0,g=0,_=0,m=0,f=u.matrixWorldInverse;for(let v=0,M=c.length;v<M;v++){let y=c[v];if(y.isSunLight){let w=i.sun[d];w.direction.setFromMatrixPosition(y.matrixWorld),w.direction.transformDirection(f),d++}else if(y.isDirectionalLight){let w=i.directional[h];w.direction.setFromMatrixPosition(y.matrixWorld),r.setFromMatrixPosition(y.target.matrixWorld),w.direction.sub(r),w.direction.transformDirection(f),h++}else if(y.isSpotLight){let w=i.spot[g];w.position.setFromMatrixPosition(y.matrixWorld),w.position.applyMatrix4(f),w.direction.setFromMatrixPosition(y.matrixWorld),r.setFromMatrixPosition(y.target.matrixWorld),w.direction.sub(r),w.direction.transformDirection(f),g++}else if(y.isRectAreaLight){let w=i.rectArea[_];w.position.setFromMatrixPosition(y.matrixWorld),w.position.applyMatrix4(f),o.identity(),s.copy(y.matrixWorld),s.premultiply(f),o.extractRotation(s),w.halfWidth.set(y.width*.5,0,0),w.halfHeight.set(0,y.height*.5,0),w.halfWidth.applyMatrix4(o),w.halfHeight.applyMatrix4(o),_++}else if(y.isPointLight){let w=i.point[p];w.position.setFromMatrixPosition(y.matrixWorld),w.position.applyMatrix4(f),p++}else if(y.isHemisphereLight){let w=i.hemi[m];w.direction.setFromMatrixPosition(y.matrixWorld),w.direction.transformDirection(f),m++}}}return{setup:a,setupView:l,state:i}}function z1(n){let e=new MI(n),t=[],i=[],r=[];function s(h){d.camera=h,t.length=0,i.length=0,r.length=0}function o(h){t.push(h)}function a(h){i.push(h)}function l(h){r.push(h)}function c(){e.setup(t)}function u(h){e.setupView(t,h)}let d={lightsArray:t,shadowsArray:i,lightProbeGridArray:r,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:d,setupLights:c,setupLightsView:u,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function wI(n){let e=new WeakMap;function t(r,s=0){let o=e.get(r),a;return o===void 0?(a=new z1(n),e.set(r,[a])):s>=o.length?(a=new z1(n),o.push(a)):a=o[s],a}function i(){e=new WeakMap}return{get:t,dispose:i}}function CI(n,e,t){let i=new Pc,r=new it,s=new it,o=new Ut,a=new Af,l=new Cf,c={},u=t.maxTextureSize,d={[ks]:On,[On]:ks,[mr]:mr},h=new Fn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new it},radius:{value:4}},vertexShader:EI,fragmentShader:TI}),p=h.clone();p.defines.HORIZONTAL_PASS=1;let g=new pr;g.setAttribute("position",new bi(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new Un(g,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Oc;let f=this.type;this.render=function(E,A,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;this.type===UM&&(ke("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Oc);let b=n.getRenderTarget(),P=n.getActiveCubeFace(),L=n.getActiveMipmapLevel(),D=n.state;D.setBlending(gr),D.buffers.depth.getReversed()===!0?D.buffers.color.setClear(0,0,0,0):D.buffers.color.setClear(1,1,1,1),D.buffers.depth.setTest(!0),D.setScissorTest(!1);let B=f!==this.type;B&&A.traverse(function(I){I.material&&(Array.isArray(I.material)?I.material.forEach(O=>O.needsUpdate=!0):I.material.needsUpdate=!0)});for(let I=0,O=E.length;I<O;I++){let Y=E[I],H=Y.shadow;if(H===void 0){ke("WebGLShadowMap:",Y,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;r.copy(H.mapSize);let ne=H.getFrameExtents();r.multiply(ne),s.copy(H.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/ne.x),r.x=s.x*ne.x,H.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/ne.y),r.y=s.y*ne.y,H.mapSize.y=s.y));let Z=n.state.buffers.depth.getReversed();if(H.camera._reversedDepth=Z,H.map===null||B===!0){if(H.map!==null&&(H.map.depthTexture!==null&&(H.map.depthTexture.dispose(),H.map.depthTexture=null),H.map.dispose()),this.type===Za){if(Y.isPointLight){ke("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}H.map=new Tn(r.x,r.y,{format:Gs,type:$i,minFilter:Et,magFilter:Et,generateMipmaps:!1}),H.map.texture.name=Y.name+".shadowMap",H.map.depthTexture=new Ds(r.x,r.y,Zi),H.map.depthTexture.name=Y.name+".shadowMapDepth",H.map.depthTexture.format=hr,H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=rn,H.map.depthTexture.magFilter=rn}else Y.isPointLight?(H.map=new Id(r.x),H.map.depthTexture=new Tf(r.x,Yi)):(H.map=new Tn(r.x,r.y),H.map.depthTexture=new Ds(r.x,r.y,Yi)),H.map.depthTexture.name=Y.name+".shadowMap",H.map.depthTexture.format=hr,this.type===Oc?(H.map.depthTexture.compareFunction=Z?Ad:bd,H.map.depthTexture.minFilter=Et,H.map.depthTexture.magFilter=Et):(H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=rn,H.map.depthTexture.magFilter=rn);H.camera.updateProjectionMatrix()}H.map.isWebGLCubeRenderTarget!==!0&&(H.map.width!==r.x||H.map.height!==r.y)&&H.map.setSize(r.x,r.y);let te=H.map.isWebGLCubeRenderTarget?6:H.getViewportCount();Y.isPointLight!==!0&&H.updateMatrices(Y,x);for(let re=0;re<te;re++){let Te=H.getCamera(re);if(Y.isPointLight){let fe=H.camera,Ue=H.matrix,Oe=Y.distance||fe.far;Oe!==fe.far&&(fe.far=Oe,fe.updateProjectionMatrix()),Zc.setFromMatrixPosition(Y.matrixWorld),fe.position.copy(Zc),h_.copy(fe.position),h_.add(bI[re]),fe.up.copy(AI[re]),fe.lookAt(h_),fe.updateMatrixWorld(),Ue.makeTranslation(-Zc.x,-Zc.y,-Zc.z),V1.multiplyMatrices(fe.projectionMatrix,fe.matrixWorldInverse),H._frustum.setFromProjectionMatrix(V1,fe.coordinateSystem,fe.reversedDepth)}if(H.map.isWebGLCubeRenderTarget)n.setRenderTarget(H.map,re),n.clear();else{re===0&&(n.setRenderTarget(H.map),n.clear());let fe=H.getViewport(re);o.set(s.x*fe.x,s.y*fe.y,s.x*fe.z,s.y*fe.w),D.viewport(o)}i=H.getFrustum(re),y(A,x,Te,Y,this.type)}H.isPointLightShadow!==!0&&this.type===Za&&v(H,x),H.needsUpdate=!1}f=this.type,m.needsUpdate=!1,n.setRenderTarget(b,P,L)};function v(E,A){let x=e.update(_);h.defines.VSM_SAMPLES!==E.blurSamples&&(h.defines.VSM_SAMPLES=E.blurSamples,p.defines.VSM_SAMPLES=E.blurSamples,h.needsUpdate=!0,p.needsUpdate=!0),E.mapPass===null?E.mapPass=new Tn(r.x,r.y,{format:Gs,type:$i}):(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)&&E.mapPass.setSize(E.map.width,E.map.height),h.uniforms.shadow_pass.value=E.map.depthTexture,h.uniforms.resolution.value.set(E.map.width,E.map.height),h.uniforms.radius.value=E.radius,n.setRenderTarget(E.mapPass),n.clear(),n.renderBufferDirect(A,null,x,h,_,null),p.uniforms.shadow_pass.value=E.mapPass.texture,p.uniforms.resolution.value.set(E.map.width,E.map.height),p.uniforms.radius.value=E.radius,n.setRenderTarget(E.map),n.clear(),n.renderBufferDirect(A,null,x,p,_,null)}function M(E,A,x,b){let P=null,L=x.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(L!==void 0)P=L;else if(P=x.isPointLight===!0?l:a,n.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){let D=P.uuid,B=A.uuid,I=c[D];I===void 0&&(I={},c[D]=I);let O=I[B];O===void 0&&(O=P.clone(),I[B]=O,A.addEventListener("dispose",w)),P=O}if(P.visible=A.visible,P.wireframe=A.wireframe,b===Za?P.side=A.shadowSide!==null?A.shadowSide:A.side:P.side=A.shadowSide!==null?A.shadowSide:d[A.side],P.alphaMap=A.alphaMap,P.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,P.map=A.map,P.clipShadows=A.clipShadows,P.clippingPlanes=A.clippingPlanes,P.clipIntersection=A.clipIntersection,P.displacementMap=A.displacementMap,P.displacementScale=A.displacementScale,P.displacementBias=A.displacementBias,P.wireframeLinewidth=A.wireframeLinewidth,P.linewidth=A.linewidth,x.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let D=n.properties.get(P);D.light=x}return P}function y(E,A,x,b,P){if(E.visible===!1)return;if(E.layers.test(A.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&P===Za)&&(!E.frustumCulled||E.intersectsFrustum(i))){E.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,E.matrixWorld);let B=e.update(E),I=E.material;if(Array.isArray(I)){let O=B.groups;for(let Y=0,H=O.length;Y<H;Y++){let ne=O[Y],Z=I[ne.materialIndex];if(Z&&Z.visible){let te=M(E,Z,b,P);E.onBeforeShadow(n,E,A,x,B,te,ne),n.renderBufferDirect(x,null,B,te,E,ne),E.onAfterShadow(n,E,A,x,B,te,ne)}}}else if(I.visible){let O=M(E,I,b,P);E.onBeforeShadow(n,E,A,x,B,O,null),n.renderBufferDirect(x,null,B,O,E,null),E.onAfterShadow(n,E,A,x,B,O,null)}}let D=E.children;for(let B=0,I=D.length;B<I;B++)y(D[B],A,x,b,P)}function w(E){E.target.removeEventListener("dispose",w);for(let x in c){let b=c[x],P=E.target.uuid;P in b&&(b[P].dispose(),delete b[P])}}}function RI(n,e){function t(){let U=!1,pe=new Ut,ee=null,me=new Ut(0,0,0,0);return{setMask:function(Se){ee!==Se&&!U&&(n.colorMask(Se,Se,Se,Se),ee=Se)},setLocked:function(Se){U=Se},setClear:function(Se,se,Ie,Ce,ft){ft===!0&&(Se*=Ce,se*=Ce,Ie*=Ce),pe.set(Se,se,Ie,Ce),me.equals(pe)===!1&&(n.clearColor(Se,se,Ie,Ce),me.copy(pe))},reset:function(){U=!1,ee=null,me.set(-1,0,0,0)}}}function i(){let U=!1,pe=!1,ee=null,me=null,Se=null;return{setReversed:function(se){if(pe!==se){let Ie=e.get("EXT_clip_control");se?Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.ZERO_TO_ONE_EXT):Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.NEGATIVE_ONE_TO_ONE_EXT),pe=se;let Ce=Se;Se=null,this.setClear(Ce)}},getReversed:function(){return pe},setTest:function(se){se?ie(n.DEPTH_TEST):ye(n.DEPTH_TEST)},setMask:function(se){ee!==se&&!U&&(n.depthMask(se),ee=se)},setFunc:function(se){if(pe&&(se=g1[se]),me!==se){switch(se){case uf:n.depthFunc(n.NEVER);break;case hf:n.depthFunc(n.ALWAYS);break;case ff:n.depthFunc(n.LESS);break;case Ba:n.depthFunc(n.LEQUAL);break;case df:n.depthFunc(n.EQUAL);break;case pf:n.depthFunc(n.GEQUAL);break;case mf:n.depthFunc(n.GREATER);break;case gf:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}me=se}},setLocked:function(se){U=se},setClear:function(se){Se!==se&&(Se=se,pe&&(se=1-se),n.clearDepth(se))},reset:function(){U=!1,ee=null,me=null,Se=null,pe=!1}}}function r(){let U=!1,pe=null,ee=null,me=null,Se=null,se=null,Ie=null,Ce=null,ft=null;return{setTest:function(et){U||(et?ie(n.STENCIL_TEST):ye(n.STENCIL_TEST))},setMask:function(et){pe!==et&&!U&&(n.stencilMask(et),pe=et)},setFunc:function(et,sn,on){(ee!==et||me!==sn||Se!==on)&&(n.stencilFunc(et,sn,on),ee=et,me=sn,Se=on)},setOp:function(et,sn,on){(se!==et||Ie!==sn||Ce!==on)&&(n.stencilOp(et,sn,on),se=et,Ie=sn,Ce=on)},setLocked:function(et){U=et},setClear:function(et){ft!==et&&(n.clearStencil(et),ft=et)},reset:function(){U=!1,pe=null,ee=null,me=null,Se=null,se=null,Ie=null,Ce=null,ft=null}}}let s=new t,o=new i,a=new r,l=new WeakMap,c=new WeakMap,u={},d={},h={},p=new WeakMap,g=[],_=null,m=!1,f=null,v=null,M=null,y=null,w=null,E=null,A=null,x=new rt(0,0,0),b=0,P=!1,L=null,D=null,B=null,I=null,O=null,Y=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),H=!1,ne=0,Z=n.getParameter(n.VERSION);Z.indexOf("WebGL")!==-1?(ne=parseFloat(/^WebGL (\d)/.exec(Z)[1]),H=ne>=1):Z.indexOf("OpenGL ES")!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),H=ne>=2);let te=null,re={},Te=n.getParameter(n.SCISSOR_BOX),fe=n.getParameter(n.VIEWPORT),Ue=new Ut().fromArray(Te),Oe=new Ut().fromArray(fe);function We(U,pe,ee,me){let Se=new Uint8Array(4),se=n.createTexture();n.bindTexture(U,se),n.texParameteri(U,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(U,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Ie=0;Ie<ee;Ie++)U===n.TEXTURE_3D||U===n.TEXTURE_2D_ARRAY?n.texImage3D(pe,0,n.RGBA,1,1,me,0,n.RGBA,n.UNSIGNED_BYTE,Se):n.texImage2D(pe+Ie,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Se);return se}let j={};j[n.TEXTURE_2D]=We(n.TEXTURE_2D,n.TEXTURE_2D,1),j[n.TEXTURE_CUBE_MAP]=We(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),j[n.TEXTURE_2D_ARRAY]=We(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),j[n.TEXTURE_3D]=We(n.TEXTURE_3D,n.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ie(n.DEPTH_TEST),o.setFunc(Ba),Ye(!1),Ne(P0),ie(n.CULL_FACE),Be(gr);function ie(U){u[U]!==!0&&(n.enable(U),u[U]=!0)}function ye(U){u[U]!==!1&&(n.disable(U),u[U]=!1)}function Fe(U,pe){return h[U]!==pe?(n.bindFramebuffer(U,pe),h[U]=pe,U===n.DRAW_FRAMEBUFFER&&(h[n.FRAMEBUFFER]=pe),U===n.FRAMEBUFFER&&(h[n.DRAW_FRAMEBUFFER]=pe),!0):!1}function _e(U,pe){let ee=g,me=!1;if(U){ee=p.get(pe),ee===void 0&&(ee=[],p.set(pe,ee));let Se=U.textures;if(ee.length!==Se.length||ee[0]!==n.COLOR_ATTACHMENT0){for(let se=0,Ie=Se.length;se<Ie;se++)ee[se]=n.COLOR_ATTACHMENT0+se;ee.length=Se.length,me=!0}}else ee[0]!==n.BACK&&(ee[0]=n.BACK,me=!0);me&&n.drawBuffers(ee)}function He(U){return _!==U?(n.useProgram(U),_=U,!0):!1}let Ft={[Co]:n.FUNC_ADD,[OM]:n.FUNC_SUBTRACT,[BM]:n.FUNC_REVERSE_SUBTRACT};Ft[kM]=n.MIN,Ft[zM]=n.MAX;let qe={[VM]:n.ZERO,[GM]:n.ONE,[HM]:n.SRC_COLOR,[N0]:n.SRC_ALPHA,[$M]:n.SRC_ALPHA_SATURATE,[YM]:n.DST_COLOR,[XM]:n.DST_ALPHA,[WM]:n.ONE_MINUS_SRC_COLOR,[U0]:n.ONE_MINUS_SRC_ALPHA,[ZM]:n.ONE_MINUS_DST_COLOR,[qM]:n.ONE_MINUS_DST_ALPHA,[JM]:n.CONSTANT_COLOR,[KM]:n.ONE_MINUS_CONSTANT_COLOR,[jM]:n.CONSTANT_ALPHA,[QM]:n.ONE_MINUS_CONSTANT_ALPHA};function Be(U,pe,ee,me,Se,se,Ie,Ce,ft,et){if(U===gr){m===!0&&(ye(n.BLEND),m=!1);return}if(m===!1&&(ie(n.BLEND),m=!0),U!==FM){if(U!==f||et!==P){if((v!==Co||w!==Co)&&(n.blendEquation(n.FUNC_ADD),v=Co,w=Co),et)switch(U){case $a:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case I0:n.blendFunc(n.ONE,n.ONE);break;case L0:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case D0:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Ve("WebGLState: Invalid blending: ",U);break}else switch(U){case $a:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case I0:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case L0:Ve("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case D0:Ve("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ve("WebGLState: Invalid blending: ",U);break}M=null,y=null,E=null,A=null,x.set(0,0,0),b=0,f=U,P=et}return}Se=Se||pe,se=se||ee,Ie=Ie||me,(pe!==v||Se!==w)&&(n.blendEquationSeparate(Ft[pe],Ft[Se]),v=pe,w=Se),(ee!==M||me!==y||se!==E||Ie!==A)&&(n.blendFuncSeparate(qe[ee],qe[me],qe[se],qe[Ie]),M=ee,y=me,E=se,A=Ie),(Ce.equals(x)===!1||ft!==b)&&(n.blendColor(Ce.r,Ce.g,Ce.b,ft),x.copy(Ce),b=ft),f=U,P=!1}function ht(U,pe){U.side===mr?ye(n.CULL_FACE):ie(n.CULL_FACE);let ee=U.side===On;pe&&(ee=!ee),Ye(ee),U.blending===$a&&U.transparent===!1?Be(gr):Be(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),o.setFunc(U.depthFunc),o.setTest(U.depthTest),o.setMask(U.depthWrite),s.setMask(U.colorWrite);let me=U.stencilWrite;a.setTest(me),me&&(a.setMask(U.stencilWriteMask),a.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),a.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),Ot(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?ie(n.SAMPLE_ALPHA_TO_COVERAGE):ye(n.SAMPLE_ALPHA_TO_COVERAGE)}function Ye(U){L!==U&&(U?n.frontFace(n.CW):n.frontFace(n.CCW),L=U)}function Ne(U){U!==DM?(ie(n.CULL_FACE),U!==D&&(U===P0?n.cullFace(n.BACK):U===NM?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):ye(n.CULL_FACE),D=U}function Ct(U){U!==B&&(H&&n.lineWidth(U),B=U)}function Ot(U,pe,ee){U?(ie(n.POLYGON_OFFSET_FILL),(I!==pe||O!==ee)&&(I=pe,O=ee,o.getReversed()&&(pe=-pe),n.polygonOffset(pe,ee))):ye(n.POLYGON_OFFSET_FILL)}function Ke(U){U?ie(n.SCISSOR_TEST):ye(n.SCISSOR_TEST)}function xt(U){U===void 0&&(U=n.TEXTURE0+Y-1),te!==U&&(n.activeTexture(U),te=U)}function F(U,pe,ee){ee===void 0&&(te===null?ee=n.TEXTURE0+Y-1:ee=te);let me=re[ee];me===void 0&&(me={type:void 0,texture:void 0},re[ee]=me),(me.type!==U||me.texture!==pe)&&(te!==ee&&(n.activeTexture(ee),te=ee),n.bindTexture(U,pe||j[U]),me.type=U,me.texture=pe)}function yt(){let U=re[te];U!==void 0&&U.type!==void 0&&(n.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function $e(){try{n.compressedTexImage2D(...arguments)}catch(U){Ve("WebGLState:",U)}}function C(){try{n.compressedTexImage3D(...arguments)}catch(U){Ve("WebGLState:",U)}}function S(){try{n.texSubImage2D(...arguments)}catch(U){Ve("WebGLState:",U)}}function k(){try{n.texSubImage3D(...arguments)}catch(U){Ve("WebGLState:",U)}}function z(){try{n.compressedTexSubImage2D(...arguments)}catch(U){Ve("WebGLState:",U)}}function J(){try{n.compressedTexSubImage3D(...arguments)}catch(U){Ve("WebGLState:",U)}}function le(){try{n.texStorage2D(...arguments)}catch(U){Ve("WebGLState:",U)}}function de(){try{n.texStorage3D(...arguments)}catch(U){Ve("WebGLState:",U)}}function W(){try{n.texImage2D(...arguments)}catch(U){Ve("WebGLState:",U)}}function Q(){try{n.texImage3D(...arguments)}catch(U){Ve("WebGLState:",U)}}function ue(U){return d[U]!==void 0?d[U]:n.getParameter(U)}function Pe(U,pe){d[U]!==pe&&(n.pixelStorei(U,pe),d[U]=pe)}function ge(U){Ue.equals(U)===!1&&(n.scissor(U.x,U.y,U.z,U.w),Ue.copy(U))}function he(U){Oe.equals(U)===!1&&(n.viewport(U.x,U.y,U.z,U.w),Oe.copy(U))}function Ae(U,pe){let ee=c.get(pe);ee===void 0&&(ee=new WeakMap,c.set(pe,ee));let me=ee.get(U);me===void 0&&(me=n.getUniformBlockIndex(pe,U.name),ee.set(U,me))}function De(U,pe){let me=c.get(pe).get(U);l.get(pe)!==me&&(n.uniformBlockBinding(pe,me,U.__bindingPointIndex),l.set(pe,me))}function ze(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),u={},d={},te=null,re={},h={},p=new WeakMap,g=[],_=null,m=!1,f=null,v=null,M=null,y=null,w=null,E=null,A=null,x=new rt(0,0,0),b=0,P=!1,L=null,D=null,B=null,I=null,O=null,Ue.set(0,0,n.canvas.width,n.canvas.height),Oe.set(0,0,n.canvas.width,n.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:ie,disable:ye,bindFramebuffer:Fe,drawBuffers:_e,useProgram:He,setBlending:Be,setMaterial:ht,setFlipSided:Ye,setCullFace:Ne,setLineWidth:Ct,setPolygonOffset:Ot,setScissorTest:Ke,activeTexture:xt,bindTexture:F,unbindTexture:yt,compressedTexImage2D:$e,compressedTexImage3D:C,texImage2D:W,texImage3D:Q,pixelStorei:Pe,getParameter:ue,updateUBOMapping:Ae,uniformBlockBinding:De,texStorage2D:le,texStorage3D:de,texSubImage2D:S,texSubImage3D:k,compressedTexSubImage2D:z,compressedTexSubImage3D:J,scissor:ge,viewport:he,reset:ze}}function PI(n,e,t,i,r,s,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new it,u=new WeakMap,d=new Set,h,p=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(C,S){return g?new OffscreenCanvas(C,S):ka("canvas")}function m(C,S,k){let z=1,J=$e(C);if((J.width>k||J.height>k)&&(z=k/Math.max(J.width,J.height)),z<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let le=Math.floor(z*J.width),de=Math.floor(z*J.height);h===void 0&&(h=_(le,de));let W=S?_(le,de):h;return W.width=le,W.height=de,W.getContext("2d").drawImage(C,0,0,le,de),ke("WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+le+"x"+de+")."),W}else return"data"in C&&ke("WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),C;return C}function f(C){return C.generateMipmaps}function v(C){n.generateMipmap(C)}function M(C){return C.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?n.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function y(C,S,k,z,J,le=!1){if(C!==null){if(n[C]!==void 0)return n[C];ke("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let de;z&&(de=e.get("EXT_texture_norm16"),de||ke("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let W=S;if(S===n.RED&&(k===n.FLOAT&&(W=n.R32F),k===n.HALF_FLOAT&&(W=n.R16F),k===n.UNSIGNED_BYTE&&(W=n.R8),k===n.UNSIGNED_SHORT&&de&&(W=de.R16_EXT),k===n.SHORT&&de&&(W=de.R16_SNORM_EXT)),S===n.RED_INTEGER&&(k===n.UNSIGNED_BYTE&&(W=n.R8UI),k===n.UNSIGNED_SHORT&&(W=n.R16UI),k===n.UNSIGNED_INT&&(W=n.R32UI),k===n.BYTE&&(W=n.R8I),k===n.SHORT&&(W=n.R16I),k===n.INT&&(W=n.R32I)),S===n.RG&&(k===n.FLOAT&&(W=n.RG32F),k===n.HALF_FLOAT&&(W=n.RG16F),k===n.UNSIGNED_BYTE&&(W=n.RG8),k===n.UNSIGNED_SHORT&&de&&(W=de.RG16_EXT),k===n.SHORT&&de&&(W=de.RG16_SNORM_EXT)),S===n.RG_INTEGER&&(k===n.UNSIGNED_BYTE&&(W=n.RG8UI),k===n.UNSIGNED_SHORT&&(W=n.RG16UI),k===n.UNSIGNED_INT&&(W=n.RG32UI),k===n.BYTE&&(W=n.RG8I),k===n.SHORT&&(W=n.RG16I),k===n.INT&&(W=n.RG32I)),S===n.RGB_INTEGER&&(k===n.UNSIGNED_BYTE&&(W=n.RGB8UI),k===n.UNSIGNED_SHORT&&(W=n.RGB16UI),k===n.UNSIGNED_INT&&(W=n.RGB32UI),k===n.BYTE&&(W=n.RGB8I),k===n.SHORT&&(W=n.RGB16I),k===n.INT&&(W=n.RGB32I)),S===n.RGBA_INTEGER&&(k===n.UNSIGNED_BYTE&&(W=n.RGBA8UI),k===n.UNSIGNED_SHORT&&(W=n.RGBA16UI),k===n.UNSIGNED_INT&&(W=n.RGBA32UI),k===n.BYTE&&(W=n.RGBA8I),k===n.SHORT&&(W=n.RGBA16I),k===n.INT&&(W=n.RGBA32I)),S===n.RGB&&(k===n.UNSIGNED_SHORT&&de&&(W=de.RGB16_EXT),k===n.SHORT&&de&&(W=de.RGB16_SNORM_EXT),k===n.UNSIGNED_INT_5_9_9_9_REV&&(W=n.RGB9_E5),k===n.UNSIGNED_INT_10F_11F_11F_REV&&(W=n.R11F_G11F_B10F)),S===n.RGBA){let Q=le?Ec:Qe.getTransfer(J);k===n.FLOAT&&(W=n.RGBA32F),k===n.HALF_FLOAT&&(W=n.RGBA16F),k===n.UNSIGNED_BYTE&&(W=Q===ut?n.SRGB8_ALPHA8:n.RGBA8),k===n.UNSIGNED_SHORT&&de&&(W=de.RGBA16_EXT),k===n.SHORT&&de&&(W=de.RGBA16_SNORM_EXT),k===n.UNSIGNED_SHORT_4_4_4_4&&(W=n.RGBA4),k===n.UNSIGNED_SHORT_5_5_5_1&&(W=n.RGB5_A1)}return(W===n.R16F||W===n.R32F||W===n.RG16F||W===n.RG32F||W===n.RGBA16F||W===n.RGBA32F)&&e.get("EXT_color_buffer_float"),W}function w(C,S){let k;return C?S===null||S===Yi||S===Ka?k=n.DEPTH24_STENCIL8:S===Zi?k=n.DEPTH32F_STENCIL8:S===Ja&&(k=n.DEPTH24_STENCIL8,ke("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===Yi||S===Ka?k=n.DEPTH_COMPONENT24:S===Zi?k=n.DEPTH_COMPONENT32F:S===Ja&&(k=n.DEPTH_COMPONENT16),k}function E(C,S){return f(C)===!0||C.isFramebufferTexture&&C.minFilter!==rn&&C.minFilter!==Et?Math.log2(Math.max(S.width,S.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?S.mipmaps.length:1}function A(C){let S=C.target;S.removeEventListener("dispose",A),b(S),S.isVideoTexture&&u.delete(S),S.isHTMLTexture&&d.delete(S)}function x(C){let S=C.target;S.removeEventListener("dispose",x),L(S)}function b(C){let S=i.get(C);if(S.__webglInit===void 0)return;let k=C.source,z=p.get(k);if(z){let J=z[S.__cacheKey];J.usedTimes--,J.usedTimes===0&&P(C),Object.keys(z).length===0&&p.delete(k)}i.remove(C)}function P(C){let S=i.get(C);n.deleteTexture(S.__webglTexture);let k=C.source,z=p.get(k);delete z[S.__cacheKey],o.memory.textures--}function L(C){let S=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let z=0;z<6;z++){if(Array.isArray(S.__webglFramebuffer[z]))for(let J=0;J<S.__webglFramebuffer[z].length;J++)n.deleteFramebuffer(S.__webglFramebuffer[z][J]);else n.deleteFramebuffer(S.__webglFramebuffer[z]);S.__webglDepthbuffer&&n.deleteRenderbuffer(S.__webglDepthbuffer[z])}else{if(Array.isArray(S.__webglFramebuffer))for(let z=0;z<S.__webglFramebuffer.length;z++)n.deleteFramebuffer(S.__webglFramebuffer[z]);else n.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&n.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&n.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let z=0;z<S.__webglColorRenderbuffer.length;z++)S.__webglColorRenderbuffer[z]&&n.deleteRenderbuffer(S.__webglColorRenderbuffer[z]);S.__webglDepthRenderbuffer&&n.deleteRenderbuffer(S.__webglDepthRenderbuffer)}let k=C.textures;for(let z=0,J=k.length;z<J;z++){let le=i.get(k[z]);le.__webglTexture&&(n.deleteTexture(le.__webglTexture),o.memory.textures--),i.remove(k[z])}i.remove(C)}let D=0;function B(){D=0}function I(){return D}function O(C){D=C}function Y(){let C=D;return C>=r.maxTextures&&ke("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+r.maxTextures),D+=1,C}function H(C){let S=[];return S.push(C.wrapS),S.push(C.wrapT),S.push(C.wrapR||0),S.push(C.magFilter),S.push(C.minFilter),S.push(C.anisotropy),S.push(C.internalFormat),S.push(C.format),S.push(C.type),S.push(C.generateMipmaps),S.push(C.premultiplyAlpha),S.push(C.flipY),S.push(C.unpackAlignment),S.push(C.colorSpace),S.join()}function ne(C,S){let k=i.get(C);if(C.isVideoTexture&&F(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&k.__version!==C.version){let z=C.image;if(z===null)ke("WebGLRenderer: Texture marked for update but no image data found.");else if(z.complete===!1)ke("WebGLRenderer: Texture marked for update but image is incomplete");else{ye(k,C,S);return}}else C.isExternalTexture&&(k.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,k.__webglTexture,n.TEXTURE0+S)}function Z(C,S){let k=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&k.__version!==C.version){ye(k,C,S);return}else C.isExternalTexture&&(k.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,k.__webglTexture,n.TEXTURE0+S)}function te(C,S){let k=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&k.__version!==C.version){ye(k,C,S);return}t.bindTexture(n.TEXTURE_3D,k.__webglTexture,n.TEXTURE0+S)}function re(C,S){let k=i.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&k.__version!==C.version){Fe(k,C,S);return}t.bindTexture(n.TEXTURE_CUBE_MAP,k.__webglTexture,n.TEXTURE0+S)}let Te={[_f]:n.REPEAT,[ur]:n.CLAMP_TO_EDGE,[vf]:n.MIRRORED_REPEAT},fe={[rn]:n.NEAREST,[n1]:n.NEAREST_MIPMAP_NEAREST,[kc]:n.NEAREST_MIPMAP_LINEAR,[Et]:n.LINEAR,[Hf]:n.LINEAR_MIPMAP_NEAREST,[_r]:n.LINEAR_MIPMAP_LINEAR},Ue={[o1]:n.NEVER,[h1]:n.ALWAYS,[a1]:n.LESS,[bd]:n.LEQUAL,[l1]:n.EQUAL,[Ad]:n.GEQUAL,[c1]:n.GREATER,[u1]:n.NOTEQUAL};function Oe(C,S){if(S.type===Zi&&e.has("OES_texture_float_linear")===!1&&(S.magFilter===Et||S.magFilter===Hf||S.magFilter===kc||S.magFilter===_r||S.minFilter===Et||S.minFilter===Hf||S.minFilter===kc||S.minFilter===_r)&&ke("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(C,n.TEXTURE_WRAP_S,Te[S.wrapS]),n.texParameteri(C,n.TEXTURE_WRAP_T,Te[S.wrapT]),(C===n.TEXTURE_3D||C===n.TEXTURE_2D_ARRAY)&&n.texParameteri(C,n.TEXTURE_WRAP_R,Te[S.wrapR]),n.texParameteri(C,n.TEXTURE_MAG_FILTER,fe[S.magFilter]),n.texParameteri(C,n.TEXTURE_MIN_FILTER,fe[S.minFilter]),S.compareFunction&&(n.texParameteri(C,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(C,n.TEXTURE_COMPARE_FUNC,Ue[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===rn||S.minFilter!==kc&&S.minFilter!==_r||S.type===Zi&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||i.get(S).__currentAnisotropy){let k=e.get("EXT_texture_filter_anisotropic");n.texParameterf(C,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,r.getMaxAnisotropy())),i.get(S).__currentAnisotropy=S.anisotropy}}}function We(C,S){let k=!1;C.__webglInit===void 0&&(C.__webglInit=!0,S.addEventListener("dispose",A));let z=S.source,J=p.get(z);J===void 0&&(J={},p.set(z,J));let le=H(S);if(le!==C.__cacheKey){J[le]===void 0&&(J[le]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,k=!0),J[le].usedTimes++;let de=J[C.__cacheKey];de!==void 0&&(J[C.__cacheKey].usedTimes--,de.usedTimes===0&&P(S)),C.__cacheKey=le,C.__webglTexture=J[le].texture}return k}function j(C,S,k){return Math.floor(Math.floor(C/k)/S)}function ie(C,S,k,z){let le=C.updateRanges;if(le.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,S.width,S.height,k,z,S.data);else{le.sort((Pe,ge)=>Pe.start-ge.start);let de=0;for(let Pe=1;Pe<le.length;Pe++){let ge=le[de],he=le[Pe],Ae=ge.start+ge.count,De=j(he.start,S.width,4),ze=j(ge.start,S.width,4);he.start<=Ae+1&&De===ze&&j(he.start+he.count-1,S.width,4)===De?ge.count=Math.max(ge.count,he.start+he.count-ge.start):(++de,le[de]=he)}le.length=de+1;let W=t.getParameter(n.UNPACK_ROW_LENGTH),Q=t.getParameter(n.UNPACK_SKIP_PIXELS),ue=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,S.width);for(let Pe=0,ge=le.length;Pe<ge;Pe++){let he=le[Pe],Ae=Math.floor(he.start/4),De=Math.ceil(he.count/4),ze=Ae%S.width,U=Math.floor(Ae/S.width),pe=De,ee=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,ze),t.pixelStorei(n.UNPACK_SKIP_ROWS,U),t.texSubImage2D(n.TEXTURE_2D,0,ze,U,pe,ee,k,z,S.data)}C.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,W),t.pixelStorei(n.UNPACK_SKIP_PIXELS,Q),t.pixelStorei(n.UNPACK_SKIP_ROWS,ue)}}function ye(C,S,k){let z=n.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(z=n.TEXTURE_2D_ARRAY),S.isData3DTexture&&(z=n.TEXTURE_3D);let J=We(C,S),le=S.source;t.bindTexture(z,C.__webglTexture,n.TEXTURE0+k);let de=i.get(le);if(le.version!==de.__version||J===!0){if(t.activeTexture(n.TEXTURE0+k),(typeof ImageBitmap<"u"&&S.image instanceof ImageBitmap)===!1){let ee=Qe.getPrimaries(Qe.workingColorSpace),me=S.colorSpace===Wr?null:Qe.getPrimaries(S.colorSpace),Se=S.colorSpace===Wr||ee===me?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,S.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Se)}t.pixelStorei(n.UNPACK_ALIGNMENT,S.unpackAlignment);let Q=m(S.image,!1,r.maxTextureSize);Q=yt(S,Q);let ue=s.convert(S.format,S.colorSpace),Pe=s.convert(S.type),ge=y(S.internalFormat,ue,Pe,S.normalized,S.colorSpace,S.isVideoTexture);Oe(z,S);let he,Ae=S.mipmaps,De=S.isVideoTexture!==!0,ze=de.__version===void 0||J===!0,U=le.dataReady,pe=E(S,Q);if(S.isDepthTexture)ge=w(S.format===Vs,S.type),ze&&(De?t.texStorage2D(n.TEXTURE_2D,1,ge,Q.width,Q.height):t.texImage2D(n.TEXTURE_2D,0,ge,Q.width,Q.height,0,ue,Pe,null));else if(S.isDataTexture)if(Ae.length>0){De&&ze&&t.texStorage2D(n.TEXTURE_2D,pe,ge,Ae[0].width,Ae[0].height);for(let ee=0,me=Ae.length;ee<me;ee++)he=Ae[ee],De?U&&t.texSubImage2D(n.TEXTURE_2D,ee,0,0,he.width,he.height,ue,Pe,he.data):t.texImage2D(n.TEXTURE_2D,ee,ge,he.width,he.height,0,ue,Pe,he.data);S.generateMipmaps=!1}else De?(ze&&t.texStorage2D(n.TEXTURE_2D,pe,ge,Q.width,Q.height),U&&ie(S,Q,ue,Pe)):t.texImage2D(n.TEXTURE_2D,0,ge,Q.width,Q.height,0,ue,Pe,Q.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){De&&ze&&t.texStorage3D(n.TEXTURE_2D_ARRAY,pe,ge,Ae[0].width,Ae[0].height,Q.depth);for(let ee=0,me=Ae.length;ee<me;ee++)if(he=Ae[ee],S.format!==jn)if(ue!==null)if(De){if(U)if(S.layerUpdates.size>0){let Se=r_(he.width,he.height,S.format,S.type);for(let se of S.layerUpdates){let Ie=he.data.subarray(se*Se/he.data.BYTES_PER_ELEMENT,(se+1)*Se/he.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ee,0,0,se,he.width,he.height,1,ue,Ie)}}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ee,0,0,0,he.width,he.height,Q.depth,ue,he.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,ee,ge,he.width,he.height,Q.depth,0,he.data,0,0);else ke("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else De?U&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,ee,0,0,0,he.width,he.height,Q.depth,ue,Pe,he.data):t.texImage3D(n.TEXTURE_2D_ARRAY,ee,ge,he.width,he.height,Q.depth,0,ue,Pe,he.data);S.layerUpdates.size>0&&S.clearLayerUpdates()}else{De&&ze&&t.texStorage2D(n.TEXTURE_2D,pe,ge,Ae[0].width,Ae[0].height);for(let ee=0,me=Ae.length;ee<me;ee++)he=Ae[ee],S.format!==jn?ue!==null?De?U&&t.compressedTexSubImage2D(n.TEXTURE_2D,ee,0,0,he.width,he.height,ue,he.data):t.compressedTexImage2D(n.TEXTURE_2D,ee,ge,he.width,he.height,0,he.data):ke("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):De?U&&t.texSubImage2D(n.TEXTURE_2D,ee,0,0,he.width,he.height,ue,Pe,he.data):t.texImage2D(n.TEXTURE_2D,ee,ge,he.width,he.height,0,ue,Pe,he.data)}else if(S.isDataArrayTexture)if(De){if(ze&&t.texStorage3D(n.TEXTURE_2D_ARRAY,pe,ge,Q.width,Q.height,Q.depth),U)if(S.layerUpdates.size>0){let ee=r_(Q.width,Q.height,S.format,S.type);for(let me of S.layerUpdates){let Se=Q.data.subarray(me*ee/Q.data.BYTES_PER_ELEMENT,(me+1)*ee/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,me,Q.width,Q.height,1,ue,Pe,Se)}S.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,ue,Pe,Q.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,ge,Q.width,Q.height,Q.depth,0,ue,Pe,Q.data);else if(S.isData3DTexture)De?(ze&&t.texStorage3D(n.TEXTURE_3D,pe,ge,Q.width,Q.height,Q.depth),U&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,ue,Pe,Q.data)):t.texImage3D(n.TEXTURE_3D,0,ge,Q.width,Q.height,Q.depth,0,ue,Pe,Q.data);else if(S.isFramebufferTexture){if(ze)if(De)t.texStorage2D(n.TEXTURE_2D,pe,ge,Q.width,Q.height);else{let ee=Q.width,me=Q.height;for(let Se=0;Se<pe;Se++)t.texImage2D(n.TEXTURE_2D,Se,ge,ee,me,0,ue,Pe,null),ee>>=1,me>>=1}}else if(S.isHTMLTexture){if("texElementImage2D"in n){let ee=n.canvas;if(ee.hasAttribute("layoutsubtree")||ee.setAttribute("layoutsubtree","true"),Q.parentNode!==ee){ee.appendChild(Q),d.add(S),ee.onpaint=me=>{let Se=me.changedElements;for(let se of d)Se.includes(se.image)&&(se.needsUpdate=!0)},ee.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,Q);else{let Se=n.RGBA,se=n.RGBA,Ie=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,Se,se,Ie,Q)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(Ae.length>0){if(De&&ze){let ee=$e(Ae[0]);t.texStorage2D(n.TEXTURE_2D,pe,ge,ee.width,ee.height)}for(let ee=0,me=Ae.length;ee<me;ee++)he=Ae[ee],De?U&&t.texSubImage2D(n.TEXTURE_2D,ee,0,0,ue,Pe,he):t.texImage2D(n.TEXTURE_2D,ee,ge,ue,Pe,he);S.generateMipmaps=!1}else if(De){if(ze){let ee=$e(Q);t.texStorage2D(n.TEXTURE_2D,pe,ge,ee.width,ee.height)}U&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,ue,Pe,Q)}else t.texImage2D(n.TEXTURE_2D,0,ge,ue,Pe,Q);f(S)&&v(z),de.__version=le.version,S.onUpdate&&S.onUpdate(S)}C.__version=S.version}function Fe(C,S,k){if(S.image.length!==6)return;let z=We(C,S),J=S.source;t.bindTexture(n.TEXTURE_CUBE_MAP,C.__webglTexture,n.TEXTURE0+k);let le=i.get(J);if(J.version!==le.__version||z===!0){t.activeTexture(n.TEXTURE0+k);let de=Qe.getPrimaries(Qe.workingColorSpace),W=S.colorSpace===Wr?null:Qe.getPrimaries(S.colorSpace),Q=S.colorSpace===Wr||de===W?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,S.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,S.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Q);let ue=S.isCompressedTexture||S.image[0].isCompressedTexture,Pe=S.image[0]&&S.image[0].isDataTexture,ge=[];for(let se=0;se<6;se++)!ue&&!Pe?ge[se]=m(S.image[se],!0,r.maxCubemapSize):ge[se]=Pe?S.image[se].image:S.image[se],ge[se]=yt(S,ge[se]);let he=ge[0],Ae=s.convert(S.format,S.colorSpace),De=s.convert(S.type),ze=y(S.internalFormat,Ae,De,S.normalized,S.colorSpace),U=S.isVideoTexture!==!0,pe=le.__version===void 0||z===!0,ee=J.dataReady,me=E(S,he);Oe(n.TEXTURE_CUBE_MAP,S);let Se;if(ue){U&&pe&&t.texStorage2D(n.TEXTURE_CUBE_MAP,me,ze,he.width,he.height);for(let se=0;se<6;se++){Se=ge[se].mipmaps;for(let Ie=0;Ie<Se.length;Ie++){let Ce=Se[Ie];S.format!==jn?Ae!==null?U?ee&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ie,0,0,Ce.width,Ce.height,Ae,Ce.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ie,ze,Ce.width,Ce.height,0,Ce.data):ke("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):U?ee&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ie,0,0,Ce.width,Ce.height,Ae,De,Ce.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ie,ze,Ce.width,Ce.height,0,Ae,De,Ce.data)}}}else{if(Se=S.mipmaps,U&&pe){Se.length>0&&me++;let se=$e(ge[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,me,ze,se.width,se.height)}for(let se=0;se<6;se++)if(Pe){U?ee&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,0,0,ge[se].width,ge[se].height,Ae,De,ge[se].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,ze,ge[se].width,ge[se].height,0,Ae,De,ge[se].data);for(let Ie=0;Ie<Se.length;Ie++){let ft=Se[Ie].image[se].image;U?ee&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ie+1,0,0,ft.width,ft.height,Ae,De,ft.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ie+1,ze,ft.width,ft.height,0,Ae,De,ft.data)}}else{U?ee&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,0,0,Ae,De,ge[se]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,ze,Ae,De,ge[se]);for(let Ie=0;Ie<Se.length;Ie++){let Ce=Se[Ie];U?ee&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ie+1,0,0,Ae,De,Ce.image[se]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ie+1,ze,Ae,De,Ce.image[se])}}}f(S)&&v(n.TEXTURE_CUBE_MAP),le.__version=J.version,S.onUpdate&&S.onUpdate(S)}C.__version=S.version}function _e(C,S,k,z,J,le){let de=s.convert(k.format,k.colorSpace),W=s.convert(k.type),Q=y(k.internalFormat,de,W,k.normalized,k.colorSpace),ue=i.get(S),Pe=i.get(k);if(Pe.__renderTarget=S,!ue.__hasExternalTextures){let ge=Math.max(1,S.width>>le),he=Math.max(1,S.height>>le);J===n.TEXTURE_3D||J===n.TEXTURE_2D_ARRAY?t.texImage3D(J,le,Q,ge,he,S.depth,0,de,W,null):t.texImage2D(J,le,Q,ge,he,0,de,W,null)}t.bindFramebuffer(n.FRAMEBUFFER,C),xt(S)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,z,J,Pe.__webglTexture,0,Ke(S)):(J===n.TEXTURE_2D||J>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,z,J,Pe.__webglTexture,le),t.bindFramebuffer(n.FRAMEBUFFER,null)}function He(C,S,k){if(n.bindRenderbuffer(n.RENDERBUFFER,C),S.depthBuffer){let z=S.depthTexture,J=z&&z.isDepthTexture?z.type:null,le=w(S.stencilBuffer,J),de=S.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;xt(S)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ke(S),le,S.width,S.height):k?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ke(S),le,S.width,S.height):n.renderbufferStorage(n.RENDERBUFFER,le,S.width,S.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,de,n.RENDERBUFFER,C)}else{let z=S.textures;for(let J=0;J<z.length;J++){let le=z[J],de=s.convert(le.format,le.colorSpace),W=s.convert(le.type),Q=y(le.internalFormat,de,W,le.normalized,le.colorSpace);xt(S)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ke(S),Q,S.width,S.height):k?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ke(S),Q,S.width,S.height):n.renderbufferStorage(n.RENDERBUFFER,Q,S.width,S.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Ft(C,S,k){let z=S.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,C),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let J=i.get(S.depthTexture);if(J.__renderTarget=S,(!J.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),z){if(J.__webglInit===void 0&&(J.__webglInit=!0,S.depthTexture.addEventListener("dispose",A)),J.__webglTexture===void 0){J.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,J.__webglTexture),Oe(n.TEXTURE_CUBE_MAP,S.depthTexture);let ue=s.convert(S.depthTexture.format),Pe=s.convert(S.depthTexture.type),ge;S.depthTexture.format===hr?ge=n.DEPTH_COMPONENT24:S.depthTexture.format===Vs&&(ge=n.DEPTH24_STENCIL8);for(let he=0;he<6;he++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,ge,S.width,S.height,0,ue,Pe,null)}}else ne(S.depthTexture,0);let le=J.__webglTexture,de=Ke(S),W=z?n.TEXTURE_CUBE_MAP_POSITIVE_X+k:n.TEXTURE_2D,Q=S.depthTexture.format===Vs?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(S.depthTexture.format===hr)xt(S)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Q,W,le,0,de):n.framebufferTexture2D(n.FRAMEBUFFER,Q,W,le,0);else if(S.depthTexture.format===Vs)xt(S)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Q,W,le,0,de):n.framebufferTexture2D(n.FRAMEBUFFER,Q,W,le,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function qe(C){let S=i.get(C),k=C.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==C.depthTexture){let z=C.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),z){let J=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,z.removeEventListener("dispose",J)};z.addEventListener("dispose",J),S.__depthDisposeCallback=J}S.__boundDepthTexture=z}if(C.depthTexture&&!S.__autoAllocateDepthBuffer)if(k)for(let z=0;z<6;z++)Ft(S.__webglFramebuffer[z],C,z);else{let z=C.texture.mipmaps;z&&z.length>0?Ft(S.__webglFramebuffer[0],C,0):Ft(S.__webglFramebuffer,C,0)}else if(k){S.__webglDepthbuffer=[];for(let z=0;z<6;z++)if(t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer[z]),S.__webglDepthbuffer[z]===void 0)S.__webglDepthbuffer[z]=n.createRenderbuffer(),He(S.__webglDepthbuffer[z],C,!1);else{let J=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,le=S.__webglDepthbuffer[z];n.bindRenderbuffer(n.RENDERBUFFER,le),n.framebufferRenderbuffer(n.FRAMEBUFFER,J,n.RENDERBUFFER,le)}}else{let z=C.texture.mipmaps;if(z&&z.length>0?t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=n.createRenderbuffer(),He(S.__webglDepthbuffer,C,!1);else{let J=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,le=S.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,le),n.framebufferRenderbuffer(n.FRAMEBUFFER,J,n.RENDERBUFFER,le)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function Be(C,S,k){let z=i.get(C);S!==void 0&&_e(z.__webglFramebuffer,C,C.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),k!==void 0&&qe(C)}function ht(C){let S=C.texture,k=i.get(C),z=i.get(S);C.addEventListener("dispose",x);let J=C.textures,le=C.isWebGLCubeRenderTarget===!0,de=J.length>1;if(de||(z.__webglTexture===void 0&&(z.__webglTexture=n.createTexture()),z.__version=S.version,o.memory.textures++),le){k.__webglFramebuffer=[];for(let W=0;W<6;W++)if(S.mipmaps&&S.mipmaps.length>0){k.__webglFramebuffer[W]=[];for(let Q=0;Q<S.mipmaps.length;Q++)k.__webglFramebuffer[W][Q]=n.createFramebuffer()}else k.__webglFramebuffer[W]=n.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){k.__webglFramebuffer=[];for(let W=0;W<S.mipmaps.length;W++)k.__webglFramebuffer[W]=n.createFramebuffer()}else k.__webglFramebuffer=n.createFramebuffer();if(de)for(let W=0,Q=J.length;W<Q;W++){let ue=i.get(J[W]);ue.__webglTexture===void 0&&(ue.__webglTexture=n.createTexture(),o.memory.textures++)}if(C.samples>0&&xt(C)===!1){k.__webglMultisampledFramebuffer=n.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let W=0;W<J.length;W++){let Q=J[W];k.__webglColorRenderbuffer[W]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,k.__webglColorRenderbuffer[W]);let ue=s.convert(Q.format,Q.colorSpace),Pe=s.convert(Q.type),ge=y(Q.internalFormat,ue,Pe,Q.normalized,Q.colorSpace,C.isXRRenderTarget===!0),he=Ke(C);n.renderbufferStorageMultisample(n.RENDERBUFFER,he,ge,C.width,C.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+W,n.RENDERBUFFER,k.__webglColorRenderbuffer[W])}n.bindRenderbuffer(n.RENDERBUFFER,null),C.depthBuffer&&(k.__webglDepthRenderbuffer=n.createRenderbuffer(),He(k.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(le){t.bindTexture(n.TEXTURE_CUBE_MAP,z.__webglTexture),Oe(n.TEXTURE_CUBE_MAP,S);for(let W=0;W<6;W++)if(S.mipmaps&&S.mipmaps.length>0)for(let Q=0;Q<S.mipmaps.length;Q++)_e(k.__webglFramebuffer[W][Q],C,S,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+W,Q);else _e(k.__webglFramebuffer[W],C,S,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+W,0);f(S)&&v(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(de){for(let W=0,Q=J.length;W<Q;W++){let ue=J[W],Pe=i.get(ue),ge=n.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(ge=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ge,Pe.__webglTexture),Oe(ge,ue),_e(k.__webglFramebuffer,C,ue,n.COLOR_ATTACHMENT0+W,ge,0),f(ue)&&v(ge)}t.unbindTexture()}else{let W=n.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(W=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(W,z.__webglTexture),Oe(W,S),S.mipmaps&&S.mipmaps.length>0)for(let Q=0;Q<S.mipmaps.length;Q++)_e(k.__webglFramebuffer[Q],C,S,n.COLOR_ATTACHMENT0,W,Q);else _e(k.__webglFramebuffer,C,S,n.COLOR_ATTACHMENT0,W,0);f(S)&&v(W),t.unbindTexture()}C.depthBuffer&&qe(C)}function Ye(C){let S=C.textures;for(let k=0,z=S.length;k<z;k++){let J=S[k];if(f(J)){let le=M(C),de=i.get(J).__webglTexture;t.bindTexture(le,de),v(le),t.unbindTexture()}}}let Ne=[],Ct=[];function Ot(C){if(C.samples>0){if(xt(C)===!1){let S=C.textures,k=C.width,z=C.height,J=n.COLOR_BUFFER_BIT,le=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,de=i.get(C),W=S.length>1;if(W)for(let ue=0;ue<S.length;ue++)t.bindFramebuffer(n.FRAMEBUFFER,de.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ue,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,de.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ue,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,de.__webglMultisampledFramebuffer);let Q=C.texture.mipmaps;Q&&Q.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,de.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,de.__webglFramebuffer);for(let ue=0;ue<S.length;ue++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(J|=n.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(J|=n.STENCIL_BUFFER_BIT)),W){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,de.__webglColorRenderbuffer[ue]);let Pe=i.get(S[ue]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Pe,0)}n.blitFramebuffer(0,0,k,z,0,0,k,z,J,n.NEAREST),l===!0&&(Ne.length=0,Ct.length=0,Ne.push(n.COLOR_ATTACHMENT0+ue),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(Ne.push(le),Ct.push(le),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Ct)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Ne))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),W)for(let ue=0;ue<S.length;ue++){t.bindFramebuffer(n.FRAMEBUFFER,de.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ue,n.RENDERBUFFER,de.__webglColorRenderbuffer[ue]);let Pe=i.get(S[ue]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,de.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ue,n.TEXTURE_2D,Pe,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,de.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&l){let S=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[S])}}}function Ke(C){return Math.min(r.maxSamples,C.samples)}function xt(C){let S=i.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function F(C){let S=o.render.frame;u.get(C)!==S&&(u.set(C,S),C.update())}function yt(C,S){let k=C.colorSpace,z=C.format,J=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||k!==wc&&k!==Wr&&(Qe.getTransfer(k)===ut?(z!==jn||J!==di)&&ke("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ve("WebGLTextures: Unsupported texture color space:",k)),S}function $e(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=Y,this.resetTextureUnits=B,this.getTextureUnits=I,this.setTextureUnits=O,this.setTexture2D=ne,this.setTexture2DArray=Z,this.setTexture3D=te,this.setTextureCube=re,this.rebindTextures=Be,this.setupRenderTarget=ht,this.updateRenderTargetMipmap=Ye,this.updateMultisampleRenderTarget=Ot,this.setupDepthRenderbuffer=qe,this.setupFrameBufferTexture=_e,this.useMultisampledRTT=xt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function II(n,e){function t(i,r=Wr){let s,o=Qe.getTransfer(r);if(i===di)return n.UNSIGNED_BYTE;if(i===Xf)return n.UNSIGNED_SHORT_4_4_4_4;if(i===qf)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Y0)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===Z0)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===X0)return n.BYTE;if(i===q0)return n.SHORT;if(i===Ja)return n.UNSIGNED_SHORT;if(i===Wf)return n.INT;if(i===Yi)return n.UNSIGNED_INT;if(i===Zi)return n.FLOAT;if(i===$i)return n.HALF_FLOAT;if(i===$0)return n.ALPHA;if(i===J0)return n.RGB;if(i===jn)return n.RGBA;if(i===hr)return n.DEPTH_COMPONENT;if(i===Vs)return n.DEPTH_STENCIL;if(i===K0)return n.RED;if(i===Yf)return n.RED_INTEGER;if(i===Gs)return n.RG;if(i===Zf)return n.RG_INTEGER;if(i===$f)return n.RGBA_INTEGER;if(i===zc||i===Vc||i===Gc||i===Hc)if(o===ut)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===zc)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Vc)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Gc)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Hc)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===zc)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Vc)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Gc)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Hc)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Jf||i===Kf||i===jf||i===Qf)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===Jf)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Kf)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===jf)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Qf)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===ed||i===td||i===nd||i===id||i===rd||i===Wc||i===sd)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===ed||i===td)return o===ut?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===nd)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(i===id)return s.COMPRESSED_R11_EAC;if(i===rd)return s.COMPRESSED_SIGNED_R11_EAC;if(i===Wc)return s.COMPRESSED_RG11_EAC;if(i===sd)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===od||i===ad||i===ld||i===cd||i===ud||i===hd||i===fd||i===dd||i===pd||i===md||i===gd||i===_d||i===vd||i===xd)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===od)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===ad)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===ld)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===cd)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===ud)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===hd)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===fd)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===dd)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===pd)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===md)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===gd)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===_d)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===vd)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===xd)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===yd||i===Sd||i===Md)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===yd)return o===ut?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Sd)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Md)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===wd||i===Ed||i===Xc||i===Td)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===wd)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Ed)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Xc)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Td)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Ka?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}function UI(n,e){function t(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function i(m,f){f.color.getRGB(m.fogColor.value,t_(n)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function r(m,f,v,M,y){f.isNodeMaterial?f.uniformsNeedUpdate=!1:f.isMeshBasicMaterial?s(m,f):f.isMeshLambertMaterial?(s(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshToonMaterial?(s(m,f),d(m,f)):f.isMeshPhongMaterial?(s(m,f),u(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshStandardMaterial?(s(m,f),h(m,f),f.isMeshPhysicalMaterial&&p(m,f,y)):f.isMeshMatcapMaterial?(s(m,f),g(m,f)):f.isMeshDepthMaterial?s(m,f):f.isMeshDistanceMaterial?(s(m,f),_(m,f)):f.isMeshNormalMaterial?s(m,f):f.isLineBasicMaterial?(o(m,f),f.isLineDashedMaterial&&a(m,f)):f.isPointsMaterial?l(m,f,v,M):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function s(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,t(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===On&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,t(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===On&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,t(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,t(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let v=e.get(f),M=v.envMap,y=v.envMapRotation;M&&(m.envMap.value=M,m.envMapRotation.value.setFromMatrix4(NI.makeRotationFromEuler(y)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Z1),m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,t(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,m.aoMapTransform))}function o(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform))}function a(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,v,M){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*v,m.scale.value=M*.5,f.map&&(m.map.value=f.map,t(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function u(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function d(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function h(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,v){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===On&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.retroreflectivity>0&&(m.retroreflectivity.value=f.retroreflectivity),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=v.texture,m.transmissionSamplerSize.value.set(v.width,v.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function _(m,f){let v=e.get(f).light;m.referencePosition.value.setFromMatrixPosition(v.matrixWorld),m.nearDistance.value=v.shadow.camera.near,m.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function FI(n,e,t,i){let r={},s={},o=[],a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,w){let E=w.program;i.uniformBlockBinding(y,E)}function c(y,w){let E=r[y.id];E===void 0&&(m(y),E=u(y),r[y.id]=E,y.addEventListener("dispose",v));let A=w.program;i.updateUBOMapping(y,A);let x=e.render.frame;s[y.id]!==x&&(h(y),s[y.id]=x)}function u(y){let w=d();y.__bindingPointIndex=w;let E=n.createBuffer(),A=y.__size,x=y.usage;return n.bindBuffer(n.UNIFORM_BUFFER,E),n.bufferData(n.UNIFORM_BUFFER,A,x),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,w,E),E}function d(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return Ve("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(y){let w=r[y.id],E=y.uniforms,A=y.__cache;n.bindBuffer(n.UNIFORM_BUFFER,w);for(let x=0,b=E.length;x<b;x++){let P=E[x];if(Array.isArray(P))for(let L=0,D=P.length;L<D;L++)p(P[L],x,L,A);else p(P,x,0,A)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function p(y,w,E,A){if(_(y,w,E,A)===!0){let x=y.__offset,b=y.value;if(Array.isArray(b)){let P=0;for(let L=0;L<b.length;L++){let D=b[L],B=f(D);g(D,y.__data,P),typeof D!="number"&&typeof D!="boolean"&&!D.isMatrix3&&!ArrayBuffer.isView(D)&&(P+=B.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(b,y.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,x,y.__data)}}function g(y,w,E){typeof y=="number"||typeof y=="boolean"?w[0]=y:y.isMatrix3?(w[0]=y.elements[0],w[1]=y.elements[1],w[2]=y.elements[2],w[3]=0,w[4]=y.elements[3],w[5]=y.elements[4],w[6]=y.elements[5],w[7]=0,w[8]=y.elements[6],w[9]=y.elements[7],w[10]=y.elements[8],w[11]=0):ArrayBuffer.isView(y)?w.set(new y.constructor(y.buffer,y.byteOffset,w.length)):y.toArray(w,E)}function _(y,w,E,A){let x=y.value,b=w+"_"+E;if(A[b]===void 0)return typeof x=="number"||typeof x=="boolean"?A[b]=x:ArrayBuffer.isView(x)?A[b]=x.slice():A[b]=x.clone(),!0;{let P=A[b];if(typeof x=="number"||typeof x=="boolean"){if(P!==x)return A[b]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(P.equals(x)===!1)return P.copy(x),!0}}return!1}function m(y){let w=y.uniforms,E=0,A=16;for(let b=0,P=w.length;b<P;b++){let L=Array.isArray(w[b])?w[b]:[w[b]];for(let D=0,B=L.length;D<B;D++){let I=L[D],O=Array.isArray(I.value)?I.value:[I.value];for(let Y=0,H=O.length;Y<H;Y++){let ne=O[Y],Z=f(ne),te=E%A,re=te%Z.boundary,Te=te+re;E+=re,Te!==0&&A-Te<Z.storage&&(E+=A-Te),I.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=E,E+=Z.storage}}}let x=E%A;return x>0&&(E+=A-x),y.__size=E,y.__cache={},this}function f(y){let w={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(w.boundary=4,w.storage=4):y.isVector2?(w.boundary=8,w.storage=8):y.isVector3||y.isColor?(w.boundary=16,w.storage=12):y.isVector4?(w.boundary=16,w.storage=16):y.isMatrix3?(w.boundary=48,w.storage=48):y.isMatrix4?(w.boundary=64,w.storage=64):y.isTexture?ke("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(w.boundary=16,w.storage=y.byteLength):ke("WebGLRenderer: Unsupported uniform value type.",y),w}function v(y){let w=y.target;w.removeEventListener("dispose",v);let E=o.indexOf(w.__bindingPointIndex);o.splice(E,1),n.deleteBuffer(r[w.id]),delete r[w.id],delete s[w.id]}function M(){for(let y in r)n.deleteBuffer(r[y]);o=[],r={},s={}}return{bind:l,update:c,dispose:M}}function BI(){return vr===null&&(vr=new Xa(OI,16,16,Gs,$i),vr.name="DFG_LUT",vr.minFilter=Et,vr.magFilter=Et,vr.wrapS=ur,vr.wrapT=ur,vr.generateMipmaps=!1,vr.needsUpdate=!0),vr}var KA,jA,QA,eC,tC,nC,iC,rC,sC,oC,aC,lC,cC,uC,hC,fC,dC,pC,mC,gC,_C,vC,xC,yC,SC,MC,wC,EC,TC,bC,AC,CC,RC,PC,IC,LC,DC,NC,UC,FC,OC,BC,kC,zC,VC,GC,HC,WC,XC,qC,YC,ZC,$C,JC,KC,jC,QC,eR,tR,nR,iR,rR,sR,oR,aR,lR,cR,uR,hR,fR,dR,pR,mR,gR,_R,vR,xR,yR,SR,MR,wR,ER,TR,bR,AR,CR,RR,PR,IR,LR,DR,NR,UR,FR,OR,BR,kR,zR,VR,GR,HR,WR,XR,qR,YR,ZR,$R,JR,KR,jR,QR,eP,tP,nP,iP,rP,sP,oP,aP,lP,cP,uP,hP,fP,dP,pP,mP,gP,_P,vP,xP,yP,SP,MP,wP,EP,TP,bP,AP,CP,RP,PP,Xe,xe,xr,Cd,IP,H1,Qa,OP,BP,kP,Yc,S1,o_,a_,l_,c_,zP,Io,Pd,Id,KP,W1,f_,X1,q1,Y1,T1,b1,A1,C1,R1,d_,p_,m_,u_,el,z2,V2,L1,X2,Rd,K2,j2,eI,nI,rI,oI,lI,fI,__,v_,yI,EI,TI,bI,AI,V1,Zc,h_,LI,DI,x_,y_,NI,Z1,OI,vr,Ld,$1=Zr(()=>{s_();s_();KA=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,jA=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,QA=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,eC=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,tC=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,nC=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,iC=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,rC=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,sC=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,oC=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,aC=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,lC=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,cC=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,uC=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,hC=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,fC=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,dC=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,pC=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,mC=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,gC=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,_C=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,vC=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,xC=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,yC=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,SC=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,MC=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,wC=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,EC=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,TC=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,bC=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,AC="gl_FragColor = linearToOutputTexel( gl_FragColor );",CC=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,RC=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,PC=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,IC=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,LC=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,DC=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,NC=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,UC=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,FC=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,OC=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,BC=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,kC=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,zC=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,VC=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,GC=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,HC=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,WC=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,XC=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,qC=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,YC=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,ZC=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,$C=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,JC=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,KC=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,jC=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,QC=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,eR=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,tR=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,nR=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,iR=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,rR=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,sR=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,oR=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,aR=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,lR=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,cR=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,uR=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,hR=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,fR=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,dR=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,pR=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,mR=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,gR=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,_R=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,vR=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,xR=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,yR=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,SR=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,MR=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,wR=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ER=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,TR=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,bR=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,AR=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,CR=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,RR=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,PR=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,IR=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,LR=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,DR=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,NR=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,UR=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,FR=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,OR=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,BR=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,kR=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,zR=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,VR=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,GR=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,HR=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,WR=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,XR=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,qR=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,YR=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,ZR=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,$R=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,JR=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,KR=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,jR=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,QR=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,eP=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tP=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,nP=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,iP=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,rP=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,sP=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,oP=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,aP=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,lP=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cP=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,uP=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,hP=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,fP=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,dP=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,pP=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mP=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,gP=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_P=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,vP=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,xP=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,yP=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,SP=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,MP=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wP=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,EP=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,TP=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,bP=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,AP=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,CP=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,RP=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,PP=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Xe={alphahash_fragment:KA,alphahash_pars_fragment:jA,alphamap_fragment:QA,alphamap_pars_fragment:eC,alphatest_fragment:tC,alphatest_pars_fragment:nC,aomap_fragment:iC,aomap_pars_fragment:rC,batching_pars_vertex:sC,batching_vertex:oC,begin_vertex:aC,beginnormal_vertex:lC,bsdfs:cC,iridescence_fragment:uC,bumpmap_pars_fragment:hC,clipping_planes_fragment:fC,clipping_planes_pars_fragment:dC,clipping_planes_pars_vertex:pC,clipping_planes_vertex:mC,color_fragment:gC,color_pars_fragment:_C,color_pars_vertex:vC,color_vertex:xC,common:yC,cube_uv_reflection_fragment:SC,defaultnormal_vertex:MC,displacementmap_pars_vertex:wC,displacementmap_vertex:EC,emissivemap_fragment:TC,emissivemap_pars_fragment:bC,colorspace_fragment:AC,colorspace_pars_fragment:CC,envmap_fragment:RC,envmap_common_pars_fragment:PC,envmap_pars_fragment:IC,envmap_pars_vertex:LC,envmap_physical_pars_fragment:HC,envmap_vertex:DC,fog_vertex:NC,fog_pars_vertex:UC,fog_fragment:FC,fog_pars_fragment:OC,gradientmap_pars_fragment:BC,lightmap_pars_fragment:kC,lights_lambert_fragment:zC,lights_lambert_pars_fragment:VC,lights_pars_begin:GC,lights_toon_fragment:WC,lights_toon_pars_fragment:XC,lights_phong_fragment:qC,lights_phong_pars_fragment:YC,lights_physical_fragment:ZC,lights_physical_pars_fragment:$C,lights_fragment_begin:JC,lights_fragment_maps:KC,lights_fragment_end:jC,lightprobes_pars_fragment:QC,logdepthbuf_fragment:eR,logdepthbuf_pars_fragment:tR,logdepthbuf_pars_vertex:nR,logdepthbuf_vertex:iR,map_fragment:rR,map_pars_fragment:sR,map_particle_fragment:oR,map_particle_pars_fragment:aR,metalnessmap_fragment:lR,metalnessmap_pars_fragment:cR,morphinstance_vertex:uR,morphcolor_vertex:hR,morphnormal_vertex:fR,morphtarget_pars_vertex:dR,morphtarget_vertex:pR,normal_fragment_begin:mR,normal_fragment_maps:gR,normal_pars_fragment:_R,normal_pars_vertex:vR,normal_vertex:xR,normalmap_pars_fragment:yR,clearcoat_normal_fragment_begin:SR,clearcoat_normal_fragment_maps:MR,clearcoat_pars_fragment:wR,iridescence_pars_fragment:ER,opaque_fragment:TR,packing:bR,premultiplied_alpha_fragment:AR,project_vertex:CR,dithering_fragment:RR,dithering_pars_fragment:PR,roughnessmap_fragment:IR,roughnessmap_pars_fragment:LR,shadowmap_pars_fragment:DR,shadowmap_pars_vertex:NR,shadowmap_vertex:UR,shadowmask_pars_fragment:FR,skinbase_vertex:OR,skinning_pars_vertex:BR,skinning_vertex:kR,skinnormal_vertex:zR,specularmap_fragment:VR,specularmap_pars_fragment:GR,tonemapping_fragment:HR,tonemapping_pars_fragment:WR,transmission_fragment:XR,transmission_pars_fragment:qR,uv_pars_fragment:YR,uv_pars_vertex:ZR,uv_vertex:$R,worldpos_vertex:JR,background_vert:KR,background_frag:jR,backgroundCube_vert:QR,backgroundCube_frag:eP,cube_vert:tP,cube_frag:nP,depth_vert:iP,depth_frag:rP,distance_vert:sP,distance_frag:oP,equirect_vert:aP,equirect_frag:lP,linedashed_vert:cP,linedashed_frag:uP,meshbasic_vert:hP,meshbasic_frag:fP,meshlambert_vert:dP,meshlambert_frag:pP,meshmatcap_vert:mP,meshmatcap_frag:gP,meshnormal_vert:_P,meshnormal_frag:vP,meshphong_vert:xP,meshphong_frag:yP,meshphysical_vert:SP,meshphysical_frag:MP,meshtoon_vert:wP,meshtoon_frag:EP,points_vert:TP,points_frag:bP,shadow_vert:AP,shadow_frag:CP,sprite_vert:RP,sprite_frag:PP},xe={common:{diffuse:{value:new rt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ge}},envmap:{envMap:{value:null},envMapRotation:{value:new Ge},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ge}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ge}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ge},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ge},normalScale:{value:new it(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ge},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ge}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ge}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ge}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new rt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new q},probesMax:{value:new q},probesResolution:{value:new q}},points:{diffuse:{value:new rt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0},uvTransform:{value:new Ge}},sprite:{diffuse:{value:new rt(16777215)},opacity:{value:1},center:{value:new it(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}}},xr={basic:{uniforms:bn([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.fog]),vertexShader:Xe.meshbasic_vert,fragmentShader:Xe.meshbasic_frag},lambert:{uniforms:bn([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,xe.lights,{emissive:{value:new rt(0)},envMapIntensity:{value:1}}]),vertexShader:Xe.meshlambert_vert,fragmentShader:Xe.meshlambert_frag},phong:{uniforms:bn([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,xe.lights,{emissive:{value:new rt(0)},specular:{value:new rt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Xe.meshphong_vert,fragmentShader:Xe.meshphong_frag},standard:{uniforms:bn([xe.common,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.roughnessmap,xe.metalnessmap,xe.fog,xe.lights,{emissive:{value:new rt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag},toon:{uniforms:bn([xe.common,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.gradientmap,xe.fog,xe.lights,{emissive:{value:new rt(0)}}]),vertexShader:Xe.meshtoon_vert,fragmentShader:Xe.meshtoon_frag},matcap:{uniforms:bn([xe.common,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,{matcap:{value:null}}]),vertexShader:Xe.meshmatcap_vert,fragmentShader:Xe.meshmatcap_frag},points:{uniforms:bn([xe.points,xe.fog]),vertexShader:Xe.points_vert,fragmentShader:Xe.points_frag},dashed:{uniforms:bn([xe.common,xe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Xe.linedashed_vert,fragmentShader:Xe.linedashed_frag},depth:{uniforms:bn([xe.common,xe.displacementmap]),vertexShader:Xe.depth_vert,fragmentShader:Xe.depth_frag},normal:{uniforms:bn([xe.common,xe.bumpmap,xe.normalmap,xe.displacementmap,{opacity:{value:1}}]),vertexShader:Xe.meshnormal_vert,fragmentShader:Xe.meshnormal_frag},sprite:{uniforms:bn([xe.sprite,xe.fog]),vertexShader:Xe.sprite_vert,fragmentShader:Xe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ge},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Xe.background_vert,fragmentShader:Xe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ge}},vertexShader:Xe.backgroundCube_vert,fragmentShader:Xe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Xe.cube_vert,fragmentShader:Xe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Xe.equirect_vert,fragmentShader:Xe.equirect_frag},distance:{uniforms:bn([xe.common,xe.displacementmap,{referencePosition:{value:new q},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Xe.distance_vert,fragmentShader:Xe.distance_frag},shadow:{uniforms:bn([xe.lights,xe.fog,{color:{value:new rt(0)},opacity:{value:1}}]),vertexShader:Xe.shadow_vert,fragmentShader:Xe.shadow_frag}};xr.physical={uniforms:bn([xr.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ge},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ge},clearcoatNormalScale:{value:new it(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ge},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ge},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ge},sheen:{value:0},sheenColor:{value:new rt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ge},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ge},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ge},transmissionSamplerSize:{value:new it},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ge},attenuationDistance:{value:0},attenuationColor:{value:new rt(0)},specularColor:{value:new rt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ge},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ge},anisotropyVector:{value:new it},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ge}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag};Cd={r:0,b:0,g:0},IP=new Ht,H1=new Ge;H1.set(-1,0,0,0,1,0,0,0,1);Qa=4,OP=6,BP=20,kP=256,Yc=new Bs,S1=new rt,o_=null,a_=0,l_=0,c_=!1,zP=new q,Io=new q,Pd=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,r=100,s={}){let{size:o=256,position:a=zP}=s;o_=this._renderer.getRenderTarget(),a_=this._renderer.getActiveCubeFace(),l_=this._renderer.getActiveMipmapLevel(),c_=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,r,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=E1(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=w1(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(o_,a_,l_),this._renderer.xr.enabled=c_,e.scissorTest=!1,ja(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===zs||e.mapping===Ro?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),o_=this._renderer.getRenderTarget(),a_=this._renderer.getActiveCubeFace(),l_=this._renderer.getActiveMipmapLevel(),c_=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Et,minFilter:Et,generateMipmaps:!1,type:$i,format:jn,colorSpace:wc,depthBuffer:!1},r=M1(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=M1(e,t,i);let{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=VP(s)),this._blurMaterial=HP(s,e,t),this._ggxMaterial=GP(s,e,t)}return r}_compileMaterial(e){let t=new Un(new pr,e);this._renderer.compile(t,Yc)}_sceneToCubeUV(e,t,i,r,s){let l=new Kn(90,1,t,i),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],d=this._renderer,h=d.autoClear,p=d.toneMapping;d.getClearColor(S1),d.toneMapping=qi,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(r),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Un(new qa,new Ao({name:"PMREM.Background",side:On,depthWrite:!1,depthTest:!1})));let _=this._backgroundBox,m=_.material,f=!1,v=e.background;v?v.isColor&&(m.color.copy(v),e.background=null,f=!0):(m.color.copy(S1),f=!0);for(let M=0;M<6;M++){let y=M%3;y===0?(l.up.set(0,c[M],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x+u[M],s.y,s.z)):y===1?(l.up.set(0,0,c[M]),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y+u[M],s.z)):(l.up.set(0,c[M],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y,s.z+u[M]));let w=this._cubeSize;ja(r,y*w,M>2?w:0,w,w),d.setRenderTarget(r),f&&d.render(_,l),d.render(e,l)}d.toneMapping=p,d.autoClear=h,e.background=v}_textureToCubeUV(e,t){let i=this._renderer,r=e.mapping===zs||e.mapping===Ro;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=E1()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=w1());let s=r?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=s;let a=s.uniforms;a.envMap.value=e;let l=this._cubeSize;ja(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,Yc)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let s=1;s<r;s++)this._applyGGXFilter(e,s-1,s);t.autoClear=i}_applyGGXFilter(e,t,i){let r=this._renderer,s=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;let l=o.uniforms,c=i/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),d=Math.sqrt(c*c-u*u),h=c*1.25,p=d*h,{_lodMax:g}=this,_=this._sizeLods[i],m=3*_*(i>g-Qa?i-g+Qa:0),f=4*(this._cubeSize-_);l.envMap.value=e.texture,l.roughness.value=p,l.mipInt.value=g-t,ja(s,m,f,3*_,2*_),r.setRenderTarget(s),r.render(a,Yc),l.envMap.value=s.texture,l.roughness.value=0,l.mipInt.value=g-i,ja(e,m,f,3*_,2*_),r.setRenderTarget(e),r.render(a,Yc)}_blur(e,t,i,r){let s=this._pingPongRenderTarget,o=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,s,t,i,o),this._blurPass(s,e,i,i,o)}_blurPass(e,t,i,r,s){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[r];l.material=a;let c=a.uniforms;c.envMap.value=e.texture,c.sigma.value=s,c.mipInt.value=this._lodMax-i;let u=this._sizeLods[r],d=3*u*(r>this._lodMax-Qa?r-this._lodMax+Qa:0),h=4*(this._cubeSize-u);ja(t,d,h,3*u,2*u),o.setRenderTarget(t),o.render(l,Yc)}};Id=class extends Tn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new Lc(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new qa(5,5,5),s=new Fn({name:"CubemapFromEquirect",uniforms:Po(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:On,blending:gr});s.uniforms.tEquirect.value=t;let o=new Un(r,s),a=t.minFilter;return t.minFilter===_r&&(t.minFilter=Et),new kf(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,r=!0){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,r);e.setRenderTarget(s)}};KP={[O0]:"LINEAR_TONE_MAPPING",[B0]:"REINHARD_TONE_MAPPING",[k0]:"CINEON_TONE_MAPPING",[z0]:"ACES_FILMIC_TONE_MAPPING",[G0]:"AGX_TONE_MAPPING",[H0]:"NEUTRAL_TONE_MAPPING",[V0]:"CUSTOM_TONE_MAPPING"};W1=new En,f_=new Ds(1,1),X1=new bc,q1=new wf,Y1=new Lc,T1=[],b1=[],A1=new Float32Array(16),C1=new Float32Array(9),R1=new Float32Array(4);d_=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=v2(t.type)}},p_=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=B2(t.type)}},m_=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,t[a.id],i)}}},u_=/(\w+)(\])?(\[|\.)?/g;el=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){let a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);k2(a,l,this)}let r=[],s=[];for(let o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(o):s.push(o);r.length>0&&(this.seq=r.concat(s))}setValue(e,t,i,r){let s=this.map[t];s!==void 0&&s.setValue(e,i,r)}setOptional(e,t,i){let r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let s=0,o=t.length;s!==o;++s){let a=t[s],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){let i=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in t&&i.push(o)}return i}};z2=37297,V2=0;L1=new Ge;X2={[O0]:"Linear",[B0]:"Reinhard",[k0]:"Cineon",[z0]:"ACESFilmic",[G0]:"AgX",[H0]:"Neutral",[V0]:"Custom"};Rd=new q;K2=/^[ \t]*#include +<([\w\d./]+)>/gm;j2=new Map;eI=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;nI={[Oc]:"SHADOWMAP_TYPE_PCF",[Za]:"SHADOWMAP_TYPE_VSM"};rI={[zs]:"ENVMAP_TYPE_CUBE",[Ro]:"ENVMAP_TYPE_CUBE",[Bc]:"ENVMAP_TYPE_CUBE_UV"};oI={[Ro]:"ENVMAP_MODE_REFRACTION"};lI={[F0]:"ENVMAP_BLENDING_MULTIPLY",[e1]:"ENVMAP_BLENDING_MIX",[t1]:"ENVMAP_BLENDING_ADD"};fI=0,__=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(i)===!1&&(r.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new v_(e),t.set(e,i)),i}},v_=class{constructor(e){this.id=fI++,this.code=e,this.usedTimes=0}};yI=0;EI=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,TI=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,bI=[new q(1,0,0),new q(-1,0,0),new q(0,1,0),new q(0,-1,0),new q(0,0,1),new q(0,0,-1)],AI=[new q(0,-1,0),new q(0,-1,0),new q(0,0,1),new q(0,0,-1),new q(0,-1,0),new q(0,-1,0)],V1=new Ht,Zc=new q,h_=new q;LI=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,DI=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,x_=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new Dc(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new Fn({vertexShader:LI,fragmentShader:DI,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Un(new Ns(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},y_=class extends fr{constructor(e,t){super();let i=this,r=null,s=1,o=null,a="local-floor",l=1,c=null,u=null,d=null,h=null,p=null,g=null,_=typeof XRWebGLBinding<"u",m=new x_,f={},v=t.getContextAttributes(),M=null,y=null,w=[],E=[],A=new it,x=null,b=null,P=new Kn;P.viewport=new Ut;let L=new Kn;L.viewport=new Ut;let D=[P,L],B=new zf,I=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let ie=w[j];return ie===void 0&&(ie=new Ga,w[j]=ie),ie.getTargetRaySpace()},this.getControllerGrip=function(j){let ie=w[j];return ie===void 0&&(ie=new Ga,w[j]=ie),ie.getGripSpace()},this.getHand=function(j){let ie=w[j];return ie===void 0&&(ie=new Ga,w[j]=ie),ie.getHandSpace()};function Y(j){let ie=E.indexOf(j.inputSource);if(ie===-1)return;let ye=w[ie];ye!==void 0&&(ye.update(j.inputSource,j.frame,c||o),ye.dispatchEvent({type:j.type,data:j.inputSource}))}function H(){r.removeEventListener("select",Y),r.removeEventListener("selectstart",Y),r.removeEventListener("selectend",Y),r.removeEventListener("squeeze",Y),r.removeEventListener("squeezestart",Y),r.removeEventListener("squeezeend",Y),r.removeEventListener("end",H),r.removeEventListener("inputsourceschange",ne);for(let j=0;j<w.length;j++){let ie=E[j];ie!==null&&(E[j]=null,w[j].disconnect(ie))}I=null,O=null,m.reset();for(let j in f)delete f[j];if(e.setRenderTarget(M),p=null,h=null,d=null,r=null,y=null,We.stop(),i.isPresenting=!1,e.setPixelRatio(x),e.setSize(A.width,A.height,!1),b!==null){let j=b.camera;j.fov=b.fov,j.zoom=b.zoom,j.updateProjectionMatrix(),b=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){s=j,i.isPresenting===!0&&ke("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){a=j,i.isPresenting===!0&&ke("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(j){c=j},this.getBaseLayer=function(){return h!==null?h:p},this.getBinding=function(){return d===null&&_&&(d=new XRWebGLBinding(r,t)),d},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(j){if(r=j,r!==null){if(M=e.getRenderTarget(),r.addEventListener("select",Y),r.addEventListener("selectstart",Y),r.addEventListener("selectend",Y),r.addEventListener("squeeze",Y),r.addEventListener("squeezestart",Y),r.addEventListener("squeezeend",Y),r.addEventListener("end",H),r.addEventListener("inputsourceschange",ne),v.xrCompatible!==!0&&await t.makeXRCompatible(),x=e.getPixelRatio(),e.getSize(A),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let ye=null,Fe=null,_e=null;v.depth&&(_e=v.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ye=v.stencil?Vs:hr,Fe=v.stencil?Ka:Yi);let He={colorFormat:t.RGBA8,depthFormat:_e,scaleFactor:s};d=this.getBinding(),h=d.createProjectionLayer(He),r.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),y=new Tn(h.textureWidth,h.textureHeight,{format:jn,type:di,depthTexture:new Ds(h.textureWidth,h.textureHeight,Fe,void 0,void 0,void 0,void 0,void 0,void 0,ye),stencilBuffer:v.stencil,colorSpace:e.outputColorSpace,samples:v.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let ye={antialias:v.antialias,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(r,t,ye),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),y=new Tn(p.framebufferWidth,p.framebufferHeight,{format:jn,type:di,colorSpace:e.outputColorSpace,stencilBuffer:v.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),We.setContext(r),We.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function ne(j){for(let ie=0;ie<j.removed.length;ie++){let ye=j.removed[ie],Fe=E.indexOf(ye);Fe>=0&&(E[Fe]=null,w[Fe].disconnect(ye))}for(let ie=0;ie<j.added.length;ie++){let ye=j.added[ie],Fe=E.indexOf(ye);if(Fe===-1){for(let He=0;He<w.length;He++)if(He>=E.length){E.push(ye),Fe=He;break}else if(E[He]===null){E[He]=ye,Fe=He;break}if(Fe===-1)break}let _e=w[Fe];_e&&_e.connect(ye)}}let Z=new q,te=new q;function re(j,ie,ye){Z.setFromMatrixPosition(ie.matrixWorld),te.setFromMatrixPosition(ye.matrixWorld);let Fe=Z.distanceTo(te),_e=ie.projectionMatrix.elements,He=ye.projectionMatrix.elements,Ft=_e[14]/(_e[10]-1),qe=_e[14]/(_e[10]+1),Be=(_e[9]+1)/_e[5],ht=(_e[9]-1)/_e[5],Ye=(_e[8]-1)/_e[0],Ne=(He[8]+1)/He[0],Ct=Ft*Ye,Ot=Ft*Ne,Ke=Fe/(-Ye+Ne),xt=Ke*-Ye;if(ie.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(xt),j.translateZ(Ke),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),_e[10]===-1)j.projectionMatrix.copy(ie.projectionMatrix),j.projectionMatrixInverse.copy(ie.projectionMatrixInverse);else{let F=Ft+Ke,yt=qe+Ke,$e=Ct-xt,C=Ot+(Fe-xt),S=Be*qe/yt*F,k=ht*qe/yt*F;j.projectionMatrix.makePerspective($e,C,S,k,F,yt),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function Te(j,ie){ie===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(ie.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(r===null)return;let ie=j.near,ye=j.far;m.texture!==null&&(m.depthNear>0&&(ie=m.depthNear),m.depthFar>0&&(ye=m.depthFar)),B.near=L.near=P.near=ie,B.far=L.far=P.far=ye,(I!==B.near||O!==B.far)&&(r.updateRenderState({depthNear:B.near,depthFar:B.far}),I=B.near,O=B.far),B.layers.mask=j.layers.mask|6,P.layers.mask=B.layers.mask&-5,L.layers.mask=B.layers.mask&-3;let Fe=j.parent,_e=B.cameras;Te(B,Fe);for(let He=0;He<_e.length;He++)Te(_e[He],Fe);_e.length===2?re(B,P,L):B.projectionMatrix.copy(P.projectionMatrix),b===null&&j.isPerspectiveCamera&&(b={camera:j,fov:j.fov,zoom:j.zoom}),fe(j,B,Fe)};function fe(j,ie,ye){ye===null?j.matrix.copy(ie.matrixWorld):(j.matrix.copy(ye.matrixWorld),j.matrix.invert(),j.matrix.multiply(ie.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(ie.projectionMatrix),j.projectionMatrixInverse.copy(ie.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=yf*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return B},this.getFoveation=function(){if(!(h===null&&p===null))return l},this.setFoveation=function(j){l=j,h!==null&&(h.fixedFoveation=j),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=j)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(B)},this.getCameraTexture=function(j){return f[j]};let Ue=null;function Oe(j,ie){if(u=ie.getViewerPose(c||o),g=ie,u!==null){let ye=u.views;p!==null&&(e.setRenderTargetFramebuffer(y,p.framebuffer),e.setRenderTarget(y));let Fe=!1;ye.length!==B.cameras.length&&(B.cameras.length=0,Fe=!0);for(let qe=0;qe<ye.length;qe++){let Be=ye[qe],ht=null;if(p!==null)ht=p.getViewport(Be);else{let Ne=d.getViewSubImage(h,Be);ht=Ne.viewport,qe===0&&(e.setRenderTargetTextures(y,Ne.colorTexture,Ne.depthStencilTexture),e.setRenderTarget(y))}let Ye=D[qe];Ye===void 0&&(Ye=new Kn,Ye.layers.enable(qe),Ye.viewport=new Ut,D[qe]=Ye),Ye.matrix.fromArray(Be.transform.matrix),Ye.matrix.decompose(Ye.position,Ye.quaternion,Ye.scale),Ye.projectionMatrix.fromArray(Be.projectionMatrix),Ye.projectionMatrixInverse.copy(Ye.projectionMatrix).invert(),Ye.viewport.set(ht.x,ht.y,ht.width,ht.height),qe===0&&(B.matrix.copy(Ye.matrix),B.matrix.decompose(B.position,B.quaternion,B.scale)),Fe===!0&&B.cameras.push(Ye)}let _e=r.enabledFeatures;if(_e&&_e.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&_){d=i.getBinding();let qe=d.getDepthInformation(ye[0]);qe&&qe.isValid&&qe.texture&&m.init(qe,r.renderState)}if(_e&&_e.includes("camera-access")&&_){e.state.unbindTexture(),d=i.getBinding();for(let qe=0;qe<ye.length;qe++){let Be=ye[qe].camera;if(Be){let ht=f[Be];ht||(ht=new Dc,f[Be]=ht);let Ye=d.getCameraImage(Be);ht.sourceTexture=Ye}}}}for(let ye=0;ye<w.length;ye++){let Fe=E[ye],_e=w[ye];Fe!==null&&_e!==void 0&&_e.update(Fe,ie,c||o)}Ue&&Ue(j,ie),ie.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ie}),g=null}let We=new G1;We.setAnimationLoop(Oe),this.setAnimationLoop=function(j){Ue=j},this.dispose=function(){}}},NI=new Ht,Z1=new Ge;Z1.set(-1,0,0,0,1,0,0,0,1);OI=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),vr=null;Ld=class{constructor(e={}){let{canvas:t=d1(),context:i=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:h=!1,outputBufferType:p=di}=e;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=o;let _=p,m=new Set([$f,Zf,Yf]),f=new Set([di,Yi,Ja,Ka,Xf,qf]),v=new Uint32Array(4),M=new Int32Array(4),y=new q,w=null,E=null,A=[],x=[],b=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=qi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,L=!1,D=null,B=null,I=null,O=null;this._outputColorSpace=wn;let Y=0,H=0,ne=null,Z=-1,te=null,re=new Ut,Te=new Ut,fe=null,Ue=new rt(0),Oe=0,We=t.width,j=t.height,ie=1,ye=null,Fe=null,_e=new Ut(0,0,We,j),He=new Ut(0,0,We,j),Ft=!1,qe=new Pc,Be=!1,ht=!1,Ye=new Ht,Ne=new q,Ct=new Ut,Ot={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ke=!1;function xt(){return ne===null?ie:1}let F=i;function yt(T,N){return t.getContext(T,N)}let $e,C,S,k,z,J,le,de,W,Q,ue,Pe,ge,he,Ae,De,ze,U,pe,ee,me,Se,se;try{let T={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",ft,!1),t.addEventListener("webglcontextrestored",et,!1),t.addEventListener("webglcontextcreationerror",sn,!1),F===null){let N="webgl2";if(F=yt(N,T),F===null)throw yt(N)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ie()}catch(T){throw t.removeEventListener("webglcontextlost",ft,!1),t.removeEventListener("webglcontextrestored",et,!1),t.removeEventListener("webglcontextcreationerror",sn,!1),Ve("WebGLRenderer: "+T.message),T}function Ie(){$e=new XP(F),$e.init(),me=new II(F,$e),C=new UP(F,$e,e,me),S=new RI(F,$e),C.reversedDepthBuffer&&h&&S.buffers.depth.setReversed(!0),B=F.createFramebuffer(),I=F.createFramebuffer(),O=F.createFramebuffer(),k=new ZP(F),z=new mI,J=new PI(F,$e,S,z,C,me,k),le=new WP(P),de=new JA(F),Se=new DP(F,de),W=new qP(F,de,k,Se),Q=new JP(F,W,de,Se,k),U=new $P(F,C,J),Ae=new FP(z),ue=new pI(P,le,$e,C,Se,Ae),Pe=new UI(P,z),ge=new _I,he=new wI($e),ze=new LP(P,le,S,Q,g,l),De=new CI(P,Q,C),se=new FI(F,k,C,S),pe=new NP(F,$e,k),ee=new YP(F,$e,k),k.programs=ue.programs,P.capabilities=C,P.extensions=$e,P.properties=z,P.renderLists=ge,P.shadowMap=De,P.state=S,P.info=k}_!==di&&(b=new jP(_,t.width,t.height,a,r,s));let Ce=new y_(P,F);this.xr=Ce,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){let T=$e.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=$e.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return ie},this.setPixelRatio=function(T){T!==void 0&&(ie=T,this.setSize(We,j,!1))},this.getSize=function(T){return T.set(We,j)},this.setSize=function(T,N,X=!0){if(Ce.isPresenting){ke("WebGLRenderer: Can't change size while VR device is presenting.");return}We=T,j=N,t.width=Math.floor(T*ie),t.height=Math.floor(N*ie),X===!0&&(t.style.width=T+"px",t.style.height=N+"px"),b!==null&&b.setSize(t.width,t.height),this.setViewport(0,0,T,N)},this.getDrawingBufferSize=function(T){return T.set(We*ie,j*ie).floor()},this.setDrawingBufferSize=function(T,N,X){We=T,j=N,ie=X,t.width=Math.floor(T*X),t.height=Math.floor(N*X),this.setViewport(0,0,T,N)},this.setEffects=function(T){if(_===di){Ve("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(T){for(let N=0;N<T.length;N++)if(T[N].isOutputPass===!0){ke("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}b.setEffects(T||[])},this.getCurrentViewport=function(T){return T.copy(re)},this.getViewport=function(T){return T.copy(_e)},this.setViewport=function(T,N,X,V){T.isVector4?_e.set(T.x,T.y,T.z,T.w):_e.set(T,N,X,V),S.viewport(re.copy(_e).multiplyScalar(ie).round())},this.getScissor=function(T){return T.copy(He)},this.setScissor=function(T,N,X,V){T.isVector4?He.set(T.x,T.y,T.z,T.w):He.set(T,N,X,V),S.scissor(Te.copy(He).multiplyScalar(ie).round())},this.getScissorTest=function(){return Ft},this.setScissorTest=function(T){S.setScissorTest(Ft=T)},this.setOpaqueSort=function(T){ye=T},this.setTransparentSort=function(T){Fe=T},this.getClearColor=function(T){return T.copy(ze.getClearColor())},this.setClearColor=function(){ze.setClearColor(...arguments)},this.getClearAlpha=function(){return ze.getClearAlpha()},this.setClearAlpha=function(){ze.setClearAlpha(...arguments)},this.clear=function(T=!0,N=!0,X=!0){let V=0;if(T){let R=!1;if(ne!==null){let G=ne.texture.format;R=m.has(G)}if(R){let G=ne.texture.type,$=f.has(G),K=ze.getClearColor(),oe=ze.getClearAlpha(),ce=K.r,Ee=K.g,Me=K.b;$?(v[0]=ce,v[1]=Ee,v[2]=Me,v[3]=oe,F.clearBufferuiv(F.COLOR,0,v)):(M[0]=ce,M[1]=Ee,M[2]=Me,M[3]=oe,F.clearBufferiv(F.COLOR,0,M))}else V|=F.COLOR_BUFFER_BIT}N&&(V|=F.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),X&&(V|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),V!==0&&F.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(T){T.setRenderer(this),D=T},this.dispose=function(){t.removeEventListener("webglcontextlost",ft,!1),t.removeEventListener("webglcontextrestored",et,!1),t.removeEventListener("webglcontextcreationerror",sn,!1),ze.dispose(),ge.dispose(),he.dispose(),z.dispose(),le.dispose(),Q.dispose(),Se.dispose(),se.dispose(),ue.dispose(),Ce.dispose(),Ce.removeEventListener("sessionstart",nl),Ce.removeEventListener("sessionend",Xs),Ji.stop()};function ft(T){T.preventDefault(),e_("WebGLRenderer: Context Lost."),L=!0}function et(){e_("WebGLRenderer: Context Restored."),L=!1;let T=k.autoReset,N=De.enabled,X=De.autoUpdate,V=De.needsUpdate,R=De.type;Ie(),k.autoReset=T,De.enabled=N,De.autoUpdate=X,De.needsUpdate=V,De.type=R}function sn(T){Ve("WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function on(T){let N=T.target;N.removeEventListener("dispose",on),Vd(N)}function Vd(T){Do(T),z.remove(T)}function Do(T){let N=z.get(T).programs;N!==void 0&&(N.forEach(function(X){ue.releaseProgram(X)}),T.isShaderMaterial&&ue.releaseShaderCache(T))}this.renderBufferDirect=function(T,N,X,V,R,G){N===null&&(N=Ot);let $=R.isMesh&&R.matrixWorld.determinantAffine()<0,K=ol(T,N,X,V,R);S.setMaterial(V,$);let oe=X.index,ce=1;if(V.wireframe===!0){if(oe=W.getWireframeAttribute(X),oe===void 0)return;ce=2}let Ee=X.drawRange,Me=X.attributes.position,ve=Ee.start*ce,Le=(Ee.start+Ee.count)*ce;G!==null&&(ve=Math.max(ve,G.start*ce),Le=Math.min(Le,(G.start+G.count)*ce)),oe!==null?(ve=Math.max(ve,0),Le=Math.min(Le,oe.count)):Me!=null&&(ve=Math.max(ve,0),Le=Math.min(Le,Me.count));let Ze=Le-ve;if(Ze<0||Ze===1/0)return;Se.setup(R,V,K,X,oe);let ct,Re=pe;if(oe!==null&&(ct=de.get(oe),Re=ee,Re.setIndex(ct)),R.isMesh)V.wireframe===!0?(S.setLineWidth(V.wireframeLinewidth*xt()),Re.setMode(F.LINES)):Re.setMode(F.TRIANGLES);else if(R.isLine){let ot=V.linewidth;ot===void 0&&(ot=1),S.setLineWidth(ot*xt()),R.isLineSegments?Re.setMode(F.LINES):R.isLineLoop?Re.setMode(F.LINE_LOOP):Re.setMode(F.LINE_STRIP)}else R.isPoints?Re.setMode(F.POINTS):R.isSprite&&Re.setMode(F.TRIANGLES);if(R.isBatchedMesh)if($e.get("WEBGL_multi_draw"))Re.renderMultiDraw(R._multiDrawStarts,R._multiDrawCounts,R._multiDrawCount);else{let ot=R._multiDrawStarts,we=R._multiDrawCounts,Wt=R._multiDrawCount,je=oe?de.get(oe).bytesPerElement:1,An=z.get(V).currentProgram.getUniforms();for(let Cn=0;Cn<Wt;Cn++)An.setValue(F,"_gl_DrawID",Cn),Re.render(ot[Cn]/je,we[Cn])}else if(R.isInstancedMesh)Re.renderInstances(ve,Ze,R.count);else if(X.isInstancedBufferGeometry){let ot=X._maxInstanceCount!==void 0?X._maxInstanceCount:1/0,we=Math.min(X.instanceCount,ot);Re.renderInstances(ve,Ze,we)}else Re.render(ve,Ze)};function Ws(T,N,X,V){D!==null&&T.isNodeMaterial&&D.setObject(V,T),Be===!0&&Ae.setState(T,X,!1),T.transparent===!0&&T.side===mr&&T.forceSinglePass===!1?(T.side=On,T.needsUpdate=!0,qs(T,N,V),T.side=ks,T.needsUpdate=!0,qs(T,N,V),T.side=mr):qs(T,N,V)}this.compile=function(T,N,X=null){X===null&&(X=T),D!==null&&D.renderStart(T,N,X),E=he.get(X),E.init(N),x.push(E),X.traverseVisible(function(R){R.isLight&&R.layers.test(N.layers)&&(E.pushLight(R),R.castShadow&&E.pushShadow(R))}),T!==X&&T.traverseVisible(function(R){R.isLight&&R.layers.test(N.layers)&&(E.pushLight(R),R.castShadow&&E.pushShadow(R))}),E.setupLights(),D!==null&&D.updateLights(E.state.lightsArray),ht=this.localClippingEnabled,Be=Ae.init(this.clippingPlanes,ht),Be===!0&&Ae.setGlobalState(this.clippingPlanes,N),D!==null&&De.render(E.state.shadowsArray,X,N);let V=new Set;return T.traverse(function(R){if(!(R.isMesh||R.isPoints||R.isLine||R.isSprite))return;let G=R.material;if(G)if(Array.isArray(G))for(let $=0;$<G.length;$++){let K=G[$];Ws(K,X,N,R),V.add(K)}else Ws(G,X,N,R),V.add(G)}),E=x.pop(),D!==null&&D.renderEnd(),V},this.compileAsync=function(T,N,X=null){let V=this.compile(T,N,X);return new Promise(R=>{function G(){if(V.forEach(function($){let oe=z.get($).currentProgram;(oe===void 0||oe.isReady())&&V.delete($)}),V.size===0){R(T);return}setTimeout(G,10)}$e.get("KHR_parallel_shader_compile")!==null?G():setTimeout(G,10)})};let No=null;function Jc(T){No&&No(T)}function nl(){Ji.stop()}function Xs(){Ji.start()}let Ji=new G1;Ji.setAnimationLoop(Jc),typeof self<"u"&&Ji.setContext(self),this.setAnimationLoop=function(T){No=T,Ce.setAnimationLoop(T),T===null?Ji.stop():Ji.start()},Ce.addEventListener("sessionstart",nl),Ce.addEventListener("sessionend",Xs),this.render=function(T,N){if(N!==void 0&&N.isCamera!==!0){Ve("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;D!==null&&D.renderStart(T,N);let X=Ce.enabled===!0&&Ce.isPresenting===!0,V=b!==null&&(ne===null||X)&&b.begin(P,ne);if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),Ce.enabled===!0&&Ce.isPresenting===!0&&(b===null||b.isCompositing()===!1)&&(Ce.cameraAutoUpdate===!0&&Ce.updateCamera(N),N=Ce.getCamera()),T.isScene===!0&&T.onBeforeRender(P,T,N,ne),E=he.get(T,x.length),E.init(N),E.state.textureUnits=J.getTextureUnits(),x.push(E),Ye.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),qe.setFromProjectionMatrix(Ye,Xi,N.reversedDepth),ht=this.localClippingEnabled,Be=Ae.init(this.clippingPlanes,ht),w=ge.get(T,A.length),w.init(),A.push(w),Ce.enabled===!0&&Ce.isPresenting===!0){let $=P.xr.getDepthSensingMesh();$!==null&&Uo($,N,-1/0,P.sortObjects)}Uo(T,N,0,P.sortObjects),w.finish(),D!==null&&D.updateLights(E.state.lightsArray),P.sortObjects===!0&&w.sort(ye,Fe),Ke=Ce.enabled===!1||Ce.isPresenting===!1||Ce.hasDepthSensing()===!1,Ke&&ze.addToRenderList(w,T),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Be===!0&&Ae.beginShadows();let R=E.state.shadowsArray;if(De.render(R,T,N),Be===!0&&Ae.endShadows(),(V&&b.hasRenderPass())===!1){let $=w.opaque,K=w.transmissive;if(E.setupLights(),N.isArrayCamera){let oe=N.cameras;if(K.length>0)for(let ce=0,Ee=oe.length;ce<Ee;ce++){let Me=oe[ce];rl($,K,T,Me)}Ke&&ze.render(T);for(let ce=0,Ee=oe.length;ce<Ee;ce++){let Me=oe[ce];il(w,T,Me,Me.viewport)}}else K.length>0&&rl($,K,T,N),Ke&&ze.render(T),il(w,T,N)}ne!==null&&H===0&&(J.updateMultisampleRenderTarget(ne),J.updateRenderTargetMipmap(ne)),V&&b.end(P),T.isScene===!0&&T.onAfterRender(P,T,N),Se.resetDefaultState(),Z=-1,te=null,x.pop(),x.length>0?(E=x[x.length-1],J.setTextureUnits(E.state.textureUnits),Be===!0&&Ae.setGlobalState(P.clippingPlanes,E.state.camera)):E=null,A.pop(),A.length>0?w=A[A.length-1]:w=null,D!==null&&D.renderEnd()};function Uo(T,N,X,V){if(T.visible===!1)return;if(T.layers.test(N.layers)){if(T.isGroup)X=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(N);else if(T.isLightProbeGrid)E.pushLightProbeGrid(T);else if(T.isLight)E.pushLight(T),T.castShadow&&E.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||T.intersectsFrustum(qe)){V&&Ct.setFromMatrixPosition(T.matrixWorld).applyMatrix4(Ye);let $=Q.update(T),K=T.material;K.visible&&w.push(T,$,K,X,Ct.z,null,N)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||T.intersectsFrustum(qe))){let $=Q.update(T),K=T.material;if(V&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Ct.copy(T.boundingSphere.center)):($.boundingSphere===null&&$.computeBoundingSphere(),Ct.copy($.boundingSphere.center)),Ct.applyMatrix4(T.matrixWorld).applyMatrix4(Ye)),Array.isArray(K)){let oe=$.groups;for(let ce=0,Ee=oe.length;ce<Ee;ce++){let Me=oe[ce],ve=K[Me.materialIndex];ve&&ve.visible&&w.push(T,$,ve,X,Ct.z,Me,N)}}else K.visible&&w.push(T,$,K,X,Ct.z,null,N)}}let G=T.children;for(let $=0,K=G.length;$<K;$++)Uo(G[$],N,X,V)}function il(T,N,X,V){let{opaque:R,transmissive:G,transparent:$}=T;E.setupLightsView(X),Be===!0&&Ae.setGlobalState(P.clippingPlanes,X),V&&S.viewport(re.copy(V)),R.length>0&&Fo(R,N,X),G.length>0&&Fo(G,N,X),$.length>0&&Fo($,N,X),S.buffers.depth.setTest(!0),S.buffers.depth.setMask(!0),S.buffers.color.setMask(!0),S.setPolygonOffset(!1)}function rl(T,N,X,V){if((X.isScene===!0?X.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[V.id]===void 0){let ve=$e.has("EXT_color_buffer_half_float")||$e.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[V.id]=new Tn(1,1,{generateMipmaps:!0,type:ve?$i:di,minFilter:_r,samples:Math.max(4,C.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Qe.workingColorSpace})}let G=E.state.transmissionRenderTarget[V.id],$=V.viewport||re;G.setSize($.z*P.transmissionResolutionScale,$.w*P.transmissionResolutionScale);let K=P.getRenderTarget(),oe=P.getActiveCubeFace(),ce=P.getActiveMipmapLevel();P.setRenderTarget(G),P.getClearColor(Ue),Oe=P.getClearAlpha(),Oe<1&&P.setClearColor(16777215,.5),P.clear(),Ke&&ze.render(X);let Ee=P.toneMapping;P.toneMapping=qi;let Me=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),E.setupLightsView(V),Be===!0&&Ae.setGlobalState(P.clippingPlanes,V),Fo(T,X,V),J.updateMultisampleRenderTarget(G),J.updateRenderTargetMipmap(G),$e.has("WEBGL_multisampled_render_to_texture")===!1){let ve=!1;for(let Le=0,Ze=N.length;Le<Ze;Le++){let ct=N[Le],{object:Re,geometry:ot,material:we,group:Wt}=ct;if(we.side===mr&&Re.layers.test(V.layers)){let je=we.side;we.side=On,we.needsUpdate=!0,Kc(Re,X,V,ot,we,Wt),we.side=je,we.needsUpdate=!0,ve=!0}}ve===!0&&(J.updateMultisampleRenderTarget(G),J.updateRenderTargetMipmap(G))}P.setRenderTarget(K,oe,ce),P.setClearColor(Ue,Oe),Me!==void 0&&(V.viewport=Me),P.toneMapping=Ee}function Fo(T,N,X){let V=N.isScene===!0?N.overrideMaterial:null;for(let R=0,G=T.length;R<G;R++){let $=T[R],{object:K,geometry:oe,group:ce}=$,Ee=$.material;Ee.allowOverride===!0&&V!==null&&(Ee=V),K.layers.test(X.layers)&&Kc(K,N,X,oe,Ee,ce)}}function Kc(T,N,X,V,R,G){D!==null&&R.isNodeMaterial&&D.setObject(T,R),T.onBeforeRender(P,N,X,V,R,G),T.modelViewMatrix.multiplyMatrices(X.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),R.onBeforeRender(P,N,X,V,T,G),R.transparent===!0&&R.side===mr&&R.forceSinglePass===!1?(R.side=On,R.needsUpdate=!0,P.renderBufferDirect(X,N,V,R,T,G),R.side=ks,R.needsUpdate=!0,P.renderBufferDirect(X,N,V,R,T,G),R.side=mr):P.renderBufferDirect(X,N,V,R,T,G),T.onAfterRender(P,N,X,V,R,G)}function qs(T,N,X){N.isScene!==!0&&(N=Ot);let V=z.get(T),R=E.state.lights,G=E.state.shadowsArray,$=R.state.version,K=ue.getParameters(T,R.state,G,N,X,E.state.lightProbeGridArray),oe=ue.getProgramCacheKey(K),ce=V.programs;V.environment=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?N.environment:null,V.fog=N.fog;let Ee=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap;V.envMap=le.get(T.envMap||V.environment,Ee),V.envMapRotation=V.environment!==null&&T.envMap===null?N.environmentRotation:T.envMapRotation,ce===void 0&&(T.addEventListener("dispose",on),ce=new Map,V.programs=ce);let Me=ce.get(oe);if(Me!==void 0){if(V.currentProgram===Me&&V.lightsStateVersion===$)return qr(T,K),Me}else K.uniforms=ue.getUniforms(T),D!==null&&T.isNodeMaterial&&D.build(T,X,K),T.onBeforeCompile(K,P),Me=ue.acquireProgram(K,oe),ce.set(oe,Me),V.uniforms=K.uniforms;let ve=V.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(ve.clippingPlanes=Ae.uniform),qr(T,K),V.needsLights=al(T),V.lightsStateVersion=$,V.needsLights&&(ve.ambientLightColor.value=R.state.ambient,ve.lightProbe.value=R.state.probe,ve.sunLights.value=R.state.sun,ve.sunLightShadows.value=R.state.sunShadow,ve.directionalLights.value=R.state.directional,ve.directionalLightShadows.value=R.state.directionalShadow,ve.spotLights.value=R.state.spot,ve.spotLightShadows.value=R.state.spotShadow,ve.rectAreaLights.value=R.state.rectArea,ve.ltc_1.value=R.state.rectAreaLTC1,ve.ltc_2.value=R.state.rectAreaLTC2,ve.pointLights.value=R.state.point,ve.pointLightShadows.value=R.state.pointShadow,ve.hemisphereLights.value=R.state.hemi,ve.sunShadowMatrix.value=R.state.sunShadowMatrix,ve.sunShadowCascade.value=R.state.sunShadowCascade,ve.directionalShadowMatrix.value=R.state.directionalShadowMatrix,ve.spotLightMatrix.value=R.state.spotLightMatrix,ve.spotLightMap.value=R.state.spotLightMap,ve.pointShadowMatrix.value=R.state.pointShadowMatrix),V.lightProbeGrid=E.state.lightProbeGridArray.length>0,V.currentProgram=Me,V.uniformsList=null,Me}function Gd(T){if(T.uniformsList===null){let N=T.currentProgram.getUniforms();T.uniformsList=el.seqWithValue(N.seq,T.uniforms)}return T.uniformsList}function qr(T,N){let X=z.get(T);X.outputColorSpace=N.outputColorSpace,X.batching=N.batching,X.batchingColor=N.batchingColor,X.instancing=N.instancing,X.instancingColor=N.instancingColor,X.instancingMorph=N.instancingMorph,X.skinning=N.skinning,X.morphTargets=N.morphTargets,X.morphNormals=N.morphNormals,X.morphColors=N.morphColors,X.morphTargetsCount=N.morphTargetsCount,X.numClippingPlanes=N.numClippingPlanes,X.numIntersection=N.numClipIntersection,X.vertexAlphas=N.vertexAlphas,X.vertexTangents=N.vertexTangents,X.toneMapping=N.toneMapping}function sl(T,N){if(T.length===0)return null;if(T.length===1)return T[0].texture!==null?T[0]:null;y.setFromMatrixPosition(N.matrixWorld);for(let X=0,V=T.length;X<V;X++){let R=T[X];if(R.texture!==null&&R.boundingBox.containsPoint(y))return R}return null}function ol(T,N,X,V,R){N.isScene!==!0&&(N=Ot),J.resetTextureUnits();let G=N.fog,$=V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial?N.environment:null,K=ne===null?P.outputColorSpace:ne.isXRRenderTarget===!0?ne.texture.colorSpace:Qe.workingColorSpace,oe=V.isMeshStandardMaterial||V.isMeshLambertMaterial&&!V.envMap||V.isMeshPhongMaterial&&!V.envMap,ce=le.get(V.envMap||$,oe),Ee=V.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,Me=!!X.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),ve=!!X.morphAttributes.position,Le=!!X.morphAttributes.normal,Ze=!!X.morphAttributes.color,ct=qi;V.toneMapped&&(ne===null||ne.isXRRenderTarget===!0)&&(ct=P.toneMapping);let Re=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,ot=Re!==void 0?Re.length:0,we=z.get(V),Wt=E.state.lights;if(Be===!0&&(ht===!0||T!==te)){let dt=T===te&&V.id===Z;Ae.setState(V,T,dt)}let je=!1;V.version===we.__version?(we.needsLights&&we.lightsStateVersion!==Wt.state.version||we.outputColorSpace!==K||R.isBatchedMesh&&we.batching===!1||!R.isBatchedMesh&&we.batching===!0||R.isBatchedMesh&&we.batchingColor===!0&&R._colorsTexture===null||R.isBatchedMesh&&we.batchingColor===!1&&R._colorsTexture!==null||R.isInstancedMesh&&we.instancing===!1||!R.isInstancedMesh&&we.instancing===!0||R.isSkinnedMesh&&we.skinning===!1||!R.isSkinnedMesh&&we.skinning===!0||R.isInstancedMesh&&we.instancingColor===!0&&R.instanceColor===null||R.isInstancedMesh&&we.instancingColor===!1&&R.instanceColor!==null||R.isInstancedMesh&&we.instancingMorph===!0&&R.morphTexture===null||R.isInstancedMesh&&we.instancingMorph===!1&&R.morphTexture!==null||we.envMap!==ce||V.fog===!0&&we.fog!==G||we.numClippingPlanes!==void 0&&(we.numClippingPlanes!==Ae.numPlanes||we.numIntersection!==Ae.numIntersection)||we.vertexAlphas!==Ee||we.vertexTangents!==Me||we.morphTargets!==ve||we.morphNormals!==Le||we.morphColors!==Ze||we.toneMapping!==ct||we.morphTargetsCount!==ot||!!we.lightProbeGrid!=E.state.lightProbeGridArray.length>0)&&(je=!0):(je=!0,we.__version=V.version);let An=we.currentProgram;je===!0&&(An=qs(V,N,R),D&&V.isNodeMaterial&&D.onUpdateProgram(V,An,we));let Cn=!1,kn=!1,Ri=!1,at=An.getUniforms(),Tt=we.uniforms;if(S.useProgram(An.program)&&(Cn=!0,kn=!0,Ri=!0),V.id!==Z&&(Z=V.id,kn=!0),we.needsLights){let dt=sl(E.state.lightProbeGridArray,R);we.lightProbeGrid!==dt&&(we.lightProbeGrid=dt,kn=!0)}if(Cn||te!==T){S.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),at.setValue(F,"projectionMatrix",T.projectionMatrix),at.setValue(F,"viewMatrix",T.matrixWorldInverse);let Ii=at.map.cameraPosition;Ii!==void 0&&Ii.setValue(F,Ne.setFromMatrixPosition(T.matrixWorld)),C.logarithmicDepthBuffer&&at.setValue(F,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&at.setValue(F,"isOrthographic",T.isOrthographicCamera===!0),te!==T&&(te=T,kn=!0,Ri=!0)}if(we.needsLights&&(Wt.state.sunShadowMap.length>0&&at.setValue(F,"sunShadowMap",Wt.state.sunShadowMap,J),Wt.state.directionalShadowMap.length>0&&at.setValue(F,"directionalShadowMap",Wt.state.directionalShadowMap,J),Wt.state.spotShadowMap.length>0&&at.setValue(F,"spotShadowMap",Wt.state.spotShadowMap,J),Wt.state.pointShadowMap.length>0&&at.setValue(F,"pointShadowMap",Wt.state.pointShadowMap,J)),R.isSkinnedMesh){at.setOptional(F,R,"bindMatrix"),at.setOptional(F,R,"bindMatrixInverse");let dt=R.skeleton;dt&&(dt.boneTexture===null&&dt.computeBoneTexture(),at.setValue(F,"boneTexture",dt.boneTexture,J))}R.isBatchedMesh&&(at.setOptional(F,R,"batchingTexture"),at.setValue(F,"batchingTexture",R._matricesTexture,J),at.setOptional(F,R,"batchingIdTexture"),at.setValue(F,"batchingIdTexture",R._indirectTexture,J),at.setOptional(F,R,"batchingColorTexture"),R._colorsTexture!==null&&at.setValue(F,"batchingColorTexture",R._colorsTexture,J));let Pi=X.morphAttributes;if((Pi.position!==void 0||Pi.normal!==void 0||Pi.color!==void 0)&&U.update(R,X,An),(kn||we.receiveShadow!==R.receiveShadow)&&(we.receiveShadow=R.receiveShadow,at.setValue(F,"receiveShadow",R.receiveShadow)),(V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial)&&V.envMap===null&&N.environment!==null&&(Tt.envMapIntensity.value=N.environmentIntensity),Tt.dfgLUT!==void 0&&(Tt.dfgLUT.value=BI()),kn){if(at.setValue(F,"toneMappingExposure",P.toneMappingExposure),we.needsLights&&jc(Tt,Ri),G&&V.fog===!0&&Pe.refreshFogUniforms(Tt,G),Pe.refreshMaterialUniforms(Tt,V,ie,j,E.state.transmissionRenderTarget[T.id]),we.needsLights&&we.lightProbeGrid){let dt=we.lightProbeGrid;Tt.probesSH.value=dt.texture,Tt.probesMin.value.copy(dt.boundingBox.min),Tt.probesMax.value.copy(dt.boundingBox.max),Tt.probesResolution.value.copy(dt.resolution)}el.upload(F,Gd(we),Tt,J)}if(V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(el.upload(F,Gd(we),Tt,J),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&at.setValue(F,"center",R.center),at.setValue(F,"modelViewMatrix",R.modelViewMatrix),at.setValue(F,"normalMatrix",R.normalMatrix),at.setValue(F,"modelMatrix",R.matrixWorld),V.uniformsGroups!==void 0){let dt=V.uniformsGroups;for(let Ii=0,Ki=dt.length;Ii<Ki;Ii++){let eu=dt[Ii];se.update(eu,An),se.bind(eu,An)}}return An}function jc(T,N){T.ambientLightColor.needsUpdate=N,T.lightProbe.needsUpdate=N,T.sunLights.needsUpdate=N,T.sunLightShadows.needsUpdate=N,T.directionalLights.needsUpdate=N,T.directionalLightShadows.needsUpdate=N,T.pointLights.needsUpdate=N,T.pointLightShadows.needsUpdate=N,T.spotLights.needsUpdate=N,T.spotLightShadows.needsUpdate=N,T.rectAreaLights.needsUpdate=N,T.hemisphereLights.needsUpdate=N}function al(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return Y},this.getActiveMipmapLevel=function(){return H},this.getRenderTarget=function(){return ne},this.setRenderTargetTextures=function(T,N,X){let V=z.get(T);V.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),z.get(T.texture).__webglTexture=N,z.get(T.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:X,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,N){let X=z.get(T);X.__webglFramebuffer=N,X.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(T,N=0,X=0){ne=T,Y=N,H=X;let V=null,R=!1,G=!1;if(T){let K=z.get(T);if(K.__useDefaultFramebuffer!==void 0){S.bindFramebuffer(F.FRAMEBUFFER,K.__webglFramebuffer),re.copy(T.viewport),Te.copy(T.scissor),fe=T.scissorTest,S.viewport(re),S.scissor(Te),S.setScissorTest(fe),Z=-1;return}else if(K.__webglFramebuffer===void 0)J.setupRenderTarget(T);else if(K.__hasExternalTextures)J.rebindTextures(T,z.get(T.texture).__webglTexture,z.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let Ee=T.depthTexture;if(K.__boundDepthTexture!==Ee){if(Ee!==null&&z.has(Ee)&&(T.width!==Ee.image.width||T.height!==Ee.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");J.setupDepthRenderbuffer(T)}}let oe=T.texture;(oe.isData3DTexture||oe.isDataArrayTexture||oe.isCompressedArrayTexture)&&(G=!0);let ce=z.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(ce[N])?V=ce[N][X]:V=ce[N],R=!0):T.samples>0&&J.useMultisampledRTT(T)===!1?V=z.get(T).__webglMultisampledFramebuffer:Array.isArray(ce)?V=ce[X]:V=ce,re.copy(T.viewport),Te.copy(T.scissor),fe=T.scissorTest}else re.copy(_e).multiplyScalar(ie).floor(),Te.copy(He).multiplyScalar(ie).floor(),fe=Ft;if(X!==0&&(V=B),S.bindFramebuffer(F.FRAMEBUFFER,V)&&S.drawBuffers(T,V),S.viewport(re),S.scissor(Te),S.setScissorTest(fe),R){let K=z.get(T.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+N,K.__webglTexture,X)}else if(G){let K=N;for(let oe=0;oe<T.textures.length;oe++){let ce=z.get(T.textures[oe]);F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0+oe,ce.__webglTexture,X,K)}}else if(T!==null&&X!==0){let K=z.get(T.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,K.__webglTexture,X)}Z=-1};function Qc(T){let N=z.get(T);return(N.__readFormat!==T.format||N.__readType!==T.type)&&(N.__readFormat=T.format,N.__readType=T.type,N.__formatReadable=C.textureFormatReadable(T.format),N.__typeReadable=C.textureTypeReadable(T.type)),N}this.readRenderTargetPixels=function(T,N,X,V,R,G,$,K=0){if(!(T&&T.isWebGLRenderTarget)){Ve("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let oe=z.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&$!==void 0&&(oe=oe[$]),oe){S.bindFramebuffer(F.FRAMEBUFFER,oe);try{let ce=T.textures[K],Ee=ce.format,Me=ce.type;T.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+K);let ve=Qc(ce);if(ve.__formatReadable===!1){Ve("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(ve.__typeReadable===!1){Ve("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=T.width-V&&X>=0&&X<=T.height-R&&F.readPixels(N,X,V,R,me.convert(Ee),me.convert(Me),G)}finally{let ce=ne!==null?z.get(ne).__webglFramebuffer:null;S.bindFramebuffer(F.FRAMEBUFFER,ce)}}},this.readRenderTargetPixelsAsync=async function(T,N,X,V,R,G,$,K=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let oe=z.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&$!==void 0&&(oe=oe[$]),oe)if(N>=0&&N<=T.width-V&&X>=0&&X<=T.height-R){S.bindFramebuffer(F.FRAMEBUFFER,oe);let ce=T.textures[K],Ee=ce.format,Me=ce.type;T.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+K);let ve=Qc(ce);if(ve.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(ve.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Le=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,Le),F.bufferData(F.PIXEL_PACK_BUFFER,G.byteLength,F.STREAM_READ),F.readPixels(N,X,V,R,me.convert(Ee),me.convert(Me),0),F.bindBuffer(F.PIXEL_PACK_BUFFER,null);let Ze=ne!==null?z.get(ne).__webglFramebuffer:null;S.bindFramebuffer(F.FRAMEBUFFER,Ze);let ct=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await m1(F,ct,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,Le),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,G),F.bindBuffer(F.PIXEL_PACK_BUFFER,null),F.deleteBuffer(Le),F.deleteSync(ct),G}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,N=null,X=0){let V=Math.pow(2,-X),R=Math.floor(T.image.width*V),G=Math.floor(T.image.height*V),$=N!==null?N.x:0,K=N!==null?N.y:0;J.setTexture2D(T,0),F.copyTexSubImage2D(F.TEXTURE_2D,X,0,0,$,K,R,G),S.unbindTexture()},this.copyTextureToTexture=function(T,N,X=null,V=null,R=0,G=0){let $,K,oe,ce,Ee,Me,ve,Le,Ze,ct=T.isCompressedTexture?T.mipmaps[G]:T.image;if(X!==null)$=X.max.x-X.min.x,K=X.max.y-X.min.y,oe=X.isBox3?X.max.z-X.min.z:1,ce=X.min.x,Ee=X.min.y,Me=X.isBox3?X.min.z:0;else{let Tt=Math.pow(2,-R);$=Math.floor(ct.width*Tt),K=Math.floor(ct.height*Tt),T.isDataArrayTexture?oe=ct.depth:T.isData3DTexture?oe=Math.floor(ct.depth*Tt):oe=1,ce=0,Ee=0,Me=0}V!==null?(ve=V.x,Le=V.y,Ze=V.z):(ve=0,Le=0,Ze=0);let Re=me.convert(N.format),ot=me.convert(N.type),we;N.isData3DTexture?(J.setTexture3D(N,0),we=F.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(J.setTexture2DArray(N,0),we=F.TEXTURE_2D_ARRAY):(J.setTexture2D(N,0),we=F.TEXTURE_2D),S.activeTexture(F.TEXTURE0),S.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,N.flipY),S.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),S.pixelStorei(F.UNPACK_ALIGNMENT,N.unpackAlignment);let Wt=S.getParameter(F.UNPACK_ROW_LENGTH),je=S.getParameter(F.UNPACK_IMAGE_HEIGHT),An=S.getParameter(F.UNPACK_SKIP_PIXELS),Cn=S.getParameter(F.UNPACK_SKIP_ROWS),kn=S.getParameter(F.UNPACK_SKIP_IMAGES);S.pixelStorei(F.UNPACK_ROW_LENGTH,ct.width),S.pixelStorei(F.UNPACK_IMAGE_HEIGHT,ct.height),S.pixelStorei(F.UNPACK_SKIP_PIXELS,ce),S.pixelStorei(F.UNPACK_SKIP_ROWS,Ee),S.pixelStorei(F.UNPACK_SKIP_IMAGES,Me);let Ri=T.isDataArrayTexture||T.isData3DTexture,at=N.isDataArrayTexture||N.isData3DTexture;if(T.isDepthTexture){let Tt=z.get(T),Pi=z.get(N),dt=z.get(Tt.__renderTarget),Ii=z.get(Pi.__renderTarget);S.bindFramebuffer(F.READ_FRAMEBUFFER,dt.__webglFramebuffer),S.bindFramebuffer(F.DRAW_FRAMEBUFFER,Ii.__webglFramebuffer);for(let Ki=0;Ki<oe;Ki++)Ri&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,z.get(T).__webglTexture,R,Me+Ki),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,z.get(N).__webglTexture,G,Ze+Ki)),F.blitFramebuffer(ce,Ee,$,K,ve,Le,$,K,F.DEPTH_BUFFER_BIT,F.NEAREST);S.bindFramebuffer(F.READ_FRAMEBUFFER,null),S.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if(R!==0||T.isRenderTargetTexture||z.has(T)){let Tt=z.get(T),Pi=z.get(N);S.bindFramebuffer(F.READ_FRAMEBUFFER,I),S.bindFramebuffer(F.DRAW_FRAMEBUFFER,O);for(let dt=0;dt<oe;dt++)Ri?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Tt.__webglTexture,R,Me+dt):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Tt.__webglTexture,R),at?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Pi.__webglTexture,G,Ze+dt):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Pi.__webglTexture,G),R!==0?F.blitFramebuffer(ce,Ee,$,K,ve,Le,$,K,F.COLOR_BUFFER_BIT,F.NEAREST):at?F.copyTexSubImage3D(we,G,ve,Le,Ze+dt,ce,Ee,$,K):F.copyTexSubImage2D(we,G,ve,Le,ce,Ee,$,K);S.bindFramebuffer(F.READ_FRAMEBUFFER,null),S.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else at?T.isDataTexture||T.isData3DTexture?F.texSubImage3D(we,G,ve,Le,Ze,$,K,oe,Re,ot,ct.data):N.isCompressedArrayTexture?F.compressedTexSubImage3D(we,G,ve,Le,Ze,$,K,oe,Re,ct.data):F.texSubImage3D(we,G,ve,Le,Ze,$,K,oe,Re,ot,ct):T.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,G,ve,Le,$,K,Re,ot,ct.data):T.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,G,ve,Le,ct.width,ct.height,Re,ct.data):F.texSubImage2D(F.TEXTURE_2D,G,ve,Le,$,K,Re,ot,ct);S.pixelStorei(F.UNPACK_ROW_LENGTH,Wt),S.pixelStorei(F.UNPACK_IMAGE_HEIGHT,je),S.pixelStorei(F.UNPACK_SKIP_PIXELS,An),S.pixelStorei(F.UNPACK_SKIP_ROWS,Cn),S.pixelStorei(F.UNPACK_SKIP_IMAGES,kn),G===0&&N.generateMipmaps&&F.generateMipmap(we),S.unbindTexture()},this.initRenderTarget=function(T){z.get(T).__webglFramebuffer===void 0&&J.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?J.setTextureCube(T,0):T.isData3DTexture?J.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?J.setTexture2DArray(T,0):J.setTexture2D(T,0),S.unbindTexture()},this.resetState=function(){Y=0,H=0,ne=null,S.reset(),Se.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Xi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Qe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Qe._getUnpackColorSpace()}}});function Ud(...n){return n.filter(Boolean).join(" ")}var S_=Zr(()=>{});var K1=ji(Fd=>{"use strict";var zI=hl(),VI=Symbol.for("react.element"),GI=Symbol.for("react.fragment"),HI=Object.prototype.hasOwnProperty,WI=zI.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,XI={key:!0,ref:!0,__self:!0,__source:!0};function J1(n,e,t){var i,r={},s=null,o=null;t!==void 0&&(s=""+t),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(o=e.ref);for(i in e)HI.call(e,i)&&!XI.hasOwnProperty(i)&&(r[i]=e[i]);if(n&&n.defaultProps)for(i in e=n.defaultProps,e)r[i]===void 0&&(r[i]=e[i]);return{$$typeof:VI,type:n,key:s,ref:o,props:r,_owner:WI.current}}Fd.Fragment=GI;Fd.jsx=J1;Fd.jsxs=J1});var Lo=ji((lU,j1)=>{"use strict";j1.exports=K1()});function kd({className:n,message:e="Interactive WebGL content is unavailable on this device/browser."}){return(0,Bd.jsx)("div",{className:Ud("flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-900 px-4 text-center text-sm text-white/75",n),role:"status","aria-live":"polite",children:(0,Bd.jsx)("p",{children:e})})}var Q1,Bd,Od,ew=Zr(()=>{"use client";S_();Q1=Mr(hl()),Bd=Mr(Lo()),Od=class extends Q1.Component{state={hasError:!1};static getDerivedStateFromError(){return{hasError:!0}}componentDidCatch(e,t){this.props.onError?.(e,t)}render(){return this.state.hasError?this.props.fallback??(0,Bd.jsx)(kd,{}):this.props.children}}});function yr(n,e){let t=n[e];if(t===void 0)throw new Error("Index out of range.");return t}function nw(){return typeof window<"u"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches}function jI(n){let e=n.trim();if(e.startsWith("#")&&(e.length===7||e.length===4)){let t=e.length===4?`#${e[1]}${e[1]}${e[2]}${e[2]}${e[3]}${e[3]}`:e,i=Number.parseInt(t.slice(1),16);return Number.isFinite(i)?i:16777215}return 16777215}function QI(n,e,t){let i=nw(),r=t.entry&&!i,s=t.items;if(s.length===0)return null;let o=Math.max(1,n.clientWidth),a=Math.max(1,n.clientHeight),l=()=>Math.max(120,Math.min(t.panelHeight,Math.round(a*.52))),c=l(),u=t.gap,d=i?.28:.09,h=i?.22:.05,p=1.4,g=1.6,_=1,m=.22,f=.865,v=120,M=60,y=.25,w=.06,E;try{E=new Ld({antialias:!0,alpha:t.background==="transparent"})}catch{return null}let A=Math.min(window.devicePixelRatio||1,2);E.setPixelRatio(A),E.setSize(o,a),t.background==="transparent"?E.setClearColor(0,0):E.setClearColor(jI(t.background),1),E.domElement.style.display="block",E.domElement.style.width="100%",E.domElement.style.height="100%",E.domElement.style.touchAction="none",E.domElement.style.userSelect="none",E.domElement.setAttribute("aria-hidden","true"),n.appendChild(E.domElement);let x=new Ha,b=new Bs(-o/2,o/2,a/2,-a/2,-100,100);b.position.z=10;let P=[],L=new Uc;L.setCrossOrigin("anonymous");let D=s.map(R=>{let G={tex:null,aspect:R.aspect||Sr,locked:R.aspect!=null};if(R.video){let $=document.createElement("video");return $.src=R.video,$.muted=!0,$.loop=!0,$.playsInline=!0,$.preload="auto",$.crossOrigin="anonymous",$.setAttribute("muted",""),$.setAttribute("playsinline",""),$.addEventListener("loadeddata",()=>{let K=new Ic($);K.minFilter=Et,K.magFilter=Et,K.generateMipmaps=!1,K.colorSpace=wn,!G.locked&&$.videoWidth&&(G.aspect=$.videoWidth/$.videoHeight),G.tex=K,Y(),Oe||(fe=H(0),Ue=fe)},{once:!0}),$.play().catch(()=>{}),P.push($),G}return L.load(R.src,$=>{$.minFilter=_r,$.magFilter=Et,$.generateMipmaps=!0,$.anisotropy=E.capabilities.getMaxAnisotropy(),$.colorSpace=wn,!G.locked&&$.image&&(G.aspect=$.image.width/$.image.height),G.tex=$,Y(),Oe||(fe=H(0),Ue=fe)},void 0,()=>{G.aspect=G.aspect||Sr}),G});function B(R){return yr(D,R).aspect*c+u}let I=[],O=0;function Y(){I=[];let R=0;for(let G=0;G<D.length;G++)I.push(R),R+=B(G);O=R}Y();function H(R){let G=D.length,$=Math.floor(R/G),K=(R%G+G)%G;return yr(I,K)+B(K)/2-u/2+$*O}function ne(R){if(!O)return 0;let G=D.length,$=0,K=1/0;for(let oe=0;oe<G;oe++){let ce=yr(I,oe)+B(oe)/2-u/2,Ee=Math.round((R-ce)/O),Me=Math.abs(ce+Ee*O-R);Me<K&&(K=Me,$=oe+Ee*G)}return $}function Z(R){if(!O)return 0;let G=0,$=1/0;for(let K=0;K<D.length;K++){let oe=yr(I,K)+B(K)/2-u/2,ce=Math.round((R-oe)/O),Ee=Math.abs(oe+ce*O-R);Ee<$&&($=Ee,G=K)}return G}let te=-1,re=[],Te=null;if(t.background==="transparent"){let G=new Uint8Array(256);for(let $=0;$<64;$++){let K=$/63,oe=Math.min(K,1-K)/.12,ce=Math.min(1,Math.max(0,oe)),Ee=Math.round(255*ce*ce*(3-2*ce));G[$*4]=Ee,G[$*4+1]=Ee,G[$*4+2]=Ee,G[$*4+3]=255}Te=new Xa(G,1,64,jn),Te.magFilter=Et,Te.minFilter=Et,Te.needsUpdate=!0}for(let R=0;R<Xr;R++)for(let G=0;G<D.length;G++){let $=new Ao({color:14540253,transparent:!0,alphaMap:Te}),K=new Un(new Ns(1,1,1,1),$);K.visible=!1,x.add(K),re.push({mesh:K,mat:$,srcIndex:G,bound:!1})}let fe=H(0),Ue=fe,Oe=!1,We=0,j=0,ie=0,ye=null,Fe=performance.now(),_e=!1,He=new Tn(o*A,a*A),Ft=new Ha,qe=new Bs(-1,1,1,-1,0,1),Be={uTex:{value:He.texture},uRes:{value:new it(o*A,a*A)},uCenter:{value:new it(.5,.5)},uSizeX:{value:lt.sizeX},uSizeY:{value:lt.sizeY},uShape:{value:0},uSquareRound:{value:0},uRotation:{value:0},uAspect:{value:o/a},uZoom:{value:lt.zoom},uDispersion:{value:lt.dispersion},uBlur:{value:lt.blur},uGlow:{value:lt.glow},uWhiteGlow:{value:lt.whiteGlow},uNovaSize:{value:lt.novaSize},uBlueRing:{value:lt.blueRing},uRingRadius:{value:lt.ringRadius},uRingWidth:{value:lt.ringWidth},uShimmer:{value:i||!lt.shimmer?0:1},uShimmerFreq:{value:lt.shimmerFreq},uShimmerSpeed:{value:lt.shimmerSpeed},uShimmerDepth:{value:lt.shimmerDepth},uTime:{value:0},uRimStart:{value:lt.rimStart},uRimTangential:{value:lt.rimTangential},uRimInward:{value:lt.rimInward},uRimFreq1:{value:lt.rimFreq1},uRimFreq2:{value:lt.rimFreq2},uBlueColor:{value:new rt(lt.blueColor)},uRimLine:{value:lt.rimLine},uRimLinePos:{value:lt.rimLinePos},uRimLineWidth:{value:lt.rimLineWidth},uVignette:{value:lt.vignette},uVignetteSize:{value:lt.vignetteSize},uSamples:{value:lt.samples},uLensMix:{value:1},uEdge:{value:t.background==="transparent"?1:0}},ht=new Fn({uniforms:Be,vertexShader:YI,fragmentShader:ZI}),Ye=new Un(new Ns(2,2),ht);Ft.add(Ye);let Ne={active:!1,srcIndex:-1,poolIdx:-1,lensFx:r?0:1,anim:null},Ct=new Array(Xr*D.length).fill(0),Ot=1,Ke=new Array(Xr*D.length),xt=new Array(Xr*D.length).fill(r?0:1),F=r,yt=!1,$e=new Array(Xr*D.length).fill(r?0:1),C=null,S={uDispersion:Be.uDispersion.value,uBlueRing:Be.uBlueRing.value,uRimLine:Be.uRimLine.value,uVignette:Be.uVignette.value,uZoom:Be.uZoom.value,uRimTangential:Be.uRimTangential.value,uRimInward:Be.uRimInward.value},k=[],z=null;function J(){k=[],z=null;let R=1/0,G=o/2,$=c;re.forEach((K,oe)=>{let ce=Math.floor(oe/D.length),Ee=K.srcIndex,Me=yr(D,Ee),Le=yr(I,Ee)+B(Ee)/2-u/2-fe;Le=(Le%O+O)%O,Le+=(ce-Math.floor(Xr/2))*O,Le>G+O&&(Le-=O*Xr);let Ze=Le;if(!(F||yt)&&(Ze<-G-$||Ze>G+$)){K.mesh.visible=!1,Ke[oe]=void 0;return}Ke[oe]=Ze;let Re=1-.25*ie,ot=c*Re,we=Me.aspect*c*Re;Me.tex&&!K.bound&&(K.mat.map=Me.tex,K.mat.color.set(16777215),K.mat.needsUpdate=!0,K.bound=!0);let Wt=0,je=Ne.active&&Ne.poolIdx===oe,An=Ct[oe]||0;if(K.bound){let Ki=je?Math.min(1,Math.max(0,(Ot-1)/(Bn.centerScale-1))):0;K.mat.color.setScalar(1+1.1*Ki)}let Cn=we,kn=ot;je?(Cn=we*Ot,kn=ot*Ot):An>0&&(Wt=-An*a*Bn.dropDist),K.mesh.visible=!0;let Ri=Ze,at=Wt,Tt=Cn,Pi=kn;if(F||yt){let Ki=xt[oe]||0,eu=$e[oe]||0,M_=fn.startH+(kn-fn.startH)*eu;Pi=M_,Tt=M_*Me.aspect;let ll=Z(fe),Yr=Ee-ll;Yr>D.length/2&&(Yr-=D.length),Yr<-D.length/2&&(Yr+=D.length);let Qn=D.length,w_=Math.floor(Xr/2);if(ce!==w_){K.mesh.visible=!1,Ke[oe]=void 0;return}let tu=Li=>{let Ys=$e[w_*Qn+Li]||0;return fn.startH+(c-fn.startH)*Ys},Hd=0;if(Yr>0)for(let Li=0;Li<Yr;Li++){let Ys=((ll+Li)%Qn+Qn)%Qn,cl=((ll+Li+1)%Qn+Qn)%Qn;Hd+=(yr(D,Ys).aspect*tu(Ys)+yr(D,cl).aspect*tu(cl))/2+u}else if(Yr<0)for(let Li=0;Li<-Yr;Li++){let Ys=((ll-Li)%Qn+Qn)%Qn,cl=((ll-Li-1)%Qn+Qn)%Qn;Hd-=(yr(D,Ys).aspect*tu(Ys)+yr(D,cl).aspect*tu(cl))/2+u}if(Ri=Hd,Ri<-G-$||Ri>G+$){K.mesh.visible=!1,Ke[oe]=void 0;return}let E_=-a*fn.fromBelow;at=E_+(Wt-E_)*Ki}K.mesh.position.set(Ri,at,0),K.mesh.scale.set(Tt,Pi,1);let dt=Ze+o/2,Ii=a/2-Wt;k.push({left:dt-Cn/2,right:dt+Cn/2,top:Ii-kn/2,bottom:Ii+kn/2,poolIdx:oe,srcIndex:Ee,centerX:Ze}),Math.abs(Ze)<R&&(R=Math.abs(Ze),z={srcIndex:Ee,centerX:Ze,wPx:we,h:ot,poolIdx:oe})})}function le(R,G){for(let $ of k)if(R>=$.left&&R<=$.right&&G>=$.top&&G<=$.bottom)return $;return null}function de(R){let G=E.domElement.getBoundingClientRect();return{x:R.clientX-G.left,y:R.clientY-G.top}}let W=E.domElement,Q=!1,ue=null,Pe=0,ge=0,he=0,Ae=0,De=!1,ze="mouse",U=Number.NaN,pe=Number.NaN,ee=!1,me="mouse";e&&tn.set(e,{xPercent:20,yPercent:30,scale:0,autoAlpha:0});let Se=e?tn.quickTo(e,"x",{duration:.5,ease:"power3.out"}):null,se=e?tn.quickTo(e,"y",{duration:.5,ease:"power3.out"}):null,Ie=!1,Ce=!1,ft="";function et(R){R!==ft&&(ft=R,W.style.cursor=R)}function sn(){return Ne.active||F||yt?et(""):et(Q?"grabbing":Ce?"grab":"")}function on(R){Ce=R,Do(R)}function Vd(){if(!(!ee||me!=="mouse")&&Number.isFinite(U)){if(Ne.active){on(!1);return}on(le(U,pe)!==null)}}function Do(R){if((F||yt)&&(R=!1),Q&&(R=!1),R===Ie){sn();return}Ie=R,sn(),e&&(tn.killTweensOf(e,"scale,autoAlpha,opacity,visibility"),tn.to(e,{scale:R?1:0,autoAlpha:R?1:0,duration:R?.35:.25,ease:R?"power3.out":"power3.in"}))}function Ws(){return Ne.active||F||yt}function No(R){let G=R.shiftKey&&R.deltaY||R.deltaX;Math.abs(G)<Math.abs(R.deltaY)*.6&&!R.shiftKey||(R.preventDefault(),!Ws()&&(Oe=!0,ye=null,Ue+=G*p,Fe=performance.now(),_e=!1))}function Jc(R){if(De=!1,Ws()||Q||R.button!==0&&R.pointerType==="mouse")return;Q=!0,ue=R.pointerId,ze=R.pointerType||"mouse";try{W.setPointerCapture(R.pointerId)}catch{}let G=de(R);Pe=G.x,U=G.x,pe=G.y,ge=0,he=0,Ae=performance.now(),Do(!1),We=0,ye=null,Oe=!0,_e=!1,Fe=Ae}function nl(R){let G=de(R);if(Q&&R.pointerId===ue){let $=ze==="mouse"?g:_,K=G.x-Pe;Pe=G.x,ge+=Math.abs(K),Ue-=K*$,he=he*.6+-K*$*.4,Ae=performance.now(),Fe=Ae,_e=!1}if(U=G.x,pe=G.y,me=R.pointerType||"mouse",ee=!0,R.pointerType==="mouse"){if(Se&&Se(G.x),se&&se(G.y),Ne.active){on(!1);return}on(le(G.x,G.y)!==null)}}function Xs(R){if(Q&&!(R&&ue!==null&&R.pointerId!==ue)){if(Q=!1,ue!==null){try{W.releasePointerCapture(ue)}catch{}ue=null}We=performance.now()-Ae>KI?0:he,he=0,Fe=performance.now(),_e=!1,De=ge>(ze==="mouse"?$I:JI),ze==="mouse"?on(le(U,pe)!==null):sn()}}function Ji(R){ee=!0,me=R.pointerType||"mouse"}function Uo(){ee=!1,on(!1)}function il(R){if(De){De=!1;return}if(Ws())return;let G=de(R),$=le(G.x,G.y);if($){if(z&&$.poolIdx===z.poolIdx){ye=null,rl();return}Oe=!0,We=0,Ue=H(ne(fe+$.centerX)),_e=!0,ye={srcIndex:$.srcIndex},Do(!1)}}function rl(){if(Ne.active||!z||!D[z.srcIndex]?.tex)return;Ne.active=!0,Ne.srcIndex=z.srcIndex;let G=z.poolIdx;Ne.poolIdx=G,Ue=H(ne(fe));let $=Ke[G]||0,K=re.map((Le,Ze)=>({idx:Ze,x:Ke[Ze]})).filter(Le=>Le.idx!==G&&Le.x!==void 0).map(Le=>({idx:Le.idx,dist:Math.abs((Le.x??0)-$)})).sort((Le,Ze)=>Le.dist-Ze.dist),oe=0,ce=-1,Ee=K.map(Le=>(ce>=0&&Le.dist-ce>1&&(oe+=1),ce=Le.dist,{idx:Le.idx,rank:oe}));for(let Le of tw)S[Le]=Be[Le].value;Ne.anim&&Ne.anim.kill();let Me={v:Ot},ve=tn.timeline();ve.to(Ne,{lensFx:0,duration:Bn.lensFade,ease:"power3.out"},0),ve.to(Me,{v:Bn.centerScale,duration:Bn.focusDuration,ease:Bn.focusEase,onUpdate(){Ot=Me.v}},0),Ee.forEach(Le=>{ve.to(Ct,{[Le.idx]:1,duration:Bn.cardDuration,ease:Bn.cardEase},Le.rank*Bn.stagger)}),Ne.anim=ve,Do(!1),t.onFocusChange(!0)}function Fo(){if(!Ne.active)return;Ne.anim&&Ne.anim.kill();let R=Ke[Ne.poolIdx]||0,G=re.map((Me,ve)=>({idx:ve,x:Ke[ve]})).filter(Me=>Me.x!==void 0&&(Ct[Me.idx]||0)>0).map(Me=>({idx:Me.idx,dist:Math.abs((Me.x??0)-R)})).sort((Me,ve)=>ve.dist-Me.dist),$=0,K=-1,oe=G.map(Me=>(K>=0&&K-Me.dist>1&&($+=1),K=Me.dist,{idx:Me.idx,rank:$}));t.onFocusChange(!1);let ce={v:Ot},Ee=tn.timeline({onComplete:()=>{Ne.active=!1,Ne.srcIndex=-1,sn()}});Ee.to(Ne,{lensFx:1,duration:Bn.lensFade*.8,ease:"power3.inOut"},0),Ee.to(ce,{v:1,duration:Bn.focusDuration*.85,ease:Bn.focusEase,onUpdate(){Ot=ce.v}},0),oe.forEach(Me=>{Ee.to(Ct,{[Me.idx]:0,duration:Bn.cardDuration*.85,ease:Bn.cardEase},Me.rank*Bn.stagger*.7)}),Ne.anim=Ee}function Kc(){if(!r){t.onEntryDone(!0);return}C&&C.kill();for(let Re=0;Re<xt.length;Re++)xt[Re]=0;F=!0,yt=!1,t.onEntryDone(!1);for(let Re=0;Re<$e.length;Re++)$e[Re]=0;Ne.lensFx=0,Ue=H(ne(fe)),fe=Ue,We=0,_e=!0,J();let R=[];for(let Re=0;Re<Ke.length;Re++)Ke[Re]!==void 0&&R.push(Re);let G=tn.timeline({delay:fn.delay}),$=fn.stagger*Math.max(R.length-1,1),K=0;R.forEach(Re=>{let ot=Math.random()*$;K=Math.max(K,ot+fn.riseDuration),G.to(xt,{[Re]:1,duration:fn.riseDuration,ease:fn.riseEase},ot)}),G.call(()=>{F=!1,yt=!0},[],K);let oe=Z(fe),ce=D.length,Ee=Math.floor(Xr/2),Me=[],ve=0;for(let Re=0;Re<Ke.length;Re++){if(Ke[Re]===void 0||Math.floor(Re/ce)!==Ee)continue;let ot=Re%ce-oe;ot>ce/2&&(ot-=ce),ot<-ce/2&&(ot+=ce);let we=Math.abs(ot);ve=Math.max(ve,we),Me.push({idx:Re,rank:we})}let Le=Me.map(Re=>({idx:Re.idx,rank:ve-Re.rank})),Ze=K+fn.growDelay,ct=Ze;G.to(Ne,{lensFx:1,duration:fn.lensBloom,ease:fn.lensBloomEase},Ze),Le.forEach(Re=>{let ot=Ze+Re.rank*fn.growStagger;ct=Math.max(ct,ot+fn.growDuration),G.to($e,{[Re.idx]:1,duration:fn.growDuration,ease:fn.growEase},ot)}),G.call(()=>{yt=!1;for(let Re=0;Re<$e.length;Re++)$e[Re]=1;t.onEntryDone(!0),sn()},[],ct),C=G}function qs(R){Ws()||(Oe=!0,We=0,ye=null,Ue=H(ne(fe)+R),_e=!0,Fe=performance.now())}W.closest("[data-lgc-nowheel]")||W.addEventListener("wheel",No,{passive:!1}),W.addEventListener("pointerdown",Jc),W.addEventListener("pointermove",nl),W.addEventListener("pointerup",Xs),W.addEventListener("pointercancel",Xs),W.addEventListener("pointerenter",Ji),W.addEventListener("pointerleave",Uo),W.addEventListener("click",il);let qr=0,sl=!0,ol=!0;function jc(){if(!sl)return;if(!ol||document.hidden){qr=0;return}Q||(Ue+=We,We*=f,Math.abs(We)<.05&&(We=0),!_e&&!Ne.active&&performance.now()-Fe>v&&(Ue=H(ne(fe)),_e=!0));let R=Q&&ze!=="mouse"?m:_e&&!ye?h:d;fe+=(Ue-fe)*R;let G=Z(fe);G!==te&&(te=G,t.onActiveChange(G));let $=fe-j;j=fe;let K=Math.min(1,Math.abs($)/Math.max(1,M)),oe=K>ie?y:w;if(ie+=(K-ie)*oe,J(),Vd(),ye&&!Ne.active&&Math.abs(Ue-fe)<.5){let Me=ye;ye=null,z&&z.srcIndex===Me.srcIndex&&rl()}Be.uCenter.value.set(lt.posX,lt.posY),Be.uAspect.value=o/a,Be.uTime.value=performance.now()*.001;let ce=Me=>Me*Math.PI/180;Be.uRotation.value=ce(lt.rotation)+ce(lt.spin)*(performance.now()*.001);let Ee=Ne.lensFx;Be.uLensMix.value=Ee;for(let Me of tw)Be[Me].value=S[Me]*Ee;E.setRenderTarget(He),E.render(x,b),E.setRenderTarget(null),E.render(Ft,qe),qr=requestAnimationFrame(jc)}function al(){!sl||qr||(qr=requestAnimationFrame(jc))}al(),r?Kc():t.onEntryDone(!0);function Qc(){o=Math.max(1,n.clientWidth),a=Math.max(1,n.clientHeight),c=l(),Y(),E.setSize(o,a),b.left=-o/2,b.right=o/2,b.top=a/2,b.bottom=-a/2,b.updateProjectionMatrix();let R=Math.min(window.devicePixelRatio||1,2);E.setPixelRatio(R),He.setSize(o*R,a*R),Be.uRes.value.set(o*R,a*R),Oe||(fe=H(0),Ue=fe)}let T=new ResizeObserver(Qc);T.observe(n);let N=new IntersectionObserver(([R])=>{let G=R?.boundingClientRect;!G||G.width===0&&G.height===0||(ol=R?.isIntersecting??!0,ol&&al())});N.observe(n);let X=()=>{document.hidden||al()};document.addEventListener("visibilitychange",X);function V(){P.forEach(R=>{R.pause(),R.removeAttribute("src"),R.load()}),sl=!1,cancelAnimationFrame(qr),T.disconnect(),N.disconnect(),document.removeEventListener("visibilitychange",X),W.removeEventListener("wheel",No),W.removeEventListener("pointerdown",Jc),W.removeEventListener("pointermove",nl),W.removeEventListener("pointerup",Xs),W.removeEventListener("pointercancel",Xs),W.removeEventListener("pointerenter",Ji),W.removeEventListener("pointerleave",Uo),W.removeEventListener("click",il),Ne.anim&&Ne.anim.kill(),C&&C.kill(),e&&tn.killTweensOf(e),E.dispose(),He.dispose(),Ye.geometry.dispose(),ht.dispose(),re.forEach(R=>{R.mesh.geometry.dispose(),R.mat.dispose()}),D.forEach(R=>{R.tex?.dispose()}),E.domElement.parentNode&&E.domElement.parentNode.removeChild(E.domElement)}return{closeFocus:Fo,next:()=>qs(1),previous:()=>qs(-1),destroy:V}}function zd(n){return String(n).padStart(2,"0")}function iw({items:n=qI,panelHeight:e=450,gap:t=12,background:i="#ffffff",entry:r=!0,className:s,style:o,onActiveChange:a,onFocusChange:l}){let c=(0,Yt.useRef)(null),u=(0,Yt.useRef)(null),d=(0,Yt.useRef)(null),h=(0,Yt.useRef)(null),p=(0,Yt.useRef)(null),g=(0,Yt.useRef)(!1),[_,m]=(0,Yt.useState)(0),[f,v]=(0,Yt.useState)(!1),[M,y]=(0,Yt.useState)(!r),[w,E]=(0,Yt.useState)(!1),A=(0,Yt.useId)(),x=(0,Yt.useId)(),b=n[_]??n[0],P=(0,Yt.useRef)(a),L=(0,Yt.useRef)(l);P.current=a,L.current=l,(0,Yt.useEffect)(()=>{let B=c.current;if(!B||n.length===0)return;let I=QI(B,u.current,{items:n,panelHeight:e,gap:t,background:i,entry:r,onActiveChange:O=>{m(O),P.current?.(O)},onFocusChange:O=>{v(O),L.current?.(O)},onEntryDone:y});if(!I){E(!0);return}return d.current=I,()=>{I.destroy(),d.current=null}},[n,e,t,i,r]),(0,Yt.useEffect)(()=>{let B=h.current,I=p.current;if(!B||!I)return;let O=nw();if(tn.set(B,{xPercent:-50}),tn.set(I,{xPercent:-50}),!M&&r&&!O){tn.set([B,I],{autoAlpha:0}),g.current=!1;return}let Y=f?window.innerHeight*-.05:0;if(M&&!f&&!g.current){g.current=!0,tn.fromTo(B,{autoAlpha:0},{autoAlpha:1,duration:O?0:1.6,ease:"power2.out"}),tn.fromTo(I,{autoAlpha:0},{autoAlpha:1,duration:O?0:1.6,ease:"power2.out",delay:O?0:.18});return}tn.to(B,{y:Y,autoAlpha:1,duration:O?0:.4,ease:"power3.out"}),tn.to(I,{autoAlpha:f?0:1,duration:O?0:.4,ease:"power3.out"})},[f,M,r]);let D=B=>{B.key==="ArrowRight"?(B.preventDefault(),d.current?.next()):B.key==="ArrowLeft"?(B.preventDefault(),d.current?.previous()):B.key==="Escape"&&(B.preventDefault(),d.current?.closeFocus())};return(0,pi.jsxs)("div",{className:Ud("relative h-full min-h-[420px] w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-black/20",s),style:{background:i,color:"#111111",...o},tabIndex:0,role:"region","aria-roledescription":"carousel","aria-labelledby":A,onKeyDown:D,children:[(0,pi.jsx)("p",{id:A,className:"sr-only",children:"Sanchez workshop carousel"}),(0,pi.jsxs)("p",{id:x,className:"sr-only","aria-live":"polite",children:[b?.title??"",", ",zd(_+1)," of ",zd(n.length),f?", focused":""]}),(0,pi.jsx)(Od,{fallback:(0,pi.jsx)(kd,{className:"absolute inset-0",message:"This carousel needs WebGL, which is unavailable in this browser."}),children:w?(0,pi.jsx)(kd,{className:"absolute inset-0",message:"This carousel needs WebGL, which is unavailable in this browser."}):(0,pi.jsx)("div",{ref:c,className:"absolute inset-0"})}),(0,pi.jsx)("p",{ref:h,className:"pointer-events-none absolute left-1/2 top-[4.5%] z-10 m-0 text-center text-[15px] font-medium tracking-[-0.02em] text-black opacity-0 sm:text-[17px]",children:b?.title}),(0,pi.jsxs)("p",{ref:p,className:"pointer-events-none absolute bottom-[6%] left-1/2 z-10 m-0 text-center text-[13px] font-medium tabular-nums tracking-[-0.02em] text-black opacity-0 sm:text-[15px]",children:[zd(_+1),"/",zd(n.length)]}),(0,pi.jsx)("div",{ref:u,className:"pointer-events-none absolute left-0 top-0 z-20 text-[13px] font-medium text-black mix-blend-exclusion",children:"View"}),(0,pi.jsx)("button",{type:"button",onClick:()=>d.current?.closeFocus(),"aria-label":"Close focused project",className:"absolute right-[4%] top-[4.5%] z-20 text-[13px] font-medium text-black mix-blend-exclusion transition-opacity duration-300",style:{opacity:f?1:0,pointerEvents:f?"auto":"none"},children:"Close"})]})}var Yt,pi,Sr,Hs,qI,lt,Bn,fn,YI,ZI,tw,Xr,$I,JI,KI,rw=Zr(()=>{"use client";fM();Yt=Mr(hl());$1();S_();ew();pi=Mr(Lo()),Sr=3/4,Hs=n=>`https://images.unsplash.com/photo-${n}?w=900&h=1200&q=85&auto=format&fit=crop`,qI=[{title:"Project One",src:Hs("1600585154340-be6161a56a0c"),aspect:Sr},{title:"Project Two",src:Hs("1514906689926-25ba6dcb584b"),aspect:Sr},{title:"Project Three",src:Hs("1568557412756-7d219873dd11"),aspect:Sr},{title:"Project Four",src:Hs("1581892805885-73bdd91beff0"),aspect:Sr},{title:"Project Five",src:Hs("1482938289607-e9573fc25ebb"),aspect:Sr},{title:"Project Six",src:Hs("1610846202780-b4d9837371ea"),aspect:Sr},{title:"Project Seven",src:Hs("1527630941-4a229fd674ab"),aspect:Sr},{title:"Project Eight",src:Hs("1603786420263-ad59136a7409"),aspect:Sr}],lt={sizeX:.565,sizeY:1,posX:.5,posY:.5,rotation:65,spin:0,zoom:0,dispersion:11,blur:0,glow:4.2,whiteGlow:.24,novaSize:12,blueRing:4.5,ringRadius:.49,ringWidth:.014,shimmer:!0,shimmerFreq:12,shimmerSpeed:3.5,shimmerDepth:.12,rimStart:.578,rimTangential:.6,rimInward:0,rimFreq1:2,rimFreq2:1,blueColor:"#c9a45c",rimLine:1.4,rimLinePos:.488,rimLineWidth:.003,vignette:0,vignetteSize:.3,samples:16},Bn={cardDuration:.7,focusDuration:.9,cardEase:"power4.out",focusEase:"power3.out",stagger:.06,dropDist:1.4,centerScale:1.18,lensFade:.85},fn={delay:.5,startH:80,riseDuration:1,stagger:.07,riseEase:"power3.out",fromBelow:.9,growDelay:.25,growDuration:2.15,growEase:"expo.inOut",growStagger:.085,lensBloom:1.4,lensBloomEase:"power2.inOut"},YI=`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`,ZI=`
#define PI 3.14159265
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uCenter;
uniform float uSizeX;
uniform float uSizeY;
uniform float uAspect;
uniform float uZoom;
uniform float uDispersion;
uniform float uBlur;
uniform float uGlow;
uniform float uWhiteGlow;
uniform float uNovaSize;
uniform float uBlueRing;
uniform float uRingRadius;
uniform float uRingWidth;
uniform float uShimmer;
uniform float uShimmerFreq;
uniform float uShimmerSpeed;
uniform float uShimmerDepth;
uniform float uTime;
uniform float uRimStart;
uniform float uRimTangential;
uniform float uRimInward;
uniform float uRimFreq1;
uniform float uRimFreq2;
uniform vec3 uBlueColor;
uniform float uRimLine;
uniform float uLensMix;
uniform float uEdge;
uniform float uRimLinePos;
uniform float uRimLineWidth;
uniform float uVignette;
uniform float uVignetteSize;
uniform float uShape;
uniform float uSquareRound;
uniform float uRotation;
uniform int uSamples;

const int MAX_SAMPLES = 16;

float sdRoundBox(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

vec3 discLens(vec2 center, float aspectCorrect, out float outA) {
  vec2 p = (vUv - center);
  p.x *= aspectCorrect;
  float ca = cos(uRotation), sa = sin(uRotation);
  p = mat2(ca, -sa, sa, ca) * p;
  vec2 halfSize = vec2(uSizeX, uSizeY);
  float dist = length(p / halfSize);
  outA = 0.0;

  float maskND;
  if (uShape > 0.5) {
    float corner = min(uSizeX, uSizeY) * clamp(uSquareRound, 0.0, 1.0);
    float sd = sdRoundBox(p, halfSize, corner);
    maskND = 1.0 + sd / min(uSizeX, uSizeY);
  } else {
    maskND = dist;
  }
  if (maskND > 1.0) return vec3(0.0);

  float shapeND = clamp(maskND, 0.0, 1.0);
  float nd = clamp(dist, 0.0, 1.0);
  vec2 offset = vUv - center;
  vec2 radialDir = normalize(offset + 1e-6);
  vec2 tangentDir = vec2(-radialDir.y, radialDir.x);
  float angle = atan(p.y, p.x);

  float pull = uZoom * 0.30 * (nd * nd);
  float rimStrength = smoothstep(uRimStart, 1.0, nd);
  float fluidWave = sin(angle * uRimFreq1) * 0.55 + sin(angle * uRimFreq2) * 0.25;
  float rScreen = (uSizeX + uSizeY) * 0.5;
  vec2 rimOff = tangentDir * fluidWave * rimStrength * rScreen * uRimTangential;
  vec2 rimPull = -radialDir * rimStrength * rScreen * uRimInward;

  vec2 baseUV = center + offset * (1.0 - pull) + rimOff + rimPull;

  float rimMask = smoothstep(0.55, 1.0, nd);
  vec2 dispDir = offset * uDispersion * 0.004 * rimMask;
  int N = uSamples;
  if (N < 2) N = 2;
  if (N > MAX_SAMPLES) N = MAX_SAMPLES;
  vec3 col = vec3(0.0);
  vec3 caW = vec3(0.0);
  for (int i = 0; i < MAX_SAMPLES; i++) {
    if (i >= N) break;
    float t = float(i) / float(N - 1);
    vec2 sUV = baseUV + dispDir * (t - 0.5);
    vec3 s = texture2D(uTex, sUV).rgb;
    vec3 w = vec3(
      exp(-pow((t - 0.00) / 0.38, 2.0)),
      exp(-pow((t - 0.50) / 0.38, 2.0)),
      exp(-pow((t - 1.00) / 0.38, 2.0))
    );
    col += s * w;
    caW += w;
  }
  col /= max(caW, vec3(0.001));

  float blurFade = 1.0 - smoothstep(0.72, 0.98, nd);
  if (uBlur > 0.01 && blurFade > 0.01) {
    vec2 blurRad = vec2(uBlur) / uRes * blurFade;
    vec3 bcol = vec3(0.0);
    float btw = 0.0;
    for (float a = 0.0; a < PI * 2.0; a += PI * 2.0 / 6.0) {
      for (float rr = 0.4; rr <= 1.001; rr += 0.3) {
        vec2 o = vec2(cos(a), sin(a)) * blurRad * rr;
        float w = 1.0 - rr * 0.38;
        bcol += texture2D(uTex, baseUV + o).rgb * w;
        btw += w;
      }
    }
    col = mix(bcol / btw, col, rimMask);
  }

  col *= mix(0.91, 1.0, smoothstep(0.0, 0.38, shapeND));

  float r2 = shapeND * shapeND * 0.25;
  float gs = max(uNovaSize * uGlow * 0.003, 0.004);
  float nova = exp(-r2 / gs) + exp(-r2 / (gs * 7.0)) * 0.18;
  nova *= uWhiteGlow * (uGlow / 17.0) * 1.15;
  col += vec3(nova);

  float dC = shapeND * 0.5;
  float tR = clamp(uRingRadius, 0.1, 0.49);
  float rW = max(uRingWidth, 0.003);
  float ring = exp(-pow((dC - tR) / rW, 2.0));
  ring *= uBlueRing * (uGlow / 17.0) * 1.8;
  if (uShimmer > 0.5) ring *= sin(angle * uShimmerFreq + uTime * uShimmerSpeed) * uShimmerDepth + (1.0 - uShimmerDepth);
  float ringAura = exp(-pow((dC - tR) / (rW * 6.0), 2.0)) * 0.28 * uBlueRing * (uGlow / 17.0);
  col += uBlueColor * (ring + ringAura);
  col += vec3(exp(-pow((dC - uRimLinePos) / max(uRimLineWidth, 0.0001), 2.0)) * uRimLine);

  outA = smoothstep(1.0, 0.93, maskND);
  return col;
}

void main(){
  vec4 baseT = texture2D(uTex, vUv);
  vec3 base = baseT.rgb;
  vec3 outc = base;
  float a = 0.0;
  vec3 c = discLens(uCenter, uAspect, a);
  outc = mix(outc, c, a * uLensMix);
  if (uVignette > 0.001) {
    vec2 vc = vUv - 0.5;
    vc.x *= uAspect;
    float d = length(vc) / max(uVignetteSize, 0.0001);
    float vig = 1.0 - uVignette * smoothstep(0.5, 1.0, d);
    outc *= clamp(vig, 0.0, 1.0);
  }
  /* site tweak: keep transparency. The scene texture holds premultiplied colour; the lens glow adds light, so alpha follows the brightest channel. */
  float outAlpha = max(baseT.a, a * uLensMix * clamp(max(outc.r, max(outc.g, outc.b)), 0.0, 1.0));
  outc = min(outc, vec3(1.0));
  outAlpha = clamp(max(outAlpha, max(outc.r, max(outc.g, outc.b))), 0.0, 1.0);
  float edgeK = mix(1.0, smoothstep(0.0, 0.07, vUv.y) * smoothstep(0.0, 0.07, 1.0 - vUv.y), uEdge);
  gl_FragColor = vec4(outc * edgeK, outAlpha * edgeK);
}
`,tw=["uDispersion","uBlueRing","uRimLine","uVignette","uZoom","uRimTangential","uRimInward"],Xr=4,$I=6,JI=12,KI=90});var e3=ji(()=>{var sw=Mr(sS());rw();var ow=Mr(Lo());document.querySelectorAll("[data-lgc]").forEach(n=>{let e=JSON.parse(n.getAttribute("data-items")||"[]");(0,sw.createRoot)(n).render((0,ow.jsx)(iw,{items:e,background:n.dataset.bg||"#090706",panelHeight:Number(n.dataset.panel||460),gap:14}))})});e3();})();
/*! Bundled license information:

react/cjs/react.production.min.js:
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

scheduler/cjs/scheduler.production.min.js:
  (**
   * @license React
   * scheduler.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.min.js:
  (**
   * @license React
   * react-dom.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

gsap/gsap-core.js:
  (*!
   * GSAP 3.15.0
   * https://gsap.com
   *
   * @license Copyright 2008-2026, GreenSock. All rights reserved.
   * Subject to the terms at https://gsap.com/standard-license
   * @author: Jack Doyle, jack@greensock.com
  *)

gsap/CSSPlugin.js:
  (*!
   * CSSPlugin 3.15.0
   * https://gsap.com
   *
   * Copyright 2008-2026, GreenSock. All rights reserved.
   * Subject to the terms at https://gsap.com/standard-license
   * @author: Jack Doyle, jack@greensock.com
  *)

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)

react/cjs/react-jsx-runtime.production.min.js:
  (**
   * @license React
   * react-jsx-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
