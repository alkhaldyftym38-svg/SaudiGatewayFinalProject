import { useState, useRef } from 'react';
import { Upload, Link2, X, ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
export default function ImageUploader({ value, onChange, label, ar }) {
  const [tab, setTab] = useState('url');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadDone, setUploadDone] = useState(false);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploadDone(false);
    setUploading(true);

    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase.storage
      .from('content-images')
      .upload(path, file, { upsert: false, contentType: file.type });

    setUploading(false);

    if (error) {
      setUploadError(error.message);
      return;
    }

    const { data: pub } = supabase.storage
      .from('content-images')
      .getPublicUrl(data.path);

    onChange(pub.publicUrl);
    setUploadDone(true);
  };

  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-on-surface-variant mb-1">{label}</label>
      )}
      <div className="flex rounded-xl border border-outline-variant/30 overflow-hidden mb-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setTab('url')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors ${
            tab === 'url' ? 'bg-primary text-white' : 'bg-surface text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          {ar ? 'رابط URL' : 'URL'}
        </button>
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors ${
            tab === 'upload' ? 'bg-primary text-white' : 'bg-surface text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          {ar ? 'رفع صورة' : 'Upload'}
        </button>
      </div>
      {tab === 'url' && (
        <input
          type="url"
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/40 outline-none"
        />
      )}
      {tab === 'upload' && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-outline-variant/40 hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : uploadDone ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <ImageIcon className="w-6 h-6 text-on-surface-variant" />
            )}
            <span className="text-xs text-on-surface-variant">
              {uploading
                ? (ar ? 'جارٍ الرفع...' : 'Uploading...')
                : uploadDone
                  ? (ar ? 'تم الرفع بنجاح ✓' : 'Uploaded ✓')
                  : (ar ? 'اضغط لاختيار صورة' : 'Click to choose image')}
            </span>
            <span className="text-[10px] text-on-surface-variant/60">
              JPG, PNG, WEBP — {ar ? 'حتى 5 ميغابايت' : 'max 5 MB'}
            </span>
          </button>
          {uploadError && (
            <p className="text-xs text-red-500 mt-1">{uploadError}</p>
          )}
        </div>
      )}
      {value && (
        <div className="mt-2 relative group w-full h-32 rounded-xl overflow-hidden border border-outline-variant/20">
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => { onChange(''); setUploadDone(false); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
