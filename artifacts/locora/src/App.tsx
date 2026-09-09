import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowLeft, ArrowRight, Bell, Bookmark, BriefcaseBusiness, Check,
  ChevronDown, ChevronRight, CircleHelp, Compass, Heart, Home as HomeIcon,
  LocateFixed, MapPin, MessageCircle, Navigation, PackageSearch, Plus,
  Search, Send, Settings, SlidersHorizontal, Sparkles, Store, Tag,
  Timer, UserRound, UsersRound, X, Zap,
} from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';

type Category = 'All' | 'Food' | 'Home' | 'Fashion' | 'Electronics' | 'Beauty' | 'Services';
type Offer = { id: string; title: string; shop: string; category: Category; price: number; oldPrice?: number; distance: string; image: string; badge: string; shopId: string; description: string };
type Request = { id: string; title: string; category: Category; detail: string; radius: number; created: string; status: 'Live' | 'Matched' | 'Closed'; responses: number };
type ResponseItem = { id: string; shop: string; initials: string; price: number; eta: string; note: string; rating: number };

const images = {
  hero: 'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg?auto=compress&cs=tinysrgb&w=1200',
  biryani: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=700',
  chair: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=700',
  shoes: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=700',
  headphones: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=700',
  beauty: 'https://images.pexels.com/photos/7755515/pexels-photo-7755515.jpeg?auto=compress&cs=tinysrgb&w=700',
  flowers: 'https://images.pexels.com/photos/1458694/pexels-photo-1458694.jpeg?auto=compress&cs=tinysrgb&w=700',
};

const categories: { label: Category; short: string }[] = [
  { label: 'All', short: '◎' }, { label: 'Food', short: 'F' }, { label: 'Home', short: 'H' },
  { label: 'Fashion', short: 'W' }, { label: 'Electronics', short: 'E' }, { label: 'Beauty', short: 'B' }, { label: 'Services', short: 'S' },
];

const offers: Offer[] = [
  { id: 'biryani', title: 'Family biryani box', shop: 'Dum Pukht, Sector 137', shopId: 'dum-pukht', category: 'Food', price: 449, oldPrice: 560, distance: '1.8 km', image: images.biryani, badge: 'Popular nearby', description: 'A generous family box with aromatic basmati, two gravies and cooling raita. Ready for pickup in 25 minutes.' },
  { id: 'chair', title: 'Cane lounge chair', shop: 'Nivasa Living, Alpha 2', shopId: 'nivasa', category: 'Home', price: 2890, oldPrice: 3490, distance: '3.2 km', image: images.chair, badge: 'Save ₹600', description: 'Hand-finished natural cane with a deep, comfortable seat. One display piece available today.' },
  { id: 'sneakers', title: 'Everyday trainers', shop: 'Sole Story, Gaur City', shopId: 'sole-story', category: 'Fashion', price: 1499, oldPrice: 2199, distance: '4.6 km', image: images.shoes, badge: 'Last few', description: 'Lightweight everyday trainers in three colourways. Try before you buy at the Gaur City store.' },
  { id: 'audio', title: 'Noise-cancel earbuds', shop: 'Sound Garage, Sector 18', shopId: 'sound-garage', category: 'Electronics', price: 2299, oldPrice: 2999, distance: '5.1 km', image: images.headphones, badge: 'Fresh today', description: 'All-day battery, pocket-sized case and a clear call microphone. Local warranty included.' },
  { id: 'facial', title: 'Glow facial + head massage', shop: 'Mitti & Mist, Pari Chowk', shopId: 'mitti-mist', category: 'Beauty', price: 799, oldPrice: 1100, distance: '2.4 km', image: images.beauty, badge: 'Weekday offer', description: 'A 50-minute ritual for tired skin, finished with a calming head massage.' },
  { id: 'bouquet', title: 'Sunset vase bouquet', shop: 'Petal Room, Sector 50', shopId: 'petal-room', category: 'Services', price: 650, distance: '6.2 km', image: images.flowers, badge: 'Made to order', description: 'Seasonal local flowers arranged in a reusable ceramic vase. Same-day delivery within 7 km.' },
];

