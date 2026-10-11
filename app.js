const KEY="recoveryQuestV10";
const defaults={
  day:0,streak:0,best:115,xp:0,slips:0,why:"",history:[],shields:1,
  missionDate:"",missionsDone:[],
  campaignDays:120,weedDaily:15,cokeDaily:100,
  goals:[
    {id:"adr",name:"ADR course fund",target:650},
    {id:"hiab",name:"HIAB / lorry loader",target:800},
    {id:"fork",name:"Forklift tickets",target:500}
  ],
  activeGoal:"adr"
};
let state=load();
let viewDate=new Date();
const milestones=[[1,"First 24 hours"],[3,"Crash phase survived"],[7,"One full week"],[14,"Two weeks"],[30,"One month"],[60,"Two months"],[90,"90-day fortress"],[116,"New personal record"],[120,"120-Day Quest complete"]];
const achievementDefs=[
{id:"d1",icon:"🌅",name:"Day One",desc:"First clean day",ok:s=>s.day>=1},
{id:"d3",icon:"🧱",name:"Foundation",desc:"3 clean days",ok:s=>s.day>=3},
{id:"w1",icon:"🔥",name:"One Week",desc:"7-day streak",ok:s=>Math.max(s.best,s.streak)>=7},
{id:"m1",icon:"🏆",name:"30 Club",desc:"30 clean days",ok:s=>s.day>=30},
{id:"save1",icon:"💷",name:"£1K Back",desc:"£1,000 saved",ok:s=>savedTotal()>=1000},
{id:"save5",icon:"💰",name:"£5K Back",desc:"£5,000 saved",ok:s=>savedTotal()>=5000},
{id:"shield",icon:"🛡️",name:"Protected",desc:"Earn a streak shield",ok:s=>s.day>=14},
{id:"record",icon:"👑",name:"New Record",desc:"Beat 115 days",ok:s=>s.day>=116},
{id:"boss",icon:"⚔️",name:"Boss Slayer",desc:"Use 5 craving actions",ok:s=>(s.history||[]).filter(x=>x.type==="boss").length>=5},
{id:"journal",icon:"📓",name:"Reflective",desc:"10 check-in notes",ok:s=>(s.history||[]).filter(x=>x.type==="day"&&x.notes).length>=10},
{id:"steady",icon:"🧭",name:"Steady",desc:"14-day current streak",ok:s=>s.streak>=14},
{id:"quest",icon:"🌟",name:"Quest Complete",desc:"Finish campaign",ok:s=>s.day>=s.campaignDays}
];
const missionsBase=[
{id:"water",label:"Hydrate properly",xp:20},
{id:"move",label:"Walk / train 20+ mins",xp:35},
{id:"food",label:"Eat a proper meal",xp:20},
{id:"why",label:"Read your reason for quitting",xp:15}
];
const $=id=>document.getElementById(id);
function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return {...defaults}}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function dailyTotal(){return Number(state.weedDaily||0)+Number(state.cokeDaily||0)}
function savedTotal(){return state.day*dailyTotal()}
function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function ensureDailyMissions(){const t=todayKey();if(state.missionDate!==t){state.missionDate=t;state.missionsDone=[];save()}}
function phase(day){if(day<=3)return"Phase 1 · Protect the crash";if(day<=15)return"Phase 2 · Build the routine";if(day<=45)return"Phase 3 · Honeymoon — stay alert";if(day<=90)return"Phase 4 · The wall — keep moving";if(day<=115)return"Phase 5 · Personal danger zone";return"Phase 6 · New personal record"}
function rank(day){if(day<7)return["Starter",1];if(day<30)return["Builder",2];if(day<60)return["Fighter",3];if(day<116)return["Guardian",4];return["Veteran",5]}
function money(n){return Number(n||0).toLocaleString("en-GB")}
function health(day){return Math.min(100,60+Math.floor(day*.34))}
function energy(day){return Math.min(100,40+Math.floor(day*.5))}
function xpLevel(xp){return Math.floor(xp/500)+1}
function renderAvatar(){const [name,stage]=rank(state.day);$("rankName").textContent=name;$("avatar").className=`avatar stage-${stage}`;$("phaseText").textContent=phase(state.day)}
function renderMissions(){ensureDailyMissions();const wrap=$("missions");wrap.innerHTML="";missionsBase.forEach(m=>{const done=state.missionsDone.includes(m.id);const row=document.createElement("div");row.className="mission"+(done?" done":"");row.innerHTML=`<div><strong>${m.label}</strong><div class="muted">+${m.xp} XP</div></div><button type="button" data-id="${m.id}">${done?"Done ✓":"Complete"}</button>`;row.querySelector("button").addEventListener("click",()=>{if(done)return;state.missionsDone.push(m.id);state.xp+=m.xp;state.history.push({type:"mission",id:m.id,at:new Date().toISOString()});save();render()});wrap.appendChild(row)})}
function renderAchievements(){const wrap=$("achievements");wrap.innerHTML="";let count=0;achievementDefs.forEach(a=>{const unlocked=a.ok(state);if(unlocked)count++;const el=document.createElement("div");el.className="achievement"+(unlocked?" unlocked":"");el.innerHTML=`<div class="icon">${a.icon}</div><strong>${a.name}</strong><small>${a.desc}</small>`;wrap.appendChild(el)});$("achievementCount").textContent=count}
function renderMilestones(){const wrap=$("milestones");wrap.innerHTML="";milestones.forEach(([d,label])=>{if(d>state.campaignDays && d!==116)return;const done=state.day>=d;const el=document.createElement("div");el.className="milestone"+(done?" done":"");el.innerHTML=`<div><strong>${done?"✓ ":"○ "}${label}</strong><small>Day ${d} · £${money(d*dailyTotal())} saved</small></div><span class="badge">${done?"UNLOCKED":"LOCKED"}</span>`;wrap.appendChild(el)})}
function eventMap(){const map={};(state.history||[]).forEach(h=>{if(!h.at)return;const d=new Date(h.at);const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;if(h.type==="slip")map[key]="slip";else if(h.type==="day"&&!map[key])map[key]="clean"});return map}
function renderCalendar(){const y=viewDate.getFullYear(),m=viewDate.getMonth();$("calendarTitle").textContent=viewDate.toLocaleDateString("en-GB",{month:"long",year:"numeric"});const wrap=$("calendar");wrap.innerHTML="";const first=new Date(y,m,1),days=new Date(y,m+1,0).getDate();let start=(first.getDay()+6)%7;for(let i=0;i<start;i++){const e=document.createElement("div");e.className="cal-day empty";wrap.appendChild(e)}const map=eventMap(),today=todayKey();for(let d=1;d<=days;d++){const key=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;const el=document.createElement("div");el.className="cal-day"+(map[key]?" "+map[key]:"")+(key===today?" today":"");el.textContent=d;wrap.appendChild(el)}}
function calcRisk(){const days=(state.history||[]).filter(x=>x.type==="day").slice(-5);if(!days.length)return {score:0,title:"Low risk",advice:"Keep stacking routine and sleep."};const avgC=days.reduce((a,b)=>a+Number(b.craving||0),0)/days.length;const poor=days.filter(x=>x.sleep==="Poor"||x.sleep==="Very poor").length;const low=days.filter(x=>["Low","Anxious","Irritable"].includes(x.mood)).length;let score=Math.round(avgC*12+poor*7+low*5);score=Math.min(100,score);let title="Low risk",advice="Keep stacking routine and sleep.";if(score>=65){title="High risk";advice="Reduce exposure to triggers today, contact someone, eat, sleep, and use a boss-battle action before making decisions."}else if(score>=35){title="Watch closely";advice="Your recent check-ins show some pressure. Protect sleep and routine today."}return {score,title,advice}}
function renderRisk(){const r=calcRisk();$("riskScore").textContent=r.score;$("riskTitle").textContent=r.title;$("riskAdvice").textContent=r.advice;$("riskCard").style.borderColor=r.score>=65?"#7f1d1d":r.score>=35?"#7c5a13":"#29415f"}
function renderInsights(){const days=(state.history||[]).filter(x=>x.type==="day");const avg=days.length?days.reduce((a,b)=>a+Number(b.craving||0),0)/days.length:0;$("avgCraving").textContent=avg.toFixed(1);$("highCravingDays").textContent=days.filter(x=>Number(x.craving)>=4).length;$("bossActionsCount").textContent=(state.history||[]).filter(x=>x.type==="boss").length;$("slipsCount").textContent=(state.history||[]).filter(x=>x.type==="slip").length;const chart=$("trendChart");chart.innerHTML="";days.slice(-14).forEach((d,i)=>{const b=document.createElement("div");b.className="trend-bar";b.style.height=(10+Number(d.craving||0)*24)+"px";b.innerHTML=`<small>${i+1}</small>`;chart.appendChild(b)});if(!days.length)chart.innerHTML='<p class="muted">No check-ins yet.</p>';const stop=new Set(["the","and","with","from","that","this","were","was","for","had","have","just","into","before","after"]);const counts={};(state.history||[]).filter(x=>x.type==="slip").forEach(s=>((s.reason||"")+" "+(s.context||"")).toLowerCase().replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(w=>w.length>3&&!stop.has(w)).forEach(w=>counts[w]=(counts[w]||0)+1));const tags=$("triggerWords");tags.innerHTML="";Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([w,c])=>{const el=document.createElement("span");el.className="tag";el.textContent=`${w} ×${c}`;tags.appendChild(el)});if(!Object.keys(counts).length)tags.innerHTML='<p class="muted">No slip patterns logged yet.</p>'}
function renderGoals(){const wrap=$("goalList");wrap.innerHTML="";state.goals.forEach(g=>{const pct=Math.min(100,savedTotal()/g.target*100);const el=document.createElement("div");el.className="goal-item";el.innerHTML=`<div class="goal-item-top"><div><strong>${g.name}</strong><small>£${money(Math.min(savedTotal(),g.target))} / £${money(g.target)}</small></div><button class="secondary choose-goal" data-id="${g.id}">${state.activeGoal===g.id?"Active":"Make active"}</button></div><div class="progress-track slim"><div class="progress-bar" style="width:${pct}%"></div></div>`;el.querySelector(".choose-goal").addEventListener("click",()=>{state.activeGoal=g.id;save();render()});wrap.appendChild(el)})}
function renderActiveGoal(){let g=state.goals.find(x=>x.id===state.activeGoal)||state.goals[0];if(!g)return;$("goalTitle").textContent=g.name;$("goalTargetText").textContent=money(g.target);$("goalProgress").textContent=`£${money(Math.min(savedTotal(),g.target))} / £${money(g.target)}`;$("goalBar").style.width=Math.min(100,savedTotal()/g.target*100)+"%"}
function render(){
  ensureDailyMissions();
  const pct=Math.min(100,Math.round(state.day/state.campaignDays*100)),within=state.xp%500;
  $("campaignLength").textContent=state.campaignDays;$("dayNow").textContent=state.day;$("percentNow").textContent=pct;$("progressBar").style.width=pct+"%";
  $("streak").textContent=state.streak;$("bestStreak").textContent=Math.max(state.best,state.streak);$("shieldCount").textContent=state.shields;
  $("xpNow").textContent=within;$("xpNext").textContent=500;$("xpBar").style.width=(within/500*100)+"%";
  $("healthText").textContent=health(state.day)+"%";$("healthBar").style.width=health(state.day)+"%";$("energyText").textContent=energy(state.day)+"%";$("energyBar").style.width=energy(state.day)+"%";
  $("weedSaved").textContent=money(state.day*state.weedDaily);$("cocaineSaved").textContent=money(state.day*state.cokeDaily);$("totalSaved").textContent=money(savedTotal());$("weedRateText").textContent=`£${money(state.weedDaily)}/day`;$("cokeRateText").textContent=`£${money(state.cokeDaily)}/day`;
  $("whyText").value=state.why||"";$("completeDay").disabled=state.day>=state.campaignDays;$("completeDay").textContent=state.day>=state.campaignDays?"Quest complete":"Complete day";
  renderAvatar();renderMissions();renderAchievements();renderMilestones();renderCalendar();renderRisk();renderInsights();renderGoals();renderActiveGoal();save()
}
document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));btn.classList.add("active");document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));$(`view-${btn.dataset.view}`).classList.remove("hidden");if(btn.dataset.view==="insights")renderInsights()}));
$("completeDay").addEventListener("click",()=>{if(state.day>=state.campaignDays)return;const craving=Number($("craving").value||0);state.day++;state.streak++;state.best=Math.max(state.best,state.streak);state.xp+=100+(craving>=3?30:10);if([14,30,60,90].includes(state.day))state.shields++;state.history.push({type:"day",day:state.day,craving,mood:$("mood").value,sleep:$("sleep").value,notes:$("dailyNotes").value.trim(),at:new Date().toISOString()});$("dailyNotes").value="";$("checkinMessage").textContent=craving>=4?`Strong craving survived. Bonus XP earned — and another £${money(dailyTotal())} kept.`:`Day complete. Another £${money(dailyTotal())} kept in your pocket.`;render()});
document.querySelectorAll(".bossAction").forEach(btn=>btn.addEventListener("click",()=>{state.xp+=Number(btn.dataset.xp||0);state.history.push({type:"boss",action:btn.textContent.trim(),at:new Date().toISOString()});$("checkinMessage").textContent=`Boss action complete: ${btn.textContent.trim()}. XP added.`;render()}));
$("logSlip").addEventListener("click",()=>{$("slipPanel").classList.remove("hidden");$("slipReason").focus()});
$("cancelSlip").addEventListener("click",()=>{$("slipPanel").classList.add("hidden")});
$("saveSlip").addEventListener("click",()=>{const reason=$("slipReason").value.trim(),context=$("slipContext").value.trim();if(!reason){$("slipMsg").textContent="Add the trigger first — the lesson is the useful part.";return}const wants=$("useShield").checked;let used=false;if(wants&&state.shields>0){state.shields--;used=true;$("slipMsg").textContent="Lesson saved. Shield used: your streak is protected."}else{state.streak=0;$("slipMsg").textContent="Lesson saved. Overall progress remains; current streak restarts."}state.slips++;state.xp+=50;state.history.push({type:"slip",reason,context,shield:used,at:new Date().toISOString()});$("slipReason").value="";$("slipContext").value="";$("useShield").checked=false;render()});
$("whyText").addEventListener("input",e=>{state.why=e.target.value;save()});
$("prevMonth").addEventListener("click",()=>{viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()-1,1);renderCalendar()});
$("nextMonth").addEventListener("click",()=>{viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()+1,1);renderCalendar()});
$("addGoal").addEventListener("click",()=>{const name=$("newGoalName").value.trim();const target=Number($("newGoalTarget").value);if(!name||!Number.isFinite(target)||target<=0)return;const id="g"+Date.now();state.goals.push({id,name,target});state.activeGoal=id;$("newGoalName").value="";$("newGoalTarget").value="";render()});
$("openSettings").addEventListener("click",()=>{$("settingCampaign").value=state.campaignDays;$("settingWeed").value=state.weedDaily;$("settingCoke").value=state.cokeDaily;$("settingsPanel").classList.remove("hidden")});
$("closeSettings").addEventListener("click",()=>$("settingsPanel").classList.add("hidden"));
$("saveSettings").addEventListener("click",()=>{state.campaignDays=Math.max(30,Math.min(365,Number($("settingCampaign").value)||120));state.weedDaily=Math.max(0,Number($("settingWeed").value)||0);state.cokeDaily=Math.max(0,Number($("settingCoke").value)||0);$("settingsPanel").classList.add("hidden");render()});
$("exportData").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`recovery-quest-backup-${todayKey()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});
$("importData").addEventListener("change",e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const parsed=JSON.parse(r.result);state={...defaults,...parsed};save();render();$("settingsPanel").classList.add("hidden")}catch{alert("That backup file could not be read.")}};r.readAsText(f)});
$("resetApp").addEventListener("click",()=>{if(confirm("Reset all Recovery Quest progress on this device?")){state={...defaults};localStorage.removeItem(KEY);$("settingsPanel").classList.add("hidden");render()}});
if("serviceWorker"in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}))}
render();