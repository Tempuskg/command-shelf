export type TerminalMode = 'active' | 'dedicated';

export interface ShelfCommand {
  id: string;
  label: string;
  command: string;
  group: string | null;
  sortOrder: number;
  terminalMode: TerminalMode;
}

export interface ShelfGroup {
  id: string;
  label: string;
  sortOrder: number;
}

export interface ShelfData {
  version: number;
  commands: ShelfCommand[];
  groups: ShelfGroup[];
}