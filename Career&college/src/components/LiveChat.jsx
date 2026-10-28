import { useEffect, useRef, useState } from 'react';
import {
  Check,
  CheckCheck,
  FileText,
  ImagePlus,
  MessageCircle,
  Paperclip,
  Send,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

const STORAGE_KEY = 'campus360-community-chat-v1';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const seniorMembers = [
  { id: 'ananya', name: 'Ananya Sharma', role: 'ML Engineer · 2023 graduate', expertise: 'AI & Machine Learning', initials: 'AS', color: 'bg-violet-600', online: true },
  { id: 'rohan', name: 'Rohan Mehta', role: 'Software Engineer · 2022 graduate', expertise: 'Cloud & Full-Stack', initials: 'RM', color: 'bg-blue-600', online: true },
  { id: 'meera', name: 'Meera Iyer', role: 'Product Designer · 2021 graduate', expertise: 'Product Design & UX', initials: 'MI', color: 'bg-rose-600', online: false },
];

const makeSeedState = (careerTitle) => ({
  selectedChannel: 'career',
  connectedIds: [],
  channels: {
    career: {
      name: careerTitle,
      description: `Career-specific doubts, roadmaps, and guidance for ${careerTitle}.`,
      unread: 2,
      messages: [
        { id: 'seed-1', author: 'Ananya Sharma', initials: 'AS', color: 'bg-violet-600', senior: true, text: `Welcome to the ${careerTitle} community. Share your doubt with enough context and seniors will help you with the next step.`, time: '10:02 AM', read: true },
        { id: 'seed-2', author: 'Karan Patel', initials: 'KP', color: 'bg-orange-500', text: 'What is the best way to build a strong project portfolio while studying?', time: '10:11 AM', read: true },
        { id: 'seed-3', author: 'Ananya Sharma', initials: 'AS', color: 'bg-violet-600', senior: true, text: 'Start with one focused project, document the problem and your decisions, then improve it with feedback. Quality matters more than the number of projects.', time: '10:16 AM', read: true },
      ],
    },
    lounge: {
      name: 'Student Lounge',
      description: 'Meet students, exchange opportunities, and make connections across careers.',
      unread: 1,
      messages: [
        { id: 'seed-4', author: 'Riya Singh', initials: 'RS', color: 'bg-emerald-600', text: 'Anyone joining an open-source beginner group this weekend?', time: '9:48 AM', read: true },
        { id: 'seed-5', author: 'Rohan Mehta', initials: 'RM', color: 'bg-blue-600', senior: true, text: 'I can share a simple first-contribution checklist if that would help.', time: '9:52 AM', read: true },
      ],
    },
    opportunities: {
      name: 'Opportunities',
      description: 'Internships, events, study groups, and career opportunities.',
      unread: 0,
      messages: [
        { id: 'seed-6', author: 'Campus360 Team', initials: 'C3', color: 'bg-slate-700', senior: true, text: 'Remember to verify every opportunity before sharing personal information or files.', time: 'Yesterday', read: true },
      ],
    },
  },
});

function loadChat(careerTitle) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.channels) {
      return {
        ...saved,
        channels: {
          ...saved.channels,
          career: { ...saved.channels.career, name: careerTitle, description: `Career-specific doubts, roadmaps, and guidance for ${careerTitle}.` },
        },
      };
    }
  } catch {
    // Fall back to safe starter data when old browser storage is malformed.
  }
  return makeSeedState(careerTitle);
}

function formatTime() {
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date());
}

