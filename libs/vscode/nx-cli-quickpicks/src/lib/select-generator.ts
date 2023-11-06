import {
  Generator,
  GeneratorType,
  TaskExecutionSchema,
} from '@nx-console/shared/schema';
import { matchWithWildcards } from '@nx-console/shared/utils';
import { GlobalConfigurationStore } from '@nx-console/vscode/configuration';
import {
  getGeneratorOptions,
  getGenerators,
  getNxWorkspace,
} from '@nx-console/vscode/nx-workspace';
import { QuickPickItem, window } from 'vscode';
import { selectFlags } from './select-flags';
import { showNoGeneratorsMessage } from '@nx-console/vscode/utils';

export async function selectGenerator(
  generatorType?: GeneratorType,
  generator?: { collection: string; name: string }
): Promise<TaskExecutionSchema | undefined> {
  interface GenerateQuickPickItem extends QuickPickItem {
    collectionName: string;
    generator: Generator;
    generatorName: string;
    collectionPath: string;
  }
  const generators = await getGenerators();
  let generatorsQuickPicks = generators
    .filter((collection) => !!collection.data)
    .map((collection): GenerateQuickPickItem => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const generatorData = collection.data!;
      return {
        description: generatorData.description,
        label: `${generatorData.collection} - ${generatorData.name}`,
        generatorName: `${generatorData.collection}:${generatorData.name}`,
        collectionName: generatorData.collection,
        collectionPath: collection.path,
        generator: generatorData,
      };
    });

  if (GlobalConfigurationStore.instance.get('enableGeneratorFilters') ?? true) {
    const allowlist: string[] =
      GlobalConfigurationStore.instance.get('generatorAllowlist') ?? [];
    const blocklist: string[] =
      GlobalConfigurationStore.instance.get('generatorBlocklist') ?? [];

    if (allowlist.length > 0) {
      generatorsQuickPicks = generatorsQuickPicks.filter((item) =>
        allowlist.find((rule) => matchWithWildcards(item.generatorName, rule))
      );
    }

    if (blocklist.length > 0) {
      generatorsQuickPicks = generatorsQuickPicks.filter(
        (item) =>
          !blocklist.find((rule) =>
            matchWithWildcards(item.generatorName, rule)
          )
      );
    }
  }

  if (generatorType) {
    generatorsQuickPicks = generatorsQuickPicks.filter((generator) => {
      return generator.generator.type === generatorType;
    });
  }

  if (!generators || !generators.length) {
    showNoGeneratorsMessage();
    return;
  }
  const selection = generator
    ? generatorsQuickPicks.find(
        (quickPick) =>
          quickPick.generator.collection === generator.collection &&
          quickPick.generator.name === generator.name
      )
    : generatorsQuickPicks.length > 1
    ? await window.showQuickPick(generatorsQuickPicks)
    : generatorsQuickPicks[0];
  if (selection) {
    const options =
      selection.generator.options ||
      (await getGeneratorOptions({
        collection: selection.collectionName,
        name: selection.generator.name,
        path: selection.collectionPath,
      }));
    const positional = selection.generatorName;
    return {
      ...selection.generator,
      options,
      command: 'generate',
      positional,
    };
  }
}

export async function selectGeneratorAndPromptForFlags(): Promise<
  | {
      generator: TaskExecutionSchema;
      flags: string[];
    }
  | undefined
> {
  const { validWorkspaceJson } = await getNxWorkspace();

  if (!validWorkspaceJson) {
    return;
  }

  const selection = await selectGenerator();
  if (!selection) {
    return;
  }

  const flags = await selectFlags(
    `generate ${selection.positional}`,
    selection.options
  );

  return {
    generator: selection,
    flags: flags ?? [],
  };
}
