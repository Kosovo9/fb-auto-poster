'use client';

import { useState } from 'react';

interface MediaUploaderProps {
    onUpload: (url: string) => void;
    userId?: string;
}

export function MediaUploader({ onUpload, userId }: MediaUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files) return;

        setUploading(true);

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            if (userId) formData.append('userId', userId);

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
                    console.error("Upload error:", data.error);
                }
            } catch (error) {
                console.error('Upload failed:', error);
            }
        }

        setUploading(false);
    }

    return (
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 hover:border-slate-500 transition-colors bg-slate-700/30">
            <label className="block cursor-pointer">
                <span className="sr-only">Choose file</span>
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
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700"
                />
            </label>

            {uploading && <p className="text-sm text-yellow-400 mt-2">Uploading...</p>}

            {!uploading && uploadedFiles.length === 0 && (
                <p className="text-sm text-slate-400 mt-2">
                    Soporta: JPEG, PNG, WebP, MP4 (máx 50MB)
                </p>
            )}

            {uploadedFiles.length > 0 && (
                <div className="mt-4">
                    <p className="text-sm font-bold mb-2 text-slate-300">Archivos listos:</p>
                    <div className="flex gap-2 flex-wrap">
                        {uploadedFiles.map((url, i) => (
                            <div key={i} className="relative group">
                                <img
                                    src={url}
                                    alt="Uploaded"
                                    className="w-20 h-20 object-cover rounded border border-slate-600"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                    <span className="text-green-400 text-xs">✓</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
