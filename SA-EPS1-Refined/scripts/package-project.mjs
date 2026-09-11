import {mkdirSync,copyFileSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
const destination=path.resolve(process.argv[2]||path.join(root,'..','delivery'));
const project=path.join(destination,'SA-EPS1-Refined');
const files=['package.json','START-WINDOWS.bat','START-MAC-LINUX.sh','THIRD-PARTY-NOTICES.md','START-HERE.md','frontend/operations.html','frontend/operations.css','frontend/operations.js','frontend/domain.js','frontend/campus-loader.js','frontend/vendor/three.module.js','frontend/vendor/three.core.js','frontend/vendor/OrbitControls.js','frontend/vendor/LICENSE','backend/server.mjs','backend/server.test.mjs','backend/config.json','models/campus.glb','models/eps1-model.json','scripts/build-eps1.mjs','frontend/refinement.css','frontend/vendor/lucide.min.js','frontend/vendor/LUCIDE-LICENSE','design-qa.md','scripts/export-glb.mjs','scripts/validate-campus.mjs','scripts/package-project.mjs',...['CCTV 1.mp4','CCTV 2.mp4','CCTV 3.mp4','drone 1.mp4','drone 2.mp4','drone 3.mp4'].map(x=>'backend/media/'+x)];
for(const file of files){const dest=path.join(project,file);mkdirSync(path.dirname(dest),{recursive:true});copyFileSync(path.join(root,file),dest);}
copyFileSync(path.join(root,'START-HERE.md'),path.join(project,'README.md'));mkdirSync(path.join(project,'backend/data'),{recursive:true});
execFileSync(process.execPath,['--test','backend/server.test.mjs'],{cwd:project,stdio:'inherit'});execFileSync(process.execPath,['scripts/validate-campus.mjs'],{cwd:project,stdio:'inherit'});
const zip=path.join(destination,'Signal-Atlas-EPS1-Refinement-Checkpoint.zip');execFileSync('zip',['-q','-r',zip,'SA-EPS1-Refined'],{cwd:destination});console.log(JSON.stringify({zip,bytes:statSync(zip).size,files:files.length+1}));
