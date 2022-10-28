import { ThemeColor, ThemeIcon, TreeItem } from 'vscode';
import { CloudRun } from './cloud-run.model';

export class NxCloudRunsTreeItem extends TreeItem {
  constructor(cloudRun: CloudRun) {
    super(cloudRun.command);
    const success = cloudRun.tasks.every((t) => t.status === 0);
    this.iconPath = new ThemeIcon(
      success ? 'pass' : 'stop',
      new ThemeColor(success ? 'testing.iconPassed' : 'testing.iconFailed')
    );
  }
}
