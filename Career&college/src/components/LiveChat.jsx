import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, MessageCircle, Send, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

function formatTime(timestamp) {
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date(timestamp));
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'C3';
}

export default function LiveChat({ selectedCareer, user }) {
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCommunity = useCallback(async () => {
    if (!user?.id) {
      setChannels([]);
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const { data: channelRows, error: channelError } = await supabase
      .from('community_channels')
      .select('*')
      .eq('is_active', true)
      .order('created_at');
    if (channelError) {
      setError(channelError.code === 'PGRST205' || channelError.code === '42P01'
        ? 'The Community database schema has not been applied yet.'
        : 'Could not load community discussions.');
      setChannels([]);
      setMessages([]);
      setLoading(false);
      return;
    }
    setChannels(channelRows || []);
    setActiveChannelId((current) => current && channelRows?.some((channel) => channel.id === current) ? current : channelRows?.[0]?.id || null);
    setLoading(false);
  }, [user?.id]);

  const loadMessages = useCallback(async () => {
    if (!activeChannelId || !user?.id) return;
    const { data: messageRows, error: messageError } = await supabase
      .from('community_messages')
      .select('*')
      .eq('channel_id', activeChannelId)
      .order('created_at');
    if (messageError) {
      setError('Could not load messages for this channel.');
      return;
    }
    const authorIds = [...new Set((messageRows || []).map((message) => message.author_id))];
    const { data: profiles } = authorIds.length
      ? await supabase.from('profiles').select('id, display_name').in('id', authorIds)
      : { data: [] };
    const names = new Map((profiles || []).map((profile) => [profile.id, profile.display_name]));
    setMessages((messageRows || []).map((message) => ({
      ...message,
      authorName: names.get(message.author_id) || 'Campus360 member',
    })));
  }, [activeChannelId, user?.id]);

  useEffect(() => { loadCommunity(); }, [loadCommunity]);
  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    if (!activeChannelId) return undefined;
    const channel = supabase.channel(`community-${activeChannelId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_messages', filter: `channel_id=eq.${activeChannelId}` }, loadMessages)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeChannelId, loadMessages]);

  const activeChannel = useMemo(() => channels.find((channel) => channel.id === activeChannelId), [channels, activeChannelId]);

  const sendMessage = async () => {
    const body = draft.trim();
    if (!body || !user?.id || !activeChannelId) return;
    setDraft('');
    const { error: sendError } = await supabase.from('community_messages').insert({
      channel_id: activeChannelId,
      author_id: user.id,
      body,
    });
    if (sendError) {
      setDraft(body);
      setError(`Could not send message: ${sendError.message}`);
      return;
    }
    loadMessages();
  };

  if (loading) return <div className="grid min-h-[360px] place-items-center rounded-2xl border border-slate-200 bg-white"><div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Loading community…</div></div>;

  if (!user?.id) return <Empty title="Sign in to join the community" text="Guest sessions cannot read or post community discussions." />;
  if (error && !channels.length) return <Empty title="Community unavailable" text={error} />;
  if (!channels.length) return <Empty title="No community channels yet" text="Community channels will appear here when they are created in Supabase." />;

  return <section className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    {error && <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">{error}</div>}
    <div className="grid min-h-[620px] lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="border-b border-slate-200 bg-slate-50 p-3 lg:border-b-0 lg:border-r">
        <div className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">Channels</div>
        <div className="space-y-1">{channels.map((channel) => <button key={channel.id} type="button" onClick={() => setActiveChannelId(channel.id)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${channel.id === activeChannelId ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/70'}`}><MessageCircle className="h-4 w-4 shrink-0" /><span className="truncate font-semibold">{channel.name}</span></button>)}</div>
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="border-b border-slate-200 px-5 py-4"><h2 className="font-bold text-slate-900">{activeChannel?.name}</h2><p className="mt-1 text-xs text-slate-500">{activeChannel?.description || `Discuss ${selectedCareer?.title || 'career and student life'} with the community.`}</p></header>
        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4 sm:p-5">{messages.length ? messages.map((message) => { const mine = message.author_id === user.id; return <article key={message.id} className={`flex max-w-[92%] gap-2.5 ${mine ? 'ml-auto flex-row-reverse' : ''}`}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{initials(message.authorName)}</span><div className={`min-w-0 rounded-2xl px-3.5 py-2.5 shadow-sm ${mine ? 'rounded-tr-sm bg-blue-600 text-white' : 'rounded-tl-sm border border-slate-200 bg-white text-slate-700'}`}><div className={`mb-1 text-[11px] font-bold ${mine ? 'text-blue-100' : 'text-slate-700'}`}>{mine ? 'You' : message.authorName}</div><p className="whitespace-pre-wrap text-sm leading-5">{message.body}</p><div className={`mt-1.5 text-right text-[10px] ${mine ? 'text-blue-100' : 'text-slate-400'}`}>{formatTime(message.created_at)}</div></div></article>; }) : <div className="grid min-h-64 place-items-center text-center"><div><Users className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-600">No messages yet</p><p className="mt-1 text-sm text-slate-500">Start the first real conversation in this channel.</p></div></div>}</div>
        <div className="border-t border-slate-200 bg-white p-3 sm:p-4"><div className="flex items-end gap-2"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} rows="1" placeholder={`Ask a doubt in ${activeChannel?.name || 'this channel'}…`} className="max-h-28 min-h-11 flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" /><button type="button" onClick={sendMessage} disabled={!draft.trim()} className="rounded-xl bg-blue-600 p-3 text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send message"><Send className="h-5 w-5" /></button></div></div>
      </div>
    </div>
  </section>;
}

function Empty({ title, text }) { return <section className="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 p-8 text-center"><div><Users className="mx-auto h-10 w-10 text-slate-400" /><h2 className="mt-4 text-lg font-extrabold text-slate-600">{title}</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{text}</p></div></section>; }
