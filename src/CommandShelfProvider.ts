import * as vscode from 'vscode';

import { CommandStore } from './CommandStore';
import { CommandShelfItem, GroupShelfItem, type ShelfItem } from './CommandShelfItem';
import type { ShelfCommand } from './models';

const TREE_MIME_TYPE = 'application/vnd.code.tree.commandShelfView';

type DragPayload = {
  commandIds: string[];
};

export class CommandShelfProvider
  implements vscode.TreeDataProvider<ShelfItem>, vscode.TreeDragAndDropController<ShelfItem>
{
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<ShelfItem | undefined>();

  public readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;
  public readonly dragMimeTypes = [TREE_MIME_TYPE];
  public readonly dropMimeTypes = [TREE_MIME_TYPE];

  public constructor(private readonly store: CommandStore) {
    this.store.onDidChange(() => {
      this.refresh();
    });
  }

  public getTreeItem(element: ShelfItem): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: ShelfItem): ShelfItem[] {
    if (!element) {
      const groups = this.store.getGroups().map(
        (group) => new GroupShelfItem(group, this.store.getCommandsByGroup(group.label).length)
      );
      const ungroupedCommands = this.store.getCommandsByGroup(null).map(
        (command) => new CommandShelfItem(command)
      );
      return [...groups, ...ungroupedCommands];
    }

    if (element instanceof GroupShelfItem) {
      return this.store.getCommandsByGroup(element.group.label).map((command) => new CommandShelfItem(command));
    }

    return [];
  }

  public getParent(element: ShelfItem): vscode.ProviderResult<ShelfItem> {
    if (!(element instanceof CommandShelfItem) || element.shelfCommand.group === null) {
      return undefined;
    }

    const group = this.store.getGroups().find((item) => item.label === element.shelfCommand.group);
    if (!group) {
      return undefined;
    }

    return new GroupShelfItem(group, this.store.getCommandsByGroup(group.label).length);
  }

  public async handleDrag(
    source: readonly ShelfItem[],
    dataTransfer: vscode.DataTransfer
  ): Promise<void> {
    const commandIds = source
      .filter((item): item is CommandShelfItem => item instanceof CommandShelfItem)
      .map((item) => item.shelfCommand.id);

    dataTransfer.set(TREE_MIME_TYPE, new vscode.DataTransferItem(JSON.stringify({ commandIds } satisfies DragPayload)));
  }

  public async handleDrop(
    target: ShelfItem | undefined,
    dataTransfer: vscode.DataTransfer,
    _token: vscode.CancellationToken
  ): Promise<void> {
    const transferItem = dataTransfer.get(TREE_MIME_TYPE);
    if (!transferItem) {
      return;
    }

    const rawValue = await transferItem.asString();
    const payload = JSON.parse(rawValue) as DragPayload;
    if (!Array.isArray(payload.commandIds) || payload.commandIds.length === 0) {
      return;
    }

    const commandId = payload.commandIds[0];
    const targetGroup = this.resolveTargetGroup(target);
    const targetIndex = this.resolveTargetIndex(target, targetGroup, commandId);
    await this.store.reorder(commandId, targetGroup, targetIndex);
  }

  public refresh(): void {
    this.onDidChangeTreeDataEmitter.fire(undefined);
  }

  private resolveTargetGroup(target: ShelfItem | undefined): string | null {
    if (!target) {
      return null;
    }

    if (target instanceof GroupShelfItem) {
      return target.group.label;
    }

    return target.shelfCommand.group;
  }

  private resolveTargetIndex(target: ShelfItem | undefined, targetGroup: string | null, draggedId: string): number {
    const siblings = this.store
      .getCommandsByGroup(targetGroup)
      .filter((command) => command.id !== draggedId);

    if (!target) {
      return siblings.length;
    }

    if (target instanceof GroupShelfItem) {
      return siblings.length;
    }

    const targetCommand = target.shelfCommand;
    const index = siblings.findIndex((command) => command.id === targetCommand.id);
    return index === -1 ? siblings.length : index;
  }

  public getCommandItems(): ShelfCommand[] {
    return this.store.getCommands();
  }
}