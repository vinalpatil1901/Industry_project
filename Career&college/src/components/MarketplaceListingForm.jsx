import { useState } from 'react';
import { Upload, X } from 'lucide-react';

const CURRENT_USER = { id: 'student-demo', name: 'Dinesh Shah', college: 'Campus360 Student' };
const CATEGORIES = ['Notes', 'Previous Year Question Papers (PYQs)', 'Study Guides', 'Used Books'];
const CONDITIONS = ['Like New', 'Good', 'Acceptable'];
const fieldClass = 'h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100';

function formatPrice(price) {
  return Number(price) === 0 ? 'Free' : `₹${Number(price).toLocaleString('en-IN')}`;
}

function Field({ label, error, wide = false, children }) {
  return (
    <label className={`flex min-w-0 flex-col gap-2 ${wide ? 'md:col-span-2' : ''}`}>
      <span className="text-xs font-bold text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1.5 text-xs font-semibold text-rose-600">{error}</span>}
    </label>
  );
}

export default function MarketplaceListingForm({ initial, onClose, onSave, workspaceOffset = 0 }) {
  const [form, setForm] = useState(() => initial || {
    title: '', category: 'Notes', subject: '', course: '', semester: '', college: '',
    description: '', type: 'PDF', price: '', condition: 'Good', contact: '', fileName: '', imageName: '',
  });
  const [errors, setErrors] = useState({});
  const physical = form.category === 'Used Books' || form.type === 'Physical used book';

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const selectFile = (event, key, acceptedTypes) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!acceptedTypes.includes(file.type) || file.size > 10 * 1024 * 1024) {
      setErrors((current) => ({ ...current, [key]: 'Use an allowed file under 10 MB.' }));
      return;
    }
    setField(key, file.name);
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    ['title', 'subject', 'course', 'semester', 'description'].forEach((key) => {
      if (!String(form[key]).trim()) nextErrors[key] = 'Required';
    });
    if (form.price === '' || Number(form.price) < 0) nextErrors.price = 'Enter a valid price.';
    if (!physical && !form.fileName) nextErrors.fileName = 'A PDF is required for a digital resource.';
    if (physical && !form.imageName) nextErrors.imageName = 'A book image is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSave({
      ...initial,
      ...form,
      id: initial?.id || crypto.randomUUID(),
      price: Number(form.price),
      seller: initial?.seller || CURRENT_USER,
      createdAt: initial?.createdAt || new Date().toISOString().slice(0, 10),
      status: initial?.status || 'Published',
      sample: physical ? '' : `Preview available for ${form.title}.`,
    });
  };

  return (
    <div
      className="fixed bottom-0 right-0 top-0 z-[60] grid place-items-center overflow-y-auto bg-slate-950/55 px-4 py-6 sm:px-6"
      style={{ left: `${workspaceOffset}px` }}
      role="presentation"
    >
      <form onSubmit={submit} className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="listing-form-title">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-5 sm:px-7">
          <div>
            <h2 id="listing-form-title" className="text-lg font-extrabold text-slate-900">{initial ? 'Edit listing' : 'List a resource'}</h2>
            <p className="mt-1 text-sm text-slate-500">Add clear details so students can find and trust your resource.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close listing form"><X className="h-5 w-5" /></button>
        </header>

        <div className="max-h-[calc(100dvh-210px)] overflow-y-auto px-5 py-6 sm:px-7">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <Field label="Resource title" error={errors.title}>
              <input value={form.title} onChange={(event) => setField('title', event.target.value)} className={fieldClass} placeholder="e.g. DBMS revision notes" />
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={(event) => { setField('category', event.target.value); if (event.target.value === 'Used Books') setField('type', 'Physical used book'); }} className={fieldClass}>
                {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Subject" error={errors.subject}>
              <input value={form.subject} onChange={(event) => setField('subject', event.target.value)} className={fieldClass} placeholder="e.g. Database Management Systems" />
            </Field>
            <Field label="Course" error={errors.course}>
              <input value={form.course} onChange={(event) => setField('course', event.target.value)} className={fieldClass} placeholder="e.g. B.Tech CSE" />
            </Field>
            <Field label="Semester" error={errors.semester}>
              <input value={form.semester} onChange={(event) => setField('semester', event.target.value)} className={fieldClass} inputMode="numeric" placeholder="e.g. 4" />
            </Field>
            <Field label="College name (optional)">
              <input value={form.college} onChange={(event) => setField('college', event.target.value)} className={fieldClass} placeholder="e.g. Campus360 College" />
            </Field>
            <Field label="Resource type">
              <select value={form.type} onChange={(event) => setField('type', event.target.value)} className={fieldClass} disabled={form.category === 'Used Books'}>
                {['PDF', 'Study guide', 'PYQ', 'Physical used book'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Price in Indian rupees" error={errors.price}>
              <input value={form.price} onChange={(event) => setField('price', event.target.value)} className={fieldClass} type="number" min="0" placeholder="0 for free" />
            </Field>
            {physical ? <>
              <Field label="Book condition">
                <select value={form.condition} onChange={(event) => setField('condition', event.target.value)} className={fieldClass}>{CONDITIONS.map((item) => <option key={item}>{item}</option>)}</select>
              </Field>
              <Field label="Book image" error={errors.imageName}>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => selectFile(event, 'imageName', ['image/png', 'image/jpeg', 'image/webp'])} className={`${fieldClass} h-auto py-2 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-blue-700`} />
                <span className="text-xs text-slate-500">{form.imageName || 'PNG, JPG, or WebP under 10 MB'}</span>
              </Field>
              <Field label="Seller contact (optional)" wide>
                <input value={form.contact} onChange={(event) => setField('contact', event.target.value)} className={fieldClass} placeholder="Email or phone" />
              </Field>
            </> : <Field label="Resource PDF" error={errors.fileName} wide>
              <input type="file" accept="application/pdf" onChange={(event) => selectFile(event, 'fileName', ['application/pdf'])} className={`${fieldClass} h-auto py-2 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-blue-700`} />
              <span className="text-xs text-slate-500">{form.fileName || 'PDF under 10 MB'}</span>
            </Field>}
            <Field label="Description" error={errors.description} wide>
              <textarea value={form.description} onChange={(event) => setField('description', event.target.value)} className={`${fieldClass} h-auto min-h-28 py-3`} rows="4" placeholder="Describe the topics, units, condition, or what makes this resource useful." />
            </Field>
          </div>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Listing preview</p>
            <p className="mt-2 font-bold text-slate-800">{form.title || 'Your resource title'}</p>
            <p className="mt-1 text-sm text-slate-600">{form.subject || 'Subject'} · {form.category} · {formatPrice(form.price || 0)}</p>
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100">Cancel</button>
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"><Upload className="h-4 w-4" />{initial ? 'Save changes' : 'Publish listing'}</button>
        </footer>
      </form>
    </div>
  );
}
