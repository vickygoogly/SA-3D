const tag=(name,classes,text)=>{const node=document.createElement(name);if(classes)node.className=classes;if(text)node.textContent=text;return node};
const theme=document.createElement('link');theme.rel='stylesheet';theme.href='./future.css';document.head.append(theme);const overrides=document.createElement('link');overrides.rel='stylesheet';overrides.href='./future-overrides.css';document.head.append(overrides);
const pageTitle=document.querySelector('.page-title');
const kpis=document.querySelector('.kpis');

// The normal dashboard data remains authoritative; this is a presentation layer
// that gives the spatial console a faster, calmer operational hierarchy.
document.body.classList.add('signal-atlas');
const top=tag('div','atlas-topbar');
top.innerHTML=`<div class="atlas-mark"><span class="atlas-glyph">◆</span><strong>SIGNAL ATLAS</strong><span class="atlas-divider"></span><b>EPS-1</b><span>Industrial plant</span></div><div class="atlas-nav"><button class="atlas-nav-active" data-atlas-view="overview">Live</button><button data-atlas-view="overview">Explore</button><button data-atlas-view="alerts">Events</button><button data-atlas-view="cameras">Reports</button></div><div class="atlas-operator"><span class="atlas-search">Search assets, zones, or events…</span><span class="atlas-user">OC</span><span><b>Operations controller</b><small>Control room</small></span></div>`;
document.querySelector('.shell').prepend(top);

document.querySelector('.brand').innerHTML='<span class="brand-symbol">◆</span><span>SIGNAL<br><b>ATLAS</b></span>';
document.querySelector('.workspace-label').textContent='SPATIAL OPERATIONS';
document.querySelectorAll('.nav').forEach((node,i)=>{node.querySelector('i').textContent=['⌂','△','◎','▣'][i]});
document.querySelectorAll('[data-atlas-view]').forEach(button=>button.addEventListener('click',()=>{const view=button.dataset.atlasView;document.querySelector(`[data-view="${view}"]`)?.click();document.querySelectorAll('[data-atlas-view]').forEach(item=>item.classList.toggle('atlas-nav-active',item===button));}));
pageTitle.innerHTML=`<div class="atlas-title"><span class="eyebrow">EPS-1 · LIVE OPERATIONS</span><h1>Situational Awareness</h1><p>People, assets, and operational risk—under one spatial command view.</p></div><div class="atlas-date"><span>Operational status</span><strong><i></i> All systems online</strong><small id="atlas-clock">—</small></div>`;
const metrics=[['◎','248','Personnel on site'],['▣','48','Cameras online'],['△','4','Active events'],['⌁','100%','Critical systems']];
kpis.innerHTML=metrics.map(([icon,value,label])=>`<article class="atlas-metric"><span class="atlas-metric-icon">${icon}</span><div><strong>${value}</strong><small>${label}</small></div></article>`).join('');
const toolbar=document.querySelector('.twin-actions');
const arButton=tag('button','ar-action');arButton.id='ar-view';arButton.type='button';arButton.innerHTML='<span class="ar-device">▣</span><span><b>AR View</b><small>Place site in your world</small></span>';
toolbar.prepend(arButton);
const layerPanel=tag('div','atlas-layers');
layerPanel.innerHTML=`<strong>LAYERS</strong><button data-layer-toggle="layer-personnel"><span>◎</span> Personnel <i></i></button><button data-layer-toggle="layer-cctv"><span>▣</span> CCTV <i></i></button><button data-layer-toggle="layer-alerts"><span>△</span> Alerts <i></i></button><button data-layer-toggle="layer-labels"><span>◫</span> Zone names <i></i></button>`;
document.getElementById('twin-viewport').append(layerPanel);
layerPanel.querySelectorAll('[data-layer-toggle]').forEach(button=>{const input=document.getElementById(button.dataset.layerToggle);const refresh=()=>button.classList.toggle('is-off',!input.checked);refresh();button.addEventListener('click',()=>{input.click();refresh();});input.addEventListener('change',refresh);});
const label=document.querySelector('.twin-state');
label.innerHTML='<span class="status-dot"></span> 3D SPATIAL VIEW <span class="twin-note">Live spatial operations</span>';
document.querySelector('.panel-heading h2').textContent='3D Spatial View';
document.querySelector('.plant-panel .panel-sub').textContent='Interactive refinery model · EPS-1';
document.querySelector('.twin-bottom').innerHTML='<span><span class="legend mint"></span> Personnel <span class="legend blue"></span> CCTV <span class="legend red"></span> Active event</span><span>EPS-1 digital twin · Demonstration environment</span>';
const updates=()=>{const node=document.getElementById('atlas-clock');if(node)node.textContent=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'UTC'})+' UTC · Live';};updates();setInterval(updates,1000);
