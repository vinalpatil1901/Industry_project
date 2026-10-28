import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import studyMonkey from '../assets/study-monkey.webp';

const PET_COPY = {
  career: [
    'Curious about your future? Let us explore it together!',
    'One thoughtful answer can bring you closer to a great path.',
    'Your next step does not need to be perfect; it only needs to be yours.',
    'Skills grow every time you stay curious.',
    'A clear direction starts with knowing what energises you.',
    'Small discoveries today can shape a meaningful career tomorrow.',
    'Trust your progress - you are learning more about yourself every day.',
    'The best path is built one confident choice at a time.',
  ],
  community: [
    'A good question can help the whole community learn.',
    'Be kind, share what you know, and keep growing!',
    'Your experience may be the answer someone else needs today.',
    'Learning together makes every challenge feel lighter.',
    'Ask bravely. Someone else probably has the same question.',
    'A helpful message can make a big difference to a fellow student.',
    'Good communities grow when everyone gets a chance to be heard.',
    'Share progress, not perfection - we are all learning.',
  ],
  study: [
    'Ready for a focused study session? I am cheering for you!',
    'Try one more question - you are making progress.',
    'Little study sessions add up to big confidence.',
    'Read it once, explain it once, and it starts to stick.',
    'Focus on the next small task, not the whole mountain.',
    'A five-minute start can turn into a great study session.',
    'Every question you practise is a step toward mastery.',
    'Take a breath, open the notes, and begin where you are.',
    'Consistency is your quiet superpower.',
    'You do not have to know everything yet - that is what studying is for.',
  ],
  money: [
    'Small choices today can make a big difference tomorrow.',
    'You have got this - one smart money step at a time!',
    'Saving a little regularly is still a powerful habit.',
    'A budget gives your goals a place to grow.',
    'Track one expense today and make tomorrow easier.',
    'Financial confidence begins with simple, honest choices.',
    'Progress is not about the amount; it is about the habit.',
    'Your future self will appreciate the care you show today.',
  ],
  marketplace: [
    'The right study resource can make revision feel easier.',
    'Found something useful? Save it for your next study session!',
    'Good notes are even better when shared with someone who needs them.',
    'Choose resources that help you understand, not just memorise.',
    'A well-organised resource can save a lot of revision time.',
    'Find what supports your learning style and make it yours.',
    'One useful resource can unlock a whole topic.',
    'Share wisely, learn generously, and keep your study space useful.',
  ],
};

export default function StudyPet({ area }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = PET_COPY[area] || PET_COPY.study;
  const message = messages[messageIndex % messages.length];

  if (!isVisible) return null;

  const openPet = () => {
    setIsOpen(true);
    setMessageIndex((current) => current + 1);
  };

  return (
    <aside className="fixed bottom-4 right-4 z-40 flex max-w-[min(19rem,calc(100vw-2rem))] items-end gap-2 sm:bottom-6 sm:right-6" aria-label="Study companion">
      {isOpen && <div className="relative rounded-2xl border border-violet-100 bg-white/95 px-4 py-3 pr-9 text-sm font-semibold leading-5 text-slate-700 shadow-lg shadow-violet-950/10 backdrop-blur"><p className="text-xs font-bold uppercase tracking-wider text-violet-600">Study buddy</p><p className="mt-1">{message}</p><button type="button" onClick={() => setIsOpen(false)} className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close study buddy message"><X className="h-3.5 w-3.5" /></button><span className="absolute -bottom-1.5 right-7 h-3 w-3 rotate-45 border-b border-r border-violet-100 bg-white" /></div>}
      <div className="group relative shrink-0">
        <span className="absolute inset-1 rounded-full bg-violet-200/70 blur-md" />
        <button type="button" onClick={openPet} className="group relative grid h-16 w-16 place-items-center overflow-hidden rounded-full border-2 border-white bg-violet-50 shadow-lg shadow-violet-950/15 transition duration-200 hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-violet-200 sm:h-20 sm:w-20" aria-label="Open a message from your study buddy" aria-expanded={isOpen}>
          <img src={studyMonkey} alt="Reading monkey study companion" className="h-full w-full scale-125 object-cover object-center transition duration-200 group-hover:scale-[1.34]" />
        </button>
        {!isOpen && <span className="absolute -left-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-violet-600 text-white shadow-sm"><MessageCircle className="h-3 w-3" /></span>}
        <button type="button" onClick={() => setIsVisible(false)} className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full border border-white bg-slate-700 text-white opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100" aria-label="Hide study companion"><X className="h-3 w-3" /></button>
      </div>
    </aside>
  );
}
