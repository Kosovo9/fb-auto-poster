'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface MediaUploaderProps {
    onUpload: (url: string) => void;
}

export function MediaUploader({ onUpload }: MediaUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const t = useTranslations();

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files) return;

        setUploading(true);

        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const data = await res.json();
                if (data.success) {
                    setUploadedFiles((prev) => [...prev, data.url]);
                    onUpload(data.url);
                }
            } catch (error) {
            }
        }
        setUploading(false);
    }

    return (
        <div className="space-y-4">
            <div className={`border-4 border-dashed rounded-[2rem] p-10 transition-all ${uploading ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-slate-900/40 hover:border-blue-500/30'}`}>
                <input type="file" multiple accept="image/*,video/*" onChange={handleUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="12 4v16m8-8H4" /></svg>
                    </div>
                    <p className="text-lg font-black text-white mb-2 uppercase tracking-tighter">
                        {uploading ? t('common.loading') : t('dashboard.mediaUpload')}
                    </p>
                </div>
            </div>
            {uploadedFiles.length > 0 && (
                <div className="flex gap-3 flex-wrap">
                    {uploadedFiles.map((url, i) => <img key={i} src={url} className="w-20 h-20 object-cover rounded-xl border border-white/10" alt="upload" />)}
                </div>
            )}
        </div>
    );
}
