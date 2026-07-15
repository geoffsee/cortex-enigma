import { describe, it, expect } from 'vitest';
import {
  addParticipant,
  createSession,
  removeParticipant,
  sessionSummary,
  updateNote,
} from './collaborativeSession';

describe('collaborativeSession', () => {
  it('creates an empty session with the given id', () => {
    expect(createSession('ABC123')).toEqual({ id: 'ABC123', participants: [] });
  });

  it('adds a participant, trimming name and note', () => {
    const session = addParticipant(createSession('S1'), {
      id: 'p1',
      name: '  Refik  ',
      note: '  more low end  ',
    });
    expect(session.participants).toEqual([{ id: 'p1', name: 'Refik', note: 'more low end' }]);
  });

  it('ignores a participant with a blank name', () => {
    const session = addParticipant(createSession('S1'), { id: 'p1', name: '   ', note: 'x' });
    expect(session.participants).toHaveLength(0);
  });

  it('does not add a duplicate id', () => {
    const first = addParticipant(createSession('S1'), { id: 'p1', name: 'Maciej', note: '' });
    const second = addParticipant(first, { id: 'p1', name: 'Other', note: '' });
    expect(second.participants).toHaveLength(1);
  });

  it('removes a participant by id', () => {
    const seeded = addParticipant(createSession('S1'), { id: 'p1', name: 'Maciej', note: '' });
    expect(removeParticipant(seeded, 'p1').participants).toHaveLength(0);
  });

  it('updates a participant note', () => {
    const seeded = addParticipant(createSession('S1'), { id: 'p1', name: 'Maciej', note: '' });
    const updated = updateNote(seeded, 'p1', '  warmer palette  ');
    expect(updated.participants[0].note).toBe('warmer palette');
  });

  it('summarises the session as shareable text', () => {
    const seeded = addParticipant(createSession('SESSION7'), {
      id: 'p1',
      name: 'Refik',
      note: 'sound as an audience variable',
    });
    expect(sessionSummary(seeded, 'a photo, surreal')).toBe(
      [
        'Cortex Enigma session SESSION7',
        'Prompt: a photo, surreal',
        '',
        'Collaborators:',
        '- Refik: sound as an audience variable',
      ].join('\n'),
    );
  });

  it('summarises an empty session without collaborators or prompt', () => {
    expect(sessionSummary(createSession('S1'), '')).toBe(
      ['Cortex Enigma session S1', 'Prompt: (empty)', '', 'Collaborators:', '- (none yet)'].join(
        '\n',
      ),
    );
  });
});
