import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addEdge,
  Background,
  ConnectionMode,
  Controls,
  Handle,
  Position,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import { Activity, BrainCircuit, ChevronRight, CircleHelp, Network, Plus, Search, Settings2, Sparkles, Users, X } from 'lucide-react';

type Person = {
  id: string;
  name: string;
  role: string;
  color: string;
  initials: string;
  notes: string;
  tags: string[];
};
type StoredData = { people: Person[]; nodes: Node[]; edges: Edge[] };
const STORAGE_KEY = 'friend-dex-prototype-v1';
const palette = ['#39FF14', '#A78BFA', '#72FF4A', '#8B5CF6', '#B6FF70', '#6D42C1', '#D0FF9A'];
function PersonNode({ data, selected }: NodeProps<Node<{ label: string; initials: string; color: string; role: string }>>) {
  return (
    <div className={`person-node ${selected ? 'selected' : ''}`} style={{ '--node-color': data.color } as React.CSSProperties}>
      <Handle type="source" position={Position.Top} id="source-top" />
      <Handle type="source" position={Position.Right} id="source-right" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" />
      <Handle type="source" position={Position.Left} id="source-left" />
      <div className="person-node-avatar">{data.initials}</div>
      <div className="person-node-name">{data.label}</div>
      <div className="person-node-role">{data.role}</div>
    </div>
  );
}

const nodeTypes = { person: PersonNode };

const starterPeople: Person[] = [
  { id: 'p1', name: 'You', role: 'Center of your network', color: '#39FF14', initials: 'YO', notes: 'Your personal starting point for the social atlas.', tags: ['Me', 'Core'] },
  { id: 'p2', name: 'Alex Rivera', role: 'Close friend', color: '#A78BFA', initials: 'AR', notes: 'Met through a shared interest. Add more context as you learn it.', tags: ['Friend', 'Music'] },
  { id: 'p3', name: 'Sam Chen', role: 'Friend', color: '#72FF4A', initials: 'SC', notes: 'Knows Alex too. Keep observations factual and dated.', tags: ['Friend'] },
  { id: 'p4', name: 'Jordan Lee', role: 'Classmate', color: '#8B5CF6', initials: 'JL', notes: 'Someone from class; relationship details are still sparse.', tags: ['Class'] },
  { id: 'p5', name: 'Morgan Silva', role: 'Acquaintance', color: '#B6FF70', initials: 'MS', notes: 'A newer connection in the network.', tags: ['New'] },
];
const starterNodes: Node[] = [
  { id: 'p1', position: { x: 0, y: 40 }, data: { label: 'You', initials: 'YO', color: '#39FF14', role: 'Center of your network' }, type: 'person' },
  { id: 'p2', position: { x: -220, y: -110 }, data: { label: 'Alex Rivera', initials: 'AR', color: '#A78BFA', role: 'Close friend' }, type: 'person' },
  { id: 'p3', position: { x: 225, y: -130 }, data: { label: 'Sam Chen', initials: 'SC', color: '#72FF4A', role: 'Friend' }, type: 'person' },
  { id: 'p4', position: { x: -200, y: 230 }, data: { label: 'Jordan Lee', initials: 'JL', color: '#8B5CF6', role: 'Classmate' }, type: 'person' },
  { id: 'p5', position: { x: 230, y: 210 }, data: { label: 'Morgan Silva', initials: 'MS', color: '#B6FF70', role: 'Acquaintance' }, type: 'person' },
];
const starterEdges: Edge[] = [
  { id: 'e1', source: 'p1', target: 'p2', label: 'friendship', type: 'default', style: { stroke: '#A78BFA', strokeWidth: 2 }, labelStyle: { fill: '#aeb8c7', fontSize: 10 }, labelBgStyle: { fill: '#11161d' } },
  { id: 'e2', source: 'p1', target: 'p3', label: 'friendship', type: 'default', style: { stroke: '#72FF4A', strokeWidth: 2 }, labelStyle: { fill: '#aeb8c7', fontSize: 10 }, labelBgStyle: { fill: '#11161d' } },
  { id: 'e3', source: 'p1', target: 'p4', label: 'class', type: 'default', style: { stroke: '#8B5CF6', strokeWidth: 2 }, labelStyle: { fill: '#aeb8c7', fontSize: 10 }, labelBgStyle: { fill: '#11161d' } },
  { id: 'e4', source: 'p1', target: 'p5', label: 'acquaintance', type: 'default', style: { stroke: '#B6FF70', strokeWidth: 2 }, labelStyle: { fill: '#aeb8c7', fontSize: 10 }, labelBgStyle: { fill: '#11161d' } },
  { id: 'e5', source: 'p2', target: 'p3', label: 'know each other', type: 'default', style: { stroke: '#667085', strokeWidth: 1.5, strokeDasharray: '5 4' }, labelStyle: { fill: '#aeb8c7', fontSize: 10 }, labelBgStyle: { fill: '#11161d' } },
];

