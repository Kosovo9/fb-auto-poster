import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const userId = formData.get('userId') as string;
        const scheduleId = formData.get('scheduleId') as string;

        if (!file || !userId) {
            return NextResponse.json(
                { error: 'file y userId requeridos' },
                { status: 400 }
            );
        }

        // Validar tipo de archivo
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'video/mp4',
        ];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Tipo de archivo no permitido' },
                { status: 400 }
            );
        }

        // Validar tamaño (máx 50MB)
        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'Archivo muy grande (máx 50MB)' },
                { status: 400 }
            );
        }

        // Generar nombre único
        const fileName = `${userId}/${Date.now()}-${file.name}`;

        // Subir a Supabase Storage
        const { data, error: uploadError } = await supabase.storage
            .from('auto-poster-media')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
            .from('auto-poster-media')
            .getPublicUrl(fileName);

        // Registrar en BD
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
            { error: 'Error en subida' },
            { status: 500 }
        );
    }
}
