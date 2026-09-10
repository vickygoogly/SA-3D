"""Convert the supplied OBJ to indexed binary meshes and portable GLB. Requires numpy.
Usage: python3 scripts/import-refinery.py source.obj models
No source objects are omitted; source coordinates are normalized to a 200-unit footprint.
"""
import sys, json, pathlib, struct
import numpy as np
src=pathlib.Path(sys.argv[1]); out=pathlib.Path(sys.argv[2]); out.mkdir(exist_ok=True)
vertices=[]; batches={}; group='site'; material='default'
with src.open() as f:
    for line in f:
        s=line.split()
        if not s: continue
        if s[0]=='v': vertices.append([float(x) for x in s[1:4]])
        elif s[0] in ('g','o'): group=' '.join(s[1:])
        elif s[0]=='usemtl': material=s[1]
        elif s[0]=='f':
            face=[int(x.split('/')[0]) for x in s[1:]]
            face=[x-1 if x>0 else len(vertices)+x for x in face]
            dest=batches.setdefault((group,material),[])
            for i in range(1,len(face)-1): dest.extend((face[0],face[i],face[i+1]))
v=np.asarray(vertices,dtype=np.float32); del vertices
lo=v.min(axis=0); hi=v.max(axis=0); print('Source bounds',lo,hi,flush=True)
scale=200/max(hi[0]-lo[0],hi[2]-lo[2]); v-=[(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2]; v*=scale
binary=bytearray(); manifest={'source':src.name,'scale':float(scale),'bounds':[v.min(0).tolist(),v.max(0).tolist()],'meshes':[]}
gltf={'asset':{'version':'2.0','generator':'Signal Atlas OBJ importer'},'scene':0,'scenes':[{'nodes':[]}],'nodes':[],'meshes':[],'materials':[],'bufferViews':[],'accessors':[],'buffers':[]}
def attr(a,typ,target):
    while len(binary)%4: binary.append(0)
    offset=len(binary); binary.extend(a.tobytes()); view=len(gltf['bufferViews']); gltf['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':a.nbytes,'target':target})
    access={'bufferView':view,'componentType':5126 if a.dtype==np.float32 else 5125,'count':len(a),'type':typ}
    if typ=='VEC3': access.update(min=a.min(0).tolist(),max=a.max(0).tolist())
    idx=len(gltf['accessors']); gltf['accessors'].append(access); return idx,offset
for (name,mat),faces in batches.items():
    ids,inv=np.unique(np.asarray(faces,dtype=np.uint32),return_inverse=True); pos=v[ids].astype('<f4'); inds=inv.astype('<u4')
    # Area-weighted normals keep curved vessels smooth; duplicated OBJ vertices retain hard seams.
    tri=inds.reshape(-1,3); n=np.zeros_like(pos); fn=np.cross(pos[tri[:,1]]-pos[tri[:,0]],pos[tri[:,2]]-pos[tri[:,0]])
    for k in range(3): np.add.at(n,tri[:,k],fn)
    n/=np.maximum(np.linalg.norm(n,axis=1,keepdims=True),1e-12)
    p,po=attr(pos,'VEC3',34962); no,nof=attr(n,'VEC3',34962); ix,io=attr(inds,'SCALAR',34963)
    color=[.62,.69,.7,1]; metal=.35
    if 'wire_' in mat:
        code=mat.split('_')[-1]
        if len(code)==9 and code.isdigit():
            c=[int(code[i:i+3])/255 for i in (0,3,6)]
            # Wire colors are viewport IDs, not authored render materials. Use restrained industrial finishes.
            if c[1]>c[0]*1.3 and c[1]>c[2]*1.15: color=[.10,.37,.28,1]
            elif max(c)<.35: color=[.13,.17,.19,1]
    mi=len(gltf['materials']); gltf['materials'].append({'name':mat,'pbrMetallicRoughness':{'baseColorFactor':color,'metallicFactor':metal,'roughnessFactor':.48},'doubleSided':True})
    gi=len(gltf['meshes']); gltf['meshes'].append({'name':name,'primitives':[{'attributes':{'POSITION':p,'NORMAL':no},'indices':ix,'material':mi}]}); gltf['nodes'].append({'name':name,'mesh':gi}); gltf['scenes'][0]['nodes'].append(gi)
    manifest['meshes'].append({'name':name,'material':mat,'color':color[:3],'positionOffset':po,'normalOffset':nof,'vertexCount':len(pos),'indexOffset':io,'indexCount':len(inds),'bounds':[pos.min(0).tolist(),pos.max(0).tolist()]})
out.joinpath('refinery.bin').write_bytes(binary); out.joinpath('refinery.json').write_text(json.dumps(manifest,separators=(',',':')))
gltf['buffers']=[{'byteLength':len(binary)}]; data=json.dumps(gltf,separators=(',',':')).encode(); data+=b' '*((-len(data))%4)
glb=struct.pack('<III',0x46546c67,2,12+8+len(data)+8+len(binary))+struct.pack('<II',len(data),0x4e4f534a)+data+struct.pack('<II',len(binary),0x004e4942)+binary
out.joinpath('refinery.glb').write_bytes(glb)
print(json.dumps({'meshes':len(batches),'triangles':sum(m['indexCount']//3 for m in manifest['meshes']),'binaryMB':len(binary)/1e6,'bounds':manifest['bounds']}),flush=True)
