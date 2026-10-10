import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { BookOpen, Calculator, Gamepad2, Home, MessageCircle, Puzzle, RotateCcw, Sparkles, Users, X, ArrowLeft } from 'lucide-react';
import { useArchieContext } from '@/contexts/ArchieContext';
import { useVoice } from '@/lib/voice-context';
import { sceneArtworkPath, sceneForSubject } from './SceneArtwork';
import './page-picture-jigsaw.css';
import ShootingStars from './ShootingStars';
import {PicturePauseContext} from '@/lib/archie/picture-pause';

const ACTIVITIES = [['Lessons','/courses'],['Quests','/quests'],['Maths','/games?subject=maths'],['Reading','/games?subject=reading'],['Spelling','/games?subject=spelling'],['Science','/games?subject=science'],['Geography','/games/geography-quiz'],['Whiteboard','/lesson'],['Library','/library'],['Homework','/homework'],['Cartoons','/cartoons'],['Stickers','/stickers'],['Rewards','/rewards'],['Parents','/parents'],['Class','/class'],['Teachers','/teacher'],['Games','/games'],['History','/history'],['Trail','/games/archie-adventure-trail'],['My world','/world'],['Ask Archie','/ask-archie'],['Clock lab','/time-lab'],['Progress','/progress'],['Artwork','/artwork'],['Settings','/settings'],['Privacy','/privacy']];
const PINS = [{label:'Lessons',to:'/courses',Icon:BookOpen},{label:'Maths',to:'/games?subject=maths',Icon:Calculator},{label:'Reading',to:'/games?subject=reading',Icon:BookOpen},{label:'Games',to:'/games',Icon:Gamepad2},{label:'Ask Archie',to:null,Icon:MessageCircle},{label:'Home',to:'/',Icon:Home}];
function gridSize() { return window.innerHeight < 500 ? { cols:4, rows:3 } : window.innerWidth >= 760 ? { cols:6, rows:4 } : { cols:4, rows:window.innerHeight < 650 ? 4 : 5 }; }
export function jigsawOutline(row:number,col:number,rows:number,cols:number) {
  return `M0 0 ${row===0?'H100':'H36 C36 -14 64 -14 64 0 H100'} ${col===cols-1?'V100':'V36 C86 36 86 64 100 64 V100'} ${row===rows-1?'H0':'H64 C64 86 36 86 36 100 H0'} ${col===0?'V0':'V64 C-14 64 -14 36 0 36 V0'} Z`;
}
function savedPieces(key:string,total:number,pins:number[]) { try { const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?Array.from(new Set(value.filter((n):n is number=>Number.isInteger(n)&&n>=0&&n<total&&!pins.includes(n)))):[]; } catch { return []; } }
export default function PagePictureJigsaw({pageKey,title='Archie’s picture playground',onReturn}:{pageKey:string;title?:string;onReturn?:()=>void}) {
  const {openArchie}=useArchieContext();const [grid,setGrid]=useState(gridSize);const {cols,rows}=grid;const total=cols*rows;
  const middle=Math.floor((rows-1)/2)*cols;
  const pins=[0,cols-1,middle,middle+cols-1,total-cols,total-1];
  const key=`sodafom:picture-jigsaw:v1:${pageKey}:${cols}x${rows}`;
  const [placed,setPlaced]=useState<number[]>(()=>savedPieces(key,total,pins));const [selected,setSelected]=useState<number|null>(null);
  const [notice,setNotice]=useState('The icon buttons stay fitted. Choose a loose picture piece, then tap its matching space.');
  const menu=useRef<HTMLDialogElement>(null);const board=useRef<HTMLDivElement>(null);const previousFocus=useRef<HTMLElement|null>(null);
  const id=useId().replace(/:/g,'');const scene=sceneForSubject(pageKey);const art=scene==='adventure'&&cols===4&&rows>=4?'/assets/scenes/archie-jigsaw-mobile-v2.webp':sceneArtworkPath(scene);
  useEffect(()=>{const resize=()=>setGrid(current=>{const next=gridSize();return current.cols===next.cols&&current.rows===next.rows?current:next;});window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
  useEffect(()=>{setPlaced(savedPieces(key,total,pins));setSelected(null);setNotice('The icon buttons stay fitted. Choose a loose picture piece, then tap its matching space.');},[key]);
  const complete=placed.length===total-pins.length;
  const loose=Array.from({length:total},(_,i)=>i).filter(i=>!pins.includes(i)&&!placed.includes(i)).sort((a,b)=>((a*7+13)%29)-((b*7+13)%29));
  function fit(target:number,piece=selected) {
    if(piece===null){setNotice('Choose a loose piece first.');return;}
    if(piece!==target){setNotice('That picture does not join here. Try a different space.');return;}
    if(pins.includes(target)||placed.includes(target))return;
    const next=[...placed,target];setPlaced(next);setSelected(null);try{localStorage.setItem(key,JSON.stringify(next));}catch{/* Play still works if storage is unavailable. */}
    setNotice(next.length===total-pins.length?'Brilliant! You completed the whole picture. Your icon buttons still work.':`It fits! ${next.length} of ${total-pins.length} picture pieces placed.`);
    requestAnimationFrame(()=>{const section=board.current?.closest('.page-picture-jigsaw');const nextButton=section?.querySelector<HTMLButtonElement>('.picture-loose-pieces button')||section?.querySelector<HTMLButtonElement>('[aria-label="Start picture again"]');nextButton?.focus();});
  }
  function tile(piece:number,loosePiece=false) { const row=Math.floor(piece/cols),col=piece%cols;const clip=`${id}-${loosePiece?'loose':'board'}-${piece}`;return <svg className="picture-tile-art" viewBox="-14 -14 128 128" preserveAspectRatio="none" aria-hidden="true"><defs><clipPath id={clip}><path d={jigsawOutline(row,col,rows,cols)}/></clipPath></defs><image href={art} x={-col*100} y={-row*100} width={cols*100} height={rows*100} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clip})`}/><path d={jigsawOutline(row,col,rows,cols)} fill="none" stroke="#fff" strokeWidth="1.4"/></svg>; }
  function choose(piece:number,element:HTMLButtonElement) { setSelected(piece);setNotice(`Piece ${piece+1} selected. Find where its picture joins.`); }
  function openMenu(){previousFocus.current=document.activeElement as HTMLElement;menu.current?.showModal();}
  function closeMenu(){menu.current?.close();previousFocus.current?.focus();}
  return <section className={`page-picture-jigsaw ${complete?'picture-complete':''}`} aria-label="Whole-page picture jigsaw">
    <header className="picture-heading"><div><span className="picture-eyebrow"><Sparkles size={13}/> Archie & friends</span><h2>{title}</h2></div><span className="picture-count" aria-label="Picture puzzle progress">{placed.length} / {total-pins.length}</span></header>
    <div className="picture-play-area"><div ref={board} className="picture-jigsaw-board" style={{'--picture-cols':cols,'--picture-rows':rows,'--picture-art':`url("${art}")`} as CSSProperties} aria-label="Picture puzzle spaces">
      {scene==='science'&&<ShootingStars/>}
      {Array.from({length:total},(_,piece)=>{const pin=pins.indexOf(piece),row=Math.floor(piece/cols),col=piece%cols;
        if(pin>=0){const {label,to,Icon}=pin===0&&onReturn?{label:pageKey.startsWith('/games/')?'My game':pageKey.startsWith('/lesson')||pageKey.startsWith('/courses/')?'My lesson':'This page',to:null,Icon:ArrowLeft}:pin===5&&pageKey==='home'?{label:'Parents',to:'/parents',Icon:Users}:PINS[pin];const content=<>{tile(piece)}<span className={`picture-icon-label pin-colour-${pin}`}><Icon size={22}/><span>{label==='Ask Archie'?'Archie':label}</span><span className="picture-pin-mark" aria-hidden="true">●</span></span></>;
          return to?<Link key={piece} className="picture-board-piece picture-fixed-piece" aria-label={label} to={to}>{content}</Link>:<button key={piece} type="button" className="picture-board-piece picture-fixed-piece" aria-label={label} onClick={()=>{if(pin===0&&onReturn)onReturn();else openArchie();}}>{content}</button>;
        }
        return <button key={piece} type="button" className={`picture-board-piece ${placed.includes(piece)?'picture-piece-fitted':'picture-empty-space'}`} aria-label={placed.includes(piece)?`Fitted picture piece ${piece+1}`:`Place picture piece ${piece+1}`} disabled={placed.includes(piece)} onClick={()=>fit(piece)} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();const value=event.dataTransfer.getData('application/x-sodafom-piece');if(/^\d+$/.test(value))fit(piece,Number(value));}}>{placed.includes(piece)?tile(piece):<><svg className="picture-tile-art picture-gap-art" viewBox="-14 -14 128 128" preserveAspectRatio="none" aria-hidden="true"><path d={jigsawOutline(row,col,rows,cols)}/></svg><span className="picture-space-number">{piece+1}</span></>}</button>;
      })}
    </div><div className="picture-piece-tray"><div className="picture-tray-heading"><strong>{complete?'Picture complete!':'Loose picture pieces'}</strong><span>{complete?'★ ★ ★':'Swipe to see more →'}</span></div><div className="picture-loose-pieces" aria-label="Loose picture pieces">{loose.map(piece=><button key={piece} type="button" className={`picture-loose-piece ${selected===piece?'picture-selected':''}`} aria-label={`Pick picture piece ${piece+1}`} aria-pressed={selected===piece} draggable onDragStart={event=>{event.dataTransfer.setData('application/x-sodafom-piece',String(piece));choose(piece,event.currentTarget);}} onClick={event=>choose(piece,event.currentTarget)}>{tile(piece,true)}<span>{piece+1}</span></button>)}</div><p className="picture-notice" role="status">{notice}</p></div></div>
    <footer className="picture-actions">{onReturn&&<button type="button" onClick={onReturn}><ArrowLeft size={16}/> Back to learning</button>}<button type="button" onClick={openMenu}><Gamepad2 size={17}/> All activities</button><button type="button" aria-label="Start picture again" onClick={()=>{setPlaced([]);setSelected(null);try{localStorage.removeItem(key);}catch{}setNotice('Picture reset. The icon buttons stay in place.');}}><RotateCcw size={16}/><span>Again</span></button></footer>
    <dialog ref={menu} className="picture-activity-dialog" aria-labelledby={`${id}-menu-title`} onClose={()=>previousFocus.current?.focus()}><header><h2 id={`${id}-menu-title`}>Choose an adventure</h2><button type="button" aria-label="Close activities" onClick={closeMenu}><X size={20}/></button></header><nav aria-label="Home activities">{ACTIVITIES.map(([label,to])=><Link key={label} to={to} onClick={closeMenu}>{label}</Link>)}</nav></dialog>
  </section>;
}
export function PagePictureFrame({children}:{children:ReactNode}) {
  const location=useLocation();const [open,setOpen]=useState(false);const {stop}=useVoice();
  const enabled=location.pathname!=='/';
  useEffect(()=>setOpen(false),[location.pathname,location.search]);
  const trigger=useRef<HTMLButtonElement>(null);const puzzleFocus=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(!open)return;const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);requestAnimationFrame(()=>trigger.current?.focus());}};document.addEventListener('keydown',key);puzzleFocus.current?.focus();return()=>document.removeEventListener('keydown',key);},[open]);
  function show(){stop();window.dispatchEvent(new Event('sodafom:picture-puzzle-open'));setOpen(true);}
  if(!enabled)return <>{children}</>;
  return <PicturePauseContext.Provider value={open}><div className="picture-page-frame"><div className="picture-mode-bar"><span className="picture-mode-label" aria-label="Your picture playground"><Puzzle size={16}/><span className="picture-mode-label-full" aria-hidden="true">Your picture playground</span><span className="picture-mode-label-compact" aria-hidden="true">Picture playground</span></span><button ref={trigger} type="button" aria-label={open?'Return to my activity':'Play this page as a jigsaw'} onClick={()=>{if(open)setOpen(false);else show();}}>{open?'Return to activity':'Picture puzzle'} <Puzzle size={17}/></button></div><div className="picture-route-content" hidden={open}>{children}</div>{open&&<div ref={puzzleFocus} tabIndex={-1} className="picture-route-game"><PagePictureJigsaw pageKey={location.pathname+location.search} title="Build this page’s picture" onReturn={()=>{setOpen(false);requestAnimationFrame(()=>trigger.current?.focus());}}/></div>}</div></PicturePauseContext.Provider>;
}
