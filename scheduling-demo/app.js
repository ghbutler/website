const $=id=>document.getElementById(id),days=['Mon','Tue','Wed','Thu','Fri'];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const time=m=>`${Math.floor(m/60)%12||12}:${String(m%60).padStart(2,'0')}${m<720?'am':'pm'}`;
let courses=[],sequence=0;
let cohort;
const ready=Promise.all(['term_snapshots.json','requirements.json','course-list.json'].map(p=>fetch(p).then(r=>{if(!r.ok)throw Error('Could not load demo files');return r.json()}))).then(([terms,rules,list])=>{cohort=SyntheticMPA.generate(terms,rules,20261106);return list});
async function get(url){const list=await ready;return url==='/api/courses'?list:SyntheticMPA.aggregate(cohort,url.split('/').pop())}

async function render(){const seq=++sequence,id=$('course').value;if(!id){$('result').textContent='Select a course section.';return}$('result').textContent='Loading…';try{const v=await get('/api/sections/'+id);if(seq!==sequence)return;let html=v.stale?'<p class="sub">Refresh delayed; showing the last validated update.</p>':'';
if(v.mode==='empty'||v.mode==='incomplete'){ $('result').innerHTML=html+`<p class="empty">${v.mode==='empty'?'No mock students in this section.':'Meeting information is incomplete.'} No conflict map is available.</p>`;return }
const binary=v.mode==='boolean';html+=`<div class="tablewrap"><table aria-label="Scheduled class conflicts, November 2–6, 2026, Eastern time. Percentages show the share of students with class conflicts; boolean cells indicate any conflict."><thead><tr><th>Time</th>${days.map(d=>`<th scope="col">${d}</th>`).join('')}</tr></thead><tbody>`;
for(let t=480;t<1140;t+=30){html+=`<tr><th scope="row">${time(t)}</th>`;for(let day=0;day<5;day++){const value=v.cells[(t-480)/30*5+day],f=binary?(value?1:0):value/100,label=binary?(value?'Conflict':'No conflict'):value+'%';html+=`<td style="background:rgb(${234-78*f},${241-189*f},${231-187*f});color:${f>.55?'white':'#243b37'}" aria-label="${days[day]} ${time(t)}: ${label}">${label}</td>`}html+='</tr>'}
$('result').innerHTML=html+'</tbody></table></div>';
}catch(e){if(seq===sequence)$('result').textContent=e.message}}
get('/api/courses').then(v=>{courses=v;$('course').innerHTML='<option value="">Select a course section…</option>'+v.map(c=>`<option value="${c.classNbr}">PUBPOL ${escape(c.code)} · ${escape(c.component)} ${escape(c.section)} · ${escape(c.instructors.join(', ')||'Instructor not listed')} · ${escape(c.title)}</option>`).join('');$('course').disabled=false;$('course').onchange=render}).catch(e=>$('result').textContent=e.message);
