'use client';

import { useState } from 'react';

interface MediaUploaderProps {
    onUpload: (url: string) => void;
}

export function MediaUploader({ onUpload }: MediaUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files) return;

        setUploading(true);

        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append('file', file);
            // userId removed from form data, handled server-side via cookie

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                const data = await res.json();
                if (data.success) {
                    setUploadedFiles((prev) => [...prev, data.url]);
                    onUpload(data.url);
                } else {
                    console.error('Upload failed:', data.error);
                }
            } catch (error) {
                console.error('Upload failed:', error);
            }
        }

        setUploading(false);
    }

    return (
        <div className="space-y-4">
            <div
                className={`border-4 border-dashed rounded-[2rem] p-10 transition-all duration-500 group relative overflow-hidden ${uploading ? 'border-blue-500 bg-blue-500/5 cursor-wait' : 'border-slate-800 bg-slate-900/40 hover:border-blue-500/30 hover:bg-slate-800/60'
                    }`}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                <div className="text-center relative z-0">
                    <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <p className="text-lg font-black text-white mb-2 uppercase tracking-tighter">
                        {uploading ? 'SUBIENDO...' : 'ARRASTRA TUS MEDIOS AQUÍ'}
                    </p>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                        O haz click para seleccionar (Máx 50MB)
                    </p>
                </div>

                {uploading && (
                    <div className="absolute bottom-0 left-0 h-1 bg-blue-500 animate-progress-indefinite w-full"></div>
                )}
            </div>

            {uploadedFiles.length > 0 && (
                <div className="mt-6 border-t border-slate-700 pt-4">
                    <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Archivos listos para postear:
                    </p>
                    <div className="flex gap-3 flex-wrap">
                        {uploadedFiles.map((url, i) => (
                            <div key={i} className="relative group/item">
                                <img
                                    src={url}
                                    alt="Uploaded"
                                    className="w-24 h-24 object-cover rounded-lg border border-slate-700 shadow-xl"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
