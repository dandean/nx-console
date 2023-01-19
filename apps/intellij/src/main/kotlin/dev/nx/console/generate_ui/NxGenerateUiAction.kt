package dev.nx.console.generate_ui

import com.intellij.codeInsight.editorActions.TextBlockTransferable.convertLineSeparators
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.components.service
import com.intellij.openapi.diagnostic.logger
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.editor.actions.ContentChooser.RETURN_SYMBOL
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.fileEditor.TextEditor
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.popup.JBPopupFactory
import com.intellij.openapi.util.text.StringUtil.first
import com.intellij.ui.ColoredListCellRenderer
import com.intellij.ui.speedSearch.SpeedSearchUtil.applySpeedSearchHighlighting
import dev.nx.console.generate_ui.editor.DefaultNxGenerateUiFile
import dev.nx.console.nxls.server.NxGenerator
import dev.nx.console.nxls.server.NxGeneratorOption
import dev.nx.console.nxls.server.NxGeneratorOptionsRequestOptions
import dev.nx.console.nxls.server.NxGeneratorsRequestOptions
import dev.nx.console.services.NxlsService
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import javax.swing.JList
import javax.swing.ListSelectionModel.SINGLE_SELECTION

private val logger = logger<NxGenerateUiAction>()
class NxGenerateUiAction(): AnAction() {
  override fun actionPerformed(e: AnActionEvent) {
    val project = e.project ?: return

    runBlocking {
      launch {
        selectGenerator(project, e)
      }
    }
  }

  private suspend fun selectGenerator(project: Project, e: AnActionEvent) {
    val nxlsService = project.service<NxlsService>()

    val generators = nxlsService.generators()
    val generatorNames = generators.map { it.name }

    JBPopupFactory.getInstance().createPopupChooserBuilder(generatorNames)
      .setTitle("Nx Generate (UI)")
      .setSelectionMode(SINGLE_SELECTION)
      .setRequestFocus(true)
      .setFilterAlwaysVisible(true)
      .setResizable(true)
      .setMovable(true)
      .setNamerForFiltering { it }
      .setItemChosenCallback { chosen ->
        val chosenGenerator = generators.find { g -> g.name == chosen };
        if(chosenGenerator != null) {
          openGenerateUi(project, chosenGenerator)
        }
      }
      .createPopup()
      .showInBestPositionFor(e.dataContext)


  }

  private fun openGenerateUi(project: Project, generator: NxGenerator) {
    var generatorOptions: List<NxGeneratorOption> = emptyList()

    runBlocking {
      launch {
        generatorOptions = project.service<NxlsService>().generatorOptions(NxGeneratorOptionsRequestOptions(generator.data.collection, generator.name, generator.path))
      }
    }
    val virtualFile = DefaultNxGenerateUiFile("Nx Generate")

    val fileEditorManager = FileEditorManager.getInstance(project)
    if(fileEditorManager.isFileOpen(virtualFile)) {
      fileEditorManager.closeFile(virtualFile)
    }

    fileEditorManager.openFile(virtualFile, true)

    virtualFile.setupGeneratorForm(generator, generatorOptions)

  }
}
