// Minimal DOM test double for AR lifecycle tests. It does not test CSS layout,
// browser media playback, WebGL or device tracking; those need browser/hardware QA.
export class Element {
 constructor(tag='div') {this.tagName=tag.toUpperCase();this.children=[];this.parentNode=null;this.attributes={};this.dataset={};this.style={};this.hidden=false;this.inert=false;this.listeners=new Map();this.clientWidth=420;this.clientHeight=860;this.text='';}
 get id(){return this.attributes.id||'';}set id(x){this.attributes.id=x;}
 get className(){return this.attributes.class||'';}set className(x){this.attributes.class=x;}
 get classList(){const self=this;return {add(x){self.className=[...new Set([...self.className.split(' ').filter(Boolean),x])].join(' ');},remove(x){self.className=self.className.split(' ').filter(c=>c!==x).join(' ');},contains(x){return self.className.split(' ').includes(x);},toggle(x,force){const yes=force??!this.contains(x);yes?this.add(x):this.remove(x);return yes;}};}
 setAttribute(k,v){this.attributes[k]=String(v);if(k==='hidden')this.hidden=true;if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(v);}
 getAttribute(k){if(k.startsWith('data-'))return this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]??null;return this.attributes[k]??null;}
 removeAttribute(k){delete this.attributes[k];}
 append(...items){for(let child of items){if(typeof child==='string'){const e=new Element('#text');e.text=child;child=e;}child.remove();child.parentNode=this;this.children.push(child);}}
 remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this);this.parentNode=null;}
 replaceChildren(...items){for(const child of this.children)child.parentNode=null;this.children=[];this.text='';this.append(...items);}
 get childElementCount(){return this.children.filter(x=>x.tagName!=='#TEXT').length;}
 set textContent(x){this.replaceChildren();this.text=String(x);}get textContent(){return this.text+this.children.map(x=>x.textContent).join('');}
 get isConnected(){return this.tagName==='BODY'||!!this.parentNode?.isConnected;}
 matches(s){
  s=s.trim();if(s.includes('>')){const parts=s.split('>');return this.matches(parts.pop())&&!!this.parentNode?.matches(parts.join('>'));}
  if(s.includes(' ')){const i=s.lastIndexOf(' ');if(!this.matches(s.slice(i+1)))return false;let p=this.parentNode;while(p){if(p.matches(s.slice(0,i)))return true;p=p.parentNode;}return false;}
  if(s.startsWith('#'))return this.id===s.slice(1);
  if(s.startsWith('.'))return this.classList.contains(s.slice(1));
  const attr=s.match(/^\[([^=\]]+)(?:="?([^"\]]+)"?)?\]$/);if(attr)return this.getAttribute(attr[1])!==null&&(attr[2]===undefined||this.getAttribute(attr[1])===attr[2]);
  return this.tagName===s.toUpperCase();
 }
 querySelectorAll(selector){const matches=[];const selectors=selector.split(',');const walk=e=>{for(const c of e.children){if(selectors.some(s=>c.matches(s)))matches.push(c);walk(c);}};walk(this);return matches;}
 querySelector(s){return this.querySelectorAll(s)[0]||null;}
 closest(s){return this.matches(s)?this:this.parentNode?.closest(s)||null;}
 addEventListener(type,fn,options={}){if(!this.listeners.has(type))this.listeners.set(type,[]);this.listeners.get(type).push({fn,once:options.once});}
 emit(type,data={}){const e={type,target:this,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...data};for(const l of [...this.listeners.get(type)||[]]){l.fn(e);if(l.once)this.listeners.set(type,this.listeners.get(type).filter(x=>x!==l));}return e;}
 click(){this.onclick?.({target:this});}
 set innerHTML(html){
  this.replaceChildren();const stack=[this];
  for(const token of html.match(/<[^>]+>|[^<]+/g)||[]){
   if(token.startsWith('</')){stack.pop();continue;}
   if(token.startsWith('<')){const match=token.match(/^<([\w-]+)/);if(!match)continue;const child=new Element(match[1]);const attrs=token.slice(match[0].length,-1);for(const a of attrs.matchAll(/([^\s=/>]+)(?:="([^"]*)")?/g))child.setAttribute(a[1],a[2]??'');stack.at(-1).append(child);if(!['input','br','hr','img','link','meta'].includes(match[1])&&!token.endsWith('/>'))stack.push(child);}
   else stack.at(-1).text+=token;
  }
 }
 pause(){this.paused=true;}load(){this.loaded=true;}
}
export function installDOM(){
 const body=new Element('body'),doc=new Element('document');doc.append(body);doc.body=body;doc.createElement=t=>new Element(t);doc.createTextNode=t=>{const e=new Element('#text');e.text=t;return e;};
 for(const tag of ['header','aside','main','dialog']){const e=new Element(tag);if(tag==='aside')e.className='rail';if(tag==='dialog')e.id='feed-dialog';body.append(e);}
 const saved=new Map();function set(key,value){saved.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});}
 const window={isSecureContext:true,scrollX:3,scrollY:50,scrollTo(x,y){this.scrollX=x;this.scrollY=y;}};
 set('document',doc);set('window',window);set('requestAnimationFrame',fn=>{fn();return 1;});
 return {document:doc,window,set,restore(){for(const [key,descriptor] of saved)descriptor?Object.defineProperty(globalThis,key,descriptor):delete globalThis[key];}};
}
