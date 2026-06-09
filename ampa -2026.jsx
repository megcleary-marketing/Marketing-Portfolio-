/**
 * Account Marketing Planning Agent (AMPA)
 * Built by Megan Cleary — Senior Demand Generation & Campaign Marketing Leader
 * linkedin.com/in/megcleary | megscleary@gmail.com
 *
 * Copyright © 2026 Megan Cleary. All rights reserved.
 *
 * This tool, including its prompt architecture, API call structure,
 * scoring methodology, activation framework, and user interface,
 * represents original work created independently by Megan Cleary.
 *
 * Unauthorized reproduction, distribution, or adaptation of this tool
 * or its underlying methodology is prohibited without written permission.
 *
 * Built with: Anthropic Claude API, React
 */

import { useState, useEffect } from "react";

const C = {
  bg:"#F7FAFD",surface:"#FFFFFF",border:"#D0DCE8",muted:"#EBF4FB",
  text:"#1C1C1C",sub:"#4A4A4A",quiet:"#888888",
  accent:"#2E74B5",accentBg:"#EBF4FB",accentBorder:"#DCE9F5",indigo:"#1C3557",
  green:"#22C55E",greenBg:"#DCFCE7",greenText:"#166534",
  amber:"#F59E0B",amberBg:"#FEF9C3",amberText:"#854D0E",
  red:"#EF4444",redBg:"#FEE2E2",redText:"#991B1B",
};
const card={background:C.surface,borderRadius:"16px",border:`1px solid ${C.border}`,padding:"28px",marginBottom:"20px",boxShadow:"0 1px 4px rgba(15,23,42,.05)"};
const fieldBase={width:"100%",padding:"10px 14px",borderRadius:"10px",border:`1.5px solid ${C.border}`,fontSize:"14px",fontFamily:"inherit",color:C.text,background:C.surface,outline:"none",boxSizing:"border-box"};

// ─── Brief Prompts (3 calls, each ~300 tokens output) ───────────────────────
const BP1=`Return ONLY raw JSON, no markdown, no extra text. One short sentence per string value.
{"scores":{"icpFit":0,"intentSignals":0,"expansionPotential":0,"strategicValue":0,"pipelinePotential":0,"tier":"A","tierRationale":"Short sentence. Second sentence."},"executiveSummary":{"whyThisAccount":"Short sentence. Second.","recommendedGTMMotion":"Motion name","marketingAngle":"One sentence.","salesAngle":"One sentence."},"companyProfile":{"overview":"Short sentence. Second.","industry":"string","revenueEstimate":"string","employeeEstimate":"string","status":"Public","geographicFootprint":"string","recentInitiatives":["item","item","item"]}}`;

const BP2=`Return ONLY raw JSON, no markdown, no extra text. One short sentence per string value.
{"buyingSignals":[{"type":"type","detail":"One sentence.","strength":"Strong"},{"type":"type","detail":"One sentence.","strength":"Strong"},{"type":"type","detail":"One sentence.","strength":"Medium"},{"type":"type","detail":"One sentence.","strength":"Weak"}],"topPersonas":[{"title":"title","goals":"One sentence.","painPoints":"One sentence.","messagingAngle":"One sentence.","bestContentOffer":"One sentence."},{"title":"title","goals":"One sentence.","painPoints":"One sentence.","messagingAngle":"One sentence.","bestContentOffer":"One sentence."},{"title":"title","goals":"One sentence.","painPoints":"One sentence.","messagingAngle":"One sentence.","bestContentOffer":"One sentence."}]}`;

const BP3=`Return ONLY raw JSON, no markdown, no extra text. One short sentence per string value.
{"technologyEnvironment":{"cloudProviders":[{"name":"n","confidence":"High"},{"name":"n","confidence":"Medium"}],"securityVendors":[{"name":"n","confidence":"High"},{"name":"n","confidence":"Medium"}],"identityVendors":[{"name":"n","confidence":"High"}],"crm":[{"name":"n","confidence":"High"}],"marketingAutomation":[{"name":"n","confidence":"Medium"}],"dataAnalytics":[{"name":"n","confidence":"Medium"}]},"campaignRecommendation":{"primaryMotion":"motion","rationale":"One sentence. Second.","tier1Channels":["ch","ch","ch"],"tier2Channels":["ch","ch"],"channelsToAvoid":["ch","ch"],"campaignTheme":"theme","contentAsset":"asset","suggestedCTA":"CTA","kpis":["kpi","kpi","kpi"]},"salesActivation":{"sdrOutreachAngle":"One sentence. Second.","executiveEmailTheme":"theme","discoveryQuestions":["Q?","Q?","Q?"],"followUpAsset":"asset","objectionHandling":["Obj: response.","Obj: response."]},"executiveHandoff":"One sentence. Second sentence."}`;

// ─── Activation Prompts (4 calls) ────────────────────────────────────────────
// AP1 — Plain text outreach (avoids JSON overhead, ~300 tokens output)
function AP1(co,sol,r){
  const ctx=`Account:${co}. Solution:${sol||"B2B tech"}. Persona:${r.topPersonas?.[0]?.title||""}. Sales angle:${r.executiveSummary?.salesAngle||""}. Key signal:${r.buyingSignals?.[0]?.detail||""}.`;
  return `${ctx}

Write outreach copy for this account. Use EXACTLY this format with these exact labels on separate lines:

PERSONA: [target persona title]
S1: [Day 1 subject line - max 8 words]
B1: [Day 1 body - 3 sentences: open with their signal, connect to challenge, make a soft ask]
S2: [Day 5 subject line - max 8 words]
B2: [Day 5 body - 2 sentences: new insight, ask for 15 minutes]
S3: [Day 12 subject line - max 8 words]
B3: [Day 12 body - 2 sentences: short direct, clear final ask]
SLACK: [Slack alert to account team - 2 sentences: tier + signal + recommended action]

Write real specific copy for ${co}. No placeholders.`;
}

// AP2a — Executive email + LinkedIn (compact JSON, ~300 tokens)
// AP2a — Executive email + LinkedIn (plain text, ~200 tokens)
function AP2a(co,sol,r){
  const ctx=`Account:${co}. Solution:${sol||"B2B tech"}. Persona:${r.topPersonas?.[0]?.title||"CISO"}. Angle:${r.executiveSummary?.salesAngle||""}. Signal:${r.buyingSignals?.[0]?.detail||""}.`;
  return `${ctx}

Write an executive email and LinkedIn message using EXACTLY this format:

EMAILTO: [exec title — e.g. CISO]
EMAILSUB: [compelling subject line, max 10 words]
EMAILBODY: [3 sentences: insight specific to their company, outcome they care about, soft ask]
LINKEDIN: [personalized connection message under 200 chars]

Real specific content for ${co}. No placeholders.`;
}

// AP2b — LinkedIn targeting (plain text, ~180 tokens)
function AP2b(co,sol,r){
  const ctx=`Account:${co}. Industry:${r.companyProfile?.industry||""}. Personas:${(r.topPersonas||[]).map(p=>p.title).join(",")||""}.`;
  return `${ctx}

Write LinkedIn ad targeting using EXACTLY this format:

TITLE1: [specific job title]
TITLE2: [specific job title]
TITLE3: [specific job title]
TITLE4: [specific job title]
TITLE5: [specific job title]
SENIORITY: [comma-separated seniority levels]
SIZE: [comma-separated company size ranges]
SKILL1: [specific skill or interest]
SKILL2: [specific skill or interest]
SKILL3: [specific skill or interest]
ADANGLE: [one sentence — best ad angle for this audience]

Real specific values for ${co}. No placeholders.`;
}

// AP3 — Paid media only (compact JSON, ~220 tokens — small enough to keep as JSON)
function AP3(co,sol,r){
  const ctx=`Account:${co}. Solution:${sol||"B2B tech"}. Theme:${r.campaignRecommendation?.campaignTheme||""}. Industry:${r.companyProfile?.industry||""}.`;
  return `${ctx}\nSINGLE-LINE COMPACT JSON ONLY. No newlines. No indentation. Real specific keywords.\n{"paidMedia":{"intentKeywords":["kw","kw","kw","kw","kw"],"searchKeywords":["kw","kw","kw"],"bomboraTopics":["topic","topic","topic"],"g2Categories":["cat","cat"],"adHeadline":"Compelling headline under 55 chars","adBodyCopy":"One punchy sentence.","cta":"CTA text"}}`;
}

// AP3b — Field marketing (plain text, ~180 tokens)
function AP3b(co,sol,r){
  const ctx=`Account:${co}. Solution:${sol||"B2B tech"}. Industry:${r.companyProfile?.industry||""}. Persona:${r.topPersonas?.[0]?.title||""}. Theme:${r.campaignRecommendation?.campaignTheme||""}.`;
  return `${ctx}

Write field marketing using EXACTLY this format:

EVENT1: [specific event type]
EVENT2: [specific event type]
EVENT3: [specific event type]
INVITE: [compelling invite subject line]
EXEC: [specific executive engagement idea]
FOLLOWUP: [specific post-event follow-up angle]

Real specific content for ${co} only.`;
}

// AP4a — Creative brief (plain text, ~220 tokens)
function AP4a(co,sol,r){
  const ctx=`Account:${co}. Solution:${sol||"B2B tech"}. Theme:${r.campaignRecommendation?.campaignTheme||""}. Angle:${r.executiveSummary?.marketingAngle||""}. Persona:${r.topPersonas?.[0]?.title||""}. Asset:${r.campaignRecommendation?.contentAsset||""}.`;
  return `${ctx}

Write a creative brief using EXACTLY this format:

OBJECTIVE: [one sentence campaign objective]
PRIMARY: [one sentence — the single most important message]
SECONDARY: [one sentence — supporting proof or context]
PROOF: [one specific metric or validation]
TONE: [3-4 adjectives]
IMAGERY: [one sentence describing imagery style]
DESIGNER: [one specific instruction for the designer]

Real specific content for ${co}. No placeholders.`;
}

// AP4b — LinkedIn ad copy (plain text, ~250 tokens)
function AP4b(co,sol,r){
  const ctx=`Account:${co}. Solution:${sol||"B2B tech"}. Theme:${r.campaignRecommendation?.campaignTheme||""}. Persona:${r.topPersonas?.[0]?.title||""}. Angle:${r.executiveSummary?.marketingAngle||""}.`;
  return `${ctx}

Write LinkedIn ad copy using EXACTLY this format:

H1: [Awareness headline, max 60 chars]
I1: [Awareness intro, max 120 chars]
V1: [Visual direction note for designer]
H2: [Pain Point headline, max 60 chars]
I2: [Pain Point intro, max 120 chars]
V2: [Visual direction note]
MSUB: [InMail subject line, max 55 chars]
MBODY: [InMail body — 2 sentences max]
MCTA: [InMail CTA, max 18 chars]
C1: [Carousel card 1 headline, max 43 chars]
C2: [Carousel card 2 headline, max 43 chars]
C3: [Carousel card 3 headline, max 43 chars]

Real specific copy for ${co}. No placeholders.`;
}

