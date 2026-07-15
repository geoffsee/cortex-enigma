import { useCallback, useState } from 'react';
import {
  addParticipant,
  createSession,
  removeParticipant,
  updateNote,
  type CollaborativeSession,
} from '../../domain/collaborativeSession';

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

export function useCollaborativeSession() {
  const [session, setSession] = useState<CollaborativeSession>(() =>
    createSession(newId().replace(/-/g, '').slice(0, 8).toUpperCase()),
  );

  const add = useCallback((name: string, note: string) => {
    setSession(s => addParticipant(s, { id: newId(), name, note }));
  }, []);

  const remove = useCallback((id: string) => {
    setSession(s => removeParticipant(s, id));
  }, []);

  const setNote = useCallback((id: string, note: string) => {
    setSession(s => updateNote(s, id, note));
  }, []);

  return { session, add, remove, setNote };
}
