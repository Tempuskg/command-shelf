import { randomUUID } from 'node:crypto';
import * as vscode from 'vscode';

import type { ShelfCommand, ShelfData, ShelfGroup, TerminalMode } from './models';

const DATA_VERSION = 1;
const MAX_LABEL_LENGTH = 100;

type EditableCommandFields = Partial<Pick<ShelfCommand, 'label' | 'command' | 'group' | 'terminalMode'>>;

function createEmptyData(): ShelfData {
  return {
    version: DATA_VERSION,
    commands: [],
    groups: [],
  };
}

function normalizeLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error('Label is required.');
  }
  if (trimmed.length > MAX_LABEL_LENGTH) {
    throw new Error(`Label must be ${MAX_LABEL_LENGTH} characters or fewer.`);
  }
  return trimmed;
}

function normalizeCommand(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error('Command is required.');
  }
  return trimmed;
}

function sortByOrder<T extends { sortOrder: number; label?: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }
    return (left.label ?? '').localeCompare(right.label ?? '');
  });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export class CommandStore implements vscode.Disposable {
  private readonly onDidChangeEmitter = new vscode.EventEmitter<void>();
  private readonly workspaceRoot: vscode.Uri;
  private readonly storageFile: vscode.Uri;
  private readonly storageDir: vscode.Uri;
  private readonly tempFile: vscode.Uri;
  private readonly watcher: vscode.FileSystemWatcher;
  private suppressWatcher = false;
  private data: ShelfData = createEmptyData();

  public readonly onDidChange = this.onDidChangeEmitter.event;

  public constructor(workspaceRoot: vscode.Uri) {
    this.workspaceRoot = workspaceRoot;
    this.storageDir = vscode.Uri.joinPath(workspaceRoot, '.vscode');
    this.storageFile = vscode.Uri.joinPath(this.storageDir, 'command-shelf.json');
    this.tempFile = vscode.Uri.joinPath(this.storageDir, 'command-shelf.json.tmp');
    this.watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(this.workspaceRoot, '.vscode/command-shelf.json')
    );

    const handleExternalChange = async (): Promise<void> => {
      if (this.suppressWatcher) {
        return;
      }

      await this.load({ createIfMissing: false });
      this.onDidChangeEmitter.fire();
    };

    this.watcher.onDidChange(handleExternalChange);
    this.watcher.onDidCreate(handleExternalChange);
    this.watcher.onDidDelete(async () => {
      if (this.suppressWatcher) {
        return;
      }

      this.data = createEmptyData();
      this.onDidChangeEmitter.fire();
    });
  }

  public async load(options: { createIfMissing?: boolean } = {}): Promise<void> {
    const createIfMissing = options.createIfMissing ?? true;

    try {
      const buffer = await vscode.workspace.fs.readFile(this.storageFile);
      const parsed = JSON.parse(Buffer.from(buffer).toString('utf8')) as unknown;
      this.data = this.validateData(parsed);
    } catch (error) {
      if (error instanceof vscode.FileSystemError) {
        if (error.code === 'FileNotFound') {
          this.data = createEmptyData();
          if (createIfMissing) {
            await this.saveInternal(false);
          }
          return;
        }
      }

      this.data = createEmptyData();
      vscode.window.showWarningMessage('Command Shelf ignored an invalid command-shelf.json file.');
      if (createIfMissing) {
        await this.saveInternal(false);
      }
    }
  }

  public dispose(): void {
    this.watcher.dispose();
    this.onDidChangeEmitter.dispose();
  }

  public getCommands(): ShelfCommand[] {
    return sortByOrder(this.data.commands);
  }

  public getGroups(): ShelfGroup[] {
    return sortByOrder(this.data.groups);
  }

  public getCommandsByGroup(groupLabel: string | null): ShelfCommand[] {
    return sortByOrder(this.data.commands.filter((command) => command.group === groupLabel));
  }

  public getCommand(id: string): ShelfCommand | undefined {
    return this.data.commands.find((command) => command.id === id);
  }

  public getGroup(id: string): ShelfGroup | undefined {
    return this.data.groups.find((group) => group.id === id);
  }

  public async addCommand(label: string, command: string, group: string | null = null, terminalMode: TerminalMode = 'active'): Promise<ShelfCommand> {
    const nextCommand: ShelfCommand = {
      id: randomUUID(),
      label: normalizeLabel(label),
      command: normalizeCommand(command),
      group: this.normalizeGroupLabel(group),
      sortOrder: this.getNextSortOrderForScope(group ?? null),
      terminalMode,
    };

    this.data.commands.push(nextCommand);
    await this.saveAndNotify();
    return nextCommand;
  }

  public async editCommand(id: string, updates: EditableCommandFields): Promise<void> {
    const command = this.requireCommand(id);
    const nextGroup = updates.group === undefined ? command.group : this.normalizeGroupLabel(updates.group);
    const changedScope = nextGroup !== command.group;

    command.label = updates.label === undefined ? command.label : normalizeLabel(updates.label);
    command.command = updates.command === undefined ? command.command : normalizeCommand(updates.command);
    command.terminalMode = updates.terminalMode === undefined ? command.terminalMode : updates.terminalMode;

    if (changedScope) {
      command.group = nextGroup;
      command.sortOrder = this.getNextSortOrderForScope(nextGroup);
      this.resequenceCommands(command.group === null ? null : command.group, command.id);
    }

    await this.saveAndNotify();
  }

  public async deleteCommand(id: string): Promise<void> {
    const command = this.requireCommand(id);
    this.data.commands = this.data.commands.filter((item) => item.id !== id);
    this.resequenceCommands(command.group);
    await this.saveAndNotify();
  }

  public async addGroup(label: string): Promise<ShelfGroup> {
    const nextLabel = normalizeLabel(label);
    this.ensureUniqueGroupLabel(nextLabel);

    const nextGroup: ShelfGroup = {
      id: randomUUID(),
      label: nextLabel,
      sortOrder: this.getNextGroupSortOrder(),
    };

    this.data.groups.push(nextGroup);
    await this.saveAndNotify();
    return nextGroup;
  }

  public async editGroup(id: string, newLabel: string): Promise<void> {
    const group = this.requireGroup(id);
    const normalizedLabel = normalizeLabel(newLabel);

    if (normalizedLabel !== group.label) {
      this.ensureUniqueGroupLabel(normalizedLabel);
      const previousLabel = group.label;
      group.label = normalizedLabel;
      for (const command of this.data.commands) {
        if (command.group === previousLabel) {
          command.group = normalizedLabel;
        }
      }
    }

    await this.saveAndNotify();
  }

  public async deleteGroup(id: string, keepCommands: boolean): Promise<void> {
    const group = this.requireGroup(id);
    this.data.groups = this.data.groups.filter((item) => item.id !== id);

    if (keepCommands) {
      const movedCommands = this.data.commands.filter((command) => command.group === group.label);
      for (const command of movedCommands) {
        command.group = null;
        command.sortOrder = this.getNextSortOrderForScope(null);
      }
      this.resequenceCommands(null);
    } else {
      this.data.commands = this.data.commands.filter((command) => command.group !== group.label);
    }

    this.resequenceGroups();
    this.resequenceCommands(group.label);
    await this.saveAndNotify();
  }

  public async reorder(id: string, targetGroup: string | null, newSortOrder: number): Promise<void> {
    const groupLabel = this.normalizeGroupLabel(targetGroup);
    const command = this.requireCommand(id);
    const sourceGroup = command.group;
    const siblings = sortByOrder(
      this.data.commands.filter((item) => item.id !== id && item.group === groupLabel)
    );

    const boundedIndex = Math.max(0, Math.min(newSortOrder, siblings.length));
    siblings.splice(boundedIndex, 0, command);

    command.group = groupLabel;
    siblings.forEach((item, index) => {
      item.group = groupLabel;
      item.sortOrder = index;
    });

    if (sourceGroup !== groupLabel) {
      this.resequenceCommands(sourceGroup, id);
    }

    await this.saveAndNotify();
  }

  private validateData(value: unknown): ShelfData {
    if (!isObject(value)) {
      throw new Error('Invalid shelf data.');
    }

    if (value.version !== DATA_VERSION) {
      throw new Error('Unsupported shelf data version.');
    }

    const rawGroups = Array.isArray(value.groups) ? value.groups : [];
    const groups: ShelfGroup[] = [];
    const groupLabels = new Set<string>();

    for (const candidate of rawGroups) {
      if (!isObject(candidate)) {
        continue;
      }

      const id = typeof candidate.id === 'string' ? candidate.id : undefined;
      const label = typeof candidate.label === 'string' ? candidate.label : undefined;
      const sortOrder = typeof candidate.sortOrder === 'number' ? candidate.sortOrder : undefined;

      if (!id || !label || sortOrder === undefined) {
        continue;
      }

      try {
        const normalizedLabel = normalizeLabel(label);
        if (groupLabels.has(normalizedLabel)) {
          continue;
        }

        groups.push({
          id,
          label: normalizedLabel,
          sortOrder,
        });
        groupLabels.add(normalizedLabel);
      } catch {
        continue;
      }
    }

    const rawCommands = Array.isArray(value.commands) ? value.commands : [];
    const commands: ShelfCommand[] = [];

    for (const candidate of rawCommands) {
      if (!isObject(candidate)) {
        continue;
      }

      const id = typeof candidate.id === 'string' ? candidate.id : undefined;
      const label = typeof candidate.label === 'string' ? candidate.label : undefined;
      const commandText = typeof candidate.command === 'string' ? candidate.command : undefined;
      const group = typeof candidate.group === 'string' ? candidate.group : candidate.group === null ? null : undefined;
      const sortOrder = typeof candidate.sortOrder === 'number' ? candidate.sortOrder : undefined;
      const rawTerminalMode = candidate.terminalMode;
      const terminalMode: TerminalMode =
        rawTerminalMode === 'active' || rawTerminalMode === 'dedicated' ? rawTerminalMode : 'active';

      if (!id || !label || !commandText || group === undefined || sortOrder === undefined) {
        continue;
      }

      try {
        const normalizedGroup = group === null ? null : normalizeLabel(group);
        if (normalizedGroup !== null && !groupLabels.has(normalizedGroup)) {
          continue;
        }

        commands.push({
          id,
          label: normalizeLabel(label),
          command: normalizeCommand(commandText),
          group: normalizedGroup,
          sortOrder,
          terminalMode,
        });
      } catch {
        continue;
      }
    }

    return {
      version: DATA_VERSION,
      groups: sortByOrder(groups).map((group, index) => ({ ...group, sortOrder: index })),
      commands: this.normalizeCommandSortOrders(commands),
    };
  }

  private normalizeCommandSortOrders(commands: ShelfCommand[]): ShelfCommand[] {
    const byGroup = new Map<string | null, ShelfCommand[]>();
    for (const command of commands) {
      const key = command.group;
      const items = byGroup.get(key) ?? [];
      items.push(command);
      byGroup.set(key, items);
    }

    const normalized: ShelfCommand[] = [];
    for (const items of byGroup.values()) {
      normalized.push(
        ...sortByOrder(items).map((command, index) => ({
          ...command,
          sortOrder: index,
        }))
      );
    }
    return normalized;
  }

  private normalizeGroupLabel(group: string | null): string | null {
    if (group === null) {
      return null;
    }

    const normalized = normalizeLabel(group);
    if (!this.data.groups.some((candidate) => candidate.label === normalized)) {
      throw new Error(`Group "${normalized}" does not exist.`);
    }

    return normalized;
  }

  private ensureUniqueGroupLabel(label: string): void {
    if (this.data.groups.some((group) => group.label.localeCompare(label, undefined, { sensitivity: 'accent' }) === 0)) {
      throw new Error(`Group "${label}" already exists.`);
    }
  }

  private requireCommand(id: string): ShelfCommand {
    const command = this.getCommand(id);
    if (!command) {
      throw new Error('Command not found.');
    }
    return command;
  }

  private requireGroup(id: string): ShelfGroup {
    const group = this.getGroup(id);
    if (!group) {
      throw new Error('Group not found.');
    }
    return group;
  }

  private getNextSortOrderForScope(group: string | null): number {
    return this.getCommandsByGroup(group).length;
  }

  private getNextGroupSortOrder(): number {
    return this.getGroups().length;
  }

  private resequenceCommands(group: string | null, excludeId?: string): void {
    const commands = sortByOrder(
      this.data.commands.filter((command) => command.group === group && command.id !== excludeId)
    );
    commands.forEach((command, index) => {
      command.sortOrder = index;
    });
  }

  private resequenceGroups(): void {
    sortByOrder(this.data.groups).forEach((group, index) => {
      group.sortOrder = index;
    });
  }

  private async saveAndNotify(): Promise<void> {
    await this.saveInternal(true);
    this.onDidChangeEmitter.fire();
  }

  private async saveInternal(deleteTempFile: boolean): Promise<void> {
    await vscode.workspace.fs.createDirectory(this.storageDir);

    const bytes = Buffer.from(JSON.stringify(this.serializeData(), null, 2) + '\n', 'utf8');
    this.suppressWatcher = true;
    try {
      await vscode.workspace.fs.writeFile(this.tempFile, bytes);
      await vscode.workspace.fs.rename(this.tempFile, this.storageFile, { overwrite: true });
    } finally {
      if (deleteTempFile) {
        try {
          await vscode.workspace.fs.delete(this.tempFile);
        } catch {
          // Ignore cleanup failures for temp files.
        }
      }
      this.suppressWatcher = false;
    }
  }

  private serializeData(): ShelfData {
    return {
      version: DATA_VERSION,
      groups: sortByOrder(this.data.groups).map((group, index) => ({
        ...group,
        sortOrder: index,
      })),
      commands: this.normalizeCommandSortOrders(this.data.commands),
    };
  }
}