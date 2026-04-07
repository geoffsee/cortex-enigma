import type { SelectionState } from '../../domain/types';

export interface IStoragePort {
  load(): unknown;
  save(state: SelectionState): void;
}
