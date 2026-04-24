import * as vscode from 'vscode';

import { CommandShelfProvider } from './CommandShelfProvider';
import { GroupShelfItem, CommandShelfItem } from './CommandShelfItem';
import { CommandStore } from './CommandStore';
import type { ShelfCommand, TerminalMode } from './models';

const SHARED_TERMINAL_NAME = 'Command Shelf';
const DEDICATED_TERMINAL_PREFIX = 'Command Shelf: ';

/** Tracks open dedicated terminals keyed by command id. */
const dedicatedTerminals = new Map<string, vscode.Terminal>();

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri;
  if (!workspaceRoot) {
    return;
  }

  const store = new CommandStore(workspaceRoot);
  await store.load();

  const provider = new CommandShelfProvider(store);
  const treeView = vscode.window.createTreeView('commandShelfView', {
    treeDataProvider: provider,
    dragAndDropController: provider,
    canSelectMany: false,
    showCollapseAll: true,
  });

  context.subscriptions.push(store, treeView);

  context.subscriptions.push(
    vscode.window.onDidCloseTerminal((closed) => {
      for (const [id, terminal] of dedicatedTerminals) {
        if (terminal === closed) {
          dedicatedTerminals.delete(id);
          break;
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('commandShelf.addCommand', async () => {
      await withErrorHandling(async () => {
        const label = await promptForLabel();
        if (!label) {
          return;
        }

        const command = await promptForCommand();
        if (!command) {
          return;
        }

        const group = await pickGroup(store, null);
        const terminalMode = await pickTerminalMode();
        if (terminalMode === undefined) {
          return;
        }
        await store.addCommand(label, command, group, terminalMode);
      });
    }),
    vscode.commands.registerCommand('commandShelf.editCommand', async (item?: CommandShelfItem | ShelfCommand) => {
      await withErrorHandling(async () => {
        const command = resolveCommand(store, item);
        if (!command) {
          return;
        }

        const label = await promptForLabel(command.label);
        if (!label) {
          return;
        }

        const commandText = await promptForCommand(command.command);
        if (!commandText) {
          return;
        }

        const group = await pickGroup(store, command.group);
        const terminalMode = await pickTerminalMode(command.terminalMode);
        if (terminalMode === undefined) {
          return;
        }
        await store.editCommand(command.id, {
          label,
          command: commandText,
          group,
          terminalMode,
        });
      });
    }),
    vscode.commands.registerCommand('commandShelf.deleteCommand', async (item?: CommandShelfItem | ShelfCommand) => {
      await withErrorHandling(async () => {
        const command = resolveCommand(store, item);
        if (!command) {
          return;
        }

        const confirmed = await vscode.window.showWarningMessage(
          `Delete command "${command.label}"?`,
          { modal: true },
          'Delete'
        );

        if (confirmed === 'Delete') {
          await store.deleteCommand(command.id);
        }
      });
    }),
    vscode.commands.registerCommand('commandShelf.runCommand', async (item?: CommandShelfItem | ShelfCommand) => {
      await withErrorHandling(async () => {
        const command = resolveCommand(store, item);
        if (!command) {
          return;
        }

        const terminal =
          command.terminalMode === 'dedicated'
            ? getOrCreateDedicatedTerminal(command)
            : getActiveOrSharedTerminal();
        terminal.show(true);
        terminal.sendText(command.command, true);
      });
    }),
    vscode.commands.registerCommand('commandShelf.copyCommand', async (item?: CommandShelfItem | ShelfCommand) => {
      await withErrorHandling(async () => {
        const command = resolveCommand(store, item);
        if (!command) {
          return;
        }

        await vscode.env.clipboard.writeText(command.command);
        await vscode.window.showInformationMessage(`Copied "${command.label}" to the clipboard.`);
      });
    }),
    vscode.commands.registerCommand('commandShelf.addGroup', async () => {
      await withErrorHandling(async () => {
        const label = await promptForGroupLabel();
        if (!label) {
          return;
        }

        await store.addGroup(label);
      });
    }),
    vscode.commands.registerCommand('commandShelf.editGroup', async (item?: GroupShelfItem) => {
      await withErrorHandling(async () => {
        const group = item?.group;
        if (!group) {
          return;
        }

        const label = await promptForGroupLabel(group.label);
        if (!label) {
          return;
        }

        await store.editGroup(group.id, label);
      });
    }),
    vscode.commands.registerCommand('commandShelf.deleteGroup', async (item?: GroupShelfItem) => {
      await withErrorHandling(async () => {
        const group = item?.group;
        if (!group) {
          return;
        }

        const choice = await vscode.window.showWarningMessage(
          `Delete group "${group.label}"?`,
          {
            modal: true,
            detail: 'You can keep the commands and move them to the root, or delete them with the group.',
          },
          'Keep Commands',
          'Delete Commands'
        );

        if (choice === 'Keep Commands') {
          await store.deleteGroup(group.id, true);
        }

        if (choice === 'Delete Commands') {
          await store.deleteGroup(group.id, false);
        }
      });
    })
  );
}

export function deactivate(): void {}

async function withErrorHandling(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error.';
    await vscode.window.showErrorMessage(message);
  }
}

async function promptForLabel(value?: string): Promise<string | undefined> {
  return vscode.window.showInputBox({
    prompt: 'Command label',
    value,
    ignoreFocusOut: true,
    validateInput(input) {
      if (!input.trim()) {
        return 'Label is required.';
      }
      if (input.trim().length > 100) {
        return 'Label must be 100 characters or fewer.';
      }
      return undefined;
    },
  });
}

async function promptForCommand(value?: string): Promise<string | undefined> {
  return vscode.window.showInputBox({
    prompt: 'Command to run in the terminal',
    value,
    ignoreFocusOut: true,
    validateInput(input) {
      return input.trim() ? undefined : 'Command is required.';
    },
  });
}

async function promptForGroupLabel(value?: string): Promise<string | undefined> {
  return vscode.window.showInputBox({
    prompt: 'Group label',
    value,
    ignoreFocusOut: true,
    validateInput(input) {
      if (!input.trim()) {
        return 'Group label is required.';
      }
      if (input.trim().length > 100) {
        return 'Group label must be 100 characters or fewer.';
      }
      return undefined;
    },
  });
}

async function pickGroup(store: CommandStore, currentGroup: string | null): Promise<string | null> {
  const picks: Array<vscode.QuickPickItem & { value: string | null | 'NEW_GROUP' }> = [
    {
      label: '$(plus) New group',
      description: 'Create a new group',
      value: 'NEW_GROUP',
    },
    {
      label: 'Ungrouped',
      description: 'Show at the root of the shelf',
      value: null,
    },
    ...store.getGroups().map((group) => ({
      label: group.label,
      value: group.label,
    })),
  ];

  const selected = await vscode.window.showQuickPick(picks, {
    title: 'Choose a group',
    ignoreFocusOut: true,
    placeHolder: currentGroup ?? 'Ungrouped',
  });

  if (selected?.value === 'NEW_GROUP') {
    const newGroupLabel = await promptForGroupLabel();
    if (!newGroupLabel) {
      return currentGroup;
    }
    await store.addGroup(newGroupLabel);
    return newGroupLabel;
  }

  return selected?.value ?? currentGroup;
}

function resolveCommand(
  store: CommandStore,
  item?: CommandShelfItem | ShelfCommand
): ShelfCommand | undefined {
  if (!item) {
    return undefined;
  }

  if (item instanceof CommandShelfItem) {
    return item.shelfCommand;
  }

  return store.getCommand(item.id);
}

function getActiveOrSharedTerminal(): vscode.Terminal {
  const active = vscode.window.activeTerminal;
  if (active) {
    return active;
  }

  const existing = vscode.window.terminals.find((t) => t.name === SHARED_TERMINAL_NAME);
  if (existing) {
    return existing;
  }

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  return vscode.window.createTerminal({
    name: SHARED_TERMINAL_NAME,
    cwd: workspaceRoot,
  });
}

function getOrCreateDedicatedTerminal(command: ShelfCommand): vscode.Terminal {
  const cached = dedicatedTerminals.get(command.id);
  if (cached && cached.exitStatus === undefined) {
    return cached;
  }

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const terminal = vscode.window.createTerminal({
    name: `${DEDICATED_TERMINAL_PREFIX}${command.label}`,
    cwd: workspaceRoot,
  });
  dedicatedTerminals.set(command.id, terminal);
  return terminal;
}

async function pickTerminalMode(current?: TerminalMode): Promise<TerminalMode | undefined> {
  const currentMode = current ?? 'active';
  const picks: Array<vscode.QuickPickItem & { value: TerminalMode }> = [
    {
      label: '$(terminal) Active terminal',
      description: 'Send to the focused terminal; create a shared terminal if none is open.',
      value: 'active',
    },
    {
      label: '$(terminal-tmux) Dedicated terminal',
      description: 'Reuse a terminal created just for this command.',
      value: 'dedicated',
    },
  ];

  const selected = await vscode.window.showQuickPick(picks, {
    title: 'Choose where to run this command',
    ignoreFocusOut: true,
    placeHolder: currentMode === 'dedicated' ? 'Dedicated terminal' : 'Active terminal',
  });

  return selected?.value;
}