const shopData: Record<string, { name: string; initials: string; area: string; category: string; rating: string; reviews: string; about: string; image: string }> = {
  'dum-pukht': { name: 'Dum Pukht', initials: 'DP', area: 'Sector 137', category: 'North Indian kitchen', rating: '4.8', reviews: '128', about: 'Slow-cooked, fragrant food made in small batches for the neighbourhood. Pickup is usually faster than delivery.', image: images.biryani },
  nivasa: { name: 'Nivasa Living', initials: 'NL', area: 'Alpha 2', category: 'Home & furniture', rating: '4.7', reviews: '64', about: 'Useful objects for Indian homes — selected for good materials, honest pricing and a long life.', image: images.chair },
  'sole-story': { name: 'Sole Story', initials: 'SS', area: 'Gaur City', category: 'Footwear & accessories', rating: '4.6', reviews: '41', about: 'A neighbourhood footwear store with sizes you can actually try and advice from people who know the fit.', image: images.shoes },
  'sound-garage': { name: 'Sound Garage', initials: 'SG', area: 'Sector 18', category: 'Audio & gadgets', rating: '4.5', reviews: '89', about: 'Test headphones, speakers and everyday tech before taking them home. Local support included.', image: images.headphones },
  'mitti-mist': { name: 'Mitti & Mist', initials: 'MM', area: 'Pari Chowk', category: 'Beauty & wellness', rating: '4.9', reviews: '75', about: 'Slow beauty, thoughtful ingredients and an unhurried appointment in the heart of Pari Chowk.', image: images.beauty },
  'petal-room': { name: 'Petal Room', initials: 'PR', area: 'Sector 50', category: 'Flowers & gifting', rating: '4.8', reviews: '31', about: 'Seasonal flowers, warm wrapping and little gifts for the days you want to mark.', image: images.flowers },
};

const initialRequests: Request[] = [
  { id: 'r1', title: 'Looking for a study table under ₹6,000', category: 'Home', detail: 'Prefer wood or engineered wood, delivery this weekend.', radius: 5, created: '18 min ago', status: 'Live', responses: 3 },
  { id: 'r2', title: 'Need a birthday cake for Saturday', category: 'Food', detail: 'Chocolate, serves 8–10. Pickup near Sector 137.', radius: 4, created: 'Yesterday', status: 'Matched', responses: 5 },
  { id: 'r3', title: 'Reliable AC service for a 2BHK', category: 'Services', detail: 'Split ACs, preferably an afternoon visit.', radius: 8, created: '3 days ago', status: 'Closed', responses: 2 },
];

const responsePool: ResponseItem[] = [
  { id: 'a', shop: 'Wood & Grain Studio', initials: 'WG', price: 5490, eta: 'Can deliver tomorrow', note: 'Solid rubberwood top, two drawers. I can share a video before you decide.', rating: 4.8 },
  { id: 'b', shop: 'Nivasa Living', initials: 'NL', price: 5990, eta: 'Ready for pickup', note: 'One clean-lined desk in stock at Alpha 2. Delivery within 5 km.', rating: 4.7 },
  { id: 'c', shop: 'The Home Shelf', initials: 'HS', price: 4750, eta: 'Delivery in 2 days', note: 'Engineered wood, walnut finish. Assembly included at this price.', rating: 4.5 },
];

function SafeImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className="safe-image-fallback" role="img" aria-label={alt}>{alt.slice(0, 1)}</div> : <img src={src} alt={alt} onError={() => setFailed(true)} />;
}

function Brand() {
  return <Link href="/" className="brand" data-testid="link-brand"><span className="brand-mark">L</span><span>locora<small>nearby, made easy</small></span></Link>;
}

