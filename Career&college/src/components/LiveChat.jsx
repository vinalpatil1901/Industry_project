import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Loader2, MessageCircle, Search, Send, UserPlus, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

function initials(name) {
  return (name || 'Campus360 member').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date(timestamp));
}

function pairFor(first, second) {
  return [first, second].sort();
}

export default function LiveChat({ user }) {
  const [profiles, setProfiles] = useState([]);
  const [connections, setConnections] = useState([]);
  const [activePerson, setActivePerson] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadPeople = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const [profileResult, connectionResult] = await Promise.all([
      supabase.from('profiles').select('id, display_name, college_name, course').neq('id', user.id).order('display_name'),
      supabase.from('community_connections').select('*').order('created_at', { ascending: false }),
    ]);
    const failure = profileResult.error || connectionResult.error;
    if (failure) {
      setError(failure.code === 'PGRST205' || failure.code === '42P01'
        ? 'Community setup is required before connections and messages can be used.'
        : 'Could not load the community. Please refresh and try again.');
      setProfiles([]);
      setConnections([]);
    } else {
      setProfiles(profileResult.data || []);
      setConnections(connectionResult.data || []);
    }
    setLoading(false);
  }, [user?.id]);

  const loadMessages = useCallback(async (id) => {
    if (!id) {
      setMessages([]);
      return;
    }
    const { data, error: messageError } = await supabase
      .from('community_direct_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at');
    if (messageError) {
      setError('Could not load this conversation.');
      return;
    }
    setMessages(data || []);
  }, []);

  useEffect(() => { loadPeople(); }, [loadPeople]);

  useEffect(() => {
    if (!conversationId) return undefined;
    loadMessages(conversationId);
    const channel = supabase.channel(`direct-chat-${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_direct_messages', filter: `conversation_id=eq.${conversationId}` }, () => loadMessages(conversationId))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, loadMessages]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const channel = supabase.channel(`connections-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_connections' }, loadPeople)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadPeople, user?.id]);

  const relationByPerson = useMemo(() => new Map(connections.map((connection) => [connection.requester_id === user?.id ? connection.recipient_id : connection.requester_id, connection])), [connections, user?.id]);
  const acceptedPeople = useMemo(() => profiles.filter((profile) => relationByPerson.get(profile.id)?.status === 'accepted'), [profiles, relationByPerson]);
  const incomingRequests = useMemo(() => profiles.filter((profile) => { const relation = relationByPerson.get(profile.id); return relation?.status === 'pending' && relation.recipient_id === user?.id; }), [profiles, relationByPerson, user?.id]);
  const filteredProfiles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return profiles.filter((profile) => !needle || `${profile.display_name} ${profile.college_name || ''} ${profile.course || ''}`.toLowerCase().includes(needle));
  }, [profiles, query]);

  const sendConnectionRequest = async (person) => {
    setNotice('');
    const { error: requestError } = await supabase.from('community_connections').insert({ requester_id: user.id, recipient_id: person.id });
    if (requestError) return setError(`Could not send request: ${requestError.message}`);
    setNotice(`Connection request sent to ${person.display_name}.`);
    loadPeople();
  };

  const respondToRequest = async (person, status) => {
    const relation = relationByPerson.get(person.id);
    if (!relation) return;
    const { error: responseError } = await supabase.from('community_connections').update({ status }).eq('id', relation.id);
    if (responseError) return setError(`Could not update request: ${responseError.message}`);
    setNotice(status === 'accepted' ? `You are now connected with ${person.display_name}.` : 'Connection request declined.');
    loadPeople();
  };

  const openConversation = async (person) => {
    const [participantOne, participantTwo] = pairFor(user.id, person.id);
    setError('');
    setActivePerson(person);
    const { data: existing, error: findError } = await supabase
      .from('community_direct_conversations')
      .select('id')
      .eq('participant_one_id', participantOne)
      .eq('participant_two_id', participantTwo)
      .maybeSingle();
    if (findError) return setError('Could not open this conversation.');
    if (existing) {
      setConversationId(existing.id);
      return;
    }
    const { data: created, error: createError } = await supabase
      .from('community_direct_conversations')
      .insert({ participant_one_id: participantOne, participant_two_id: participantTwo })
      .select('id')
      .single();
    if (createError) return setError(`Could not start conversation: ${createError.message}`);
    setConversationId(created.id);
  };

  const sendMessage = async () => {
    const body = draft.trim();
    if (!body || !conversationId) return;
    setDraft('');
    const { error: sendError } = await supabase.from('community_direct_messages').insert({ conversation_id: conversationId, sender_id: user.id, body });
    if (sendError) {
      setDraft(body);
      setError(`Could not send message: ${sendError.message}`);
      return;
    }
    loadMessages(conversationId);
  };

  if (!user?.id) return <Empty title="Sign in to use Community" text="Guest sessions cannot view connections or message other students." />;
  if (loading) return <div className="grid min-h-[420px] place-items-center rounded-2xl border border-slate-200 bg-white"><div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Loading community…</div></div>;
  return <section className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    {error && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><span className="font-semibold">{error} The Connections screen remains available; retry after the database migration finishes.</span><button type="button" onClick={loadPeople} className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-extrabold text-amber-900 transition hover:bg-amber-100">Retry</button></div>}
    {notice && <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{notice}</div>}
    <div className="grid min-h-[620px] lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="border-b border-slate-200 bg-slate-50 p-4 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between"><h2 className="text-sm font-extrabold text-slate-900">Connections</h2><span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{acceptedPeople.length}</span></div>
        <div className="mt-3 space-y-1">{acceptedPeople.length ? acceptedPeople.map((person) => <PersonButton key={person.id} person={person} active={activePerson?.id === person.id} onClick={() => openConversation(person)} />) : <p className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-4 text-xs leading-5 text-slate-500">No connections yet. Send a request from the student list below to start chatting.</p>}</div>
        {incomingRequests.length > 0 && <><h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-slate-400">Requests for you</h3><div className="mt-2 space-y-2">{incomingRequests.map((person) => <div key={person.id} className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-sm font-bold text-slate-800">{person.display_name}</p><p className="mt-0.5 text-xs text-slate-500">wants to connect</p><div className="mt-2 flex gap-2"><button onClick={() => respondToRequest(person, 'accepted')} className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-bold text-white">Accept</button><button onClick={() => respondToRequest(person, 'declined')} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-600">Decline</button></div></div>)}</div></>}
        <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-slate-400">Students</h3><div className="relative mt-2"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find students" className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-500" /></div><div className="mt-2 max-h-60 space-y-2 overflow-y-auto pr-1">{filteredProfiles.map((person) => <DirectoryPerson key={person.id} person={person} relation={relationByPerson.get(person.id)} currentUserId={user.id} onRequest={() => sendConnectionRequest(person)} onAccept={() => respondToRequest(person, 'accepted')} />)}{!filteredProfiles.length && <p className="px-1 py-3 text-xs text-slate-500">{error ? 'Student profiles will load here once the Community tables are ready.' : 'No other student profiles are available yet.'}</p>}</div>
      </aside>
      <main className="flex min-w-0 flex-col">{activePerson ? <><header className="flex items-center gap-3 border-b border-slate-200 px-5 py-4"><Avatar person={activePerson} /><div><h2 className="font-bold text-slate-900">{activePerson.display_name}</h2><p className="text-xs text-slate-500">{[activePerson.course, activePerson.college_name].filter(Boolean).join(' · ') || 'Campus360 connection'}</p></div></header><div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4 sm:p-5">{messages.length ? messages.map((message) => <Message key={message.id} message={message} mine={message.sender_id === user.id} />) : <div className="grid min-h-64 place-items-center text-center"><div><MessageCircle className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-600">No messages yet</p><p className="mt-1 text-sm text-slate-500">Start the conversation with {activePerson.display_name}.</p></div></div>}</div><footer className="border-t border-slate-200 bg-white p-3 sm:p-4"><div className="flex items-end gap-2"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} rows="1" placeholder={`Message ${activePerson.display_name}…`} className="max-h-28 min-h-11 flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><button onClick={sendMessage} disabled={!draft.trim() || !conversationId} className="rounded-xl bg-blue-600 p-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send message"><Send className="h-5 w-5" /></button></div></footer></> : <ConnectionsWelcome connectedCount={acceptedPeople.length} />}</main>
    </div>
  </section>;
}

