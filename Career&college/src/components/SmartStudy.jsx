import { useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  BookOpen, CheckCircle2, ChevronRight, Download, FileText, FolderUp,
  GraduationCap, Lightbulb, LoaderCircle, RefreshCw, Sparkles, Upload,
} from 'lucide-react';

GlobalWorkerOptions.workerSrc = pdfWorker;

const MAX_FILES = 15;
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = new Set(['pdf', 'txt', 'md', 'csv', 'json']);
const STOP_WORDS = new Set('about after again also among because before being between both could each every from have here into just like more most other over should some such than that their these they this those through under using very was were what when where which while will with would your you are and the for not but can has had its our out all any may one two three how why who'.split(' '));

const extensionOf = (name) => name.split('.').pop()?.toLowerCase() || '';
const readableSize = (bytes) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
const unique = (items) => [...new Set(items.filter(Boolean))];
const shorten = (text, maximum = 300) => text.length <= maximum ? text : `${text.slice(0, maximum).replace(/\s+\S*$/, '').trim()}...`;
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

async function textFromFile(file) {
  if (extensionOf(file.name) !== 'pdf') return file.text();
  const document = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages = Math.min(document.numPages, 80);
  const text = [];
  for (let pageNumber = 1; pageNumber <= pages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    text.push(content.items.map((item) => item.str).join(' '));
  }
  return text.join('\n');
}

function makeStudyPlan(sourceText, files) {
  const cleanText = sourceText.replace(/\s+/g, ' ').trim();
  const words = cleanText.toLowerCase().match(/[a-z][a-z-]{2,}/g) || [];
  const frequency = new Map();
  words.forEach((word) => { if (!STOP_WORDS.has(word)) frequency.set(word, (frequency.get(word) || 0) + 1); });
  const topics = [...frequency.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 6).map(([term]) => term.replace(/\b\w/g, (letter) => letter.toUpperCase()));
  const usableTopics = unique([...topics, 'Core concepts', 'Definitions', 'Key examples', 'Applications', 'Revision']).slice(0, 5);
  const sentences = unique((cleanText.match(/[^.!?]+(?:[.!?]+|$)/g) || []).map((sentence) => sentence.replace(/\s+/g, ' ').trim()).filter((sentence) => sentence.length >= 40 && /[a-z]/i.test(sentence)));
  const fallback = shorten(cleanText, 900) || 'Upload a document containing selectable text to create a study plan.';
  const ranked = sentences.map((sentence, index) => ({ sentence, index, score: [...frequency.entries()].reduce((total, [term, count]) => total + (sentence.toLowerCase().includes(term) ? count : 0), 0) })).sort((a, b) => b.score - a.score || a.index - b.index);
  const relatedTo = (topic) => ranked.filter(({ sentence }) => sentence.toLowerCase().includes(topic.toLowerCase())).map(({ sentence }) => sentence);
  const used = new Set();
  const takeUnused = (items) => {
    const result = items.find((item) => !used.has(item)) || items[0];
    if (result) used.add(result);
    return result;
  };
  const overview = takeUnused([sentences[0], ...ranked.map(({ sentence }) => sentence)]) || fallback;
  const summary = [{
    title: 'Overview', detail: shorten(overview, 500),
    points: ranked.map(({ sentence }) => sentence).filter((sentence) => sentence !== overview).slice(0, 2).map((sentence) => shorten(sentence, 260)),
  }, ...usableTopics.slice(0, 4).map((topic) => {
    const related = relatedTo(topic);
    const detail = takeUnused(related) || `Review the source material for the definition, use, and examples of ${topic.toLowerCase()}.`;
    return { title: topic, detail: shorten(detail, 500), points: related.filter((sentence) => sentence !== detail).slice(0, 2).map((sentence) => shorten(sentence, 260)) };
  })];
  const flashcards = usableTopics.map((topic) => ({ term: topic, definition: shorten(relatedTo(topic)[0] || `Review the section in your uploaded material that explains ${topic.toLowerCase()}.`, 300) }));
  const factPool = unique([...ranked.map(({ sentence }) => sentence), ...sentences]).slice(0, 12);
  const prompts = [
    (topic) => `Which statement best explains the material's discussion of ${topic}?`,
    (topic) => `According to the study material, which point is connected to ${topic}?`,
    (topic) => `Which statement should you remember when revising ${topic}?`,
    (topic) => `What does the source specifically say about ${topic}?`,
    (topic) => `Which statement is supported by the material about ${topic}?`,
  ];
  const quiz = Array.from({ length: Math.max(30, Math.min(50, Math.max(30, factPool.length * 4))) }, (_, index) => {
    const topic = usableTopics[index % usableTopics.length];
    const topicFacts = relatedTo(topic);
    const answer = topicFacts[Math.floor(index / usableTopics.length) % Math.max(1, topicFacts.length)] || factPool[index % Math.max(1, factPool.length)] || fallback;
    const alternatives = factPool.filter((sentence) => sentence !== answer).slice(index % 3, (index % 3) + 3);
    const options = unique([answer, ...alternatives, ...usableTopics.filter((item) => item !== topic).map((item) => `A discussion of ${item}.`)]).slice(0, 4);
    while (options.length < 4) options.push(`A point not stated in the material (${options.length + 1}).`);
    const shuffled = options.map((option, optionIndex) => ({ option, order: (optionIndex + index + 1) % options.length })).sort((a, b) => a.order - b.order).map(({ option }) => option);
    return { id: `question-${index}`, question: prompts[index % prompts.length](topic), options: shuffled, answer, explanation: `The source links this point to ${topic}. Review the matching summary section or flashcard for context.` };
  });
  return {
    files: files.map((file) => ({ name: file.name, size: file.size })), wordCount: words.length,
    minutes: Math.max(5, Math.ceil(words.length / 200)), topics: usableTopics, summary, flashcards, quiz,
    readiness: Math.min(96, Math.max(58, 50 + usableTopics.length * 5 + Math.round(words.length / 450))),
  };
}

