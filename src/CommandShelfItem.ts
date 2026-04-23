import * as vscode from 'vscode';

import type { ShelfCommand, ShelfGroup } from './models';

export type ShelfItem = GroupShelfItem | CommandShelfItem;

export class GroupShelfItem extends vscode.TreeItem {
  public constructor(
    public readonly group: ShelfGroup,
    commandCount: number
  ) {
    super(group.label, vscode.TreeItemCollapsibleState.Expanded);
    this.id = group.id;
    this.contextValue = 'shelfGroup';
    this.iconPath = new vscode.ThemeIcon('folder');
    this.description = `${commandCount}`;
    this.tooltip = `${group.label} (${commandCount} command${commandCount === 1 ? '' : 's'})`;
  }
}

export class CommandShelfItem extends vscode.TreeItem {
  public constructor(public readonly shelfCommand: ShelfCommand) {
    super(shelfCommand.label, vscode.TreeItemCollapsibleState.None);
    this.id = shelfCommand.id;
    this.contextValue = 'shelfCommand';
    this.iconPath = new vscode.ThemeIcon('terminal');
    this.description = shelfCommand.command;
    this.tooltip =
      shelfCommand.terminalMode === 'dedicated'
        ? `${shelfCommand.command}\n\nRuns in a dedicated terminal`
        : shelfCommand.command;
    this.command = {
      command: 'commandShelf.runCommand',
      title: 'Run Command',
      arguments: [shelfCommand],
    };
  }
}