function getSideToward(from: Node, to: Node): Position {
  const fromWidth = from.width ?? 160;
  const fromHeight = from.height ?? 90;
  const toWidth = to.width ?? 160;
  const toHeight = to.height ?? 90;
  const dx = to.position.x + toWidth / 2 - (from.position.x + fromWidth / 2);
  const dy = to.position.y + toHeight / 2 - (from.position.y + fromHeight / 2);
  if (Math.abs(dx) / fromWidth >= Math.abs(dy) / fromHeight) {
    return dx >= 0 ? Position.Right : Position.Left;
  }
  return dy >= 0 ? Position.Bottom : Position.Top;
}

function alignEdgeHandles(edges: Edge[], nodes: Node[]): Edge[] {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  let changed = false;
  const aligned = edges.map((edge) => {
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);
    if (!source || !target) return edge;
    const sourceHandle = `source-${getSideToward(source, target)}`;
    const targetHandle = `source-${getSideToward(target, source)}`;
    if (edge.sourceHandle === sourceHandle && edge.targetHandle === targetHandle) return edge;
    changed = true;
    return { ...edge, sourceHandle, targetHandle };
  });
  return changed ? aligned : edges;
}

function readSaved(): StoredData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as StoredData;
    const people = saved.people.map((person, index) => ({ ...person, color: palette[index % palette.length] }));
    const colorsById = new Map(people.map((person) => [person.id, person.color]));
    const nodes = saved.nodes.map((node) => ({
      ...node,
      data: { ...node.data, color: colorsById.get(node.id) ?? palette[0] },
    }));
    return {
      ...saved,
      people,
      nodes,
      edges: alignEdgeHandles(saved.edges.map((edge, index) => ({
        ...edge,
        type: edge.type === 'smoothstep' ? 'default' : edge.type,
        style: { ...edge.style, stroke: palette[(index + 1) % palette.length] },
      })), nodes),
    };
  } catch {
    return null;
  }
}

