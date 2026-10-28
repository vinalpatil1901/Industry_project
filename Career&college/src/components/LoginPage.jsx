import { useState } from 'react';
import { ArrowRight, CheckCircle2, Compass, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound, Users } from 'lucide-react';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ children }) {
  return children ? <p className="mt-1.5 text-xs font-medium text-rose-600">{children}</p> : null;
}

export default function LoginPage({ onAuthenticate }) {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '', agreed: false });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const isSignUp = mode === 'signup';
  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (isSignUp && form.name.trim().length < 2) nextErrors.name = 'Please enter your name (at least 2 characters).';
    if (!EMAIL_PATTERN.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters for your password.';
    if (isSignUp && !form.agreed) nextErrors.agreed = 'Please accept the community guidelines to continue.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const email = form.email.trim().toLowerCase();
    const defaultName = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    onAuthenticate({ name: isSignUp ? form.name.trim() : defaultName, email, isGuest: false });
  };

  const continueAsGuest = () => onAuthenticate({ name: 'Guest Explorer', email: '', isGuest: true });

  return (
    <main className="min-h-screen bg-slate-950 p-4 font-sans sm:grid sm:place-items-center sm:p-6">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/40 lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-700 to-indigo-900 p-7 text-white sm:p-10 lg:p-12">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-300/15 blur-2xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-violet-400/20 blur-2xl" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-blue-700 shadow-lg"><Compass className="h-6 w-6" /></div><div><p className="text-xl font-extrabold tracking-tight">Campus360</p><p className="text-xs font-medium text-blue-100">Student success platform</p></div></div>
            <div className="my-10 max-w-md lg:my-auto">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-100">Your career, connected</span>
              <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">Make every next step count.</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100">Discover careers, compare colleges, manage money, and ask seniors the questions that matter.</p>
              <div className="mt-8 space-y-4">
                {[
                  ['Career guidance built around you', UserRound],
                  ['Supportive student and graduate community', Users],
                  ['Private local session on this device', ShieldCheck],
                ].map(([label, Icon]) => <div key={label} className="flex items-center gap-3 text-sm font-semibold text-white"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10"><Icon className="h-4 w-4" /></span>{label}</div>)}
              </div>
            </div>
            <p className="relative mt-8 text-xs leading-5 text-blue-200">Campus360 is designed for purposeful, respectful learning and connection.</p>
          </div>
        </section>

        <section className="p-6 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-md">
            <div className="mb-8"><h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{isSignUp ? 'Create your account' : 'Welcome back'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{isSignUp ? 'Save your progress and personalise your Campus360 experience.' : 'Sign in to continue your learning journey.'}</p></div>
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button type="button" onClick={() => { setMode('signin'); setErrors({}); }} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${!isSignUp ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Sign in</button>
              <button type="button" onClick={() => { setMode('signup'); setErrors({}); }} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${isSignUp ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Create account</button>
            </div>
            <form noValidate onSubmit={submit} className="space-y-4">
              {isSignUp && <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Full name</span><div className="relative"><UserRound className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={form.name} onChange={(event) => updateField('name', event.target.value)} autoComplete="name" placeholder="Your name" className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:ring-2 ${errors.name ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'}`} /></div><FieldError>{errors.name}</FieldError></label>}
              <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Email address</span><div className="relative"><Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} autoComplete="email" placeholder="you@example.com" className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:ring-2 ${errors.email ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'}`} /></div><FieldError>{errors.email}</FieldError></label>
              <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Password</span><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => updateField('password', event.target.value)} autoComplete={isSignUp ? 'new-password' : 'current-password'} placeholder="At least 8 characters" className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-11 text-sm outline-none transition focus:ring-2 ${errors.password ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'}`} /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2.5 top-2.5 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div><FieldError>{errors.password}</FieldError></label>
              {isSignUp && <label className="flex cursor-pointer items-start gap-2.5 pt-1"><input type="checkbox" checked={form.agreed} onChange={(event) => updateField('agreed', event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /><span className="text-xs leading-5 text-slate-600">I agree to use Campus360 respectfully and keep community spaces safe.</span></label>}
              {isSignUp && <FieldError>{errors.agreed}</FieldError>}
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">{isSignUp ? 'Create account' : 'Sign in'}<ArrowRight className="h-4 w-4" /></button>
            </form>
            <div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
            <button type="button" onClick={continueAsGuest} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><Users className="h-4 w-4" />Continue as a guest</button>
            <div className="mt-5 flex gap-2 rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span><strong>Local demo authentication:</strong> passwords are validated for form quality but never stored or transmitted. Connect a secure auth provider before using real accounts.</span></div>
          </div>
        </section>
      </div>
    </main>
  );
}