function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const nav = [
    { href: '/', label: 'Home', icon: HomeIcon },
    { href: '/requests', label: 'My requests', icon: Send },
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/profile', label: 'Profile', icon: UserRound },
  ];
  return <div className="app-shell">
    <aside className="desktop-nav">
      <Brand /><div className="nav-label">Your locora</div>
      <nav className="nav-list">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`nav-link ${location === href ? 'active' : ''}`} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon />{label}{label === 'Notifications' && <span className="nav-count">3</span>}</Link>)}</nav>
      <div className="nav-bottom"><div className="neighbour-pill"><span className="dot-live" />Live in Greater Noida</div><p className="subtle" style={{ marginTop: 10 }}>Local shops answer faster here.</p></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="topbar-location"><MapPin /><span>Greater Noida, Uttar Pradesh</span><ChevronDown size={14} /></div><div className="topbar-actions"><Link href="/notifications" className="icon-button" aria-label="Notifications" data-testid="button-notifications"><Bell /><span className="notification-dot" /></Link><Link href="/profile" className="avatar" data-testid="link-profile-avatar">AS</Link></div></header>
      {children}
    </main>
    <nav className="mobile-nav">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={location === href ? 'active' : ''} data-testid={`mobile-nav-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon />{label === 'My requests' ? 'Requests' : label}</Link>)}</nav>
  </div>;
}

function CategoryChips({ value, onChange }: { value: Category; onChange: (value: Category) => void }) {
  return <div className="category-row">{categories.map(category => <button key={category.label} className={`category-chip ${value === category.label ? 'active' : ''}`} onClick={() => onChange(category.label)} data-testid={`button-category-${category.label.toLowerCase()}`}><span className="category-symbol">{category.short}</span>{category.label}</button>)}</div>;
}

function OfferCard({ offer, saved, onSave }: { offer: Offer; saved: boolean; onSave: (id: string) => void }) {
  return <article className="offer-card" data-testid={`card-offer-${offer.id}`}>
    <div className="offer-image"><Link href={`/offer/${offer.id}`} data-testid={`link-offer-image-${offer.id}`}><SafeImage src={offer.image} alt={offer.title} /></Link><span className="offer-badge">{offer.badge}</span><button className={`save-button ${saved ? 'saved' : ''}`} aria-label={`Save ${offer.title}`} onClick={() => onSave(offer.id)} data-testid={`button-save-${offer.id}`}><Bookmark fill={saved ? 'currentColor' : 'none'} /></button></div>
    <div className="offer-info"><Link href={`/offer/${offer.id}`} className="offer-title" data-testid={`link-offer-${offer.id}`}>{offer.title}</Link><Link href={`/shop/${offer.shopId}`} className="offer-shop" data-testid={`link-shop-${offer.shopId}`}><Store />{offer.shop}</Link><div className="offer-bottom"><span className="price">₹{offer.price.toLocaleString('en-IN')}{offer.oldPrice && <del>₹{offer.oldPrice.toLocaleString('en-IN')}</del>}</span><span className="distance">{offer.distance}</span></div></div>
  </article>;
}

function Home({ onOpenRequest, requests, saved, onSave }: { onOpenRequest: () => void; requests: Request[]; saved: string[]; onSave: (id: string) => void }) {
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => offers.filter(item => (category === 'All' || item.category === category) && `${item.title} ${item.shop}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  return <div className="page">
    <section className="hero"><div className="hero-copy"><span className="eyebrow">Greater Noida's local layer</span><h1>Find it close.<br /><em>Ask Locora.</em></h1><p>Offers, shops and helpful humans around your everyday corners. Start with what you need — we'll bring the neighbourhood to you.</p><div className="hero-actions"><button className="button button-primary" onClick={onOpenRequest} data-testid="button-ask-locora"><Send size={16} />Ask the neighbourhood</button><Link href="/explore" className="button button-quiet" data-testid="link-browse-nearby">Browse nearby <ArrowRight size={15} /></Link></div></div><div className="hero-art"><SafeImage src={images.hero} alt="A busy local market street" /><div className="hero-tag"><strong>42</strong> shops answering now</div></div></section>
    <div className="search-box"><Search /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search for a shop, offer or something you need…" aria-label="Search nearby" data-testid="input-home-search" /><span className="search-shortcut">⌘ K</span></div>
    <section><div className="section-head"><div><span className="eyebrow">A little closer to home</span><h2>Offers near you</h2></div><Link href="/explore" className="text-button" data-testid="link-see-all-offers">See all <ArrowRight size={13} style={{ verticalAlign: 'middle' }} /></Link></div><CategoryChips value={category} onChange={setCategory} /><div className="offer-grid" style={{ marginTop: 18 }}>{filtered.slice(0, 6).map(offer => <OfferCard key={offer.id} offer={offer} saved={saved.includes(offer.id)} onSave={onSave} />)}</div>{filtered.length === 0 && <div className="empty-panel" style={{ marginTop: 17 }}><Search /><h3>No nearby matches yet</h3><p>Try a wider search or ask Locora to find it for you.</p><button className="button button-primary" onClick={onOpenRequest}>Make a request</button></div>}</section>
    <div className="home-columns"><section><div className="section-head"><div><span className="eyebrow">Your neighbourhood pulse</span><h2>Requests in motion</h2></div><Link href="/requests" className="text-button" data-testid="link-see-requests">View yours <ArrowRight size={13} style={{ verticalAlign: 'middle' }} /></Link></div><div className="request-list">{requests.slice(0, 2).map(request => <div className="request-item" key={request.id} data-testid={`card-request-${request.id}`}><div><div className="request-top"><span className={`status ${request.status.toLowerCase()}`}>{request.status}</span><span className="subtle">{request.created}</span></div><h3>{request.title}</h3><div className="request-meta"><span><MapPin />{request.radius} km radius</span><span><MessageCircle />{request.responses} responses</span></div></div><ChevronRight className="muted" /></div>)}</div></section><aside><div className="request-banner"><h3>Can't find it on the shelf?</h3><p>Tell local businesses what you need. The best answer might be two streets away.</p><button className="button" onClick={onOpenRequest} data-testid="button-create-request-banner"><Plus size={15} />Create a request</button></div><div className="local-note"><p>“The shortcut to a good find is knowing who to ask.”</p><span>— a Locora neighbour, Sector 137</span></div></aside></div>
  </div>;
}