function Avatar({ initials, color, small = false }) {
  return <span className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${color} ${small ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs'}`}>{initials}</span>;
}

export default function LiveChat({ selectedCareer }) {
  const careerTitle = selectedCareer?.title || 'Career Guidance';
  const [chat, setChat] = useState(() => loadChat(careerTitle));
  const [draft, setDraft] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    try {
      // Keep browser storage small. Image previews remain visible in the active
      // session; after a refresh the attachment is retained as a file card.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chat, (key, value) => key === 'preview' ? undefined : value));
    } catch {
      // A full browser storage area must never break the chat interface.
    }
  }, [chat]);

  const storedActiveChannel = chat.channels[chat.selectedChannel];
  const activeChannel = chat.selectedChannel === 'career'
    ? { ...storedActiveChannel, name: careerTitle, description: `Career-specific doubts, roadmaps, and guidance for ${careerTitle}.` }
    : storedActiveChannel;
  const totalUnread = Object.values(chat.channels).reduce((total, channel) => total + channel.unread, 0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [chat.selectedChannel, activeChannel?.messages.length]);

  const selectChannel = (channelId) => {
    setChat((current) => ({
      ...current,
      selectedChannel: channelId,
      channels: { ...current.channels, [channelId]: { ...current.channels[channelId], unread: 0 } },
    }));
  };

  const handleAttachment = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setUploadError('');
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Files must be 5 MB or smaller.');
      return;
    }
    const base = { name: file.name, type: file.type, size: file.size, isImage: file.type.startsWith('image/') };
    if (!base.isImage) {
      setAttachment(base);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAttachment({ ...base, preview: String(reader.result) });
    reader.onerror = () => setUploadError('That image could not be read. Please try another file.');
    reader.readAsDataURL(file);
  };

  const sendMessage = () => {
    const cleanDraft = draft.trim();
    if (!cleanDraft && !attachment) return;
    const channelId = chat.selectedChannel;
    const message = { id: crypto.randomUUID(), author: 'You', initials: 'YO', color: 'bg-blue-600', text: cleanDraft, attachment, time: formatTime(), mine: true, read: false };
    setChat((current) => ({
      ...current,
      channels: {
        ...current.channels,
        [channelId]: {
          ...current.channels[channelId],
          messages: [...current.channels[channelId].messages, message],
        },
      },
    }));
    setDraft('');
    setAttachment(null);
    window.setTimeout(() => {
      setChat((current) => ({
        ...current,
        channels: {
          ...current.channels,
          [channelId]: {
            ...current.channels[channelId],
            messages: current.channels[channelId].messages.map((item) => item.id === message.id ? { ...item, read: true } : item),
          },
        },
      }));
    }, 900);
  };

  const connectWith = (member) => {
    setChat((current) => current.connectedIds.includes(member.id) ? current : { ...current, connectedIds: [...current.connectedIds, member.id] });
  };

  const askSenior = (member) => {
    selectChannel('career');
    setDraft(`Hi ${member.name.split(' ')[0]}, I need guidance about ${careerTitle}. My doubt is: `);
  };

  return (
    <section className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-5 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-100"><Users className="h-4 w-4" /> Community space</div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Ask, connect, and grow together.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Your questions are matched to <strong className="text-white">{careerTitle}</strong>, so seniors and peers can give relevant help.</p>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm backdrop-blur-sm"><span className="font-bold">{totalUnread}</span> unread community update{totalUnread === 1 ? '' : 's'}</div>
      </div>

      <div className="grid min-h-[680px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[235px_minmax(0,1fr)_275px]">
        <aside className="border-b border-slate-200 bg-slate-50 p-3 lg:border-b-0 lg:border-r">
          <div className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">Channels</div>
          <div className="space-y-1">
            {Object.entries(chat.channels).map(([id, channel]) => (
              <button key={id} type="button" onClick={() => selectChannel(id)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${chat.selectedChannel === id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/70'}`}>
                <MessageCircle className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate font-semibold">{id === 'career' ? careerTitle : channel.name}</span>
                {channel.unread > 0 && <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold ${chat.selectedChannel === id ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'}`}>{channel.unread}</span>}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-800"><strong>Respectful space.</strong> Never post personal contact details, passwords, or financial information.</div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="border-b border-slate-200 px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-slate-900">{activeChannel.name}</h2><p className="mt-0.5 text-xs leading-5 text-slate-500">{activeChannel.description}</p></div><span className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-emerald-600"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Live discussion</span></div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4 sm:p-5">
            {activeChannel.messages.map((message) => (
              <article key={message.id} className={`flex max-w-[92%] gap-2.5 ${message.mine ? 'ml-auto flex-row-reverse' : ''}`}>
                <Avatar initials={message.initials} color={message.color} small />
                <div className={`min-w-0 rounded-2xl px-3.5 py-2.5 shadow-sm ${message.mine ? 'rounded-tr-sm bg-blue-600 text-white' : 'rounded-tl-sm border border-slate-200 bg-white text-slate-700'}`}>
                  {!message.mine && <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-slate-700">{message.author}{message.senior && <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-violet-700">Senior</span>}</div>}
                  {message.text && <p className="whitespace-pre-wrap text-sm leading-5">{message.text}</p>}
                  {message.attachment && <div className={`mt-2 overflow-hidden rounded-lg border ${message.mine ? 'border-blue-400/60 bg-blue-500/30' : 'border-slate-200 bg-slate-50'}`}>
                    {message.attachment.isImage && message.attachment.preview ? <img src={message.attachment.preview} alt={message.attachment.name} className="max-h-56 w-full object-cover" /> : <div className="flex items-center gap-2 p-2.5"><FileText className="h-5 w-5 shrink-0" /><span className="truncate text-xs font-semibold">{message.attachment.name}</span></div>}
                  </div>}
                  <div className={`mt-1.5 flex items-center gap-1 text-[10px] ${message.mine ? 'justify-end text-blue-100' : 'text-slate-400'}`}>{message.time}{message.mine && (message.read ? <CheckCheck className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />)}</div>
                </div>
              </article>
            ))}
            <div ref={endRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
            {attachment && <div className="mb-2 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 p-2 text-xs text-blue-800"><FileText className="h-4 w-4" /><span className="min-w-0 flex-1 truncate font-semibold">{attachment.name}</span><button type="button" onClick={() => setAttachment(null)} className="rounded p-1 hover:bg-blue-100" aria-label="Remove attachment"><X className="h-4 w-4" /></button></div>}
            {uploadError && <p className="mb-2 text-xs font-medium text-rose-600">{uploadError}</p>}
            <div className="flex items-end gap-2"><input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleAttachment} className="hidden" /><button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg p-2.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600" aria-label="Attach a file or photo"><Paperclip className="h-5 w-5" /></button><button type="button" onClick={() => fileInputRef.current?.click()} className="hidden rounded-lg p-2.5 text-slate-500 hover:bg-slate-100 sm:block" aria-label="Attach a photo"><ImagePlus className="h-5 w-5" /></button><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} rows="1" placeholder={`Ask a doubt about ${activeChannel.name}...`} className="max-h-28 min-h-11 flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" /><button type="button" onClick={sendMessage} disabled={!draft.trim() && !attachment} className="rounded-xl bg-blue-600 p-3 text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send message"><Send className="h-5 w-5" /></button></div>
            <p className="mt-2 pl-1 text-[10px] text-slate-400">Enter to send · Shift + Enter for a new line · Images and documents up to 5 MB.</p>
          </div>
        </div>

        <aside className="border-t border-slate-200 bg-white p-4 lg:border-l lg:border-t-0">
          <div className="mb-1 flex items-center gap-2"><Users className="h-4 w-4 text-blue-600" /><h2 className="text-sm font-bold text-slate-900">Seniors & graduates</h2></div><p className="mb-4 text-xs leading-5 text-slate-500">Connect with people who can help you move forward.</p>
          <div className="space-y-3">
            {seniorMembers.map((member) => { const connected = chat.connectedIds.includes(member.id); return <div key={member.id} className="rounded-xl border border-slate-200 p-3"><div className="flex gap-2.5"><div className="relative"><Avatar initials={member.initials} color={member.color} /><span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${member.online ? 'bg-emerald-500' : 'bg-slate-300'}`} /></div><div className="min-w-0"><p className="truncate text-xs font-bold text-slate-800">{member.name}</p><p className="mt-0.5 text-[11px] leading-4 text-slate-500">{member.role}</p></div></div><div className="mt-3 flex gap-2"><button type="button" onClick={() => askSenior(member)} className="flex-1 rounded-lg bg-slate-100 px-2 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200">Ask doubt</button><button type="button" onClick={() => connectWith(member)} className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold ${connected ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>{connected ? <Check className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}{connected ? 'Connected' : 'Connect'}</button></div></div>; })}
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-500"><strong className="text-slate-700">Local demo mode:</strong> your messages, attachments, connections, and read state are saved in this browser. A secure backend and accounts are needed to deliver messages to other real people.</div>
        </aside>
      </div>
    </section>
  );
}
