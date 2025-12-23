import { supabase } from '../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const userId = formData.get('userId') as string;
        const scheduleId = formData.get('scheduleId') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'File required' },
                { status: 400 }
            );
        }

        // Validate type & size (Simple validation)
        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large (>50MB)' }, { status: 400 });
        }

        const fileName = `${userId || 'anon'}/${Date.now()}-${file.name}`;

        const { data, error: uploadError } = await supabase.storage
            .from('auto-poster-media')
            .upload(fileName, file);

        if (uploadError) {
            // If bucket doesn't exist, we might need to handle creation or fail
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('auto-poster-media')
            .getPublicUrl(fileName);

        // Register in DB if scheduleId provided
        if (scheduleId) {
            await supabase.from('media').insert([
                {
                    user_id: userId,
                    schedule_id: scheduleId,
                    file_url: publicUrl,
                    file_type: file.type.startsWith('image') ? 'image' : 'video',
                    size_bytes: file.size,
                },
            ]);
        }

        return NextResponse.json({
            success: true,
            url: publicUrl,
            fileName: data?.path,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        );
    }
}
