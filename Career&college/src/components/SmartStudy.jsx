import { useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  FolderUp,
  GraduationCap,
  Lightbulb,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Upload,
} from 'lucide-react';

GlobalWorkerOptions.workerSrc = pdfWorker;

const MAX_FILES = 15;
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = new Set(['pdf', 'txt', 'md', 'csv', 'json']);
const STOP_WORDS = new Set('about after again also among because before being between both could each every from have here into just like more most other over should some such than that their these they this those through under using very was were what when where which while will with would your you are and the for not but can has had its our out all any may one two three how why who'.split(' '));

function extensionOf(fileName) {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

function readableSize(bytes) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function textFromFile(file) {
  const extension = extensionOf(file.name);
  if (extension === 'pdf') {
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
  return file.text();
}

function makeStudyPlan(sourceText, files) {
  const cleanText = sourceText.replace(/\s+/g, ' ').trim();
  const words = cleanText.toLowerCase().match(/[a-z][a-z-]{2,}/g) || [];
  const frequency = new Map();
  words.forEach((word) => {
    if (!STOP_WORDS.has(word)) frequency.set(word, (frequency.get(word) || 0) + 1);
  });
  const topics = [...frequency.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([term]) => term.replace(/\b\w/g, (letter) => letter.toUpperCase()));
  const sentences = cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter((sentence) => sentence.length > 35) || [];
  const rankedSentences = [...sentences].map((sentence, index) => ({
    sentence,
    index,
    score: [...frequency.entries()].reduce((score, [term, count]) => score + (sentence.toLowerCase().includes(term) ? count : 0), 0),
  })).sort((a, b) => b.score - a.score || a.index - b.index);
  const summary = rankedSentences.slice(0, 5).sort((a, b) => a.index - b.index).map((item) => item.sentence);
  const fallbackSummary = cleanText.slice(0, 900) || 'Upload a document containing selectable text to create a study plan.';
  const usableTopics = topics.length ? topics : ['Core concepts', 'Definitions', 'Key examples', 'Revision'];
  const definitions = usableTopics.slice(0, 5).map((topic) => ({
    term: topic,
    definition: rankedSentences.find((item) => item.sentence.toLowerCase().includes(topic.toLowerCase()))?.sentence || `Review the section in your uploaded material that explains ${topic.toLowerCase()}.`,
  }));
  const distractors = [...usableTopics, 'Supporting examples', 'Revision strategy', 'Practical application'];
  const quiz = usableTopics.slice(0, 5).map((topic, index) => {
    const options = [topic, ...distractors.filter((item) => item !== topic).slice(index, index + 3)];
    return { id: `question-${index}`, question: `Which topic is identified as a key concept in this study material?`, options: options.sort((a, b) => (a === topic ? -1 : b === topic ? 1 : a.localeCompare(b))), answer: topic };
  });
  const wordCount = words.length;
  return {
    files: files.map((file) => ({ name: file.name, size: file.size })),
    wordCount,
    minutes: Math.max(5, Math.ceil(wordCount / 200)),
    topics: usableTopics,
    summary: summary.length ? summary : [fallbackSummary],
    flashcards: definitions,
    quiz,
    readiness: Math.min(96, Math.max(58, 50 + usableTopics.length * 5 + Math.round(wordCount / 450))),
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
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const addFiles = async (incoming) => {
    const candidates = Array.from(incoming || []);
    setError('');
    if (!candidates.length) return;
    const unsupported = candidates.filter((file) => !SUPPORTED_EXTENSIONS.has(extensionOf(file.name)));
    const oversized = candidates.filter((file) => file.size > MAX_FILE_SIZE);
    const accepted = candidates.filter((file) => SUPPORTED_EXTENSIONS.has(extensionOf(file.name)) && file.size <= MAX_FILE_SIZE).slice(0, MAX_FILES);
    if (!accepted.length) {
      setError('Choose PDF, TXT, MD, CSV, or JSON files smaller than 15 MB.');
      return;
    }
    if (unsupported.length || oversized.length || candidates.length > MAX_FILES) setError(`Added ${accepted.length} supported file${accepted.length === 1 ? '' : 's'}. Unsupported, oversized, or extra files were skipped.`);
    setFiles(accepted);
    setAnalysis(null);
    setSubmitted(false);
    setAnswers({});
    setStatus('Ready to create your study plan.');
  };

  const createStudyPlan = async () => {
    if (!files.length) {
      setError('Upload at least one study file first.');
      return;
    }
    setError('');
    setStatus('Reading your study materials…');
    try {
      const extracted = await Promise.all(files.map(textFromFile));
      const text = extracted.join('\n');
      if (text.trim().length < 80) throw new Error('These files do not contain enough selectable text. For scanned books, use a text-searchable PDF or add OCR text.');
      setStatus('Finding key topics and creating revision material…');
      setAnalysis(makeStudyPlan(text, files));
      setActiveView('summary');
      setSubmitted(false);
      setAnswers({});
      setStatus('Your SmartStudy plan is ready.');
    } catch (reason) {
      setAnalysis(null);
      setStatus('');
      setError(reason instanceof Error ? reason.message : 'The files could not be read. Try a different document.');
    }
  };

  const score = analysis ? analysis.quiz.reduce((total, question) => total + (answers[question.id] === question.answer ? 1 : 0), 0) : 0;
  const scorePercent = analysis?.quiz.length ? Math.round((score / analysis.quiz.length) * 100) : 0;
  const reset = () => { setFiles([]); setAnalysis(null); setStatus(''); setError(''); setAnswers({}); setSubmitted(false); };

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-700 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-100"><Sparkles className="h-4 w-4" /> SmartStudy</div><h1 className="text-3xl font-extrabold tracking-tight">Turn study material into clarity.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100">Upload your notes, books, or a folder. SmartStudy extracts the text and creates focused summaries, revision topics, flashcards, and a practice quiz.</p></div><div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm backdrop-blur"><strong className="block">Private by design</strong><span className="text-violet-100">Files are analysed in this browser.</span></div></div>
      </div>

      {!analysis && <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5"><h2 className="text-xl font-bold text-slate-900">Add study material</h2><p className="mt-1 text-sm text-slate-500">PDF, TXT, MD, CSV, or JSON · up to 15 files · 15 MB each.</p></div>
          <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files); }} className="grid min-h-56 place-items-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/60 p-6 text-center transition hover:border-violet-400 hover:bg-violet-50">
            <div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm"><Upload className="h-6 w-6" /></span><h3 className="mt-4 font-bold text-slate-800">Drop files here</h3><p className="mt-1 text-xs text-slate-500">or choose files and folders from your device</p><div className="mt-4 flex flex-wrap justify-center gap-2"><input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.txt,.md,.csv,.json" onChange={(event) => addFiles(event.target.files)} className="hidden" /><input ref={folderInputRef} type="file" multiple webkitdirectory="" directory="" onChange={(event) => addFiles(event.target.files)} className="hidden" /><button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg bg-violet-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-violet-700">Choose files</button><button type="button" onClick={() => folderInputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3.5 py-2 text-xs font-bold text-violet-700 hover:bg-violet-50"><FolderUp className="h-4 w-4" />Choose folder</button></div></div>
          </div>
          {files.length > 0 && <div className="mt-5"><div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Selected material</p><button type="button" onClick={reset} className="text-xs font-bold text-rose-600 hover:text-rose-700">Clear all</button></div><div className="space-y-2">{files.map((file) => <div key={`${file.name}-${file.size}`} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><FileText className="h-5 w-5 shrink-0 text-violet-600" /><span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{file.webkitRelativePath || file.name}</span><span className="text-xs text-slate-400">{readableSize(file.size)}</span></div>)}</div></div>}
          {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p>}
          {status && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{status}</p>}
          <button type="button" onClick={createStudyPlan} disabled={!files.length || status.includes('…')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">{status.includes('…') ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}Create SmartStudy plan</button>
        </div>
        <aside className="space-y-4"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Lightbulb className="h-6 w-6 text-amber-500" /><h2 className="mt-3 font-bold text-slate-900">How it works</h2><ol className="mt-3 space-y-3 text-sm leading-5 text-slate-600">{['Upload notes, text-searchable books, or a folder.', 'SmartStudy reads the text locally in your browser.', 'Review the summary, topics, flashcards, and quiz.'].map((item, index) => <li key={item} className="flex gap-2.5"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">{index + 1}</span>{item}</li>)}</ol></div><div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-800"><strong>For scanned PDFs:</strong> use an OCR or text-searchable version. Images without selectable text cannot be summarised safely in a browser.</div></aside>
      </div>}

      {analysis && <>
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5"><div><p className="text-xs font-bold uppercase tracking-wider text-violet-600">Study plan ready</p><h2 className="mt-1 text-xl font-extrabold text-slate-900">{analysis.files.length} source file{analysis.files.length === 1 ? '' : 's'} · {analysis.wordCount.toLocaleString()} words</h2><p className="mt-1 text-sm text-slate-500">Estimated focused review: {analysis.minutes} minutes.</p></div><button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"><RefreshCw className="h-4 w-4" />Analyse new files</button></div>
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]"><aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><p className="px-2 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-slate-400">Study tools</p>{[['summary', 'Summary', FileText], ['flashcards', 'Flashcards', BookOpen], ['quiz', 'Practice quiz', GraduationCap]].map(([id, label, Icon]) => <button key={id} type="button" onClick={() => setActiveView(id)} className={`mb-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${activeView === id ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}><Icon className="h-4 w-4" />{label}<ChevronRight className="ml-auto h-4 w-4" /></button>)}<div className="mt-4 rounded-xl bg-emerald-50 p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">Study readiness</p><p className="mt-1 text-2xl font-extrabold text-emerald-700">{analysis.readiness}/100</p><p className="mt-1 text-xs leading-5 text-emerald-800">Strong set of revision topics identified.</p></div></aside>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            {activeView === 'summary' && <div><div className="flex items-center gap-2"><FileText className="h-5 w-5 text-violet-600" /><h2 className="text-xl font-extrabold text-slate-900">Focused summary</h2></div><p className="mt-2 text-sm text-slate-500">Use this as a first pass, then revisit the source sections for full context.</p><div className="mt-6 space-y-4">{analysis.summary.map((paragraph, index) => <p key={`${paragraph.slice(0, 24)}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-7 text-slate-700">{paragraph}</p>)}</div><h3 className="mt-7 text-sm font-extrabold uppercase tracking-wider text-slate-500">Key topics</h3><div className="mt-3 flex flex-wrap gap-2">{analysis.topics.map((topic) => <span key={topic} className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">{topic}</span>)}</div></div>}
            {activeView === 'flashcards' && <div><div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-violet-600" /><h2 className="text-xl font-extrabold text-slate-900">Revision flashcards</h2></div><p className="mt-2 text-sm text-slate-500">Read the term, answer aloud, then use the explanation to check your understanding.</p><div className="mt-6 grid gap-4 md:grid-cols-2">{analysis.flashcards.map((card) => <article key={card.term} className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-600">Concept</p><h3 className="mt-2 text-lg font-extrabold text-slate-900">{card.term}</h3><div className="my-4 h-px bg-violet-100" /><p className="text-sm leading-6 text-slate-600">{card.definition}</p></article>)}</div></div>}
            {activeView === 'quiz' && <div><div className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-violet-600" /><h2 className="text-xl font-extrabold text-slate-900">Practice quiz</h2></div><p className="mt-2 text-sm text-slate-500">Check your recall of the main concepts before you return to the source material.</p>{submitted && <div className={`mt-5 rounded-xl p-4 ${scorePercent >= 70 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}><div className="flex items-center gap-2 font-extrabold"><CheckCircle2 className="h-5 w-5" />{score}/{analysis.quiz.length} correct · {scorePercent}%</div><p className="mt-1 text-sm">{scorePercent >= 70 ? 'Great recall. Try explaining each topic in your own words next.' : 'Review the flashcards and summary, then try the quiz again.'}</p></div>}<div className="mt-6 space-y-6">{analysis.quiz.map((question, index) => <fieldset key={question.id}><legend className="text-sm font-bold text-slate-800">{index + 1}. {question.question}</legend><div className="mt-3 grid gap-2">{question.options.map((option) => { const selected = answers[question.id] === option; const isCorrect = option === question.answer; return <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${submitted && isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : submitted && selected ? 'border-rose-300 bg-rose-50 text-rose-800' : selected ? 'border-violet-400 bg-violet-50 text-violet-800' : 'border-slate-200 hover:border-violet-200 hover:bg-slate-50'}`}><input type="radio" name={question.id} value={option} checked={selected} disabled={submitted} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option }))} className="h-4 w-4 border-slate-300 text-violet-600 focus:ring-violet-500" />{option}</label>; })}</div>{submitted && <p className="mt-2 text-xs font-semibold text-emerald-700">Answer: {question.answer}</p>}</fieldset>)}</div><div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={() => setSubmitted(true)} disabled={submitted || Object.keys(answers).length !== analysis.quiz.length} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40">Check answers</button>{submitted && <button type="button" onClick={() => { setAnswers({}); setSubmitted(false); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Try again</button>}</div></div>}
          </div>
        </div>
      </>}
    </section>
  );
}
