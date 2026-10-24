import { getAllUsers, upsertUser } from './queries.ts';
import { UserProfile } from '../types.ts';

export async function getOrCreateUser(uid: string, email: string, fullName?: string, role?: string): Promise<UserProfile> {
  const allUsers = await getAllUsers();
  const existing = allUsers.find(
    (u) => u.id === uid || (u.email && u.email.toLowerCase() === email.toLowerCase())
  );
  if (existing) {
    const updated: UserProfile = {
      ...existing,
      email,
      fullName: fullName || existing.fullName,
      role: (role as any) || existing.role,
      updatedAt: new Date().toISOString(),
    };
    await upsertUser(updated);
    return updated;
  }

  const newUser: UserProfile = {
    id: uid,
    userId: uid,
    email,
    fullName: fullName || 'Anonymous Citizen',
    role: (role as any) || 'Citizen',
    status: 'active',
    reputationScore: 50,
    zone: 'Bahir Dar Special Zone',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await upsertUser(newUser);
  return newUser;
}