function Explore({ saved, onSave }: { saved: string[]; onSave: (id: string) => void }) {
  const [category, setCategory] = useState<Category>('All');
  const [radius, setRadius] = useState(5);
  const [sort, setSort] = useState('nearby');
  const filtered = useMemo(() => offers.filter(item => category === 'All' || item.category === category).sort((a, b) => sort === 'price' ? a.price - b.price : sort === 'popular' ? a.title.localeCompare(b.title) : parseFloat(a.distance) - parseFloat(b.distance)), [category, sort]);
  return <div className="page"><div className="page-heading"><div><span className="eyebrow">Explore Greater Noida</span><h1>What's around<br /><span className="serif">your corner?</span></h1><p>Browse real offers from shops that are open and ready nearby.</p></div><div className="control-row"><label className="select-control" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><LocateFixed size={14} /> Within {radius} km<input type="range" min="1" max="10" value={radius} onChange={event => setRadius(Number(event.target.value))} aria-label="Search radius" data-testid="input-radius" /></label><select className="select-control" value={sort} onChange={event => setSort(event.target.value)} aria-label="Sort offers" data-testid="select-sort-offers"><option value="nearby">Closest first</option><option value="price">Lowest price</option><option value="popular">Shop name</option></select></div></div><div className="map-panel"><div className="map-road" /><div className="map-road secondary" /><span className="map-label l1">Knowledge Park</span><span className="map-label l2">Gaur City</span><span className="map-label l3">Pari Chowk</span><span className="map-label l4">Sector 137</span><div className="map-center" /><div className="map-pin pin-a"><MapPin /></div><div className="map-pin pin-b"><MapPin /></div><div className="map-pin pin-c"><MapPin /></div><div className="map-pin pin-d"><MapPin /></div><div className="radius-control">Searching {radius} km around you <input type="range" min="1" max="10" value={radius} onChange={event => setRadius(Number(event.target.value))} aria-label="Map radius" /></div><div className="map-legend"><strong>18 shops</strong> found in this circle</div></div><div className="section-head"><div><span className="eyebrow">Handpicked nearby</span><h2>{filtered.length * 3 + 6} things worth a look</h2></div><SlidersHorizontal size={19} color="#7b8d87" /></div><CategoryChips value={category} onChange={setCategory} /><div className="offer-grid" style={{ marginTop: 18 }}>{filtered.map(offer => <OfferCard key={offer.id} offer={offer} saved={saved.includes(offer.id)} onSave={onSave} />)}</div></div>;
}

