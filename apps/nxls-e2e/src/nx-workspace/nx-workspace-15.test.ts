import { simpleReactWorkspaceOptions, uniq } from '../utils';
import { testNxWorkspace } from './nx-workspace-base';

const workspaceName = uniq('workspace');

testNxWorkspace(
  '15',
  simpleReactWorkspaceOptions,
  workspaceName,
  [`e2e`, workspaceName],
  [
    { [`e2e`]: ['e2e', 'lint'] },
    {
      [workspaceName]: [
        'build',
        'lint',
        'preview',
        'serve',
        'serve-static',
        'start',
        'test',
      ],
    },
  ]
);
