import { SEO_LANDING_PAGES } from '../src/data/seoLandingPages.js';
import { writeFile } from 'node:fs/promises';
const checks={};
for (const page of SEO_LANDING_PAGES) {
 const rows=await Promise.all(page.representativeMods.map(async mod=>{
 const q=new URLSearchParams({loaders:JSON.stringify([page.loader]),game_versions:JSON.stringify([page.version])});
 const r=await fetch(`https://api.modrinth.com/v2/project/${mod.slug}/version?${q}`);
 if(r.status===404)return {...mod,versionId:null,versionNumber:null,unavailable:true};
 if(!r.ok)throw Error(`${mod.slug}: ${r.status}`);
 const versions=await r.json(); versions.sort((a,b)=>b.date_published.localeCompare(a.date_published));
 const v=versions.find(v=>v.files?.length);return {...mod,versionId:v?.id||null,versionNumber:v?.version_number||null};
 }));checks[page.path]=rows;
}
await writeFile('src/data/verifiedExamples.json',JSON.stringify({checkedAt:new Date().toISOString().slice(0,10),checks},null,2)+'\n');
console.log(Object.entries(checks).map(([p,rows])=>[p,rows.filter(r=>r.versionId).map(r=>r.name)]));
