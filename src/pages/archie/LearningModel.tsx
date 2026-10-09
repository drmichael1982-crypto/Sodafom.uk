import { useState, useEffect } from 'react';
import './learning-model.css';

/** Angles are clockwise from twelve. The hour hand moves throughout each hour. */
export function clockHandAngles(hour:number, minute:number) {
  return {hour:(hour % 12)*30 + minute/2, minute:minute*6};
}

/** A labelled picture supports thinking; the written question stays the authority. */
export function getLearningModel(prompt:string) {
  // Only recognise supplied data, with bounded input and bounded picture sizes.
  if (prompt.length > 2048) return null;
  const time=prompt.match(/^What does (\d{2}):(\d{2}) mean\?$/);
  if (time && Number(time[1]) < 24 && Number(time[2]) < 60) return {kind:'clock' as const,hour:Number(time[1]),minute:Number(time[2]),label:`${time[1]}:${time[2]}`};
  const coin=prompt.match(/^A (1p|2p|5p|10p|20p|50p|£1|£2) coin is worth how many pence\?$/);
  if (coin) return {kind:'coin' as const,denomination:coin[1]};
  const rectangle=prompt.match(/^A rectangle is (\d{1,4}) cm long and (\d{1,4}) cm wide\. What is its perimeter\?$/);
  if (rectangle && rectangle.slice(1).every(value => Number(value)>0 && Number(value)<=1000)) return {kind:'rectangle' as const,length:Number(rectangle[1]),width:Number(rectangle[2])};
  const grid=prompt.match(/^A rectangular grid has (\d{1,2}) columns and (\d{1,2}) rows of 1 cm² tiles\. What is its area\?$/);
  if (grid && grid.slice(1).every(value => Number(value)>0 && Number(value)<=12)) return {kind:'grid' as const,columns:Number(grid[1]),rows:Number(grid[2])};
  const table=prompt.match(/^A table reads Kites (\d{1,4}); Boats (\d{1,4}); Robots (\d{1,4})\. (?:How many Robots|What is the total|How many more Robots than Kites)\?$/);
  if (table && table.slice(1).every(value => Number(value)<=1000)) return {kind:'chart' as const,source:'table' as const,labels:['Kites','Boats','Robots'],values:table.slice(1).map(Number)};
  const bars=prompt.match(/^Two chart bars show (\d{1,4}) and (\d{1,4})\. What is their (?:difference|combined total)\?$/);
  if (bars && bars.slice(1).every(value => Number(value)<=1000)) return {kind:'chart' as const,source:'bars' as const,labels:['First bar','Second bar'],values:bars.slice(1).map(Number)};
  const sequence=prompt.match(/^What is the equal step in (\d+), (\d+), (\d+)\?/);
  if (sequence && sequence.slice(1).every(value => Number(value) <= 30)) return {kind:'sequence' as const,values:sequence.slice(1).map(Number)};
  const place=prompt.match(/^In ([\d,]+), what is the value/);
  if (place && place[1].replace(/,/g,'').length <= 7) return {kind:'place' as const,digits:place[1].replace(/,/g,'')};
  const sum=prompt.match(/^(\d+) ([+−]) (\d+) =/);
  if (sum && Number(sum[1]) + Number(sum[3]) <= 30 && (sum[2] === '+' || Number(sum[1]) >= Number(sum[3]))) return {kind:'dots' as const,a:Number(sum[1]),b:Number(sum[3]),operation:sum[2]};
  const fraction=prompt.match(/\b(\d+)\/(\d+)\b/);
  if (fraction && Number(fraction[1]) > 0 && Number(fraction[1]) <= Number(fraction[2]) && Number(fraction[2]) <= 12) return {kind:'fraction' as const,numerator:Number(fraction[1]),denominator:Number(fraction[2])};
  return null;
}
export default function LearningModel({prompt}:{prompt:string}) {
  const [counted,setCounted]=useState(0);
  useEffect(()=>setCounted(0),[prompt]);
  const model=getLearningModel(prompt);
  if (!model) return null;
  if (model.kind === 'clock') {
    const angles=clockHandAngles(model.hour,model.minute);
    return <figure className="learning-model"><figcaption>Clock picture · {model.label}</figcaption>
      <svg className="learning-clock-picture" viewBox="0 0 240 240" role="img" aria-label={`Analogue clock showing ${model.label}. The short hand shows hours; the long hand shows minutes.`}>
        <g aria-hidden="true">
          <circle cx="120" cy="120" r="112" fill="white" stroke="#263957" strokeWidth="4"/>
          {Array.from({length:60},(_,i)=><line key={i} x1="120" y1={i%5===0?13:16} x2="120" y2={i%5===0?24:20} stroke="#263957" strokeWidth={i%5===0?3:1} transform={`rotate(${i*6} 120 120)`}/>)}
          {Array.from({length:12},(_,i)=>{const number=i+1;const radians=number*Math.PI/6;return <text key={number} x={120+83*Math.sin(radians)} y={120-83*Math.cos(radians)} textAnchor="middle" dominantBaseline="central" fontSize="18" fill="#263957">{number}</text>;})}
          <line data-clock-hand="hour" x1="120" y1="120" x2="120" y2="65" stroke="#15589c" strokeWidth="9" strokeLinecap="round" transform={`rotate(${angles.hour} 120 120)`}/>
          <line data-clock-hand="minute" x1="120" y1="120" x2="120" y2="40" stroke="#925400" strokeWidth="5" strokeLinecap="round" transform={`rotate(${angles.minute} 120 120)`}/>
          <circle cx="120" cy="120" r="7" fill="#263957"/>
        </g>
      </svg>
      <p className="a-note">Short blue hand: hours. Long brown hand: minutes. The hour hand moves gradually between the hour numbers.</p>
    </figure>;
  }
  if (model.kind === 'coin') return <figure className="learning-model"><figcaption>Pretend UK coin</figcaption>
    <svg className="learning-coin-picture" viewBox="0 0 160 160" role="img" aria-label={`Pretend coin showing the written denomination ${model.denomination}. This is a learning model, not an image of a real coin.`}>
      <g aria-hidden="true"><circle cx="80" cy="80" r="70" fill="#fff0bb" stroke="#765010" strokeWidth="4"/><circle cx="80" cy="80" r="59" fill="none" stroke="#765010" strokeWidth="2" strokeDasharray="3 5"/><text x="80" y="80" textAnchor="middle" dominantBaseline="central" fontSize="36" fontWeight="700" fill="#47320c">{model.denomination}</text></g>
    </svg>
    <p className="a-note">The label is the value written in your question. This pretend model does not show a real coin’s shape, design or size.</p>
  </figure>;
  if (model.kind === 'rectangle') return <figure className="learning-model"><figcaption>Rectangle boundary · not to scale</figcaption>
    <svg className="learning-rectangle-picture" viewBox="0 0 320 210" role="img" aria-label={`Rectangle: two sides are ${model.length} centimetres long and two sides are ${model.width} centimetres wide. Picture not to scale.`}>
      <g aria-hidden="true"><rect x="76" y="48" width="168" height="104" fill="#e1f1ff" stroke="#15589c" strokeWidth="4"/>
        <text x="160" y="30" textAnchor="middle">{model.length} cm</text><text x="160" y="181" textAnchor="middle">{model.length} cm</text>
        <text x="68" y="105" textAnchor="end">{model.width} cm</text><text x="252" y="105">{model.width} cm</text>
      </g>
    </svg><p className="a-note">Trace all four sides. Opposite sides have the same length.</p>
  </figure>;
  if (model.kind === 'grid') {
    const pictureWidth=Math.max(240,model.columns*24+64);
    const startX=(pictureWidth-model.columns*24)/2;
    return <figure className="learning-model"><figcaption>Square-tile picture</figcaption>
      <svg className="learning-grid-picture" viewBox={`0 0 ${pictureWidth} ${model.rows*24+80}`} role="img" aria-label={`${model.columns} columns and ${model.rows} rows of equal tiles. Every tile has area 1 square centimetre.`}>
        <g aria-hidden="true"><text x={pictureWidth/2} y="22" textAnchor="middle">{model.columns} columns</text>
          {Array.from({length:model.columns*model.rows},(_,i)=><rect key={i} x={startX+(i%model.columns)*24} y={36+Math.floor(i/model.columns)*24} width="24" height="24" fill="#e1f1ff" stroke="#15589c" strokeWidth="1.5"/>)}
          <text x={pictureWidth/2} y={model.rows*24+62} textAnchor="middle">{model.rows} rows · 1 cm² per tile</text>
        </g>
      </svg><p className="a-note">Each square is one tile. Follow one row, then look at how many equal rows there are.</p>
    </figure>;
  }
  if (model.kind === 'chart') {
    const maximum=Math.max(1,...model.values);
    const step=248/model.values.length;
    return <figure className="learning-model"><figcaption>{model.source==='table'?'Picture of the supplied table':'Picture of the two supplied values'}</figcaption>
      <svg className="learning-chart-picture" viewBox="0 0 320 222" role="img" aria-label={`Bar chart on one shared scale. ${model.labels.map((label,i)=>`${label}: ${model.values[i]}`).join('; ')}. No other data is supplied.`}>
        <g aria-hidden="true">
          {[0,0.5,1].map(part=><g key={part}><line x1="48" y1={160-part*120} x2="300" y2={160-part*120} stroke="#b6c5d7"/><text x="39" y={165-part*120} textAnchor="end">{maximum*part}</text></g>)}
          <line x1="48" y1="36" x2="48" y2="160" stroke="#263957" strokeWidth="2"/><text x="48" y="19">{model.source==='table'?'Count':'Given value'}</text>
          {model.values.map((value,i)=>{const x=48+step*(i+0.5);const height=value/maximum*120;return <g key={model.labels[i]}><rect data-chart-bar={model.labels[i]} x={x-22} y={160-height} width="44" height={height} fill="#15589c"/><text x={x} y={152-height} textAnchor="middle">{value}</text><text x={x} y="185" textAnchor="middle">{model.labels[i]}</text></g>;})}
        </g>
      </svg><p className="a-note">All bars use the same scale and start at zero. Read the written values and category labels.</p>
    </figure>;
  }
  if (model.kind === 'sequence') return <figure className="learning-model"><figcaption>Count along the number path</figcaption><div className="sequence-picture" role="img" aria-label={'Number path: '+model.values.join(', ')}>{model.values.map((value,i)=><div key={i} aria-hidden="true"><strong>{value}</strong><span className="dot-picture">{Array.from({length:value},(_,j)=><span key={j} aria-hidden="true"/>)}</span></div>)}</div><p className="a-note">Point and count. How many counters are added each time?</p></figure>;
  if (model.kind === 'place') {
    const places=['ones','tens','hundreds','thousands','ten-thousands','hundred-thousands','millions'];
    return <figure className="learning-model"><figcaption>Place-value picture</figcaption><div className="place-value-picture">{model.digits.split('').map((digit,i)=><div key={i}><strong>{digit}</strong><span>{places[model.digits.length-i-1]}</span></div>)}</div><p className="a-note">Read each digit with its place. An empty place is shown by zero.</p></figure>;
  }
  if (model.kind === 'fraction') return <figure className="learning-model"><figcaption>One whole · {model.numerator}/{model.denominator} shaded</figcaption><div className="fraction-picture" role="img" aria-label={model.denominator+' equal parts, '+model.numerator+' shaded'}>{Array.from({length:model.denominator},(_,i)=><span key={i} className={i<model.numerator ? 'shaded' : ''} aria-hidden="true"/>)}</div><p className="a-note">Every part is the same size. This picture shows the fraction of one whole.</p></figure>;
  return <figure className="learning-model"><figcaption>{model.operation === '+' ? 'Two groups to combine' : 'A group with some taken away'}</figcaption><div className="dot-picture" role="img" aria-label={model.operation === '+' ? model.a+' blue counters and '+model.b+' gold counters' : model.a+' counters with '+model.b+' crossed out'}>{Array.from({length:model.operation === '+' ? model.a+model.b : model.a},(_,i)=><span key={i} className={(model.operation === '+' ? (i<model.a?'':'gold') : (i<model.b?'crossed':'')) + ((model.operation==='+'?i:i-model.b)>=0 && (model.operation==='+'?i:i-model.b)<counted?' counter-counted':'')} aria-hidden="true"/>)}</div><div className="counter-actions"><button type="button" className="a-button" disabled={counted>=(model.operation==='+'?model.a+model.b:model.a-model.b)} onClick={()=>setCounted(value=>value+1)}>Count the next counter</button><button type="button" className="a-button" onClick={()=>setCounted(0)}>Count again</button>{counted>0&&<p aria-live="polite">You counted {counted}. Keep pointing and counting.</p>}</div><p className="a-note">Point to each counter as you count. You can draw your own picture too.</p></figure>;
}
