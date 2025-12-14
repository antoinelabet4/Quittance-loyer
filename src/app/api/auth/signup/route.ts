import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, nom } = await request.json();

    if (!email || !password || !nom) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    const usersData = typeof window === 'undefined' 
      ? global.usersStore || (global.usersStore = {})
      : {};

    if (usersData[email]) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    const userId = `user_${Date.now()}`;
    const user = { id: userId, email, password, nom };
    usersData[email] = user;

    return NextResponse.json({
      user: { id: user.id, email: user.email, nom: user.nom },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}

declare global {
  var usersStore: Record<string, { id: string; email: string; password: string; nom: string }>;
}
