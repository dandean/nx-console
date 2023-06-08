import { ContextProvider } from '@lit-labs/context';
import { css, CSSResultGroup, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import './components/fields/checkbox-field';
import './components/fields/array-field';
import './components/fields/input-field';
import './components/fields/multiselect-field';
import './components/fields/select-field';
import './components/button';
import './components/field-list';
import './components/search-bar';
import '@nx-console/shared/lit-utils';
import { editorContext } from './editor-context';
import { debounce, getGeneratorIdentifier } from './generator-schema-utils';
import { IdeCommunicationController } from './ide-communication.controller';
import {
  formValuesServiceContext,
  FormValuesService,
} from './form-values.service';

@customElement('root-element')
export class Root extends LitElement {
  private icc: IdeCommunicationController;

  private editorContextProvider = new ContextProvider(this, {
    context: editorContext,
  });

  private formValuesService: FormValuesService;
  private formValuesServiceContextProvider = new ContextProvider(this, {
    context: formValuesServiceContext,
  });

  constructor() {
    super();
    this.icc = new IdeCommunicationController(this);

    this.editorContextProvider.setValue(this.icc.editor);

    this.formValuesService = new FormValuesService(this.icc, () =>
      this.handleValidFormChange()
    );
    this.formValuesServiceContextProvider.setValue(this.formValuesService);
  }

  @state()
  private searchValue = '';

  render() {
    const options = this.icc.generatorSchema?.options;
    return html` <div class="text-foreground h-screen flex flex-col">
      <div
        class="sticky top-0 z-50 p-6 w-full bg-background border-b-2 border-fieldBorder"
      >
        ${this.renderHeader()}
      </div>
      <div class="grow overflow-auto">
        ${!options || options.length === 0
          ? html`<p>No options</p>`
          : html` <field-list
              class="h-full"
              .options="${options}"
              .searchValue="${this.searchValue}"
            ></field-list>`}
      </div>
    </div>`;
  }

  private handleSearchValueChange(e: CustomEvent) {
    this.searchValue = e.detail;
  }

  private renderHeader() {
    return html`
      <div class="">
        <header class="flex justify-between items-center">
          <div>
            <h1 class="text-xl font-bold">
              nx generate ${getGeneratorIdentifier(this.icc.generatorSchema)}
            </h1>
          </div>

          <div class="flex space-x-2">
            ${when(
              !this.icc.configuration?.enableTaskExecutionDryRunOnChange,
              () =>
                html` <button-element
                  class="px-3 py-2"
                  @click="${() => this.runGenerator(true)}"
                  text="Dry Run"
                >
                </button-element>`
            )}

            <button-element
              class="px-3 py-2"
              @click="${() => this.runGenerator()}"
              text="Generate"
            >
            </button-element>
          </div>
        </header>

        <div class="mt-5">
          <search-bar
            @search-input="${this.handleSearchValueChange}"
          ></search-bar>
        </div>
      </div>
    `;
  }

  private handleValidFormChange() {
    if (this.icc.configuration?.enableTaskExecutionDryRunOnChange) {
      this.debouncedRunGenerator(true);
    }
  }

  private runGenerator(dryRun = false) {
    const args = this.formValuesService.getSerializedFormValues();
    args.push('--no-interactive');
    if (dryRun) {
      args.push('--dry-run');
    }
    this.icc.postMessageToIde({
      payloadType: 'run-generator',
      payload: {
        positional: getGeneratorIdentifier(this.icc.generatorSchema),
        flags: args,
      },
    });
  }

  private debouncedRunGenerator = debounce(
    (dryRun: boolean) => this.runGenerator(dryRun),
    500
  );

  protected createRenderRoot() {
    return this;
  }
}