export default function SmartStudy() {
  const [files, setFiles] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('summary');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [visibleQuizCount, setVisibleQuizCount] = useState(5);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const reset = () => { setFiles([]); setAnalysis(null); setStatus(''); setError(''); setAnswers({}); setSubmitted(false); setVisibleQuizCount(5); };
  const addFiles = (incoming) => {
    const candidates = Array.from(incoming || []);
    setError('');
    if (!candidates.length) return;
    const accepted = candidates.filter((file) => SUPPORTED_EXTENSIONS.has(extensionOf(file.name)) && file.size <= MAX_FILE_SIZE).slice(0, MAX_FILES);
    if (!accepted.length) return setError('Choose PDF, TXT, MD, CSV, or JSON files smaller than 15 MB.');
    if (accepted.length !== candidates.length) setError(`Added ${accepted.length} supported file${accepted.length === 1 ? '' : 's'}. Unsupported, oversized, or extra files were skipped.`);
    setFiles(accepted); setAnalysis(null); setSubmitted(false); setVisibleQuizCount(5); setAnswers({}); setStatus('Ready to create your study plan.');
  };
  const createStudyPlan = async () => {
    if (!files.length) return setError('Upload at least one study file first.');
    setError(''); setStatus('Reading your study materials...');
    try {
      const text = (await Promise.all(files.map(textFromFile))).join('\n');
      if (text.trim().length < 80) throw new Error('These files do not contain enough selectable text. For scanned books, use a text-searchable PDF or add OCR text.');
      setStatus('Creating your revision material...');
      setAnalysis(makeStudyPlan(text, files)); setActiveView('summary'); setSubmitted(false); setVisibleQuizCount(5); setAnswers({}); setStatus('Your SmartStudy plan is ready.');
    } catch (reason) {
      setAnalysis(null); setStatus(''); setError(reason instanceof Error ? reason.message : 'The files could not be read. Try a different document.');
    }
  };
  const downloadSummary = () => {
    if (!analysis) return;
    const summaryWindow = window.open('', '_blank');
    if (!summaryWindow) return setError('Allow pop-ups to save the summary as a PDF.');
    const sections = analysis.summary.map((section) => `<section><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.detail)}</p>${section.points.length ? `<h3>Supporting points</h3><ul>${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>` : ''}</section>`).join('');
    summaryWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>SmartStudy summary</title><style>body{font-family:Arial,sans-serif;color:#172033;line-height:1.6;margin:48px;max-width:800px}h1{font-size:28px;margin:0 0 6px}h2{font-size:19px;margin:0 0 12px}h3{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#526077;margin:18px 0 6px}p{margin:0}section{border:1px solid #dbe3ef;border-radius:12px;padding:20px;margin:16px 0;break-inside:avoid}li{margin:6px 0}.meta{color:#64748b;margin-bottom:28px}@media print{body{margin:24px}}</style></head><body><h1>SmartStudy summary</h1><p class="meta">${analysis.files.length} source file${analysis.files.length === 1 ? '' : 's'} &middot; ${analysis.wordCount.toLocaleString()} words</p>${sections}</body></html>`);
    summaryWindow.document.close();
    window.setTimeout(() => { summaryWindow.focus(); summaryWindow.print(); }, 250);
  };

  const visibleQuiz = analysis?.quiz.slice(0, visibleQuizCount) || [];
  const score = visibleQuiz.reduce((total, question) => total + (answers[question.id] === question.answer ? 1 : 0), 0);
  const scorePercent = visibleQuiz.length ? Math.round((score / visibleQuiz.length) * 100) : 0;
  const loadMoreQuiz = () => { if (analysis) { setSubmitted(false); setVisibleQuizCount((count) => Math.min(count + 5, analysis.quiz.length)); } };

  return <section className="mx-auto max-w-7xl">
    {!analysis && <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5"><h2 className="text-xl font-bold text-slate-900">Add study material</h2><p className="mt-1 text-sm text-slate-500">PDF, TXT, MD, CSV, or JSON. Up to 15 files, 15 MB each.</p></div>
        <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files); }} className="grid min-h-56 place-items-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/60 p-6 text-center transition hover:border-violet-400 hover:bg-violet-50">
          <div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm"><Upload className="h-6 w-6" /></span><h3 className="mt-4 font-bold text-slate-800">Drop files here</h3><p className="mt-1 text-xs text-slate-500">or choose files and folders from your device</p><div className="mt-4 flex flex-wrap justify-center gap-2"><input ref={fileInputRef} type="file" multiple accept=".pdf,.txt,.md,.csv,.json" onChange={(event) => addFiles(event.target.files)} className="hidden" /><input ref={folderInputRef} type="file" multiple webkitdirectory="" directory="" onChange={(event) => addFiles(event.target.files)} className="hidden" /><button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg bg-violet-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-violet-700">Choose files</button><button type="button" onClick={() => folderInputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3.5 py-2 text-xs font-bold text-violet-700 hover:bg-violet-50"><FolderUp className="h-4 w-4" />Choose folder</button></div></div>
        </div>
        {files.length > 0 && <div className="mt-5"><div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Selected material</p><button type="button" onClick={reset} className="text-xs font-bold text-rose-600 hover:text-rose-700">Clear all</button></div><div className="space-y-2">{files.map((file) => <div key={`${file.name}-${file.size}`} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><FileText className="h-5 w-5 shrink-0 text-violet-600" /><span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{file.webkitRelativePath || file.name}</span><span className="text-xs text-slate-400">{readableSize(file.size)}</span></div>)}</div></div>}
        {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p>}{status && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{status}</p>}
        <button type="button" onClick={createStudyPlan} disabled={!files.length || status.endsWith('...')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">{status.endsWith('...') ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}Create SmartStudy plan</button>
      </div>
      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Lightbulb className="h-6 w-6 text-amber-500" /><h2 className="mt-3 font-bold text-slate-900">How it works</h2><ol className="mt-3 space-y-3 text-sm leading-5 text-slate-600">{['Upload notes, text-searchable books, or a folder.', 'SmartStudy reads the text locally in your browser.', 'Review the summary, topics, flashcards, and quiz.'].map((item, index) => <li key={item} className="flex gap-2.5"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">{index + 1}</span>{item}</li>)}</ol></aside>
    </div>}

    {analysis && <>
      <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
        <div className="flex flex-col gap-5 bg-gradient-to-r from-violet-50 via-white to-sky-50 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-violet-700">Study plan ready</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Your personalised revision space is ready</h2><p className="mt-1 text-sm text-slate-600">Everything is arranged from the material you uploaded, so you can revise with focus.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={downloadSummary} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700"><Download className="h-4 w-4" />Download summary PDF</button><button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" />Analyse new files</button></div></div>
        <div className="grid border-t border-slate-200 sm:grid-cols-3"><div className="border-b border-slate-200 p-4 sm:border-b-0 sm:border-r"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Study material</p><p className="mt-1 text-lg font-extrabold text-slate-900">{analysis.files.length} source file{analysis.files.length === 1 ? '' : 's'}</p><p className="mt-1 text-xs text-slate-500">{analysis.wordCount.toLocaleString()} words analysed</p></div><div className="border-b border-slate-200 p-4 sm:border-b-0 sm:border-r"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Recommended review</p><p className="mt-1 text-lg font-extrabold text-slate-900">{analysis.minutes} minutes</p><p className="mt-1 text-xs text-slate-500">A focused first revision session</p></div><div className="p-4"><p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Study readiness</p><p className="mt-1 text-lg font-extrabold text-emerald-800">{analysis.readiness}/100</p><p className="mt-1 text-xs text-emerald-700">Strong set of revision topics identified</p></div></div>
        <div className="flex flex-wrap gap-2 border-t border-slate-200 p-4">{[['summary', 'Summary', FileText], ['flashcards', 'Flashcards', BookOpen], ['quiz', 'Practice quiz', GraduationCap]].map(([id, label, Icon]) => <button key={id} type="button" onClick={() => setActiveView(id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${activeView === id ? 'bg-violet-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Icon className="h-4 w-4" />{label}</button>)}</div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        {activeView === 'summary' && <div className="w-full"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><FileText className="h-5 w-5 text-violet-600" /><h2 className="text-xl font-extrabold text-slate-900">Detailed study summary</h2></div><p className="mt-2 max-w-3xl text-sm text-slate-500">Start with the overview, then revise each concept and its supporting points before returning to the source material.</p></div><button type="button" onClick={downloadSummary} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-2 text-sm font-bold text-violet-700 hover:bg-violet-100"><Download className="h-4 w-4" />PDF</button></div><div className="mt-6 space-y-4">{analysis.summary.map((section, index) => <article key={`${section.title}-${index}`} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6"><div className="flex items-center gap-2"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-extrabold text-violet-700">{index + 1}</span><h3 className="font-extrabold text-slate-900">{section.title}</h3></div><p className="mt-4 text-sm leading-7 text-slate-700">{section.detail}</p>{section.points.length > 0 && <div className="mt-4 border-t border-slate-200 pt-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Supporting points</p><ul className="mt-2 space-y-2">{section.points.map((point) => <li key={point} className="flex gap-2 text-sm leading-6 text-slate-600"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />{point}</li>)}</ul></div>}</article>)}</div><h3 className="mt-7 text-sm font-extrabold uppercase tracking-wider text-slate-500">Key topics</h3><div className="mt-3 flex flex-wrap gap-2">{analysis.topics.map((topic) => <span key={topic} className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">{topic}</span>)}</div></div>}
        {activeView === 'flashcards' && <div><div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-violet-600" /><h2 className="text-xl font-extrabold text-slate-900">Revision flashcards</h2></div><p className="mt-2 text-sm text-slate-500">Read the term, answer aloud, then use the explanation to check your understanding.</p><div className="mt-6 grid gap-4 md:grid-cols-2">{analysis.flashcards.map((card) => <article key={card.term} className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-600">Concept</p><h3 className="mt-2 text-lg font-extrabold text-slate-900">{card.term}</h3><div className="my-4 h-px bg-violet-100" /><p className="text-sm leading-6 text-slate-600">{card.definition}</p></article>)}</div></div>}
        {activeView === 'quiz' && <div><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-violet-600" /><h2 className="text-xl font-extrabold text-slate-900">Practice quiz</h2></div><p className="mt-2 text-sm text-slate-500">Work through five questions at a time, then load another set whenever you want more practice.</p></div><span className="shrink-0 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">{visibleQuiz.length} of {analysis.quiz.length} questions</span></div>{submitted && <div className={`mt-5 rounded-xl p-4 ${scorePercent >= 70 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}><div className="flex items-center gap-2 font-extrabold"><CheckCircle2 className="h-5 w-5" />{score}/{visibleQuiz.length} correct - {scorePercent}%</div><p className="mt-1 text-sm">{scorePercent >= 70 ? 'Great recall. Load more questions to keep building confidence.' : 'Review the detailed summary and flashcards, then try the quiz again.'}</p></div>}<div className="mt-6 space-y-6">{visibleQuiz.map((question, index) => <fieldset key={question.id}><legend className="text-sm font-bold text-slate-800">{index + 1}. {question.question}</legend><div className="mt-3 grid gap-2">{question.options.map((option) => { const selected = answers[question.id] === option; const isCorrect = option === question.answer; return <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm leading-6 transition ${submitted && isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : submitted && selected ? 'border-rose-300 bg-rose-50 text-rose-800' : selected ? 'border-violet-400 bg-violet-50 text-violet-800' : 'border-slate-200 hover:border-violet-200 hover:bg-slate-50'}`}><input type="radio" name={question.id} value={option} checked={selected} disabled={submitted} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option }))} className="h-4 w-4 shrink-0 border-slate-300 text-violet-600 focus:ring-violet-500" />{option}</label>; })}</div>{submitted && <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800"><span className="font-extrabold">Correct answer:</span> {question.answer}<br /><span className="font-extrabold">Why:</span> {question.explanation}</div>}</fieldset>)}</div><div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={() => setSubmitted(true)} disabled={submitted || visibleQuiz.some((question) => !answers[question.id])} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40">Check answers</button>{visibleQuiz.length < analysis.quiz.length && <button type="button" onClick={loadMoreQuiz} className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-bold text-violet-700 hover:bg-violet-100">Load 5 more questions <ChevronRight className="h-4 w-4" /></button>}{submitted && <button type="button" onClick={() => { setAnswers({}); setSubmitted(false); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Try again</button>}</div>{visibleQuiz.length < analysis.quiz.length && <p className="mt-3 text-xs text-slate-500">More practice is available when you are ready.</p>}</div>}
      </section>
    </>}
  </section>;
}