function Avatar({ person }) { return <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-600 text-xs font-extrabold text-white">{initials(person.display_name)}</span>; }
function PersonButton({ person, active, onClick }) { return <button type="button" onClick={onClick} className={`flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left transition ${active ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-200/70'}`}><Avatar person={person} /><span className="min-w-0"><span className="block truncate text-sm font-bold">{person.display_name}</span><span className={`block truncate text-xs ${active ? 'text-blue-100' : 'text-slate-500'}`}>{person.course || 'Campus360 student'}</span></span></button>; }
function DirectoryPerson({ person, relation, currentUserId, onRequest, onAccept }) { const incoming = relation?.status === 'pending' && relation.recipient_id === currentUserId; return <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5"><Avatar person={person} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{person.display_name}</p><p className="truncate text-[11px] text-slate-500">{person.course || person.college_name || 'Campus360 student'}</p></div>{relation?.status === 'accepted' ? <Check className="h-4 w-4 text-emerald-600" /> : incoming ? <button onClick={onAccept} className="rounded-lg bg-blue-600 px-2 py-1.5 text-[10px] font-bold text-white">Accept</button> : relation?.status === 'pending' ? <span className="text-[10px] font-bold text-slate-400">Pending</span> : relation?.status === 'declined' ? <span className="text-[10px] font-bold text-slate-400">Declined</span> : <button onClick={onRequest} className="rounded-lg bg-blue-50 p-1.5 text-blue-700 hover:bg-blue-100" aria-label={`Connect with ${person.display_name}`}><UserPlus className="h-4 w-4" /></button>}</div>; }
function Message({ message, mine }) { return <article className={`flex max-w-[85%] gap-2 ${mine ? 'ml-auto flex-row-reverse' : ''}`}><span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-500 text-[9px] font-bold text-white">{mine ? 'YO' : 'C3'}</span><div className={`rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${mine ? 'rounded-tr-sm bg-blue-600 text-white' : 'rounded-tl-sm border border-slate-200 bg-white text-slate-700'}`}><p className="whitespace-pre-wrap leading-5">{message.body}</p><p className={`mt-1 text-right text-[10px] ${mine ? 'text-blue-100' : 'text-slate-400'}`}>{formatTime(message.created_at)}</p></div></article>; }
function ConnectionsWelcome({ connectedCount }) { return <div className="grid flex-1 place-items-center bg-slate-50/50 p-8 text-center"><div className="max-w-sm"><Users className="mx-auto h-12 w-12 text-slate-300" /><h2 className="mt-4 text-lg font-extrabold text-slate-700">{connectedCount ? 'Choose a connection to start chatting' : 'Build your connections first'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{connectedCount ? 'Select someone from your connections list. Your messages are private to the two connected students.' : 'Use the student list to send a connection request. Once it is accepted, the chat will appear here.'}</p></div></div>; }
function Empty({ title, text }) { return <section className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 p-8 text-center"><div><Users className="mx-auto h-10 w-10 text-slate-400" /><h2 className="mt-4 text-lg font-extrabold text-slate-600">{title}</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{text}</p></div></section>; }
