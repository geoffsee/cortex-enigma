// A minimal, transport-free model of a shared composing session. This is an
// exploratory-spike surface: there is no backend, so "collaboration" is
// prototyped locally as a roster of contributors carrying art-director notes
// (Maciej's framing) that can be summarised into shareable text. ID generation
// is left to callers so this stays pure and testable.

export interface SessionParticipant {
  id: string;
  name: string;
  note: string;
}

export interface CollaborativeSession {
  id: string;
  participants: SessionParticipant[];
}

export function createSession(id: string): CollaborativeSession {
  return { id, participants: [] };
}

export function addParticipant(
  session: CollaborativeSession,
  participant: SessionParticipant,
): CollaborativeSession {
  const name = participant.name.trim();
  if (!name) return session;
  if (session.participants.some(p => p.id === participant.id)) return session;
  return {
    ...session,
    participants: [
      ...session.participants,
      { id: participant.id, name, note: participant.note.trim() },
    ],
  };
}

export function removeParticipant(
  session: CollaborativeSession,
  id: string,
): CollaborativeSession {
  return { ...session, participants: session.participants.filter(p => p.id !== id) };
}

export function updateNote(
  session: CollaborativeSession,
  id: string,
  note: string,
): CollaborativeSession {
  return {
    ...session,
    participants: session.participants.map(p =>
      p.id === id ? { ...p, note: note.trim() } : p,
    ),
  };
}

export function sessionSummary(session: CollaborativeSession, prompt: string): string {
  const roster = session.participants.length
    ? session.participants.map(p => `- ${p.name}${p.note ? `: ${p.note}` : ''}`)
    : ['- (none yet)'];
  return [
    `Cortex Enigma session ${session.id}`,
    `Prompt: ${prompt || '(empty)'}`,
    '',
    'Collaborators:',
    ...roster,
  ].join('\n');
}
