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
        <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 bg-slate-800/50 hover:border-blue-500/50 transition-colors group">
            <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleUpload}
                disabled={uploading}
                className="block w-full text-sm text-slate-400
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-500 file:text-white
          hover:file:bg-blue-600
          cursor-pointer disabled:opacity-50"
            />
            <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-slate-500 uppercase font-medium">
                    Formatos: JPEG, PNG, WebP, MP4 (máx 50MB)
                </p>
                {uploading && (
                    <span className="text-xs text-blue-400 animate-pulse font-bold">Subiendo archivos...</span>
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
