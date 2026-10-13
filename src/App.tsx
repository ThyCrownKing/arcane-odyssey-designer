import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useMemo, useState } from 'react';
import type { DesignerItem, GearSlot } from './data/items';
import { gearSlots, isWikiCatalog, items } from './data/items';
import { isUnfinished, unfinishedReason } from './lib/wiki-utils';

const initialLoadout = Object.fromEntries(
  gearSlots.map((slot) => [slot, items.find((item) => item.slot === slot)?.id ?? '']),
) as Record<GearSlot, string>;

function Avatar({ loadout }: { loadout: Record<GearSlot, DesignerItem | undefined> }) {
  const head = loadout.Head?.color ?? '#c8a25d';
  const chest = loadout.Chest?.color ?? '#4c7f7c';
  const legs = loadout.Legs?.color ?? '#374a47';
  const weapon = loadout.Weapon?.color ?? '#d17a54';
  const accessory = loadout.Accessory?.color ?? '#6ab4a8';

  return (
    <group position={[0, -1.05, 0]}>
      <mesh position={[0, 2.3, 0]} castShadow>
        <sphereGeometry args={[0.34, 32, 24]} />
        <meshStandardMaterial color="#d8ad83" roughness={0.78} />
      </mesh>
      <mesh position={[0, 2.62, 0]} castShadow>
        <sphereGeometry args={[0.37, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
        <meshStandardMaterial color={head} roughness={0.48} metalness={0.35} />
      </mesh>
      <mesh position={[0, 1.42, 0]} castShadow>
        <capsuleGeometry args={[0.57, 0.6, 8, 16]} />
        <meshStandardMaterial color={chest} roughness={0.6} metalness={0.18} />
      </mesh>
      <mesh position={[0, 1.76, 0.31]} castShadow>
        <torusGeometry args={[0.18, 0.045, 10, 32]} />
        <meshStandardMaterial color={accessory} roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh position={[-0.25, 0.46, 0]} castShadow>
        <capsuleGeometry args={[0.19, 0.82, 6, 12]} />
        <meshStandardMaterial color={legs} roughness={0.82} />
      </mesh>
      <mesh position={[0.25, 0.46, 0]} castShadow>
        <capsuleGeometry args={[0.19, 0.82, 6, 12]} />
        <meshStandardMaterial color={legs} roughness={0.82} />
      </mesh>
      <mesh position={[-0.76, 1.48, 0]} rotation={[0, 0, -0.12]} castShadow>
        <capsuleGeometry args={[0.16, 0.72, 6, 12]} />
        <meshStandardMaterial color={chest} roughness={0.6} />
      </mesh>
      <mesh position={[0.76, 1.48, 0]} rotation={[0, 0, 0.12]} castShadow>
        <capsuleGeometry args={[0.16, 0.72, 6, 12]} />
        <meshStandardMaterial color={chest} roughness={0.6} />
      </mesh>
      <group position={[1.02, 1.08, 0.08]} rotation={[0, 0, -0.2]}>
        <mesh position={[0, 0.48, 0]} castShadow>
          <boxGeometry args={[0.075, 1.12, 0.08]} />
          <meshStandardMaterial color={weapon} metalness={0.72} roughness={0.28} />
        </mesh>
        <mesh position={[0, -0.16, 0]}>
          <boxGeometry args={[0.28, 0.07, 0.12]} />
          <meshStandardMaterial color="#5d4031" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function ItemMark({ color }: { color: string }) {
  return <span className="item-mark" style={{ backgroundColor: color }} aria-hidden="true" />;
}

export default function App() {
  const [activeSlot, setActiveSlot] = useState<GearSlot>('Head');
  const [selected, setSelected] = useState<Record<GearSlot, string>>(initialLoadout);
  const [search, setSearch] = useState('');

  const loadout = useMemo(() => Object.fromEntries(
    gearSlots.map((slot) => [slot, items.find((item) => item.id === selected[slot])]),
  ) as Record<GearSlot, DesignerItem | undefined>, [selected]);

  const slotItems = items.filter((item) => item.slot === activeSlot
    && item.name.toLowerCase().includes(search.trim().toLowerCase()));
  const activeItem = loadout[activeSlot];
  const unfinishedCount = gearSlots.reduce((count, slot) => count + Number(Boolean(loadout[slot] && isUnfinished(loadout[slot]!))), 0);

  return (
    <main className="studio-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Loadout Studio home">
          <span className="wordmark-seal">AO</span>
          <span><strong>ARCANE ODYSSEY</strong><small>LOADOUT STUDIO</small></span>
        </a>
        <div className="topbar-meta">
          <span className="status-dot" />
          <span>{isWikiCatalog ? 'WIKI CATALOG' : 'PREVIEW CATALOG'}</span>
          <a href="https://roblox-arcane-odyssey.fandom.com/" target="_blank" rel="noreferrer">WIKI SOURCE <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <section className="studio-heading" id="top">
        <div>
          <p className="eyebrow">CHARACTER WORKSHOP <span> / </span> LOADOUT 01</p>
          <h1>Build your <em>odyssey.</em></h1>
          <p className="heading-copy">Tune your kit. Turn the model. Find your silhouette.</p>
        </div>
        <div className="loadout-index"><span>YOUR LOADOUT</span><strong>01 <i>/ 03</i></strong></div>
      </section>

      <div className="designer-grid">
        <aside className="equipment-panel" aria-label="Equipment slots">
          <div className="panel-heading"><span>01 / EQUIPMENT</span><span className="tiny-rule" /></div>
          <div className="slot-list">
            {gearSlots.map((slot, index) => {
              const equipped = loadout[slot];
              const flagged = equipped ? isUnfinished(equipped) : false;
              return (
                <button
                  className={`slot-row ${activeSlot === slot ? 'is-active' : ''}`}
                  key={slot}
                  onClick={() => { setActiveSlot(slot); setSearch(''); }}
                  aria-pressed={activeSlot === slot}
                >
                  <span className="slot-number">0{index + 1}</span>
                  {equipped && <ItemMark color={equipped.color} />}
                  <span className="slot-copy"><strong>{slot}</strong><small>{equipped?.name ?? 'Empty slot'}</small></span>
                  {flagged && <span className="warning-dot" aria-label="Unfinished wiki entry" />}
                  <span className="slot-arrow" aria-hidden="true">↗</span>
                </button>
              );
            })}
          </div>
          <div className="build-notes">
            <span className="notes-index">FIELD NOTES</span>
            <p>{unfinishedCount > 0 ? `${unfinishedCount} equipped ${unfinishedCount === 1 ? 'entry is' : 'entries are'} marked unfinished by its wiki text.` : 'No equipped items are flagged as unfinished.'}</p>
          </div>
          <div className="source-credit">
            <span className="notes-index">DATA ATTRIBUTION</span>
            <p>Item names and descriptions are sourced from the community Arcane Odyssey Wiki.</p>
            <a href="https://roblox-arcane-odyssey.fandom.com/" target="_blank" rel="noreferrer">Visit the Fandom wiki <span aria-hidden="true">↗</span></a>
          </div>
        </aside>

        <section className="preview-panel" aria-label="3D character preview">
          <div className="preview-topline"><span>02 / CHARACTER PREVIEW</span><span>DRAG TO ROTATE <b>·</b> SCROLL TO ZOOM</span></div>
          <div className="preview-stage">
            <div className="stage-coordinate coordinate-top">N <i>·</i> 04</div>
            <div className="stage-coordinate coordinate-bottom">FIG. 001 <i>—</i> {activeSlot.toUpperCase()}</div>
            {unfinishedCount > 0 && <div className="stage-warning">WIKI NOTE <span>{unfinishedCount} UNFINISHED</span></div>}
            <Canvas camera={{ position: [4, 2.8, 6.4], fov: 34 }} shadows dpr={[1, 1.6]}>
              <color attach="background" args={['#dce6df']} />
              <ambientLight intensity={1.35} />
              <directionalLight position={[4, 7, 5]} intensity={2.5} castShadow shadow-mapSize={[1024, 1024]} />
              <directionalLight position={[-4, 3, -3]} intensity={1.1} color="#a8c9bc" />
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
                <circleGeometry args={[2.6, 64]} />
                <meshStandardMaterial color="#c4d4cb" roughness={0.9} />
              </mesh>
              <gridHelper args={[8, 16, '#78958a', '#bdcec5']} position={[0, -0.06, 0]} />
              <Avatar loadout={loadout} />
              <OrbitControls target={[0, 1.05, 0]} minDistance={4} maxDistance={9} minPolarAngle={0.45} maxPolarAngle={Math.PI / 2} />
            </Canvas>
            <div className="stage-caption"><span>FIELD STUDY</span><span>ROTATION ENABLED</span></div>
          </div>
          <div className="preview-footer">
            <div className="character-title"><span>THE WANDERER</span><strong>{activeItem?.name ?? 'Unassigned'}</strong></div>
            <div className="model-coordinates"><span>GEAR SCORE</span><strong>{gearSlots.filter((slot) => loadout[slot]).length.toString().padStart(2, '0')} <i>/ 05</i></strong></div>
          </div>
        </section>

        <aside className="catalog-panel" aria-label={`${activeSlot} item catalog`}>
          <div className="panel-heading"><span>03 / ARMORY</span><span className="result-count">{slotItems.length.toString().padStart(2, '0')} ITEMS</span></div>
          <div className="catalog-tabs" role="tablist" aria-label="Equipment category">
            {gearSlots.map((slot) => (
              <button key={slot} role="tab" aria-selected={activeSlot === slot} className={activeSlot === slot ? 'tab-active' : ''} onClick={() => { setActiveSlot(slot); setSearch(''); }}>
                {slot === 'Accessory' ? 'ACC.' : slot.toUpperCase()}
              </button>
            ))}
          </div>
          <label className="search-field">
            <span className="search-glyph" aria-hidden="true">⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${activeSlot.toLowerCase()}...`} aria-label={`Search ${activeSlot} items`} />
            {search && <button onClick={() => setSearch('')} aria-label="Clear search">×</button>}
          </label>
          <div className="item-list">
            {slotItems.length > 0 ? slotItems.map((item) => {
              const flagged = isUnfinished(item);
              const equipped = selected[activeSlot] === item.id;
              return (
                <button key={item.id} aria-pressed={equipped} className={`item-row ${equipped ? 'item-equipped' : ''} ${flagged ? 'item-flagged' : ''}`} onClick={() => setSelected((current) => ({ ...current, [activeSlot]: equipped ? '' : item.id }))}>
                  <ItemMark color={item.color} />
                  <span className="item-copy"><strong>{item.name}</strong><small>{item.rarity} <i>·</i> {item.slot}</small></span>
                  {flagged && <span className="unfinished-badge">UNFINISHED</span>}
                  {equipped && <span className="equipped-check" aria-label="Equipped">✓</span>}
                </button>
              );
            }) : <div className="empty-results">No {activeSlot.toLowerCase()} entries match “{search}”.</div>}
          </div>
          {activeItem && (
            <div className="item-detail">
              <span className="notes-index">SELECTED ITEM</span>
              <h2>{activeItem.name}</h2>
              <p>{activeItem.description}</p>
              {isUnfinished(activeItem) && <p className="detail-warning">{unfinishedReason(activeItem) ?? 'This item matches an unfinished-content rule.'}</p>}
              {activeItem.previewPlaceholder && <p className="preview-note">3D preview uses stylized placeholder geometry.</p>}
              <a href={activeItem.wikiUrl ?? activeItem.sourceUrl} target="_blank" rel="noreferrer">WIKI SOURCE: {activeItem.sourceTitle} <span aria-hidden="true">↗</span></a>
              {!!activeItem.communityReferences?.length && (
                <div className="community-references">
                  <span className="notes-index">COMMUNITY REFERENCES · UNVERIFIED</span>
                  {activeItem.communityReferences.map((reference) => (
                    <a key={reference.url} href={reference.url} target="_blank" rel="noreferrer">
                      {reference.title}<small>r/{reference.subreddit} · score {reference.score} <span aria-hidden="true">↗</span></small>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
          {!isWikiCatalog && <p className="catalog-notice">Starter preview data. Run <code>npm run fetch:wiki</code> to replace it with wiki entries.</p>}
        </aside>
      </div>
      <footer className="page-footer"><span>COMMUNITY-MADE CHARACTER STUDY</span><span>NOT AFFILIATED WITH ROBLOX OR THE ARCANE ODYSSEY TEAM</span></footer>
    </main>
  );
}