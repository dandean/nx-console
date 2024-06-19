import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'dotenv';

export async function getNxCloudStatus(
  workspaceRoot: string
): Promise<{ isConnected: boolean }> {
  const nxJsonPath = join(workspaceRoot, 'nx.json');
  if (!existsSync(nxJsonPath)) {
    return { isConnected: false };
  }
  try {
    const nxJson = JSON.parse(readFileSync(nxJsonPath, 'utf-8'));
    if (nxJson.nxCloudAccessToken || checkForCloudInTaskRunnerOptions(nxJson)) {
      return { isConnected: true };
    }
    const envContents = readFileSync(join(workspaceRoot, 'nx-cloud.env'));
    const cloudEnv = parse(envContents);
    if (
      process.env.NX_CLOUD_AUTH_TOKEN ||
      process.env.NX_CLOUD_ACCESS_TOKEN ||
      cloudEnv.NX_CLOUD_AUTH_TOKEN ||
      cloudEnv.NX_CLOUD_ACCESS_TOKEN
    ) {
      return { isConnected: true };
    }
  } catch (e) {
    // do nothing
  }
  return { isConnected: false };
}

function checkForCloudInTaskRunnerOptions(nxJson: any) {
  if (!nxJson.tasksRunnerOptions) {
    return false;
  }
  for (const key in nxJson.tasksRunnerOptions) {
    const taskRunnerOption = nxJson.tasksRunnerOptions?.[key];

    if (
      taskRunnerOption &&
      taskRunnerOption.runner === 'nx-cloud' &&
      taskRunnerOption.options?.accessToken
    ) {
      return true;
    }
  }

  return false;
}