export default function App() {
  const saved = useMemo(readSaved, []);
  const [people, setPeople] = useState<Person[]>(saved?.people ?? starterPeople);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(saved?.nodes ?? starterNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(saved?.edges ?? alignEdgeHandles(starterEdges, starterNodes));
  const [selectedId, setSelectedId] = useState<string | null>('p2');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Friend');
  const [mobilePanel, setMobilePanel] = useState(false);
  const [profileOpen, setProfileOpen] = useState(true);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ people, nodes, edges })); } catch (error) { console.warn('Could not save local prototype data.', error); }
  }, [people, nodes, edges]);

  const selected = people.find((person) => person.id === selectedId) ?? null;
  const selectedConnections = edges.filter((edge) => edge.source === selectedId || edge.target === selectedId);

  const onConnect = useCallback((connection: Connection) => {
    const color = palette[Math.floor(Math.random() * palette.length)];
    const source = nodes.find((node) => node.id === connection.source);
    const target = nodes.find((node) => node.id === connection.target);
    const orientedConnection = source && target ? {
      ...connection,
      sourceHandle: `source-${getSideToward(source, target)}`,
      targetHandle: `source-${getSideToward(target, source)}`,
    } : connection;
    setEdges((current) => addEdge({ ...orientedConnection, id: `e-${Date.now()}`, label: 'connection', type: 'default', style: { stroke: color, strokeWidth: 2 }, labelStyle: { fill: '#aeb8c7', fontSize: 10 }, labelBgStyle: { fill: '#11161d' } }, current));
  }, [nodes, setEdges]);

  const onNodeDrag = useCallback((_: MouseEvent | TouchEvent, __: Node, currentNodes: Node[]) => {
    const draggedNodesById = new Map(currentNodes.map((node) => [node.id, node]));
    const allCurrentNodes = nodes.map((node) => draggedNodesById.get(node.id) ?? node);
    setEdges((currentEdges) => alignEdgeHandles(currentEdges, allCurrentNodes));
  }, [nodes, setEdges]);

  function addPerson() {
    const name = newName.trim();
    if (!name) return;
    const id = `p-${Date.now()}`;
    const color = palette[people.length % palette.length];
    const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
    const person: Person = { id, name, role: newRole, color, initials, notes: 'Add notes about this person here.', tags: [newRole] };
    const angle = people.length * 1.2;
    const node: Node = { id, type: 'person', position: { x: Math.cos(angle) * 300, y: Math.sin(angle) * 260 }, data: { label: name, initials, color, role: newRole } };
    setPeople((current) => [...current, person]);
    setNodes((current) => [...current, node]);
    setSelectedId(id);
    setProfileOpen(true);
    setNewName('');
    setShowAdd(false);
    setMobilePanel(true);
  }

  function updateNotes(notes: string) {
    if (!selectedId) return;
    setPeople((current) => current.map((person) => person.id === selectedId ? { ...person, notes } : person));
  }

  function resetDemo() {
    if (!window.confirm('Reset the graph to the fictional demo data? This replaces your current local prototype data.')) return;
    setPeople(starterPeople);
    setNodes(starterNodes);
    setEdges(starterEdges);
    setSelectedId('p2');
  }

  return (
    <main className="app-shell">
      <section className="main-column">
        <header className="topbar"><div className="topbar-leading"><div className="brand header-brand"><div className="brand-mark"><Network size={19} /></div><div><strong>FRIEND<span>-DEX</span></strong><small>SOCIAL ATLAS / v0.1</small></div></div><div className="page-heading"><div className="eyebrow">YOUR WORLD, CONNECTED</div><h1>Relationship graph</h1></div></div><nav className="top-navigation" aria-label="Main navigation"><button className="top-nav-button active"><Network size={16} /><span>Graph</span><span className="nav-count">{people.length}</span></button><button className="top-nav-button" onClick={() => setShowAdd(true)}><Users size={16} /><span>People</span><Plus size={14} /></button><button className="top-nav-button" onClick={() => alert('Events are next on the roadmap. For now, add context in each profile notes field.')}><Activity size={16} /><span>Events</span><span className="soon">SOON</span></button><button className="top-nav-button" onClick={() => alert('Oracle status: planned. We will add an AI provider after the people and relationship model is in place.')}><BrainCircuit size={16} /><span>Oracle</span></button></nav><div className="top-actions"><div className="save-status"><span className="status-dot" /> Saved locally</div><button className="icon-button" aria-label="About this prototype" onClick={() => alert('Prototype v0.1 — demo data is fictional and saved in this browser only. Do not enter sensitive information yet.')}><CircleHelp size={18} /></button><button className="avatar">YO</button></div></header>
        <div className="graph-toolbar"><div className="graph-title"><span className="live-dot" /> NETWORK MAP <span className="toolbar-divider">/</span> <span className="muted">{people.length} PEOPLE · {edges.length} CONNECTIONS</span></div><div className="toolbar-actions"><label className="search-box"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a person..." /></label><button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={16} /> Add person</button></div></div>
        <div className="graph-and-panel">
          <div className="graph-canvas">
            <div className="canvas-hint"><span className="hint-dot" /> DRAG TO ARRANGE <span>·</span> SCROLL TO ZOOM</div>
            <ReactFlow nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose} nodes={nodes.filter((node) => !search || String(node.data.label).toLowerCase().includes(search.toLowerCase()))} edges={edges} onNodesChange={onNodesChange} onNodeDrag={onNodeDrag} onEdgesChange={onEdgesChange} onConnect={onConnect} onPaneClick={() => { setProfileOpen(false); setMobilePanel(false); }} onNodeClick={(_, node) => { setSelectedId(node.id); setProfileOpen(true); setMobilePanel(true); }} fitView fitViewOptions={{ padding: 0.25 }} minZoom={0.25} maxZoom={1.8} proOptions={{ hideAttribution: true }}>
              <Background color="#29313b" gap={24} size={1} />
              <Controls position="bottom-left" showInteractive={false} />
              <MiniMap position="bottom-right" pannable zoomable nodeColor={(node) => String(node.data.color ?? '#667085')} maskColor="rgba(8, 11, 15, 0.72)" />
            </ReactFlow>
            <div className="legend"><span><i style={{ background: '#A78BFA' }} />Friendship</span><span><i style={{ background: '#8B5CF6' }} />Class / work</span><span><i style={{ background: '#72FF4A' }} />Acquaintance</span><span><i className="dashed" />Other link</span></div>
          </div>
          <aside className={`profile-panel ${profileOpen ? 'profile-open' : 'profile-closed'} ${mobilePanel ? 'mobile-open' : ''}`}>
            <button className="panel-dismiss" aria-label="Close profile panel" onClick={() => { setProfileOpen(false); setMobilePanel(false); }}><ChevronRight size={16} /></button>
            <div className="panel-header"><div><span className="eyebrow">PERSON DOSSIER</span><h2>Profile</h2></div><button className="icon-button mobile-close" onClick={() => setMobilePanel(false)} aria-label="Close profile"><X size={18} /></button><button className="icon-button" aria-label="Profile options" onClick={resetDemo}><Settings2 size={17} /></button></div>
            {selected ? <>
              <div className="profile-hero"><div className="profile-avatar" style={{ '--person-color': selected.color } as React.CSSProperties}>{selected.initials}</div><h3>{selected.name}</h3><p>{selected.role}</p><div className="tag-row">{selected.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></div>
              <div className="panel-section"><div className="section-heading">OVERVIEW <span>01</span></div><div className="stat-grid"><div className="stat-card"><strong>{selectedConnections.length}</strong><span>Connections</span></div><div className="stat-card"><strong>{selected.tags.length}</strong><span>Tags</span></div></div></div>
              <div className="panel-section"><div className="section-heading">NOTES <span>EDITABLE</span></div><textarea className="notes-input" value={selected.notes} onChange={(event) => updateNotes(event.target.value)} placeholder="What do you know about this person?" rows={5} /><p className="microcopy">Keep observations factual. Notes are saved in this browser.</p></div>
              <div className="panel-section"><div className="section-heading">CONNECTED TO <span>{selectedConnections.length}</span></div><div className="connection-list">{selectedConnections.length ? selectedConnections.map((edge) => { const otherId = edge.source === selectedId ? edge.target : edge.source; const other = people.find((person) => person.id === otherId); return other ? <button className="connection-row" key={edge.id} onClick={() => setSelectedId(other.id)}><span className="connection-avatar" style={{ color: other.color, borderColor: `${other.color}55` }}>{other.initials}</span><span className="connection-info"><strong>{other.name}</strong><small>{String(edge.label ?? 'connection')}</small></span><ChevronRight size={15} /></button> : null; }) : <p className="empty-copy">No connections yet. Connect nodes by dragging between their handles.</p>}</div></div>
              <button className="oracle-button" onClick={() => alert('The Oracle is not connected yet. Next, we will build structured relationship data before adding AI predictions.')}><Sparkles size={16} /> Ask the Oracle <span>COMING SOON</span></button>
            </> : <div className="empty-profile"><Users size={28} /><strong>Select a person</strong><p>Click a node on the map to inspect their profile.</p></div>}
          </aside>
        </div>
        <footer className="bottom-bar"><span><span className="status-dot" /> LOCAL PROTOTYPE</span><span>YOUR DATA STAYS IN THIS BROWSER FOR NOW</span><button onClick={resetDemo}>Reset demo data</button></footer>
      </section>

      {showAdd && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAdd(false); }}><form className="add-modal" onSubmit={(event) => { event.preventDefault(); addPerson(); }}><div className="modal-heading"><div><span className="eyebrow">EXPAND YOUR WORLD</span><h2>Add a person</h2></div><button type="button" className="icon-button" onClick={() => setShowAdd(false)} aria-label="Close"><X size={18} /></button></div><label className="field-label">NAME<input autoFocus value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="e.g. Taylor Morgan" maxLength={80} /></label><label className="field-label">RELATIONSHIP TO YOU<select value={newRole} onChange={(event) => setNewRole(event.target.value)}><option>Friend</option><option>Close friend</option><option>Family</option><option>Classmate</option><option>Work</option><option>Acquaintance</option><option>Other</option></select></label><p className="modal-note">This adds a profile node. You can create relationships by connecting nodes directly on the graph.</p><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowAdd(false)}>Cancel</button><button className="primary-button" type="submit" disabled={!newName.trim()}><Plus size={15} /> Create profile</button></div></form></div>}
    </main>
  );
}
