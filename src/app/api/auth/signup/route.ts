import { NextResponse } from 'next/server';

const users = new Map<string, { id: string; email: string; password: string; nom: string }>();

export async function POST(request: Request) {
  try {
    const { email, password, nom } = await request.json();

    if (!email || !password || !nom) {
      return NextResponse.json(
        { error: 'Email, mot de passe et nom requis' },
        { status: 400 }
      );
    }

    if (users.has(email)) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cet email' },
        { status: 400 }
      );
    }

    const userId = `user_${Date.now()}`;
    users.set(email, { id: userId, email, password, nom });

    return NextResponse.json({
      user: { id: userId, email, nom },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}
