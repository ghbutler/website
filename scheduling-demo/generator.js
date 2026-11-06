/* Synthetic MPA cohorts. Fixed model version and public snapshots; no student data. */
(function(root){
function generate(terms,rules,seed=20261106){
 let state=seed>>>0;const random=()=>{state+=0x6D2B79F5;let t=state;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296};
 const choose=a=>a[Math.floor(random()*a.length)],sample=(a,n)=>{a=[...a];let r=[];while(n--){const i=Math.floor(random()*a.length);r.push(a.splice(i,1)[0])}return r};
 const by=Object.fromEntries(Object.entries(terms).map(([t,cs])=>[t,Object.fromEntries(cs.map(c=>[c.code,c]))]));
 const core=['5009','5111','5120','5210','5310'];
 const pools={data:['5360','5679','5840'],economic:['5080','5340','5370','5940','5970'],environment:['5717','5734','5940','5970'],international:['5080','5200','5340','5560','5734','5940','5970'],nonprofit:['5080','5200','5340','5370','5560','5940'],technology:['5340','5717','5940'],social:['5080','5200','5370','5560','5734','5940']};
 const roles={politics:['5619'],micro:['5080','5340','5560','5970'],analytics:['5360','5679','5840'],ethics:['5160']};
 function pick(code,term,role='Core'){const g=choose(by[term][code].groups);return {code,term,role,credits:g.credits,sectionIds:g.required.map(typ=>choose(g.sections.filter(s=>s.component===typ)).id)}}
 const meetings=e=>by[e.term][e.code].groups.flatMap(g=>g.sections.filter(s=>e.sectionIds.includes(s.id)).flatMap(s=>s.meetings));
 const clash=(a,b)=>[...a.days].some(d=>b.days.includes(d))&&a.start<b.end&&b.start<a.end&&a.fromDate<=b.toDate&&b.fromDate<=a.toDate;
 function valid(es){for(let i=0;i<es.length;i++)for(let j=i+1;j<es.length;j++)if(meetings(es[i]).some(a=>meetings(es[j]).some(b=>clash(a,b))))return false;return true}
 function bundle(codes,term,labels){for(let i=0;i<10000;i++){const es=codes.map((c,j)=>pick(c,term,labels?.[j]));if(valid(es))return es}throw Error('No feasible synthetic schedule')}
 const students=[];
 for(const year of [1,2])for(let i=0;i<60;i++){
 const c=rules['2025-2026'].concentrations[i%7];let history=[],es;
 if(year===1)es=bundle(core,'FA26');else{
 history=bundle(core,'FA25');let spring;
 for(let k=0;k<10000;k++){const tool=choose(['5410','5451','5220','5072'].filter(x=>x!==c.gateway));const e=['5414','5750','5441','5012',c.gateway,tool].map(x=>pick(x,'SP26'));if(valid(e)){spring=e;break}}if(!spring)throw Error('No feasible synthetic history');history.push(...spring);
 for(let k=0;k<20000;k++){const electives=sample(pools[c.id],2),rs=sample(Object.keys(roles),2);const codes=['5425',...rs.map(r=>choose(roles[r])),...electives,'5910'];if(new Set(codes).size!==codes.length)continue;const e=codes.map((x,j)=>pick(x,'FA26',['Core',...rs,'Concentration elective','Concentration elective','Capstone'][j]));if(valid(e)){es=e;break}}if(!es)throw Error('No feasible second-year schedule');
 }
 students.push({id:`MOCK-Y${year}-${i+1}`,year,concentration:c.id,enrollments:es,assumedHistory:history});
 }
 return {students,courses:terms.FA26,seed,synthetic:true,valid};
}
function aggregate(data,id){
 const sections=new Map(data.courses.flatMap(c=>c.groups.flatMap(g=>g.sections.map(s=>[s.id,s]))));const group=data.students.filter(s=>s.enrollments.some(e=>e.sectionIds.includes(Number(id))));
 const incomplete=group.some(s=>s.enrollments.some(e=>e.sectionIds.some(i=>!sections.get(i).meetings.length)));
 const mode=!group.length?'empty':incomplete?'incomplete':group.length<=10?'boolean':'percentage',cells=[];
 if(mode==='percentage'||mode==='boolean')for(let start=480;start<1140;start+=30)for(let d=0;d<5;d++){
 const date=`2026-11-0${d+2}`;const n=group.filter(s=>s.enrollments.some(e=>e.sectionIds.some(i=>sections.get(i).meetings.some(m=>m.days.includes('MTWRF'[d])&&date>=m.fromDate&&date<=m.toDate&&m.start<start+30&&start<m.end)))).length;cells.push(mode==='boolean'?n>0:Math.round(100*n/group.length));
 }return {mode,cells,synthetic:true};
}
const api={generate,aggregate};if(typeof module!=='undefined')module.exports=api;else root.SyntheticMPA=api;
})(globalThis);