function RequestForm({ onCancel, onCreated }: { onCancel?: () => void; onCreated: (request: Request) => void }) {
  const [title, setTitle] = useState(''); const [category, setCategory] = useState<Category>('All'); const [detail, setDetail] = useState(''); const [radius, setRadius] = useState(5); const [budget, setBudget] = useState('');
  const submit = (event: FormEvent) => { event.preventDefault(); if (!title.trim()) return; onCreated({ id: `r${Date.now()}`, title: title.trim(), category, detail: `${detail.trim()}${budget ? ` Budget up to ₹${budget}.` : ''}`, radius, created: 'Just now', status: 'Live', responses: 0 }); };
  return <form className="form-panel" onSubmit={submit}><div className="form-grid"><div className="field full-field"><label htmlFor="request-title">What are you looking for?</label><input id="request-title" value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. A compact work desk for my flat" required data-testid="input-request-title" /><span className="field-hint">Be specific — local shops can respond with something that fits.</span></div><div className="field"><label htmlFor="request-category">Category</label><select id="request-category" value={category} onChange={event => setCategory(event.target.value as Category)} data-testid="select-request-category"><option value="All">Anything goes</option>{categories.slice(1).map(item => <option key={item.label} value={item.label}>{item.label}</option>)}</select></div><div className="field"><label htmlFor="request-budget">Comfortable budget <span className="subtle">(optional)</span></label><input id="request-budget" type="number" value={budget} onChange={event => setBudget(event.target.value)} placeholder="₹ e.g. 5000" data-testid="input-request-budget" /></div><div className="field full-field"><label htmlFor="request-detail">A few useful details</label><textarea id="request-detail" value={detail} onChange={event => setDetail(event.target.value)} placeholder="Size, colour, when you need it, pickup or delivery…" data-testid="textarea-request-detail" /></div><div className="field full-field"><label>How far should we look?</label><div className="radio-row">{[3, 5, 8, 12].map(value => <button type="button" key={value} className={`radio-option ${radius === value ? 'selected' : ''}`} onClick={() => setRadius(value)} data-testid={`button-radius-${value}`}>{value} km</button>)}</div></div></div><div className="form-actions">{onCancel && <button type="button" className="button button-quiet" onClick={onCancel} data-testid="button-cancel-request">Not now</button>}<button className="button button-primary" type="submit" data-testid="button-submit-request"><Send size={15} />Broadcast request</button></div></form>;
}