// ─── Small UI helpers ────────────────────────────────────────────────────────
function Tag({label,bg,text}){return <span style={{fontSize:"10px",fontWeight:"700",padding:"2px 8px",borderRadius:"5px",background:bg,color:text,letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{label}</span>;}
function ConfTag({level}){const m={High:[C.greenBg,C.greenText],Medium:[C.amberBg,C.amberText],Low:[C.redBg,C.redText]};const[bg,t]=m[level]||[C.muted,C.sub];return <Tag label={level} bg={bg} text={t}/>;}
function StrTag({strength}){const m={Strong:[C.greenBg,C.greenText],Medium:[C.amberBg,C.amberText],Weak:[C.muted,C.sub]};const[bg,t]=m[strength]||[C.muted,C.sub];return <Tag label={strength} bg={bg} text={t}/>;}
function TierBadge({tier}){const m={A:{bg:C.greenBg,text:C.greenText,border:"#BBF7D0",label:"High Priority"},B:{bg:C.amberBg,text:C.amberText,border:"#FDE68A",label:"Medium Priority"},C:{bg:C.muted,text:C.sub,border:C.border,label:"Lower Priority"}};const c=m[tier]||m.C;return(<div style={{display:"inline-flex",alignItems:"center",gap:"10px",padding:"8px 18px",borderRadius:"12px",background:c.bg,border:`2px solid ${c.border}`}}><span style={{fontSize:"24px",fontWeight:"900",color:c.text,lineHeight:1}}>{tier}</span><div><div style={{fontSize:"10px",fontWeight:"700",color:c.text,letterSpacing:"0.06em",textTransform:"uppercase"}}>Tier</div><div style={{fontSize:"12px",fontWeight:"700",color:c.text}}>{c.label}</div></div></div>);}
function ScoreBar({label,value}){const color=value>=8?C.green:value>=6?C.amber:C.red;return(<div style={{marginBottom:"14px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}><span style={{fontSize:"13px",color:C.sub,fontWeight:"500"}}>{label}</span><span style={{fontSize:"13px",fontWeight:"800",color}}>{value}/10</span></div><div style={{height:"5px",background:C.muted,borderRadius:"99px",overflow:"hidden"}}><div style={{height:"100%",width:`${value*10}%`,background:color,borderRadius:"99px"}}/></div></div>);}
function SectionHead({icon,title,light}){return(<div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}><div style={{width:"32px",height:"32px",borderRadius:"8px",flexShrink:0,background:light?"rgba(255,255,255,.15)":"linear-gradient(135deg,#1C3557,#2E74B5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>{icon}</div><h2 style={{margin:0,fontSize:"16px",fontWeight:"800",letterSpacing:"-0.02em",color:light?"#DCE9F5":C.text}}>{title}</h2></div>);}
function Stat({label,value}){return(<div style={{padding:"14px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"10px",fontWeight:"700",letterSpacing:"0.08em",textTransform:"uppercase",color:C.quiet,marginBottom:"4px"}}>{label}</div><div style={{fontSize:"13px",fontWeight:"600",color:C.text}}>{value||"—"}</div></div>);}
function Pill({label,color}){return <span style={{display:"inline-block",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"600",background:C.accentBg,color:color||C.accent,border:`1px solid ${C.accentBorder}`,margin:"3px"}}>{label}</span>;}
function Dot({color}){return <span style={{width:"5px",height:"5px",borderRadius:"50%",background:color,flexShrink:0,display:"inline-block"}}/>;}

function CopyBtn({text,label="Copy"}){
  const[copied,setCopied]=useState(false);
  return(<button onClick={()=>{navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{padding:"5px 12px",borderRadius:"7px",border:`1.5px solid ${copied?C.green:C.accentBorder}`,background:copied?C.greenBg:C.accentBg,color:copied?C.greenText:C.accent,fontSize:"11px",fontWeight:"700",cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.04em",whiteSpace:"nowrap"}}>{copied?"✓ Copied":`Copy ${label}`}</button>);
}

function AdField({value:init,maxChars,label,rows=2}){
  const[val,setVal]=useState(init||"");
  const n=val.length,over=n>maxChars,close=n>maxChars*.88;
  const color=over?C.red:close?C.amber:C.green;
  return(<div style={{marginBottom:"10px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"5px"}}><span style={{fontSize:"11px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</span><div style={{display:"flex",alignItems:"center",gap:"8px"}}><span style={{fontSize:"11px",fontWeight:"800",color}}>{n}/{maxChars} {over?"✗":"✓"}</span><CopyBtn text={val} label=""/></div></div><textarea value={val} onChange={e=>setVal(e.target.value)} rows={rows} style={{width:"100%",padding:"8px 10px",borderRadius:"8px",border:`1.5px solid ${over?C.red:close?C.amber:C.border}`,fontSize:"13px",fontFamily:"inherit",color:C.text,resize:"vertical",boxSizing:"border-box",lineHeight:"1.55",background:C.surface,outline:"none"}}/></div>);
}

// ─── Score Methodology Component ─────────────────────────────────────────────
function ScoreMethodology() {
  const [open, setOpen] = useState(false);
  const factors = [
    {
      score: "ICP Fit",
      current: "AI estimates from company size, industry, growth stage, and tech stack signals based on public information",
      enrich: "Your defined ICP profile (firmographic criteria, revenue range, employee count, vertical) connected via Salesforce or HubSpot",
    },
    {
      score: "Intent Signals",
      current: "AI inference from job postings, acquisitions, exec changes, press releases, and product launches",
      enrich: "Live Demandbase or Bombora intent scores — keyword surge data, topic engagement, and anonymous site visitor signals synced in real time",
    },
    {
      score: "Pipeline Potential",
      current: "AI estimate based on company revenue, deal complexity, number of divisions and geographies",
      enrich: "Salesforce historical win rates, average deal size, and sales cycle data for this account segment; LTV data from existing customers in the same vertical",
    },
    {
      score: "Strategic Value",
      current: "AI assessment of logo value, analyst coverage, market influence, and reference potential",
      enrich: "Internal account tiering from your ABM platform (Demandbase, 6sense), analyst relationship data, and partner ecosystem value from Salesforce",
    },
    {
      score: "Expansion Potential",
      current: "AI estimate based on business units, product lines, geographies, and company growth trajectory",
      enrich: "Product usage data showing which features are adopted; Salesforce opportunity history showing whitespace; renewal date and cross-sell history",
    },
  ];

  return (
    <div style={{marginTop:"14px"}}>
      <button
        onClick={()=>setOpen(v=>!v)}
        style={{background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0,display:"flex",alignItems:"center",gap:"6px",color:C.accent,fontSize:"12px",fontWeight:"700"}}
      >
        <span style={{fontSize:"14px"}}>{open?"▲":"▼"}</span>
        {open ? "Hide score methodology" : "How are these scores calculated?"}
      </button>

      {open && (
        <div style={{marginTop:"14px",borderRadius:"12px",border:`1.5px solid ${C.accentBorder}`,overflow:"hidden"}}>
          {/* Header */}
          <div style={{padding:"14px 16px",background:C.accentBg,borderBottom:`1px solid ${C.accentBorder}`}}>
            <div style={{fontSize:"12px",fontWeight:"800",color:C.indigo,marginBottom:"4px"}}>Score Methodology</div>
            <div style={{fontSize:"12px",color:C.sub,lineHeight:"1.5"}}>
              <strong style={{color:C.redText}}>Currently:</strong> All scores are AI estimates based on publicly available signals — no live data connection. 
              <strong style={{color:C.greenText}}> With integrations:</strong> each score can be replaced with real data from your existing stack.
            </div>
          </div>

          {/* Factor rows */}
          {factors.map((f,i)=>(
            <div key={i} style={{padding:"14px 16px",borderBottom:i<factors.length-1?`1px solid ${C.border}`:"none",background:C.surface}}>
              <div style={{fontSize:"12px",fontWeight:"800",color:C.text,marginBottom:"8px"}}>{f.score}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                <div style={{padding:"10px 12px",background:"#FEF9C3",borderRadius:"8px",border:"1px solid #FDE68A"}}>
                  <div style={{fontSize:"10px",fontWeight:"700",color:C.amberText,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"4px"}}>⚡ AI Estimate (now)</div>
                  <div style={{fontSize:"12px",color:"#78350F",lineHeight:"1.5"}}>{f.current}</div>
                </div>
                <div style={{padding:"10px 12px",background:C.greenBg,borderRadius:"8px",border:"1px solid #BBF7D0"}}>
                  <div style={{fontSize:"10px",fontWeight:"700",color:C.greenText,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"4px"}}>🔗 With integrations</div>
                  <div style={{fontSize:"12px",color:"#14532D",lineHeight:"1.5"}}>{f.enrich}</div>
                </div>
              </div>
            </div>
          ))}

          {/* Integration roadmap */}
          <div style={{padding:"14px 16px",background:C.muted}}>
            <div style={{fontSize:"11px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"10px"}}>Data sources that would make scores precise</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
              {[
                {label:"ICP Profile",desc:"Your firmographic criteria"},
                {label:"Demandbase",desc:"Live intent + engagement"},
                {label:"Bombora",desc:"Topic surge signals"},
                {label:"Salesforce",desc:"Pipeline + win rate history"},
                {label:"6sense",desc:"Account journey stage"},
                {label:"LTV Data",desc:"Customer lifetime value by segment"},
                {label:"Product Usage",desc:"Feature adoption signals"},
                {label:"Renewal Dates",desc:"Expansion timing triggers"},
              ].map(({label,desc})=>(
                <div key={label} style={{padding:"6px 12px",background:C.surface,borderRadius:"20px",border:`1.5px solid ${C.accentBorder}`,display:"flex",alignItems:"center",gap:"6px"}}>
                  <span style={{fontSize:"12px",fontWeight:"700",color:C.accent}}>{label}</span>
                  <span style={{fontSize:"11px",color:C.quiet}}>— {desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Brief sections ───────────────────────────────────────────────────────────
function BriefView({result,company}){
  const{scores,executiveSummary,companyProfile,technologyEnvironment,buyingSignals,topPersonas,campaignRecommendation,salesActivation,executiveHandoff}=result;
  return(<div>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div><div style={{fontSize:"11px",fontWeight:"700",letterSpacing:"0.08em",textTransform:"uppercase",color:C.quiet,marginBottom:"4px"}}>Account Brief</div><div style={{fontSize:"26px",fontWeight:"900",letterSpacing:"-0.03em"}}>{company}</div><div style={{fontSize:"13px",color:C.sub,marginTop:"2px"}}>{companyProfile?.industry} · {companyProfile?.status}</div></div>
      <TierBadge tier={scores?.tier}/>
    </div>

    <div style={card}>
      <SectionHead icon="📊" title="Account Prioritization Scores"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 48px"}}>
        <ScoreBar label="ICP Fit" value={scores?.icpFit}/><ScoreBar label="Intent Signals" value={scores?.intentSignals}/>
        <ScoreBar label="Expansion Potential" value={scores?.expansionPotential}/><ScoreBar label="Strategic Value" value={scores?.strategicValue}/>
        <ScoreBar label="Pipeline Potential" value={scores?.pipelinePotential}/>
      </div>
      {scores?.tierRationale&&<div style={{marginTop:"16px",padding:"14px 16px",background:C.muted,borderRadius:"10px",fontSize:"13px",color:C.sub,lineHeight:"1.65"}}>{scores.tierRationale}</div>}
      <ScoreMethodology/>
    </div>

    <div style={card}>
      <SectionHead icon="🎯" title="Executive Summary"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
        {[["Why This Account",executiveSummary?.whyThisAccount],["GTM Motion",executiveSummary?.recommendedGTMMotion],["Marketing Angle",executiveSummary?.marketingAngle],["Sales Angle",executiveSummary?.salesAngle]].map(([l,v])=>(
          <div key={l} style={{padding:"16px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"10px",fontWeight:"700",letterSpacing:"0.07em",textTransform:"uppercase",color:C.quiet,marginBottom:"8px"}}>{l}</div><div style={{fontSize:"13px",color:C.sub,lineHeight:"1.65"}}>{v}</div></div>
        ))}
      </div>
    </div>

    <div style={card}>
      <SectionHead icon="🏢" title="Company Profile"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"16px"}}>
        <Stat label="Industry" value={companyProfile?.industry}/><Stat label="Revenue (est.)" value={companyProfile?.revenueEstimate}/><Stat label="Employees (est.)" value={companyProfile?.employeeEstimate}/>
        <Stat label="Status" value={companyProfile?.status}/><Stat label="Geography" value={companyProfile?.geographicFootprint}/>
      </div>
      <p style={{margin:"0 0 16px",fontSize:"14px",color:C.sub,lineHeight:"1.7"}}>{companyProfile?.overview}</p>
      {(companyProfile?.recentInitiatives||[]).length>0&&<>{<div style={{fontSize:"11px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"10px"}}>Recent Initiatives</div>}{companyProfile.recentInitiatives.map((item,i)=><div key={i} style={{display:"flex",gap:"8px",fontSize:"13px",color:C.sub,padding:"3px 0"}}><span style={{color:C.accent,fontWeight:"700",flexShrink:0}}>→</span>{item}</div>)}</>}
    </div>

    <div style={card}>
      <SectionHead icon="💻" title="Technology Environment"/>
      <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px",padding:"10px 14px",background:C.muted,borderRadius:"8px"}}>
        <span style={{fontSize:"14px"}}>ℹ️</span>
        <span style={{fontSize:"12px",color:C.sub}}><strong style={{color:C.text}}>Confidence levels</strong> reflect how likely this technology is in use based on public signals — job postings, integrations, press releases, and tech stack mentions. <strong style={{color:C.greenText}}>High</strong> = strong evidence. <strong style={{color:C.amberText}}>Medium</strong> = likely based on company profile. <strong style={{color:C.redText}}>Low</strong> = possible but unconfirmed estimate.</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
        {[["Cloud Providers",technologyEnvironment?.cloudProviders],["Security Vendors",technologyEnvironment?.securityVendors],["Identity Vendors",technologyEnvironment?.identityVendors],["CRM",technologyEnvironment?.crm],["Marketing Automation",technologyEnvironment?.marketingAutomation],["Data & Analytics",technologyEnvironment?.dataAnalytics]].map(([label,items])=>(
          <div key={label} style={{padding:"14px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"10px",fontWeight:"700",letterSpacing:"0.07em",textTransform:"uppercase",color:C.quiet,marginBottom:"10px"}}>{label}</div>{(items||[]).map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"13px",fontWeight:"500",color:C.text}}>{item.name}</span><ConfTag level={item.confidence}/></div>)}</div>
        ))}
      </div>
    </div>

    <div style={card}>
      <SectionHead icon="📡" title="Buying Signals"/>
      {(buyingSignals||[]).map((s,i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"14px 16px",background:C.muted,borderRadius:"10px",gap:"16px",marginBottom:"10px"}}>
          <div style={{flex:1}}><div style={{fontSize:"11px",fontWeight:"700",color:C.accent,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"4px"}}>{s.type}</div><div style={{fontSize:"13px",color:C.sub,lineHeight:"1.5"}}>{s.detail}</div></div>
          <StrTag strength={s.strength}/>
        </div>
      ))}
    </div>

    <div style={card}>
      <SectionHead icon="👥" title="Persona Analysis"/>
      {(topPersonas||[]).map((p,i)=>(
        <div key={i} style={{padding:"18px",background:C.muted,borderRadius:"12px",marginBottom:"12px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px"}}><div style={{width:"34px",height:"34px",borderRadius:"8px",flexShrink:0,background:"linear-gradient(135deg,#1C3557,#2E74B5)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"11px",fontWeight:"900"}}>{(p.title||"").substring(0,2).toUpperCase()}</div><div style={{fontWeight:"800",fontSize:"14px",color:C.text}}>{p.title}</div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
            {[["Goals",p.goals],["Pain Points",p.painPoints],["Messaging Angle",p.messagingAngle],["Best Content Offer",p.bestContentOffer]].map(([l,v])=>(
              <div key={l}><div style={{fontSize:"10px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"5px"}}>{l}</div><div style={{fontSize:"13px",color:C.sub,lineHeight:"1.55"}}>{v}</div></div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <div style={card}>
      <SectionHead icon="🚀" title="Campaign Recommendation"/>
      <div style={{display:"inline-flex",alignItems:"center",gap:"8px",background:C.accentBg,padding:"8px 14px",borderRadius:"8px",marginBottom:"16px",border:`1px solid ${C.accentBorder}`}}><span style={{fontSize:"11px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.06em"}}>Primary Motion</span><span style={{fontSize:"14px",fontWeight:"800",color:C.indigo}}>{campaignRecommendation?.primaryMotion}</span></div>
      <p style={{margin:"0 0 20px",fontSize:"14px",color:C.sub,lineHeight:"1.7"}}>{campaignRecommendation?.rationale}</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
        {[["🟢 Tier 1 Channels",campaignRecommendation?.tier1Channels,C.green],["🟡 Tier 2 Channels",campaignRecommendation?.tier2Channels,C.amber],["🔴 Avoid",campaignRecommendation?.channelsToAvoid,C.red],["📈 KPIs",campaignRecommendation?.kpis,C.accent]].map(([label,items,color])=>(
          <div key={label} style={{padding:"14px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"11px",fontWeight:"700",marginBottom:"10px"}}>{label}</div>{(items||[]).map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",color:C.sub,padding:"3px 0"}}><Dot color={color}/>{item}</div>)}</div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"12px"}}>
        {[["Campaign Theme",campaignRecommendation?.campaignTheme],["Content Asset",campaignRecommendation?.contentAsset],["Suggested CTA",campaignRecommendation?.suggestedCTA]].map(([l,v])=>(
          <div key={l} style={{padding:"14px",background:C.accentBg,borderRadius:"10px",border:`1px solid ${C.accentBorder}`}}><div style={{fontSize:"10px",fontWeight:"700",color:C.accent,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"6px"}}>{l}</div><div style={{fontSize:"13px",fontWeight:"600",color:C.indigo}}>{v}</div></div>
        ))}
      </div>
    </div>

    <div style={card}>
      <SectionHead icon="💼" title="Sales Activation"/>
      <div style={{padding:"16px",background:C.muted,borderRadius:"10px",marginBottom:"14px"}}><div style={{fontSize:"10px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"8px"}}>SDR Outreach Angle</div><div style={{fontSize:"14px",color:C.sub,lineHeight:"1.7"}}>{salesActivation?.sdrOutreachAngle}</div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
        <div style={{padding:"16px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"10px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"8px"}}>Executive Email Theme</div><div style={{fontSize:"13px",fontWeight:"600",color:C.text}}>{salesActivation?.executiveEmailTheme}</div></div>
        <div style={{padding:"16px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"10px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"8px"}}>Follow-up Asset</div><div style={{fontSize:"13px",fontWeight:"600",color:C.text}}>{salesActivation?.followUpAsset}</div></div>
        <div style={{padding:"16px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"10px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"10px"}}>Discovery Questions</div>{(salesActivation?.discoveryQuestions||[]).map((q,i)=><div key={i} style={{display:"flex",gap:"8px",fontSize:"13px",color:C.sub,padding:"4px 0"}}><span style={{color:C.accent,fontWeight:"800",flexShrink:0}}>{i+1}.</span>{q}</div>)}</div>
        <div style={{padding:"16px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"10px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"10px"}}>Objection Handling</div>{(salesActivation?.objectionHandling||[]).map((o,i)=><div key={i} style={{fontSize:"13px",color:C.sub,padding:"4px 0"}}><span style={{color:C.red,fontWeight:"700"}}>▸ </span>{o}</div>)}</div>
      </div>
    </div>

    <div style={{...card,background:"linear-gradient(135deg,#1C3557,#0F2540)",border:"none",boxShadow:"0 4px 24px rgba(99,102,241,.2)"}}>
      <SectionHead icon="✉️" title="Executive Handoff" light/>
      <p style={{margin:0,fontSize:"15px",color:"#B8D4F0",lineHeight:"1.8",fontStyle:"italic"}}>"{executiveHandoff}"</p>
    </div>
  </div>);
}

// ─── Activation Workflow Component ───────────────────────────────────────────
const WORKFLOWS = [
  {
    id: 1,
    name: "Google Doc Creative Brief",
    icon: "📄",
    color: "#1A73E8",
    colorBg: "#E8F1FB",
    colorBorder: "#B8D4F5",
    description: "Creates a formatted Google Doc with the full creative brief, all 3 LinkedIn ad variations, targeting spec, and image size requirements — ready to hand to a designer.",
    steps: [
      { tool: "AMPA", action: "Generates creative brief, 3 ad copy variations (Awareness, Pain Point, Social Proof), LinkedIn targeting spec, and carousel headlines", output: "Ad copy + targeting JSON" },
      { tool: "Zapier", action: "Trigger: Activation generated → formats content into structured document sections with headings, character counts, and image spec table", output: "Formatted doc content" },
      { tool: "Google Docs", action: "Creates new Doc titled '[Account] LinkedIn Campaign Brief — [Date]', populates all sections: Creative Brief, Ad Variations, Targeting Spec, Image Requirements (1200×627px Single Image, 1080×1080px Carousel)", output: "Shareable Google Doc" },
      { tool: "Google Drive", action: "Saves Doc to shared /Marketing/Campaigns/[Account] folder, sets edit access for designer and campaign manager", output: "Shared folder link" },
      { tool: "Slack", action: "Posts to #design-requests: 'Creative brief ready for [Account] LinkedIn campaign — [Google Doc link]. Assigned to designer. Deadline: [Date]'", output: "Design request alert" },
    ],
    manualStep: "Designer creates graphics to spec, uploads to Campaign Manager, and marks Doc as 'Creative complete'",
    timeSaved: "2–3 hrs",
  },
  {
    id: 2,
    name: "Canva Design Task",
    icon: "🎨",
    color: "#7D2AE8",
    colorBg: "#F3EEFB",
    colorBorder: "#D4B8F5",
    description: "Creates Canva designs from your brand templates with ad copy pre-filled — designer opens, adjusts visuals, exports to spec.",
    steps: [
      { tool: "AMPA", action: "Generates ad copy for each format: Single Image headline + intro, Carousel card headlines, Message Ad subject + body", output: "Copy per format" },
      { tool: "Zapier", action: "Trigger: Activation generated → reads ad copy fields and maps to Canva template variables", output: "Template payload" },
      { tool: "Canva API", action: "Creates new design from your saved LinkedIn Single Image template (1200×627px), pre-fills headline and intro text fields with Variation A copy", output: "Draft Canva design" },
      { tool: "Canva API", action: "Creates Carousel design (1080×1080px), pre-fills each card headline from carousel headlines output", output: "Draft carousel" },
      { tool: "Slack", action: "DMs designer: '[Account] ad designs are ready in Canva — copy is pre-filled, just add visuals and brand elements. [Canva link]'", output: "Designer notification" },
    ],
    manualStep: "Designer adds imagery, brand colors, and logo — exports PNG/JPG and uploads to LinkedIn Campaign Manager",
    timeSaved: "1–2 hrs",
  },
  {
    id: 3,
    name: "SDR Slack Brief + Sequence Alert",
    icon: "🙋",
    color: "#E8A400",
    colorBg: "#FEF9C3",
    colorBorder: "#FDE68A",
    description: "Sends the SDR a private Slack message with their persona, outreach angle, and a direct link to the loaded Outreach sequence — everything they need in one place.",
    steps: [
      { tool: "AMPA", action: "Generates persona analysis, SDR outreach angle, 3-touch email sequence, and discovery questions for the account", output: "SDR brief" },
      { tool: "Zapier", action: "Trigger: Activation generated → looks up account owner in Salesforce → finds assigned SDR Slack ID", output: "SDR Slack ID" },
      { tool: "Outreach / Salesloft", action: "Creates sequence with Day 1, Day 5, Day 12 steps, subject lines, and body copy — assigned to the SDR", output: "Live sequence link" },
      { tool: "Slack", action: "Sends private DM to SDR: 'New Tier [A/B] account brief for [Company] — here's your play: [Persona], [Outreach angle], [Sequence link]. Top discovery question: [Q]'", output: "SDR action brief" },
    ],
    manualStep: "SDR personalizes the first line of each email, identifies named contacts, and enrolls them in the sequence",
    timeSaved: "1 hr",
  },
  {
    id: 4,
    name: "Account Team Slack Intelligence Alert",
    icon: "💬",
    color: "#4A154B",
    colorBg: "#F4EEF4",
    colorBorder: "#DEC5DF",
    description: "Sends a formatted intelligence alert to the full account team — AE, SDR, CSM, and field marketer — the moment a brief is generated. This is for team alignment, not individual task assignment.",
    steps: [
      { tool: "AMPA", action: "Generates account tier, top 3 buying signals, GTM motion, campaign theme, and executive handoff paragraph", output: "Brief summary" },
      { tool: "Zapier", action: "Trigger: Brief generated → looks up account team members (AE, SDR, CSM, field marketer) from Salesforce account record", output: "Team member list" },
      { tool: "Slack", action: "Posts to #[account]-team channel: Tier badge, why now (top signals), recommended GTM motion, campaign theme, and executive handoff. @mentions AE and SDR with specific asks", output: "Team alert" },
      { tool: "Slack", action: "Pins message to channel. Sets 24-hr reminder for AE to confirm or update the GTM approach based on relationship context", output: "Pinned brief + reminder" },
    ],
    manualStep: "AE reacts ✅ to confirm or adds a thread with relationship context that overrides AI recommendation",
    timeSaved: "30 min",
  },
  {
    id: 5,
    name: "Salesforce Account + Campaign Record",
    icon: "☁️",
    color: "#00A1E0",
    colorBg: "#E5F5FB",
    colorBorder: "#B3E4F7",
    description: "Creates or updates the Salesforce account record with ICP scores and campaign plan, and creates a linked Campaign record to track pipeline influence.",
    steps: [
      { tool: "AMPA", action: "Generates ICP score, account tier, buying signals, GTM motion, campaign theme, channel plan, and executive handoff", output: "Account strategy JSON" },
      { tool: "Zapier", action: "Trigger: Brief generated → searches Salesforce for existing account record by company name", output: "Account record ID" },
      { tool: "Salesforce", action: "Updates Account: sets ICP Score, Tier, GTM Motion, Campaign Theme custom fields. Attaches full brief as a Note. Logs activity: 'AMPA brief generated [date]'", output: "Updated account record" },
      { tool: "Salesforce", action: "Creates Campaign record: Name = '[Account] ABM Campaign [Quarter]', Status = Planning, Type = ABM, links to Account. Sets campaign owner and target close date", output: "Campaign record" },
    ],
    manualStep: "Campaign manager reviews and adds budget, adjusts target dates, and links to open opportunities",
    timeSaved: "45 min",
  },
  {
    id: 6,
    name: "Marketo / HubSpot Nurture Enrollment",
    icon: "📬",
    color: "#5C4EE5",
    colorBg: "#EEEDFB",
    colorBorder: "#C5C0F5",
    description: "Enrolls known contacts at the account into a targeted nurture program based on the campaign theme and persona analysis.",
    steps: [
      { tool: "AMPA", action: "Generates campaign theme, content asset, CTA, persona list, and tier 1/2 channel recommendations", output: "Campaign brief" },
      { tool: "Salesforce", action: "Queries known contacts at the account by persona title match — CISO, CIO, VP Security, etc.", output: "Contact list" },
      { tool: "Zapier", action: "Trigger: Brief generated + contacts found → formats enrollment payload per persona with campaign theme variables", output: "Enrollment payload" },
      { tool: "Marketo / HubSpot", action: "Enrolls contacts in persona-matched smart campaign or workflow. Sets program: [Account] ABM — [Campaign Theme]. Tags with account tier for reporting", output: "Active nurture enrollment" },
    ],
    manualStep: "Marketing ops reviews enrollment list and removes any contacts with active opportunities or DNC flags",
    timeSaved: "1–2 hrs",
  },
  {
    id: 7,
    name: "Demandbase Intent Trigger",
    icon: "📡",
    color: "#22C55E",
    colorBg: "#DCFCE7",
    colorBorder: "#BBF7D0",
    description: "Automatically triggers AMPA when a target account crosses an intent threshold in Demandbase — so briefs generate based on live signals, not manual requests.",
    steps: [
      { tool: "Demandbase", action: "Account crosses intent threshold (score >70 or surge on target keywords) — triggers webhook event", output: "Intent alert + account data" },
      { tool: "Zapier", action: "Trigger: Demandbase webhook → reads account name, intent score, surging topics, and engagement data", output: "Enriched account payload" },
      { tool: "AMPA", action: "Intent score, surging keywords, and engagement data pre-populate the optional CRM fields — brief generates with real signals instead of estimates", output: "Intent-enriched brief" },
      { tool: "Salesforce", action: "Logs intent spike as an Activity on the account record. Updates Intent Score field. If account has no open opportunity, creates a Task for the AE: 'Intent spike detected — review AMPA brief'", output: "AE task + updated record" },
    ],
    manualStep: "AE reviews AMPA brief and decides whether to upgrade account from Tier B to Tier A and activate full campaign",
    timeSaved: "2–3 hrs",
  },
  {
    id: 8,
    name: "Campaign Kickoff Calendar Invite",
    icon: "📅",
    color: "#0F9D58",
    colorBg: "#E6F4EA",
    colorBorder: "#B7DFC4",
    description: "Automatically books a campaign kickoff meeting between marketing and the account sales team — AE, SDR, and field marketer — within 48 hours of the brief generating.",
    steps: [
      { tool: "AMPA", action: "Generates account tier, GTM motion, campaign theme, and account team context used to populate the meeting agenda", output: "Brief summary + team context" },
      { tool: "Salesforce", action: "Looks up account owner (AE), assigned SDR, and field marketer from the account record", output: "Attendee list + email addresses" },
      { tool: "Zapier", action: "Trigger: Brief generated + Salesforce attendees found → builds calendar event with pre-written agenda based on GTM motion and campaign theme", output: "Calendar payload" },
      { tool: "Google Calendar", action: "Creates 30-minute event: '[Account] Campaign Kickoff — [Campaign Theme]'. Adds AE, SDR, field marketer, and campaign manager. Sets date within 48 hrs. Attaches Google Doc creative brief link and Salesforce account record link in the description", output: "Calendar invite sent to all attendees" },
      { tool: "Slack", action: "Posts to #[account]-team: 'Kickoff meeting booked for [Account] — [Date/Time]. Agenda and brief in the invite. Come ready with relationship context and open opportunity details'", output: "Team heads-up" },
    ],
    manualStep: "AE adds any deal-sensitive context to the calendar description before the meeting — competitive info, exec relationships, or open renewal details",
    timeSaved: "30 min",
  },
];

function WorkflowStep({ step, index, isLast }) {
  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: isLast ? 0 : "8px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: C.accentBg, border: `2px solid ${C.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "900", color: C.accent }}>{index + 1}</div>
        {!isLast && <div style={{ width: "2px", flex: 1, background: C.accentBorder, margin: "4px 0" }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
          <span style={{ fontSize: "11px", fontWeight: "800", color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em" }}>{step.tool}</span>
        </div>
        <div style={{ fontSize: "13px", color: C.sub, lineHeight: "1.55", marginBottom: "4px" }}>{step.action}</div>
        <div style={{ fontSize: "11px", fontWeight: "600", color: C.greenText, background: C.greenBg, display: "inline-block", padding: "2px 8px", borderRadius: "4px" }}>Output: {step.output}</div>
      </div>
    </div>
  );
}

function ActivationWorkflow({ company }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ ...card, border: "2px solid #FF4A00", boxShadow: "0 4px 20px rgba(255,74,0,.1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#FF4A00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>⚡</div>
        <div>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "800", letterSpacing: "-0.02em", color: C.text }}>Activation Workflows</h2>
          <div style={{ fontSize: "12px", color: C.sub, marginTop: "2px" }}>How to get this plan live — step by step, tool by tool</div>
        </div>
      </div>
      <div style={{ fontSize: "13px", color: C.sub, marginBottom: "16px", padding: "10px 14px", background: "#FFF7F5", borderRadius: "8px", border: "1px solid #FFD5C8" }}>
        Click any workflow to see the exact automation steps. Each one can be built as a Zap — connecting AMPA's output directly to your marketing and sales stack.
      </div>

      {/* Demandbase + Salesforce trigger flow */}
      <div style={{marginBottom:"20px",padding:"16px 20px",background:C.accentBg,borderRadius:"12px",border:`1.5px solid ${C.accentBorder}`}}>
        <div style={{fontSize:"12px",fontWeight:"800",color:C.indigo,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"12px"}}>How campaigns trigger automatically</div>
        <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap",marginBottom:"12px"}}>
          {[
            {icon:"📡",label:"Demandbase",sub:"Intent spike >70"},
            {icon:"→",label:null},
            {icon:"☁️",label:"Salesforce",sub:"Account updated"},
            {icon:"→",label:null},
            {icon:"⚡",label:"Zapier",sub:"Trigger fired"},
            {icon:"→",label:null},
            {icon:"🤖",label:"AMPA",sub:"Brief generates"},
            {icon:"→",label:null},
            {icon:"📄",label:"Google Doc",sub:"Brief created"},
            {icon:"→",label:null},
            {icon:"💬",label:"Slack",sub:"Team alerted"},
            {icon:"→",label:null},
            {icon:"📧",label:"Outreach",sub:"Sequence loaded"},
          ].map((item,i)=>item.label===null
            ? <span key={i} style={{fontSize:"14px",color:C.quiet}}>→</span>
            : <div key={i} style={{padding:"8px 10px",background:C.surface,borderRadius:"8px",border:`1px solid ${C.accentBorder}`,textAlign:"center",minWidth:"72px"}}>
                <div style={{fontSize:"16px",marginBottom:"2px"}}>{item.icon}</div>
                <div style={{fontSize:"11px",fontWeight:"700",color:C.text}}>{item.label}</div>
                <div style={{fontSize:"10px",color:C.quiet}}>{item.sub}</div>
              </div>
          )}
        </div>
        <div style={{fontSize:"12px",color:C.sub,lineHeight:"1.6"}}>
          <strong style={{color:C.text}}>Demandbase trigger: </strong>Intent score crosses threshold → Zapier webhook fires → Salesforce account record updates → AMPA generates a live-data brief → Google Doc goes to designer → Slack alerts the team → Outreach sequence loads for the SDR. Zero manual steps.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {WORKFLOWS.map(wf => (
          <div key={wf.id}>
            <button
              onClick={() => setOpen(open === wf.id ? null : wf.id)}
              style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: `1.5px solid ${open === wf.id ? wf.colorBorder : C.border}`, background: open === wf.id ? wf.colorBg : C.surface, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "12px", textAlign: "left", transition: "all 0.15s" }}
            >
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: wf.colorBg, border: `1.5px solid ${wf.colorBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{wf.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: "800", color: C.text, marginBottom: "2px" }}>{wf.name}</div>
                <div style={{ fontSize: "12px", color: C.sub }}>{wf.description}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                <div style={{ textAlign: "center", padding: "4px 10px", background: wf.color, borderRadius: "6px" }}>
                  <div style={{ fontSize: "9px", fontWeight: "700", color: "rgba(255,255,255,.75)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Saves</div>
                  <div style={{ fontSize: "12px", fontWeight: "900", color: "#fff" }}>{wf.timeSaved}</div>
                </div>
                <span style={{ fontSize: "14px", color: C.quiet }}>{open === wf.id ? "▲" : "▼"}</span>
              </div>
            </button>
            {open === wf.id && (
              <div style={{ margin: "4px 0 0", padding: "20px", background: wf.colorBg, borderRadius: "0 0 12px 12px", border: `1.5px solid ${wf.colorBorder}`, borderTop: "none" }}>
                <div style={{ marginBottom: "16px" }}>
                  {wf.steps.map((step, i) => <WorkflowStep key={i} step={step} index={i} isLast={i === wf.steps.length - 1} />)}
                </div>
                <div style={{ padding: "10px 14px", background: C.amberBg, borderRadius: "8px", border: "1px solid #FDE68A", fontSize: "12px", color: C.amberText }}>
                  <strong>⚠️ Manual step required: </strong>{wf.manualStep}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Activation sections ──────────────────────────────────────────────────────
function EmailBlock({label,to,subject,body}){
  const full=`To: ${to||""}\nSubject: ${subject||""}\n\n${body||""}`;
  return(<div style={{padding:"18px",background:C.muted,borderRadius:"12px",marginBottom:"12px"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px",flexWrap:"wrap",gap:"8px"}}><div><div style={{fontSize:"11px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em"}}>{label}</div>{to&&<div style={{fontSize:"12px",color:C.sub,marginTop:"2px"}}>To: {to}</div>}</div><CopyBtn text={full} label="Email"/></div><div style={{background:C.surface,borderRadius:"8px",padding:"14px",border:`1px solid ${C.border}`}}><div style={{fontSize:"12px",fontWeight:"700",color:C.text,marginBottom:"8px",fontFamily:"monospace"}}>Subject: {subject}</div><div style={{fontSize:"13px",color:C.sub,lineHeight:"1.7",whiteSpace:"pre-line"}}>{body}</div></div></div>);
}

function ActivationView({act,company}){
  const{outreachSequence,slackAlert,executiveEmail,linkedInMessage,linkedinTargeting,paidMedia,fieldMarketing,productMarketing,zapierAutomations,creativeBrief,singleImageAds,messageAds,carouselHeadlines}=act;
  return(<div>
    <div style={{marginBottom:"24px",paddingTop:"16px",borderTop:`2px dashed ${C.accentBorder}`}}>
      <div style={{fontSize:"11px",fontWeight:"700",letterSpacing:"0.08em",textTransform:"uppercase",color:C.accent,marginBottom:"4px"}}>Activation Materials</div>
      <div style={{fontSize:"22px",fontWeight:"900",letterSpacing:"-0.03em"}}>Ready to deploy for {company}</div>
    </div>

    {/* Outreach Sequence */}
    <div style={card}>
      <SectionHead icon="📧" title="3-Touch Outreach Sequence"/>
      {(outreachSequence||[]).map((email,i)=>(
        <div key={i} style={{marginBottom:"14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px"}}>
            <div style={{width:"28px",height:"28px",borderRadius:"50%",background:"linear-gradient(135deg,#1C3557,#2E74B5)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"12px",fontWeight:"900",flexShrink:0}}>{email.touch}</div>
            <div style={{flex:1}}><span style={{fontSize:"13px",fontWeight:"700",color:C.text}}>{email.timing}</span><span style={{fontSize:"12px",color:C.quiet,margin:"0 8px"}}>·</span><span style={{fontSize:"12px",color:C.sub}}>{email.channel}</span><span style={{fontSize:"12px",color:C.quiet,margin:"0 8px"}}>·</span><span style={{fontSize:"12px",color:C.accent,fontWeight:"600"}}>To: {email.persona}</span></div>
            <CopyBtn text={`Subject: ${email.subject}\n\n${email.body}`} label={`Touch ${email.touch}`}/>
          </div>
          <div style={{background:C.muted,borderRadius:"10px",padding:"14px",marginLeft:"38px"}}><div style={{fontSize:"12px",fontWeight:"700",color:C.text,marginBottom:"8px",fontFamily:"monospace"}}>Subject: {email.subject}</div><div style={{fontSize:"13px",color:C.sub,lineHeight:"1.7",whiteSpace:"pre-line"}}>{email.body}</div></div>
        </div>
      ))}
    </div>

    {/* Slack */}
    <div style={card}>
      <SectionHead icon="💬" title="Slack Account Alert"/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px",flexWrap:"wrap",gap:"8px"}}>
        <div style={{fontSize:"13px",color:C.sub}}>Channel: <span style={{fontWeight:"700",color:C.accent}}>{slackAlert?.channel}</span></div>
        <CopyBtn text={slackAlert?.message||""} label="Slack Message"/>
      </div>
      <div style={{background:"#1A1D27",borderRadius:"12px",padding:"20px",border:"1px solid #2D3148"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:"12px"}}>
          <div style={{width:"36px",height:"36px",borderRadius:"8px",background:"linear-gradient(135deg,#1C3557,#2E74B5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",flexShrink:0}}>⚡</div>
          <div style={{flex:1}}><div style={{fontSize:"14px",fontWeight:"800",color:"#E0E7FF",marginBottom:"8px"}}>AMPA Bot</div><div style={{fontSize:"13px",color:"#94A3B8",lineHeight:"1.7",whiteSpace:"pre-line"}}>{slackAlert?.message}</div></div>
        </div>
      </div>
    </div>

    {/* Emails */}
    <div style={card}>
      <SectionHead icon="✉️" title="Email Templates"/>
      <EmailBlock label="Executive Prospect Email" to={executiveEmail?.to} subject={executiveEmail?.subject} body={executiveEmail?.body}/>
      <div style={{padding:"18px",background:C.muted,borderRadius:"12px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em"}}>LinkedIn Connection Message</div><CopyBtn text={linkedInMessage||""} label="Message"/></div>
        <div style={{fontSize:"13px",color:C.sub,lineHeight:"1.65",fontStyle:"italic"}}>"{linkedInMessage}"</div>
        <div style={{fontSize:"11px",color:C.quiet,marginTop:"8px"}}>{(linkedInMessage||"").length}/280 characters</div>
      </div>
    </div>

    {/* LinkedIn Targeting */}
    <div style={card}>
      <SectionHead icon="🎯" title="LinkedIn Ad Targeting Spec"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"16px"}}>
        <div style={{padding:"16px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"10px"}}>Job Titles</div><div style={{display:"flex",flexWrap:"wrap"}}>{(linkedinTargeting?.jobTitles||[]).map((t,i)=><Pill key={i} label={t}/>)}</div></div>
        <div style={{padding:"16px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"10px"}}>Seniority & Company Size</div><div style={{display:"flex",flexWrap:"wrap"}}>{(linkedinTargeting?.seniorityLevels||[]).map((t,i)=><Pill key={i} label={t}/>)}{(linkedinTargeting?.companySizeRanges||[]).map((t,i)=><Pill key={`s${i}`} label={t}/>)}</div></div>
        <div style={{padding:"16px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"10px"}}>Skills & Topics</div><div style={{display:"flex",flexWrap:"wrap"}}>{(linkedinTargeting?.skills||[]).map((t,i)=><Pill key={i} label={t}/>)}</div></div>
        <div style={{padding:"16px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"10px"}}>LinkedIn Groups</div><div style={{display:"flex",flexWrap:"wrap"}}>{(linkedinTargeting?.groups||[]).map((t,i)=><Pill key={i} label={t}/>)}</div></div>
      </div>
      {linkedinTargeting?.adAngle&&<div style={{padding:"14px 16px",background:C.accentBg,borderRadius:"10px",border:`1px solid ${C.accentBorder}`}}><div style={{fontSize:"11px",fontWeight:"700",color:C.accent,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"6px"}}>Ad Angle</div><div style={{fontSize:"13px",color:C.indigo,fontWeight:"500"}}>{linkedinTargeting.adAngle}</div>{linkedinTargeting.audienceNotes&&<div style={{fontSize:"12px",color:C.sub,marginTop:"8px"}}>{linkedinTargeting.audienceNotes}</div>}</div>}
    </div>

    {/* LinkedIn Ad Copy & Creative Brief */}
    {(creativeBrief||singleImageAds) && (
      <div style={card}>
        <SectionHead icon="✏️" title="LinkedIn Ad Copy & Creative Brief"/>
        <div style={{background:"#FEF9C3",border:"1.5px solid #FDE68A",borderRadius:"10px",padding:"14px 16px",marginBottom:"20px",display:"flex",gap:"10px"}}>
          <span style={{fontSize:"16px",flexShrink:0}}>⚠️</span>
          <div style={{fontSize:"13px",color:C.amberText,lineHeight:"1.6"}}><strong>This tool generates strategy and copy direction only.</strong> Graphics and creative assets must be produced separately. Upload and traffic campaigns in LinkedIn Campaign Manager.</div>
        </div>

        {creativeBrief&&(
          <div style={{padding:"18px",background:"linear-gradient(135deg,#EBF4FB,#F2F8FD)",borderRadius:"12px",border:`1px solid ${C.accentBorder}`,marginBottom:"20px"}}>
            <div style={{fontSize:"12px",fontWeight:"800",color:C.indigo,marginBottom:"14px",textTransform:"uppercase",letterSpacing:"0.07em"}}>Creative Brief</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              {[["Campaign Objective",creativeBrief.objective],["Primary Message",creativeBrief.primaryMessage],["Secondary Message",creativeBrief.secondaryMessage],["Proof Point",creativeBrief.proofPoint],["Visual Tone",creativeBrief.visualTone],["Imagery Style",creativeBrief.imageryStyle]].map(([l,v])=>(
                <div key={l} style={{padding:"10px 12px",background:C.surface,borderRadius:"8px"}}><div style={{fontSize:"10px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"4px"}}>{l}</div><div style={{fontSize:"13px",color:C.sub}}>{v}</div></div>
              ))}
            </div>
            {creativeBrief.designerNote&&<div style={{marginTop:"10px",padding:"10px 14px",background:C.amberBg,borderRadius:"8px",border:"1px solid #FDE68A",fontSize:"12px",color:C.amberText}}><strong>Designer Note: </strong>{creativeBrief.designerNote}</div>}
          </div>
        )}

        {(singleImageAds||[]).length>0&&(
          <div style={{marginBottom:"20px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px"}}><div style={{fontSize:"13px",fontWeight:"800",color:C.text}}>Sponsored Content — Single Image</div><span style={{fontSize:"11px",color:C.quiet}}>Headline 70 chars · Intro 150 chars</span></div>
            {singleImageAds.map((ad,i)=>(
              <div key={i} style={{padding:"16px",background:C.muted,borderRadius:"12px",marginBottom:"12px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px"}}>
                  <span style={{fontSize:"11px",fontWeight:"800",padding:"3px 10px",borderRadius:"20px",background:C.accentBg,color:C.accent,border:`1px solid ${C.accentBorder}`}}>{ad.angle}</span>
                  {ad.visualDirection&&<span style={{fontSize:"12px",color:C.quiet,fontStyle:"italic"}}>Visual: {ad.visualDirection}</span>}
                </div>
                <AdField value={ad.headline} maxChars={70} label="Headline" rows={1}/>
                <AdField value={ad.introText} maxChars={150} label="Intro Text" rows={3}/>
              </div>
            ))}
          </div>
        )}

        {(messageAds||[]).length>0&&(
          <div style={{marginBottom:"20px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px"}}><div style={{fontSize:"13px",fontWeight:"800",color:C.text}}>Message Ads (InMail)</div><span style={{fontSize:"11px",color:C.quiet}}>Subject 60 · Body 1,500 · CTA 20 chars</span></div>
            {messageAds.map((ad,i)=>(
              <div key={i} style={{padding:"16px",background:C.muted,borderRadius:"12px",marginBottom:"12px"}}>
                <div style={{marginBottom:"12px"}}><span style={{fontSize:"11px",fontWeight:"800",padding:"3px 10px",borderRadius:"20px",background:C.accentBg,color:C.accent,border:`1px solid ${C.accentBorder}`}}>{ad.angle}</span></div>
                <AdField value={ad.subject} maxChars={60} label="Subject Line" rows={1}/>
                <AdField value={ad.body} maxChars={1500} label="Body" rows={4}/>
                <AdField value={ad.cta} maxChars={20} label="CTA Button" rows={1}/>
              </div>
            ))}
          </div>
        )}

        {(carouselHeadlines||[]).length>0&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px"}}><div style={{fontSize:"13px",fontWeight:"800",color:C.text}}>Carousel — Card Headlines</div><span style={{fontSize:"11px",color:C.quiet}}>45 chars per card</span></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
              {carouselHeadlines.map((c,i)=>(
                <div key={i} style={{padding:"14px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"10px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"8px"}}>Card {c.card} — {c.theme}</div><AdField value={c.headline} maxChars={45} label="Headline" rows={1}/></div>
              ))}
            </div>
          </div>
        )}

        <div style={{marginTop:"16px",padding:"12px 16px",background:C.muted,borderRadius:"10px",fontSize:"12px",color:C.sub,display:"flex",alignItems:"center",gap:"8px"}}><span>💡</span><span>All fields are editable — adjust to match your brand voice. Character counters update live.</span></div>
      </div>
    )}

    {/* Paid Media */}
    <div style={card}>
      <SectionHead icon="📢" title="Paid Media & Intent Targeting"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"16px"}}>
        <div style={{padding:"16px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"10px"}}>Intent Keywords</div><div style={{display:"flex",flexWrap:"wrap"}}>{(paidMedia?.intentKeywords||[]).map((k,i)=><Pill key={i} label={k} color={C.greenText}/>)}</div></div>
        <div style={{padding:"16px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"10px"}}>Search Keywords</div><div style={{display:"flex",flexWrap:"wrap"}}>{(paidMedia?.searchKeywords||[]).map((k,i)=><Pill key={i} label={k} color={C.amberText}/>)}</div></div>
        <div style={{padding:"16px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"10px"}}>Bombora Topics</div><div style={{display:"flex",flexWrap:"wrap"}}>{(paidMedia?.bomboraTopics||[]).map((k,i)=><Pill key={i} label={k}/>)}</div></div>
        <div style={{padding:"16px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"10px"}}>G2 Categories</div><div style={{display:"flex",flexWrap:"wrap"}}>{(paidMedia?.g2Categories||[]).map((k,i)=><Pill key={i} label={k}/>)}</div></div>
      </div>
      <div style={{padding:"16px",background:C.accentBg,borderRadius:"10px",border:`1px solid ${C.accentBorder}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.accent,textTransform:"uppercase",letterSpacing:"0.07em"}}>Ad Copy</div><CopyBtn text={`${paidMedia?.adHeadline}\n${paidMedia?.adBodyCopy}\nCTA: ${paidMedia?.cta}`} label="Ad Copy"/></div>
        <div style={{fontSize:"14px",fontWeight:"800",color:C.indigo,marginBottom:"6px"}}>{paidMedia?.adHeadline}</div>
        <div style={{fontSize:"13px",color:C.sub,marginBottom:"10px"}}>{paidMedia?.adBodyCopy}</div>
        <span style={{display:"inline-block",padding:"6px 14px",borderRadius:"6px",background:C.accent,color:"#fff",fontSize:"12px",fontWeight:"700"}}>{paidMedia?.cta}</span>
      </div>
    </div>

    {/* Field Marketing */}
    <div style={card}>
      <SectionHead icon="🎪" title="Field Marketing"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"14px"}}>
        <div style={{padding:"16px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"10px"}}>Recommended Event Types</div>{(fieldMarketing?.recommendedEventTypes||[]).map((e,i)=><div key={i} style={{display:"flex",gap:"8px",fontSize:"13px",color:C.sub,padding:"3px 0"}}><span style={{color:C.accent,fontWeight:"700",flexShrink:0}}>→</span>{e}</div>)}</div>
        <div style={{padding:"16px",background:C.muted,borderRadius:"10px"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"8px"}}>Executive Engagement Idea</div><div style={{fontSize:"13px",color:C.sub,lineHeight:"1.6"}}>{fieldMarketing?.executiveEngagementIdea}</div><div style={{fontSize:"11px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginTop:"14px",marginBottom:"6px"}}>Post-Event Follow-Up</div><div style={{fontSize:"13px",color:C.sub}}>{fieldMarketing?.postEventFollowUp}</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
        <div style={{padding:"14px",background:C.muted,borderRadius:"10px"}}>
          <div style={{fontSize:"10px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"8px"}}>Event Invite Subject Line</div>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"8px"}}>
            <div style={{fontSize:"13px",fontWeight:"600",color:C.text,lineHeight:"1.5"}}>{fieldMarketing?.inviteSubjectLine}</div>
            <CopyBtn text={fieldMarketing?.inviteSubjectLine||""} label=""/>
          </div>
        </div>
        <div style={{padding:"14px",background:C.muted,borderRadius:"10px"}}>
          <div style={{fontSize:"10px",fontWeight:"700",color:C.quiet,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"8px"}}>Post-Event Follow-Up Angle</div>
          <div style={{fontSize:"13px",color:C.sub,lineHeight:"1.5"}}>{fieldMarketing?.postEventFollowUp||"—"}</div>
        </div>
      </div>
    </div>

    {/* Activation Workflow */}
    <ActivationWorkflow company={company} act={act}/>
  </div>);
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App(){
  const[company,setCompany]=useState("");
  const[solution,setSolution]=useState("");
  const[showOpt,setShowOpt]=useState(false);
  const[showAbout,setShowAbout]=useState(false);
  const[loadingBrief,setLoadingBrief]=useState(false);
  const[loadingAct,setLoadingAct]=useState(false);
  const[loadingStep,setLoadingStep]=useState("");
  const[result,setResult]=useState(null);
  const[activation,setActivation]=useState(null);
  const[error,setError]=useState(null);
  const[actError,setActError]=useState(null);
  const[opt,setOpt]=useState({existingCustomer:"",productsOwned:"",openPipeline:"",pipelineAmount:"",opportunityStage:"",renewalDate:"",lastCampaignEngagement:"",intentScore:"",accountOwner:"",salesNotes:""});

  useEffect(()=>{
    const link=document.createElement("link");
    link.href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap";
    link.rel="stylesheet";
    document.head.appendChild(link);
  },[]);

  const callAPI=async(systemPrompt,userMessage)=>{
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:systemPrompt,messages:[{role:"user",content:userMessage}]})});
    const data=await res.json();
    if(data.error)throw new Error(`API: ${data.error.message}`);
    const raw=(data.content||[]).map(c=>c.text||"").join("");
    if(!raw.trim())throw new Error(`Empty response (${data.stop_reason})`);
    const s=raw.indexOf("{"),e=raw.lastIndexOf("}");
    if(s===-1||e===-1)throw new Error(`No JSON found. Got: ${raw.substring(0,100)}`);
    return JSON.parse(raw.substring(s,e+1));
  };

  const generateBrief=async()=>{
    if(!company.trim()||loadingBrief)return;
    setLoadingBrief(true);setError(null);setResult(null);setActivation(null);
    const ctx=`Account: ${company.trim()}. ${solution?`Solution: ${solution}.`:""} Use estimates — label them.`;
    try{
      setLoadingStep("Step 1 of 3 — Scoring account & building summary…");
      const p1=await callAPI(BP1,ctx);
      setLoadingStep("Step 2 of 3 — Analyzing signals & personas…");
      const p2=await callAPI(BP2,ctx);
      setLoadingStep("Step 3 of 3 — Building campaign recommendations…");
      const p3=await callAPI(BP3,ctx);
      setResult({...p1,...p2,...p3});
    }catch(e){setError(`${e.message}`);console.error("AMPA brief:",e);}
    finally{setLoadingBrief(false);setLoadingStep("");}
  };

  // Parse plain text outreach — robust, case-insensitive
  const parseOutreach = (raw) => {
    const lines = {};
    raw.split("\n").forEach(line => {
      const trimmed = line.trim();
      const idx = trimmed.indexOf(":");
      if(idx > 0){
        const k = trimmed.substring(0, idx).trim().toUpperCase().replace(/\s+/g,"");
        const v = trimmed.substring(idx + 1).trim();
        if(k && v) lines[k] = v;
      }
    });
    const get = (...keys) => { for(const k of keys){ if(lines[k]) return lines[k]; } return ""; };
    return {
      outreachSequence:[
        {touch:1,timing:"Day 1",channel:"Email",persona:get("PERSONA","TARGET","ROLE"),subject:get("S1","SUBJECT1","SUB1","EMAILSUBJECT1"),body:get("B1","BODY1","EMAIL1","TOUCH1")},
        {touch:2,timing:"Day 5",channel:"Email",persona:get("PERSONA","TARGET","ROLE"),subject:get("S2","SUBJECT2","SUB2","EMAILSUBJECT2"),body:get("B2","BODY2","EMAIL2","TOUCH2")},
        {touch:3,timing:"Day 12",channel:"Email + Phone",persona:get("PERSONA","TARGET","ROLE"),subject:get("S3","SUBJECT3","SUB3","EMAILSUBJECT3"),body:get("B3","BODY3","EMAIL3","TOUCH3")},
      ],
      slackAlert:{channel:"#sales-intel",message:get("SLACK","SLACKALERT","SLACKMESSAGE","ALERT")}
    };
  };

  // Parse plain text executive email + LinkedIn
  const parseExecEmail = (raw) => {
    const lines = {};
    raw.split("\n").forEach(line => {
      const trimmed = line.trim();
      const idx = trimmed.indexOf(":");
      if(idx > 0){
        const k = trimmed.substring(0, idx).trim().toUpperCase().replace(/\s+/g,"");
        const v = trimmed.substring(idx + 1).trim();
        if(k && v) lines[k] = v;
      }
    });
    const get = (...keys) => { for(const k of keys){ if(lines[k]) return lines[k]; } return ""; };
    return {
      executiveEmail:{
        to: get("EMAILTO","TO","RECIPIENT","PERSONA"),
        subject: get("EMAILSUB","SUBJECT","EMAILSUBJECT","SUB"),
        body: get("EMAILBODY","BODY","EMAILCOPY","COPY"),
      },
      linkedInMessage: get("LINKEDIN","LINKEDINMESSAGE","LINKEDINMSG","LNMESSAGE","MSG"),
    };
  };

  // Parse plain text LinkedIn targeting
  const parseLinkedInTargeting = (raw) => {
    const lines = {};
    raw.split("\n").forEach(line => {
      const trimmed = line.trim();
      const idx = trimmed.indexOf(":");
      if(idx > 0){
        const k = trimmed.substring(0, idx).trim().toUpperCase().replace(/\s+/g,"");
        const v = trimmed.substring(idx + 1).trim();
        if(k && v) lines[k] = v;
      }
    });
    const get = (...keys) => { for(const k of keys){ if(lines[k]) return lines[k]; } return ""; };
    const titles = [get("TITLE1","T1"),get("TITLE2","T2"),get("TITLE3","T3"),get("TITLE4","T4"),get("TITLE5","T5")].filter(Boolean);
    const skills = [get("SKILL1","SK1","S1"),get("SKILL2","SK2","S2"),get("SKILL3","SK3","S3")].filter(Boolean);
    const seniority = get("SENIORITY","SENIORITYLEVELS","LEVELS").split(",").map(s=>s.trim()).filter(Boolean);
    const sizes = get("SIZE","SIZES","COMPANYSIZE","COMPANYSIZERANGES").split(",").map(s=>s.trim()).filter(Boolean);
    return { linkedinTargeting:{
      jobTitles: titles.length ? titles : ["CISO","CIO","VP Security","Director Security","IT Operations Leader"],
      seniorityLevels: seniority.length ? seniority : ["Director","VP","C-Suite"],
      companySizeRanges: sizes.length ? sizes : ["1001-5000","5001-10000"],
      skills: skills.length ? skills : [],
      adAngle: get("ADANGLE","ANGLE","ADSTRATEGY","STRATEGY"),
      audienceNotes: get("AUDIENCENOTES","NOTES","AUDIENCE"),
    }};
  };

  // Parse plain text LinkedIn ad copy
  const parseAdCopy = (raw) => {
    const lines = {};
    raw.split("\n").forEach(line => {
      const trimmed = line.trim();
      const idx = trimmed.indexOf(":");
      if(idx > 0){
        const k = trimmed.substring(0, idx).trim().toUpperCase().replace(/\s+/g,"");
        const v = trimmed.substring(idx + 1).trim();
        if(k && v) lines[k] = v;
      }
    });
    const get = (...keys) => { for(const k of keys){ if(lines[k]) return lines[k]; } return ""; };
    return {
      singleImageAds:[
        {angle:"Awareness",headline:get("H1","HEADLINE1","AH1"),introText:get("I1","INTRO1","AI1"),visualDirection:get("V1","VISUAL1","VD1")},
        {angle:"Pain Point",headline:get("H2","HEADLINE2","AH2"),introText:get("I2","INTRO2","AI2"),visualDirection:get("V2","VISUAL2","VD2")},
      ].filter(ad => ad.headline),
      messageAds:[{
        angle:"Executive",
        subject:get("MSUB","MAILSUBJECT","INMSUB","SUBJECT","MSUBJECT"),
        body:get("MBODY","MAILBODY","INMBODY","BODY","MBODYCOPY"),
        cta:get("MCTA","MAILCTA","INMCTA","CTA"),
      }],
      carouselHeadlines:[
        {card:1,theme:"Challenge",headline:get("C1","CARD1","CH1","CAROUSEL1")},
        {card:2,theme:"Insight",headline:get("C2","CARD2","CH2","CAROUSEL2")},
        {card:3,theme:"Solution",headline:get("C3","CARD3","CH3","CAROUSEL3")},
      ].filter(c => c.headline),
    };
  };

  // Parse plain text field marketing — robust, case-insensitive
  const parseFieldMarketing = (raw) => {
    const lines = {};
    raw.split("\n").forEach(line => {
      const trimmed = line.trim();
      const idx = trimmed.indexOf(":");
      if(idx > 0){
        const k = trimmed.substring(0, idx).trim().toUpperCase().replace(/\s+/g,"");
        const v = trimmed.substring(idx + 1).trim();
        if(k && v) lines[k] = v;
      }
    });
    const get = (...keys) => { for(const k of keys){ if(lines[k]) return lines[k]; } return ""; };
    const events = [
      get("EVENT1","EV1","EVENTTYPE1","TYPE1"),
      get("EVENT2","EV2","EVENTTYPE2","TYPE2"),
      get("EVENT3","EV3","EVENTTYPE3","TYPE3"),
    ].filter(Boolean);
    return { fieldMarketing:{
      recommendedEventTypes: events.length ? events : ["Executive Roundtable","Industry Summit","Private CISO Dinner"],
      inviteSubjectLine: get("INVITE","INVITESUBJECT","INVITESUBJECTLINE","SUBJECT","INVITELINE"),
      executiveEngagementIdea: get("EXEC","EXECUTIVE","EXECIDEA","EXECUTIVEIDEA","ENGAGEMENT"),
      postEventFollowUp: get("FOLLOWUP","FOLLOWUPANGLE","POSTEVENT","POSTFOLLOW"),
    }};
  };

  // Parse plain text creative brief — case-insensitive, colon-safe
  const parseCreativeBrief = (raw) => {
    const lines = {};
    raw.split("\n").forEach(line => {
      const trimmed = line.trim();
      const idx = trimmed.indexOf(":");
      if(idx > 0){
        const k = trimmed.substring(0, idx).trim().toUpperCase().replace(/[^A-Z]/g,"");
        const v = trimmed.substring(idx + 1).trim();
        if(k && v) lines[k] = v;
      }
    });
    // Try multiple possible key names Claude might use
    const get = (...keys) => { for(const k of keys){ if(lines[k]) return lines[k]; } return ""; };
    return { creativeBrief:{
      objective: get("OBJECTIVE","OBJ","CAMPAIGNOBJECTIVE","GOAL"),
      primaryMessage: get("PRIMARY","PRIMARYMESSAGE","MAIN","COREMESSAGE","MESSAGE"),
      secondaryMessage: get("SECONDARY","SECONDARYMESSAGE","SUPPORTING","SUPPORT","CONTEXT"),
      proofPoint: get("PROOF","PROOFPOINT","METRIC","VALIDATION","STAT"),
      visualTone: get("TONE","VISUALTONE","STYLE","MOOD","ADJECTIVES"),
      imageryStyle: get("IMAGERY","IMAGERYSTYLE","VISUAL","VISUALS","IMAGERY"),
      designerNote: get("DESIGNER","DESIGNERNOTE","NOTE","DESIGNNOTE","INSTRUCTION"),
    }};
  };

  const callText = async (prompt, userMsg) => {
    const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:prompt,messages:[{role:"user",content:userMsg}]})});
    const data = await res.json();
    if(data.error) throw new Error(`API: ${data.error.message}`);
    return (data.content||[]).map(c=>c.text||"").join("");
  };

  const generateActivation=async()=>{
    if(!result||loadingAct)return;
    setLoadingAct(true);setActError(null);
    try{
      const t1=await callText(AP1(company,solution,result),`Write outreach copy for ${company}`);
      const a1=parseOutreach(t1);
      const t2a=await callText(AP2a(company,solution,result),`Executive email for ${company}`);
      const a2a=parseExecEmail(t2a);
      const t2b=await callText(AP2b(company,solution,result),`LinkedIn targeting for ${company}`);
      const a2b=parseLinkedInTargeting(t2b);
      const a3=await callAPI(AP3(company,solution,result),`Paid media for ${company}`);
      const t3b=await callText(AP3b(company,solution,result),`Field marketing for ${company}`);
      const a3b=parseFieldMarketing(t3b);
      const t4a=await callText(AP4a(company,solution,result),`Write creative brief for ${company}`);
      const a4a=parseCreativeBrief(t4a);
      const t4b=await callText(AP4b(company,solution,result),`LinkedIn ad copy for ${company}`);
      const a4b=parseAdCopy(t4b);
      setActivation({...a1,...a2a,...a2b,...a3,...a3b,...a4a,...a4b});
    }catch(e){setActError(`${e.message}`);console.error("AMPA activation:",e);}
    finally{setLoadingAct(false);}
  };

  const optFields=[["existingCustomer","Existing Customer (Yes/No)"],["productsOwned","Products Owned"],["openPipeline","Open Pipeline (Yes/No)"],["pipelineAmount","Pipeline Amount ($)"],["opportunityStage","Opportunity Stage"],["renewalDate","Renewal Date"],["lastCampaignEngagement","Last Campaign Engagement"],["intentScore","Intent Score (1–100)"],["accountOwner","Account Owner"]];

  return(
    <div style={{fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",minHeight:"100vh",background:C.bg,color:C.text}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"14px 32px",position:"sticky",top:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"38px",height:"38px",borderRadius:"10px",flexShrink:0,background:"linear-gradient(135deg,#1C3557,#2E74B5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px"}}>⚡</div>
          <div><div style={{fontWeight:"900",fontSize:"15px",letterSpacing:"-0.025em"}}>Account Marketing Planning Agent</div><div style={{fontSize:"12px",color:C.quiet,fontWeight:"500"}}>AI-powered B2B revenue intelligence</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:"12px",fontWeight:"700",color:C.text,letterSpacing:"-0.01em"}}>Megan Cleary</div>
            <a href="https://linkedin.com/in/megcleary" target="_blank" rel="noreferrer" style={{fontSize:"11px",color:C.accent,fontWeight:"600",textDecoration:"none"}}>linkedin.com/in/megcleary</a>
          </div>
          <div style={{fontSize:"10px",fontWeight:"800",letterSpacing:"0.08em",textTransform:"uppercase",color:C.accent,background:C.accentBg,padding:"5px 10px",borderRadius:"6px",whiteSpace:"nowrap"}}>AMPA v2.0</div>
        </div>
      </div>

      <div style={{maxWidth:"880px",margin:"0 auto",padding:"40px 24px 100px"}}>
        <div style={{...card,marginBottom:"16px"}}>
          <div style={{marginBottom:"20px"}}><div style={{fontSize:"11px",fontWeight:"700",letterSpacing:"0.08em",textTransform:"uppercase",color:C.quiet,marginBottom:"4px"}}>Target Account</div><div style={{fontSize:"22px",fontWeight:"900",letterSpacing:"-0.03em"}}>Who are we analyzing?</div></div>
          <div style={{display:"flex",gap:"10px",marginBottom:"12px"}}>
            <input type="text" placeholder="Company name (e.g. JPMorgan Chase, CrowdStrike, Okta…)" value={company} onChange={e=>setCompany(e.target.value)} onKeyDown={e=>e.key==="Enter"&&generateBrief()} style={{...fieldBase,flex:1}}/>
            <button onClick={generateBrief} disabled={!company.trim()||loadingBrief} style={{padding:"10px 24px",borderRadius:"10px",border:"none",cursor:company.trim()&&!loadingBrief?"pointer":"not-allowed",background:company.trim()&&!loadingBrief?"linear-gradient(135deg,#1C3557,#2E74B5)":C.muted,color:company.trim()&&!loadingBrief?"#fff":C.quiet,fontFamily:"inherit",fontWeight:"800",fontSize:"14px",whiteSpace:"nowrap"}}>{loadingBrief?"Analyzing…":"Generate Brief →"}</button>
          </div>
          <input type="text" placeholder="Your solution (e.g. identity security, workflow automation, email security) — improves output quality" value={solution} onChange={e=>setSolution(e.target.value)} style={{...fieldBase,marginBottom:"14px",fontSize:"13px"}}/>
          <button onClick={()=>setShowOpt(v=>!v)} style={{background:"none",border:"none",cursor:"pointer",color:C.accent,fontSize:"13px",fontWeight:"700",fontFamily:"inherit",padding:0,display:"flex",alignItems:"center",gap:"6px"}}>{showOpt?"▲ Hide":"▼ Add"} CRM / Intent Data <span style={{color:C.quiet,fontWeight:"500"}}>(optional)</span></button>
          {showOpt&&(<div style={{marginTop:"16px",paddingTop:"16px",borderTop:`1px solid ${C.border}`}}><p style={{margin:"0 0 12px",fontSize:"12px",color:C.quiet}}>Connect Salesforce, Demandbase, or any intent platform. Blanks will be estimated.</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>{optFields.map(([key,ph])=><input key={key} placeholder={ph} value={opt[key]} onChange={e=>setOpt(p=>({...p,[key]:e.target.value}))} style={{...fieldBase,fontSize:"13px"}}/>)}<textarea placeholder="Sales notes / account context…" value={opt.salesNotes} onChange={e=>setOpt(p=>({...p,salesNotes:e.target.value}))} style={{...fieldBase,fontSize:"13px",gridColumn:"1 / -1",resize:"vertical",minHeight:"64px"}}/></div></div>)}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:"12px",background:"linear-gradient(135deg,#EBF4FB,#F2F8FD)",border:`1.5px solid ${C.accentBorder}`,borderRadius:"12px",padding:"14px 20px",marginBottom:"36px"}}>
          <span style={{fontSize:"20px"}}>🔗</span>
          <div><div style={{fontSize:"13px",fontWeight:"700",color:C.indigo}}>Connect your stack</div><div style={{fontSize:"12px",color:C.accent}}>Automate with Demandbase · Salesforce · Outreach · LinkedIn · Slack · Gmail — via Zapier or direct API</div></div>
        </div>

        {loadingBrief&&(<div style={{...card,textAlign:"center",padding:"64px 24px"}}><div style={{fontSize:"36px",marginBottom:"16px"}}>⚡</div><div style={{fontWeight:"900",fontSize:"20px",letterSpacing:"-0.025em",marginBottom:"10px"}}>Analyzing {company}…</div><div style={{color:C.accent,fontSize:"14px",fontWeight:"600",marginBottom:"6px"}}>{loadingStep}</div><div style={{color:C.quiet,fontSize:"13px"}}>Running 3 AI calls to stay within token limits</div></div>)}
        {error&&<div style={{background:C.redBg,border:`1px solid #FECACA`,borderRadius:"12px",padding:"16px 20px",color:C.redText,fontSize:"14px",fontWeight:"500",marginBottom:"20px"}}>{error}</div>}
        {result&&<BriefView result={result} company={company}/>}

        {result&&!activation&&(<div style={{...card,background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",border:"2px solid #BBF7D0",textAlign:"center",padding:"36px 24px"}}><div style={{fontSize:"28px",marginBottom:"12px"}}>🚀</div><div style={{fontWeight:"900",fontSize:"18px",letterSpacing:"-0.02em",marginBottom:"8px",color:C.text}}>Ready to activate {company}?</div><div style={{fontSize:"14px",color:C.sub,marginBottom:"20px",maxWidth:"480px",margin:"0 auto 20px"}}>Generate outreach emails, Slack alerts, LinkedIn ad copy with character counters, paid media keywords, field marketing, and Zapier automations.</div><button onClick={generateActivation} disabled={loadingAct} style={{padding:"12px 32px",borderRadius:"12px",border:"none",cursor:"pointer",background:loadingAct?C.muted:"linear-gradient(135deg,#22C55E,#16A34A)",color:"#fff",fontFamily:"inherit",fontWeight:"800",fontSize:"15px"}}>{loadingAct?"Generating…":"Generate Activation Materials →"}</button></div>)}

        {loadingAct&&(<div style={{...card,textAlign:"center",padding:"48px 24px"}}><div style={{fontSize:"28px",marginBottom:"12px"}}>⚡</div><div style={{fontWeight:"800",fontSize:"17px",marginBottom:"8px"}}>Building activation materials…</div><div style={{color:C.quiet,fontSize:"13px"}}>Running 7 AI calls: Outreach · Emails · LinkedIn · Paid media · Field marketing · Creative brief · Ad copy</div></div>)}
        {actError&&<div style={{background:C.redBg,border:`1px solid #FECACA`,borderRadius:"12px",padding:"16px 20px",color:C.redText,fontSize:"14px",fontWeight:"500",marginBottom:"20px"}}>{actError}</div>}
        {activation&&<ActivationView act={activation} company={company}/>}

        <div style={{marginTop:"32px"}}>
          <button onClick={()=>setShowAbout(v=>!v)} style={{background:"none",border:`1.5px solid ${C.border}`,cursor:"pointer",color:C.sub,fontSize:"13px",fontWeight:"700",fontFamily:"inherit",padding:"10px 18px",borderRadius:"10px",display:"flex",alignItems:"center",gap:"8px"}}><span>ℹ️</span>{showAbout?"Hide":"How I built this"}</button>
          {showAbout&&(<div style={{marginTop:"14px",padding:"28px",borderRadius:"16px",border:`1.5px solid ${C.accentBorder}`,background:C.accentBg}}>
            <div style={{fontSize:"16px",fontWeight:"900",color:C.text,letterSpacing:"-0.02em",marginBottom:"6px"}}>Account Marketing Planning Agent (AMPA)</div>
            <div style={{fontSize:"13px",color:C.accent,fontWeight:"700",marginBottom:"20px"}}>Built by Megan Cleary · Senior Demand Generation & Campaign Marketing Leader</div>
            <p style={{margin:"0 0 16px",fontSize:"14px",color:C.sub,lineHeight:"1.75"}}>AMPA is an independent project I built to show how AI can operationalize enterprise demand generation and ABM at scale. The strategic framework draws on methodology I developed throughout my career — including work that contributed to <strong style={{color:C.text}}>$23.5M in bookings</strong> and <strong style={{color:C.text}}>$120M+ in influenced pipeline</strong> — but this tool itself was built entirely on my own, outside of any employer.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"16px"}}>
              {[["🧠 AI Model","Anthropic Claude (claude-sonnet-4) via 7 sequential API calls — 3 for the account brief, 4 for activation materials — each engineered to stay within token limits while covering the full ABM planning workflow"],["⚙️ Frontend","React application built independently — editable ad copy fields with live LinkedIn character counters, copy-to-clipboard on all outreach assets, and a SaaS UI designed for demand gen and sales teams"],["🔗 What It Generates","Account scoring, buying signal analysis, persona mapping, campaign strategy, outreach copy, Slack alerts, LinkedIn ad copy to spec, intent keywords, field marketing angles, and Zapier automation suggestions"],["⚠️ What Comes Next","Phase 2 is a results integration agent: pulling pipeline, campaign performance, and opportunity data back in to generate optimization recommendations — closing the loop between planning and execution"]].map(([label,desc])=>(
                <div key={label} style={{padding:"16px",background:C.surface,borderRadius:"12px",border:`1px solid ${C.accentBorder}`}}><div style={{fontSize:"12px",fontWeight:"800",color:C.indigo,marginBottom:"8px"}}>{label}</div><div style={{fontSize:"13px",color:C.sub,lineHeight:"1.6"}}>{desc}</div></div>
              ))}
            </div>
            <div style={{padding:"16px 20px",background:C.surface,borderRadius:"12px",border:`1px solid ${C.accentBorder}`,marginBottom:"16px"}}><div style={{fontSize:"12px",fontWeight:"800",color:C.indigo,marginBottom:"8px"}}>🚀 The Bigger Vision</div><p style={{margin:0,fontSize:"13px",color:C.sub,lineHeight:"1.7"}}>AMPA is Phase 1 of a two-phase revenue marketing system. Phase 1 (this tool) covers planning and activation — account intelligence, campaign strategy, and outreach. Phase 2 would be a results integration agent: pulling campaign performance, pipeline influenced, and opportunity data back in, then generating optimization recommendations automatically. Together they create a closed-loop demand gen engine where AI handles both the planning and the learning. The Zapier automation layer is the connective tissue that makes the full system real.</p></div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>{["Claude API","React","Prompt Engineering","Zapier-ready","Demandbase","Salesforce","Outreach","LinkedIn Ads","ABM Framework","Field Marketing","LinkedIn Ad Specs"].map(tag=><span key={tag} style={{fontSize:"11px",fontWeight:"700",padding:"4px 10px",borderRadius:"6px",background:C.surface,border:`1.5px solid ${C.accentBorder}`,color:C.accent,letterSpacing:"0.04em"}}>{tag}</span>)}</div>
          </div>)}
        </div>

        <div style={{marginTop:"40px",paddingTop:"24px",borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}><div style={{width:"30px",height:"30px",borderRadius:"8px",background:"linear-gradient(135deg,#1C3557,#2E74B5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px"}}>⚡</div><div><div style={{fontSize:"12px",fontWeight:"800",color:C.text,letterSpacing:"-0.01em"}}>Account Marketing Planning Agent</div><div style={{fontSize:"11px",color:C.quiet}}>AMPA v2.0</div></div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:"12px",fontWeight:"700",color:C.sub}}>Built by Megan Cleary</div><div style={{fontSize:"11px",color:C.quiet}}>Senior Demand Generation & Campaign Marketing Leader</div><a href="https://linkedin.com/in/megcleary" target="_blank" rel="noreferrer" style={{fontSize:"11px",color:C.accent,fontWeight:"600",textDecoration:"none"}}>linkedin.com/in/megcleary</a></div>
        </div>
      </div>
    </div>
  );
}
