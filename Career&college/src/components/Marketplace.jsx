import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen, CheckCircle2, ChevronDown, Download, Edit3, IndianRupee,
  LibraryBig, Loader2, PackageOpen, Plus, Search, ShoppingBag, Trash2,
  Upload, X,
} from 'lucide-react';
import MarketplaceListingForm from './MarketplaceListingForm';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['All', 'Notes', 'Previous Year Question Papers (PYQs)', 'Study Guides', 'Used Books'];

function formatPrice(price) {
  return Number(price) === 0 ? 'Free' : `₹${Number(price).toLocaleString('en-IN')}`;
}

function isPhysical(listing) {
  return listing.resourceType === 'Physical used book' || listing.category === 'Used Books';
}

function toListing(row, profiles) {
  return {
    id: row.id,
    sellerId: row.seller_id,
    sellerName: profiles.get(row.seller_id) || 'Campus360 member',
    title: row.title,
    category: row.category,
    subject: row.subject,
    course: row.course,
    semester: row.semester,
    college: row.college_name || '',
    description: row.description,
    resourceType: row.resource_type,
    price: Number(row.price_inr),
    condition: row.condition,
    contact: row.contact_details,
    assetPath: row.asset_path,
    imagePath: row.image_path,
    status: row.status,
    createdAt: row.created_at,
  };
}

