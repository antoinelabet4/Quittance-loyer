import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const usersData = typeof window === 'undefined' 
      ? global.usersStore || (global.usersStore = {})
      : {};

    const users = Object.values(usersData).map(({ id, email, nom }) => ({
      id,
      email,
      nom,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

declare global {
  var usersStore: Record<string, { id: string; email: string; password: string; nom: string }>;
}
