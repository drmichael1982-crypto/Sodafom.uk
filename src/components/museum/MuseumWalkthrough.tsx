import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, Volume2, Compass, Search } from 'lucide-react';
import { ArchieCharacter } from '@/components/ArchieCharacter';

interface Exhibit { name: string; icon: string; fact: string; challenge: string }
interface Gallery { title: string; icon: string; colour: string; welcome: string; artefacts: Exhibit[] }
interface Props {
  galleries: Record<string, Gallery>;
  selectedKey: string | null;
  selectedExhibit: number | null;
  message: string;
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onEnter: (key: string) => void;
  onBack: () => void;
  onExhibit: (index: number) => void;
  onRead: (text: string) => void;
}
const colours = ['#166cd0', '#812cba', '#bd246e', '#1560bb', '#6535ca', '#007a87'];

/** Presentation only: original exhibit data and navigation callbacks are preserved. */
export default function MuseumWalkthrough(props: Props) {
  const [entered, setEntered] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const gallery = props.selectedKey ? props.galleries[props.selectedKey] : null;
  const exhibit = gallery && props.selectedExhibit !== null ? gallery.artefacts[props.selectedExhibit] : null;
  useEffect(() => { if (entered || gallery) heading.current?.focus(); }, [entered, props.selectedKey]);
  return <div className="sf-museum">
    <section className="sf-museum-building">
      <h2 className="sf-museum-sign" ref={heading} tabIndex={-1}>{gallery?.title || 'Archie’s Museum'}</h2>
      {!entered && !gallery ? <>
        <p className="text-center font-bold">Step inside. Every exhibit has a story.</p>
        <div className="sf-museum-doorway">
          <ArchieCharacter size={130} />
          <div><p className="font-black mb-4">Your adventure starts here!</p>
            <button type="button" className="sf-primary" onClick={() => setEntered(true)}>Enter the museum <ArrowRight size={20} /></button>
          </div>
        </div>
        <p className="text-center text-sm">{Object.keys(props.galleries).length} galleries · Tap to explore at your own pace</p>
      </> : <div className="sf-museum-hall" key={props.selectedKey || 'hall'}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button type="button" className="sf-primary" onClick={() => { if (gallery) props.onBack(); else setEntered(false); }}>
            <ArrowLeft size={18} /> {gallery ? 'Museum hall' : 'Entrance'}
          </button>
          <span className="flex items-center gap-2 font-bold"><Compass size={20} />{gallery ? 'Choose an exhibit' : 'Choose a gallery'}</span>
        </div>
        {!gallery ? <div className="sf-gallery-grid">
          {Object.entries(props.galleries).map(([key, item], index) => <button type="button" key={key}
            className="sf-gallery-door" style={{ '--gallery-colour': colours[index % colours.length] } as CSSProperties}
            onClick={() => props.onEnter(key)}>
            <span className="sf-gallery-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.title}</span><small>Walk into gallery →</small>
          </button>)}
        </div> : <>
          <p className="mt-5 text-lg leading-relaxed">{gallery.welcome}</p>
          <div className="sf-exhibit-grid">{gallery.artefacts.map((item,index) =>
            <button type="button" key={item.name} className="sf-exhibit" aria-pressed={props.selectedExhibit === index} onClick={() => props.onExhibit(index)}>
              <span aria-hidden="true">{item.icon}</span>{item.name}
            </button>)}
          </div>
        </>}
      </div>}
    </section>
    <section className="sf-panel sf-museum-chat" aria-label="Museum guide">
      <div className="flex items-center gap-3"><ArchieCharacter size={70} /><h3 className="font-black text-xl">Explore with Archie</h3></div>
      <p className="mt-3 leading-relaxed" role="status">{exhibit?.fact || props.message}</p>
      {exhibit && <p className="sf-lesson-note"><strong>Archie asks: </strong>{exhibit.challenge}</p>}
      <button type="button" className="sf-primary mt-3" onClick={() => props.onRead(exhibit ? `${exhibit.name}. ${exhibit.fact} ${exhibit.challenge}` : props.message)}><Volume2 size={19} />Read to me</button>
      <form onSubmit={event => { event.preventDefault(); setEntered(true); props.onSearch(); }}>
        <label htmlFor="museum-search" className="sr-only">Which museum would you like?</label>
        <input id="museum-search" value={props.query} onChange={event => props.onQueryChange(event.target.value)} placeholder="Try dinosaurs, Egypt or space…" />
        <button type="submit" className="sf-primary" disabled={!props.query.trim()}><Search size={18} />Find gallery</button>
      </form>
    </section>
  </div>;
}
