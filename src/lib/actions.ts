'use server';

import { db } from './db';
import { bailleurs, locataires, appartements, quittances, appartementLocataires } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from './auth';
import { headers } from 'next/headers';

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

// Bailleurs
export async function getBailleurs() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return await db.query.bailleurs.findMany({
    where: eq(bailleurs.userId, session.user.id),
  });
}

export async function addBailleur(data: any) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const id = crypto.randomUUID();
  await db.insert(bailleurs).values({
    id,
    userId: session.user.id,
    ...data,
  });
  return id;
}

export async function updateBailleur(id: string, data: any) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  await db.update(bailleurs)
    .set(data)
    .where(and(eq(bailleurs.id, id), eq(bailleurs.userId, session.user.id)));
}

export async function deleteBailleur(id: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  await db.delete(bailleurs)
    .where(and(eq(bailleurs.id, id), eq(bailleurs.userId, session.user.id)));
}

// Locataires
export async function getLocataires() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return await db.query.locataires.findMany({
    where: eq(locataires.userId, session.user.id),
  });
}

export async function addLocataire(data: any) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const id = crypto.randomUUID();
  await db.insert(locataires).values({
    id,
    userId: session.user.id,
    ...data,
  });
  return id;
}

export async function updateLocataire(id: string, data: any) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  await db.update(locataires)
    .set(data)
    .where(and(eq(locataires.id, id), eq(locataires.userId, session.user.id)));
}

export async function deleteLocataire(id: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  await db.delete(locataires)
    .where(and(eq(locataires.id, id), eq(locataires.userId, session.user.id)));
}

// Appartements
export async function getAppartements() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return await db.query.appartements.findMany({
    where: eq(appartements.userId, session.user.id),
  });
}

export async function addAppartement(data: any) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const id = crypto.randomUUID();
  await db.insert(appartements).values({
    id,
    userId: session.user.id,
    ...data,
  });
  return id;
}

export async function updateAppartement(id: string, data: any) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  await db.update(appartements)
    .set(data)
    .where(and(eq(appartements.id, id), eq(appartements.userId, session.user.id)));
}

export async function deleteAppartement(id: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  await db.delete(appartements)
    .where(and(eq(appartements.id, id), eq(appartements.userId, session.user.id)));
}

// Quittances
export async function getQuittances() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return await db.query.quittances.findMany({
    where: eq(quittances.userId, session.user.id),
  });
}

export async function addQuittance(data: any) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const id = crypto.randomUUID();
  await db.insert(quittances).values({
    id,
    userId: session.user.id,
    ...data,
  });
  return id;
}

export async function updateQuittance(id: string, data: any) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  await db.update(quittances)
    .set(data)
    .where(and(eq(quittances.id, id), eq(quittances.userId, session.user.id)));
}

export async function deleteQuittance(id: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  await db.delete(quittances)
    .where(and(eq(quittances.id, id), eq(quittances.userId, session.user.id)));
}

// Appartement Locataires
export async function getAppartementLocataires() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  // Need a join or just filter if needed, but for now just returning all for simplicity as per original code
  return await db.query.appartementLocataires.findMany();
}

export async function addAppartementLocataire(data: any) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const id = crypto.randomUUID();
  await db.insert(appartementLocataires).values({
    id,
    ...data,
  });
  return id;
}

export async function deleteAppartementLocataire(id: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  await db.delete(appartementLocataires)
    .where(eq(appartementLocataires.id, id));
}
