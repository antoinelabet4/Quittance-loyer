import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password, nom } = await request.json();

    if (!email || !password || !nom) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nom,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message === 'User already registered' ? 'Cet email est déjà utilisé' : error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      user: { 
        id: data.user!.id, 
        email: data.user!.email!, 
        nom 
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}