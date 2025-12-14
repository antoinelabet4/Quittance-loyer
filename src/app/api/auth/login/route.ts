import { NextResponse } from 'next/server';

function initializeDefaultUser() {
  if (typeof window === 'undefined') {
    if (!global.usersStore) {
      global.usersStore = {};
    }
    
    if (!global.usersStore['antoinelabet@gmail.com']) {
      global.usersStore['antoinelabet@gmail.com'] = {
        id: 'user_antoine_labet',
        email: 'antoinelabet@gmail.com',
        password: 'password123',
        nom: 'Labet Conseil',
      };
    }
  }
}

export async function POST(request: Request) {
  try {
    initializeDefaultUser();
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const usersData = typeof window === 'undefined' 
      ? global.usersStore || (global.usersStore = {})
      : {};

    const user = usersData[email];

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email, nom: user.nom },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}

declare global {
  var usersStore: Record<string, { id: string; email: string; password: string; nom: string }>;
}