export default function Marketplace({ activeSection, onNavigate, workspaceOffset = 0, user }) {
  // The app session can briefly lag behind Supabase auth (for example right
  // after signing in). Resolve the live auth user so a signed-in student is
  // never treated as a guest.
  const [resolvedUser, setResolvedUser] = useState(() => (user?.id ? user : null));
  useEffect(() => {
    if (user?.id) return undefined;
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active || !data?.user) return;
      setResolvedUser({ id: data.user.id, name: data.user.user_metadata?.full_name || data.user.email || 'Campus360 member', email: data.user.email || '' });
    });
    return () => { active = false; };
  }, [user?.id]);

  const actingUser = user?.id ? user : resolvedUser;
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [subject, setSubject] = useState('Subject');
  const [priceFilter, setPriceFilter] = useState('Availability');
  const [sort, setSort] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(6);
  const [selected, setSelected] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState(null);

  const notify = useCallback((message, kind = 'success') => {
    setNotice({ message, kind });
    window.setTimeout(() => setNotice(null), 4000);
  }, []);

  const loadMarketplace = useCallback(async () => {
    setLoading(true);
    setDataError('');
    const listingResult = await supabase
      .from('marketplace_listings')
      .select('*')
      .order('created_at', { ascending: false });

    const [orderResult, requestResult] = actingUser?.id
      ? await Promise.all([
        supabase.from('marketplace_orders').select('*').eq('buyer_id', actingUser.id).order('created_at', { ascending: false }),
        supabase.from('marketplace_orders').select('*').eq('seller_id', actingUser.id).order('created_at', { ascending: false }),
      ])
      : [{ data: [], error: null }, { data: [], error: null }];

    const error = listingResult.error || orderResult.error || requestResult.error;
    if (error) {
      setListings([]);
      setOrders([]);
      setRequests([]);
      setDataError(error.code === 'PGRST205' || error.code === '42P01'
        ? 'The Learn & Earn database schema has not been applied yet.'
        : 'Could not load Learn & Earn data. Please try again.');
      setLoading(false);
      return;
    }

    const sellerIds = [...new Set(listingResult.data.map((row) => row.seller_id))];
    let profiles = new Map();
    if (sellerIds.length) {
      const { data: profileRows } = await supabase.from('profiles').select('id, display_name').in('id', sellerIds);
      profiles = new Map((profileRows || []).map((profile) => [profile.id, profile.display_name]));
    }
    setListings((listingResult.data || []).map((row) => toListing(row, profiles)));
    setOrders(orderResult.data || []);
    setRequests(requestResult.data || []);
    setLoading(false);
  }, [actingUser?.id]);

  useEffect(() => { loadMarketplace(); }, [loadMarketplace]);
  useEffect(() => { setVisibleCount(6); }, [query, category, subject, priceFilter, sort]);

  const published = listings.filter((item) => item.status === 'published');
  const myListings = listings.filter((item) => item.sellerId === actingUser?.id);
  const subjects = ['Subject', 'All', ...new Set(published.map((item) => item.subject))];
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return published.filter((item) => {
      const searchable = `${item.title} ${item.subject} ${item.course} ${item.college} ${item.category}`.toLowerCase();
      return (!normalizedQuery || searchable.includes(normalizedQuery))
        && (category === 'All' || item.category === category)
        && (subject === 'Subject' || subject === 'All' || item.subject === subject)
        && (priceFilter === 'Availability' || priceFilter === 'All'
          || (priceFilter === 'Free' ? item.price === 0 : priceFilter === 'Under 100' ? item.price > 0 && item.price < 100 : item.price >= 100));
    }).sort((left, right) => {
      if (sort === 'price-low') return left.price - right.price;
      if (sort === 'price-high') return right.price - left.price;
      return new Date(right.createdAt) - new Date(left.createdAt);
    });
  }, [published, query, category, subject, priceFilter, sort]);

  const completedOrders = orders.filter((order) => order.status === 'completed');
  const earnings = requests.filter((order) => order.status === 'completed').reduce((total, order) => total + Number(order.amount_inr), 0);

  const saveListing = async (form) => {
    if (!actingUser?.id) return notify('Sign in with a Campus360 account before publishing a resource.', 'error');
    const physical = form.category === 'Used Books' || form.type === 'Physical used book';
    let assetPath = editing?.assetPath || null;
    let imagePath = editing?.imagePath || null;

    if (form.file) {
      const safeName = form.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${actingUser.id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from('campus360-assets').upload(path, form.file, { contentType: form.file.type, upsert: false });
      if (uploadError) return notify(`Upload failed: ${uploadError.message}`, 'error');
      if (physical) imagePath = path;
      else assetPath = path;
    }

    const payload = {
      seller_id: actingUser.id,
      title: form.title.trim(),
      category: form.category,
      subject: form.subject.trim(),
      course: form.course.trim(),
      semester: form.semester.trim(),
      college_name: form.college.trim() || null,
      description: form.description.trim(),
      resource_type: form.type,
      price_inr: Number(form.price),
      condition: physical ? form.condition : null,
      contact_details: physical ? form.contact.trim() || null : null,
      asset_path: physical ? null : assetPath,
      image_path: physical ? imagePath : null,
      status: 'published',
    };
    const request = editing
      ? supabase.from('marketplace_listings').update(payload).eq('id', editing.id).eq('seller_id', actingUser.id)
      : supabase.from('marketplace_listings').insert(payload);
    const { error } = await request;
    if (error) return notify(`Could not save listing: ${error.message}`, 'error');
    setEditing(null);
    setShowUpload(false);
    notify(editing ? 'Listing updated.' : 'Resource published for all signed-in students to browse.');
    loadMarketplace();
  };

  const removeListing = async (listing) => {
    if (!window.confirm(`Delete “${listing.title}”? This cannot be undone.`)) return;
    const { error } = await supabase.from('marketplace_listings').delete().eq('id', listing.id).eq('seller_id', actingUser.id);
    if (error) return notify(`Could not delete listing: ${error.message}`, 'error');
    notify('Listing deleted.');
    loadMarketplace();
  };

  const togglePublished = async (listing) => {
    const status = listing.status === 'published' ? 'archived' : 'published';
    const { error } = await supabase.from('marketplace_listings').update({ status }).eq('id', listing.id).eq('seller_id', actingUser.id);
    if (error) return notify(`Could not update listing: ${error.message}`, 'error');
    notify(status === 'published' ? 'Listing published.' : 'Listing unpublished.');
    loadMarketplace();
  };

  const requestResource = async (listing) => {
    if (!actingUser?.id) return notify('Sign in to request a resource.', 'error');
    if (listing.sellerId === actingUser.id) return notify('You cannot request your own listing.', 'error');
    if (orders.some((order) => order.listing_id === listing.id && order.status !== 'cancelled')) return notify('You already have an access request for this resource.', 'error');
    const { error } = await supabase.from('marketplace_orders').insert({
      listing_id: listing.id,
      buyer_id: actingUser.id,
      seller_id: listing.sellerId,
      amount_inr: listing.price,
      status: listing.price === 0 && !isPhysical(listing) ? 'completed' : 'requested',
    });
    if (error) return notify(`Could not create request: ${error.message}`, 'error');
    setSelected(null);
    notify(listing.price === 0 && !isPhysical(listing) ? 'Free access is now available in My Purchases.' : 'Your request was sent to the seller.');
    loadMarketplace();
  };

  const openResource = async (listing) => {
    if (!listing.assetPath) return notify('This resource does not have a downloadable file.', 'error');
    const { data, error } = await supabase.storage.from('campus360-assets').createSignedUrl(listing.assetPath, 60);
    if (error) return notify(`Could not open resource: ${error.message}`, 'error');
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };  const openListingForm = () => {
    if (!actingUser?.id) return notify('Sign in with your Campus360 account to list a resource.', 'error');
    setEditing(null);
    setShowUpload(true);
  };

  if (loading) return <div className="grid min-h-[320px] place-items-center rounded-2xl border border-slate-200 bg-white"><div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Loading Learn & Earn…</div></div>;

  return <div className="relative mx-auto max-w-7xl space-y-6 pb-10">
    {notice && <div role="status" className={`fixed right-5 top-5 z-[70] flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${notice.kind === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}><CheckCircle2 className="h-4 w-4" />{notice.message}</div>}
    {dataError && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">{dataError}</div>}
    <div className="flex justify-end sm:absolute sm:right-0 sm:-top-[76px]"><button onClick={openListingForm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"><Plus className="h-4 w-4" />List a resource</button></div>

    {activeSection === 'dashboard' && <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={PackageOpen} label="Resources listed" value={published.length} /><Metric icon={Upload} label="My uploaded resources" value={myListings.length} onClick={() => onNavigate('listings')} /><Metric icon={LibraryBig} label="My purchases" value={orders.length} onClick={() => onNavigate('purchases')} /><Metric icon={IndianRupee} label="My earnings" value={formatPrice(earnings)} /></div>
      <BrowsePanel {...{ query, setQuery, category, setCategory, subject, setSubject, priceFilter, setPriceFilter, sort, setSort, subjects, filtered, visibleCount, setVisibleCount, setSelected, dataError }} />
    </>}
    {activeSection === 'purchases' && <Purchases orders={orders} listings={listings} onBrowse={() => onNavigate('dashboard')} onOpen={openResource} />}
    {activeSection === 'listings' && <Listings listings={myListings} requests={requests} onEdit={(listing) => { setEditing({ ...listing, type: listing.resourceType, fileName: listing.assetPath ? 'Current file uploaded' : '', imageName: listing.imagePath ? 'Current image uploaded' : '' }); setShowUpload(true); }} onDelete={removeListing} onToggle={togglePublished} onAdd={openListingForm} />}
    {showUpload && <MarketplaceListingForm initial={editing} onClose={() => { setShowUpload(false); setEditing(null); }} onSave={saveListing} workspaceOffset={workspaceOffset} />}
    {selected && <Details listing={selected} purchased={completedOrders.some((order) => order.listing_id === selected.id)} ownListing={selected.sellerId === actingUser?.id} onClose={() => setSelected(null)} onRequest={() => requestResource(selected)} onOpen={() => openResource(selected)} />}
  </div>;
}

function Metric({ icon: Icon, label, value, onClick }) { return <button type="button" onClick={onClick} className={`rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm ${onClick ? 'transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md' : 'cursor-default'}`}><Icon className="h-5 w-5 text-blue-600" /><div className="mt-3 text-2xl font-extrabold text-slate-900">{value}</div><div className="mt-1 text-xs font-semibold text-slate-500">{label}</div></button>; }

function BrowsePanel(props) { const { query, setQuery, category, setCategory, subject, setSubject, priceFilter, setPriceFilter, sort, setSort, subjects, filtered, visibleCount, setVisibleCount, setSelected, dataError } = props; return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-slate-900">Browse resources</h2><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5"><Select value={category} setValue={setCategory} options={CATEGORIES} /><Select value={subject} setValue={setSubject} options={subjects} /><Select value={priceFilter} setValue={setPriceFilter} options={['Availability', 'All', 'Free', 'Under 100', '100 and above']} /><Select value={sort} setValue={setSort} options={['newest', 'price-low', 'price-high']} display={(value) => ({ newest: 'Newest first', 'price-low': 'Price: low to high', 'price-high': 'Price: high to low' })[value]} /><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500" placeholder="Search resources…" /></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.slice(0, visibleCount).map((listing) => <ResourceCard key={listing.id} listing={listing} onView={() => setSelected(listing)} />)}</div>{filtered.length === 0 && <Empty title={dataError ? 'Resources unavailable' : 'No resources yet'} text={dataError ? 'Apply the Supabase schema, then refresh this page.' : 'Resources published by Campus360 students will appear here.'} />}{visibleCount < filtered.length && <div className="mt-5 text-center"><button onClick={() => setVisibleCount((count) => count + 6)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Load more</button></div>}</section>; }

function Select({ value, setValue, options, display = (entry) => entry }) { return <div className="relative"><select value={value} onChange={(event) => setValue(event.target.value)} className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500">{options.map((item) => <option key={item} value={item}>{display(item)}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-slate-400" /></div>; }

function ResourceCard({ listing, onView }) { return <article className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex h-28 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"><BookOpen className="h-9 w-9 text-blue-600" /></div><div className="p-4"><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">{listing.category}</span><span className="text-sm font-extrabold text-slate-900">{formatPrice(listing.price)}</span></div><h3 className="mt-3 line-clamp-2 font-bold text-slate-900">{listing.title}</h3><p className="mt-1 text-xs text-slate-500">{listing.subject}</p>{isPhysical(listing) && <span className="mt-2 inline-block rounded bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">Condition: {listing.condition}</span>}<div className="mt-4 flex items-center justify-between"><span className="text-xs text-slate-500">By {listing.sellerName}</span><button onClick={onView} className="text-xs font-bold text-blue-600 hover:text-blue-800">View details</button></div></div></article>; }

function Details({ listing, purchased, ownListing, onClose, onRequest, onOpen }) { const physical = isPhysical(listing); const canOpen = purchased && !physical; return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-slate-200 p-5"><div><span className="text-xs font-bold uppercase tracking-wide text-blue-600">{listing.category}</span><h2 className="mt-1 text-xl font-extrabold text-slate-900">{listing.title}</h2></div><button onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><X /></button></div><div className="space-y-5 p-5"><div className="grid gap-4 sm:grid-cols-[160px_1fr]"><div className="flex h-40 items-center justify-center rounded-xl bg-blue-50"><BookOpen className="h-12 w-12 text-blue-600" /></div><div><p className="text-sm leading-6 text-slate-600">{listing.description}</p><dl className="mt-3 grid grid-cols-2 gap-2 text-xs"><Info label="Subject" value={listing.subject} /><Info label="Course" value={listing.course} /><Info label="Seller" value={listing.sellerName} /></dl></div></div>{physical && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Used book condition: <b>{listing.condition}</b>. Request the seller to arrange collection and payment.</div>}<div className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><div><div className="text-xs font-semibold text-slate-500">{physical ? 'Listed price' : 'Access price'}</div><div className="text-2xl font-extrabold text-slate-900">{formatPrice(listing.price)}</div></div>{ownListing ? <span className="text-sm font-bold text-slate-500">Your listing</span> : <button onClick={canOpen ? onOpen : onRequest} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">{canOpen ? <Download className="h-4 w-4" /> : physical ? <ShoppingBag className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{canOpen ? 'Open resource' : physical ? 'Request from seller' : listing.price === 0 ? 'Get free access' : 'Request access'}</button>}</div></div></div></div>; }

function Info({ label, value }) { return <div><dt className="text-slate-400">{label}</dt><dd className="font-semibold text-slate-700">{value}</dd></div>; }
function Empty({ title, text }) { return <div className="py-12 text-center"><PackageOpen className="mx-auto h-9 w-9 text-slate-300" /><h3 className="mt-3 font-bold text-slate-700">{title}</h3><p className="mt-1 text-sm text-slate-500">{text}</p></div>; }

function Purchases({ orders, listings, onBrowse, onOpen }) { const records = orders.map((order) => ({ order, listing: listings.find((item) => item.id === order.listing_id) })).filter((item) => item.listing); return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-900">My Purchases</h2><p className="mt-1 text-xs text-slate-500">Only completed digital-resource requests can be downloaded.</p></div><button onClick={onBrowse} className="text-sm font-bold text-blue-600">Browse resources</button></div>{records.length ? <div className="mt-5 divide-y divide-slate-100">{records.map(({ order, listing }) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><div className="font-bold text-slate-800">{listing.title}</div><div className="mt-1 text-xs text-slate-500">{listing.subject} · {formatPrice(order.amount_inr)} · {order.status}</div></div>{order.status === 'completed' && !isPhysical(listing) && <button onClick={() => onOpen(listing)} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"><Download className="h-4 w-4" />Open</button>}</div>)}</div> : <Empty title="No purchases yet" text="Resources you request will appear here." />}</section>; }

function Listings({ listings, requests, onEdit, onDelete, onToggle, onAdd }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-900">My Listings</h2><p className="mt-1 text-xs text-slate-500">Only you can edit, unpublish, or delete your own resources.</p></div><button onClick={onAdd} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white"><Plus className="h-4 w-4" />New listing</button></div>{listings.length ? <div className="mt-5 divide-y divide-slate-100">{listings.map((listing) => <div key={listing.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><div className="font-bold text-slate-800">{listing.title}</div><div className="mt-1 text-xs text-slate-500">{formatPrice(listing.price)} · <span className={listing.status === 'published' ? 'text-emerald-600' : 'text-slate-500'}>{listing.status}</span> · {requests.filter((request) => request.listing_id === listing.id).length} requests</div></div><div className="flex gap-2"><button onClick={() => onToggle(listing)} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-700">{listing.status === 'published' ? 'Unpublish' : 'Publish'}</button><button onClick={() => onEdit(listing)} className="rounded-lg border border-slate-300 p-1.5 text-slate-600"><Edit3 className="h-4 w-4" /></button><button onClick={() => onDelete(listing)} className="rounded-lg border border-rose-200 p-1.5 text-rose-600"><Trash2 className="h-4 w-4" /></button></div></div>)}</div> : <Empty title="You have not listed a resource" text="Upload notes, PYQs, study guides, or a used book to get started." />}</section>; }
