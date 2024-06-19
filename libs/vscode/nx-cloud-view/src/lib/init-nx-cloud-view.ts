import { onWorkspaceRefreshed } from '@nx-console/vscode/lsp-client';
import { getNxCloudStatus } from '@nx-console/vscode/nx-workspace';
import { CliTaskProvider } from '@nx-console/vscode/tasks';
import { commands, ExtensionContext, tasks } from 'vscode';

export function initNxCloudView(context: ExtensionContext) {
  const setContext = async () => {
    const nxCloudStatus = await getNxCloudStatus();
    commands.executeCommand(
      'setContext',
      'nxConsole.connectedToCloud',
      nxCloudStatus?.isConnected ?? false
    );
  };
  setContext();
  onWorkspaceRefreshed(() => setContext());

  context.subscriptions.push(
    commands.registerCommand('nx.connectToCloud', async () => {
      CliTaskProvider.instance.executeTask({
        command: 'connect',
        flags: [],
      });
    })
  );
}