function RequestModal({ onClose, onCreated }: { onClose: () => void; onCreated: (request: Request) => void }) {
  const [stage, setStage] = useState<'form' | 'matching' | 'results'>('form'); const [created, setCreated] = useState<Request | null>(null);
  const create = (request: Request) => { setCreated(request); onCreated(request); setStage('matching'); };
  useEffect(() => { if (stage === 'matching') { const timer = window.setTimeout(() => setStage('results'), 1900); return () => window.clearTimeout(timer); } return undefined; }, [stage]);
  return <div className="overlay" role="dialog" aria-modal="true"><div className="modal">{stage === 'form' && <><div className="modal-head"><div><span className="eyebrow">Ask the neighbourhood</span><h2>What should we find?</h2></div><button className="modal-close" onClick={onClose} aria-label="Close" data-testid="button-close-request"><X /></button></div><div className="modal-body"><RequestForm onCancel={onClose} onCreated={create} /></div></>}{stage === 'matching' && <div className="match-stage"><div><div className="orbit" /><h3>Broadcasting nearby</h3><p>We're checking shops and makers within {created?.radius} km of your location.</p><div className="progress-line"><i /></div></div></div>}{stage === 'results' && <><div className="modal-head"><div><span className="eyebrow">Your request is live</span><h2>Good answers are coming.</h2></div><button className="modal-close" onClick={onClose} aria-label="Close" data-testid="button-close-results"><X /></button></div><div className="modal-body"><div style={{ display: 'flex', gap: 10, alignItems: 'start', background: '#e7f3ed', padding: 14, marginBottom: 17 }}><Check color="#237b73" size={17} /><div><strong style={{ fontSize: 13 }}>Request sent to 18 nearby businesses</strong><p className="subtle" style={{ marginTop: 4 }}>We'll let you know as shops reply. You can keep browsing.</p></div></div><div className="response-list">{responsePool.map(item => <ResponseCard key={item.id} item={item} />)}</div><Link href="/requests" className="button button-outline full" style={{ marginTop: 16 }} onClick={onClose} data-testid="link-view-all-responses">View all responses <ArrowRight size={15} /></Link></div></>}</div></div>;
}

function ResponseCard({ item }: { item: ResponseItem }) {
  const [contacted, setContacted] = useState(false);
  return <div className="response-card" data-testid={`card-response-${item.id}`}><div className="response-avatar">{item.initials}</div><div><h3>{item.shop}</h3><p>{item.note}</p><p style={{ color: '#237b73', fontWeight: 700 }}>{item.eta} · {item.rating} rating</p></div><div className="response-price">₹{item.price.toLocaleString('en-IN')}<small>best local price</small></div><div className="response-actions"><button className={`button ${contacted ? 'button-teal' : 'button-primary'}`} onClick={() => setContacted(true)} data-testid={`button-contact-response-${item.id}`}>{contacted ? <><Check size={13} />Message sent</> : <><MessageCircle size={13} />Message shop</>}</button><button className="button button-quiet" onClick={() => window.alert(`Saved ${item.shop} to your shortlist.`)} data-testid={`button-save-response-${item.id}`}><Bookmark size={13} />Save</button></div></div>;
}

function Requests({ requests, onOpenRequest, onCreated }: { requests: Request[]; onOpenRequest: () => void; onCreated: (request: Request) => void }) {
  const [sort, setSort] = useState('recent'); const [selected, setSelected] = useState<Request | null>(null);
  const list = [...requests].sort((a, b) => sort === 'responses' ? b.responses - a.responses : 0);
  return <div className="page page-narrow"><div className="page-heading"><div><span className="eyebrow">Your neighbourhood asks</span><h1>Requests</h1><p>Broadcast once. Let nearby businesses come to you.</p></div><button className="button button-primary" onClick={onOpenRequest} data-testid="button-new-request"><Plus size={16} />New request</button></div>{requests.length > 0 && <div className="control-row" style={{ justifyContent: 'flex-end', marginBottom: 15 }}><select className="select-control" value={sort} onChange={event => setSort(event.target.value)} aria-label="Sort requests" data-testid="select-sort-requests"><option value="recent">Most recent</option><option value="responses">Most responses</option></select></div>}<div className="request-list">{list.map(request => <div className="request-item" key={request.id} data-testid={`row-request-${request.id}`}><div><div className="request-top"><span className={`status ${request.status.toLowerCase()}`}>{request.status}</span><span className="subtle">{request.created}</span><span className="subtle">· {request.category}</span></div><h3>{request.title}</h3><p className="subtle" style={{ marginBottom: 10 }}>{request.detail}</p><div className="request-meta"><span><MapPin />Within {request.radius} km</span><span><MessageCircle />{request.responses || 'No'} responses yet</span></div></div><button className="button button-outline" onClick={() => setSelected(request)} data-testid={`button-view-request-${request.id}`}>{request.responses ? 'View replies' : 'Manage'} <ChevronRight size={14} /></button></div>)}</div>{selected && <div className="overlay" role="dialog"><div className="modal"><div className="modal-head"><div><span className="eyebrow">{selected.status} request</span><h2>Replies for you</h2></div><button className="modal-close" onClick={() => setSelected(null)} aria-label="Close" data-testid="button-close-replies"><X /></button></div><div className="modal-body"><div className="request-item" style={{ marginBottom: 17 }}><div><h3>{selected.title}</h3><p className="subtle" style={{ marginTop: 6 }}>{selected.detail}</p></div></div>{selected.responses ? <><div className="control-row" style={{ justifyContent: 'flex-end', marginBottom: 11 }}><span className="subtle">Sort by</span><select className="select-control" aria-label="Sort responses"><option>Best match</option><option>Lowest price</option><option>Fastest</option></select></div><div className="response-list">{responsePool.slice(0, selected.responses > 3 ? 3 : 2).map(item => <ResponseCard key={item.id} item={item} />)}</div></> : <div className="empty-panel"><Timer /><h3>Still listening nearby</h3><p>Shops have until tomorrow to send you a useful answer.</p></div>}</div></div></div>}</div>;
}

function OfferDetail({ offerId, saved, onSave, onOpenRequest }: { offerId: string; saved: string[]; onSave: (id: string) => void; onOpenRequest: () => void }) {
  const offer = offers.find(item => item.id === offerId) || offers[0];
  return <div className="page"><Link href="/explore" className="back-link" data-testid="link-back-explore"><ArrowLeft />Back to explore</Link><section className="detail-hero"><div className="detail-image"><SafeImage src={offer.image} alt={offer.title} /></div><div className="detail-copy"><span className="eyebrow">{offer.category} · {offer.badge}</span><h1>{offer.title}</h1><p>{offer.description}</p><div className="detail-price">₹{offer.price.toLocaleString('en-IN')}{offer.oldPrice && <del>₹{offer.oldPrice.toLocaleString('en-IN')}</del>}</div><div className="detail-shop"><span className="shop-avatar">{(shopData[offer.shopId]?.initials || 'LS')}</span><Link href={`/shop/${offer.shopId}`} data-testid={`link-detail-shop-${offer.shopId}`}><strong>{offer.shop}</strong><span>{offer.distance} away · Open until 9 pm</span></Link><ChevronRight size={16} style={{ marginLeft: 'auto' }} /></div><div className="detail-meta"><div><Timer />Pickup in 25 min</div><div><MapPin />{offer.distance}</div></div><div style={{ display: 'flex', gap: 9 }}><button className="button button-primary" onClick={onOpenRequest} data-testid="button-ask-about-offer"><MessageCircle size={15} />Ask the shop</button><button className={`button ${saved.includes(offer.id) ? 'button-teal' : 'button-outline'}`} onClick={() => onSave(offer.id)} data-testid="button-save-offer-detail"><Bookmark size={15} />{saved.includes(offer.id) ? 'Saved' : 'Save offer'}</button></div></div></section><section style={{ maxWidth: 800, marginTop: 42 }}><span className="eyebrow">Good to know</span><h2 style={{ marginTop: 8 }}>Made for a quick local decision.</h2><p className="muted" style={{ lineHeight: 1.7, marginTop: 12, fontSize: 14 }}>This offer is listed by a verified Greater Noida business. Message the shop for availability, size details or a hold before you make the trip.</p></section></div>;
}

function ShopProfile({ shopId, saved, onSave }: { shopId: string; saved: string[]; onSave: (id: string) => void }) {
  const shop = shopData[shopId] || shopData['dum-pukht']; const shopOffers = offers.filter(item => item.shopId === shopId);
  return <div className="page"><Link href="/explore" className="back-link" data-testid="link-back-shop"><ArrowLeft />Back to explore</Link><section className="shop-head"><div className="shop-logo">{shop.initials}</div><div><h1>{shop.name}</h1><p>{shop.category} · {shop.area}</p><div className="shop-stats"><span><strong>{shop.rating}</strong> rating</span><span><strong>{shop.reviews}</strong> local reviews</span><span><strong>Open</strong> until 9 pm</span></div></div></section><div style={{ maxWidth: 700, padding: '23px 0 30px' }}><p className="muted" style={{ lineHeight: 1.65, fontSize: 14 }}>{shop.about}</p><button className="button button-outline" style={{ marginTop: 16 }} onClick={() => window.alert(`Message request sent to ${shop.name}.`)} data-testid="button-message-shop"><MessageCircle size={15} />Message shop</button></div><div className="section-head"><div><span className="eyebrow">From this shop</span><h2>Current offers</h2></div><span className="subtle">{shopOffers.length || 0} listed nearby</span></div><div className="offer-grid">{(shopOffers.length ? shopOffers : offers.slice(0, 3)).map(offer => <OfferCard key={offer.id} offer={offer} saved={saved.includes(offer.id)} onSave={onSave} />)}</div></div>;
}

function Notifications() {
  const notes = [{ icon: MessageCircle, title: 'Nivasa Living replied to your request', text: 'A study table at ₹5,990 is ready for pickup in Alpha 2.', time: '12 min ago' }, { icon: Tag, title: 'A new offer near Sector 137', text: 'Family biryani box from Dum Pukht is ₹449 today.', time: '1 hr ago' }, { icon: Sparkles, title: 'Welcome to Locora', text: 'Set your location once and your neighbourhood gets closer.', time: 'Yesterday' }];
  return <div className="page page-narrow"><div className="page-heading"><div><span className="eyebrow">Stay in the loop</span><h1>Notifications</h1><p>Useful nudges, never a noisy inbox.</p></div><button className="text-button" onClick={() => window.alert('All notifications marked as read.')} data-testid="button-mark-read">Mark all read</button></div><div className="notice-list">{notes.map((note, index) => { const Icon = note.icon; return <div className="notice" key={note.title} data-testid={`notice-${index}`}><div className="notice-icon"><Icon size={17} /></div><div><h3>{note.title}</h3><p>{note.text}</p></div><time>{note.time}</time></div>; })}</div></div>;
}

function Profile() {
  const [radius, setRadius] = useState(5); const [saved, setSaved] = useState(true);
  return <div className="page page-narrow"><div className="profile-card"><div className="profile-main"><div className="profile-avatar">AS</div><div><h2>Ananya Sharma</h2><p>Neighbour since March 2024 · Sector 137</p></div></div><button className="button button-quiet" onClick={() => window.alert('Profile editing is ready for the next Locora release.')} data-testid="button-edit-profile">Edit profile</button></div><div className="section-head"><div><span className="eyebrow">Make Locora yours</span><h2>Preferences</h2></div></div><div className="settings-list"><button className="setting" onClick={() => window.alert('Location picker opened.')} data-testid="button-change-location"><MapPin /><span>Home location<small>Sector 137, Greater Noida</small></span><ChevronRight /></button><label className="setting"><LocateFixed /><span>Search radius<small>Find shops within {radius} km</small></span><input type="range" min="1" max="12" value={radius} onChange={event => setRadius(Number(event.target.value))} aria-label="Profile search radius" data-testid="input-profile-radius" /></label><button className="setting" onClick={() => setSaved(!saved)} data-testid="button-toggle-saved"><Bookmark /><span>Saved offers<small>{saved ? '6 offers bookmarked' : 'No saved offers yet'}</small></span><ChevronRight /></button><button className="setting" onClick={() => window.alert('Help centre opened.')} data-testid="button-help"><CircleHelp /><span>Help & feedback<small>Tell us how Locora feels</small></span><ChevronRight /></button><button className="setting" onClick={() => window.alert('You are already on the latest Locora build.')} data-testid="button-about"><Zap /><span>About Locora<small>Version 0.8 · Built for nearby</small></span><ChevronRight /></button></div></div>;
}

function AppRouter() {
  const [requestOpen, setRequestOpen] = useState(false); const [requests, setRequests] = useState<Request[]>(initialRequests); const [saved, setSaved] = useState<string[]>(['biryani']); const [toast, setToast] = useState('');
  const saveOffer = (id: string) => { setSaved(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]); setToast(saved.includes(id) ? 'Removed from saved offers' : 'Saved for later'); window.setTimeout(() => setToast(''), 2200); };
  const addRequest = (request: Request) => setRequests(current => [request, ...current]);
  return <AppShell><Switch><Route path="/"><Home requests={requests} saved={saved} onSave={saveOffer} onOpenRequest={() => setRequestOpen(true)} /></Route><Route path="/explore"><Explore saved={saved} onSave={saveOffer} /></Route><Route path="/requests"><Requests requests={requests} onCreated={addRequest} onOpenRequest={() => setRequestOpen(true)} /></Route><Route path="/notifications" component={Notifications} /><Route path="/profile" component={Profile} /><Route path="/offer/:id">{params => <OfferDetail offerId={params.id} saved={saved} onSave={saveOffer} onOpenRequest={() => setRequestOpen(true)} />}</Route><Route path="/shop/:id">{params => <ShopProfile shopId={params.id} saved={saved} onSave={saveOffer} />}</Route><Route component={NotFound} /></Switch>{requestOpen && <RequestModal onClose={() => setRequestOpen(false)} onCreated={addRequest} />}{toast && <div className="toast" role="status" data-testid="status-save-toast">{toast}</div>}</AppShell>;
}

export default function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><AppRouter /></WouterRouter>;
}