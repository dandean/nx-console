package dev.nx.console.generate.ui

import dev.nx.console.models.NxGeneratorContext
import dev.nx.console.models.NxGeneratorOption
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Output Messages */
@Serializable
sealed interface GenerateUiOutputMessage {
    val payloadType: String
}

@Serializable()
@SerialName("output-init")
data class GenerateUiFormInitOutputMessage(override val payloadType: String) :
    GenerateUiOutputMessage {}

@Serializable()
data class GenerateUiRunGeneratorPayload(val positional: String, val flags: List<String>) {}

@Serializable()
@SerialName("run-generator")
data class GenerateUiRunGeneratorOutputMessage(
    override val payloadType: String,
    val payload: GenerateUiRunGeneratorPayload
) : GenerateUiOutputMessage {}

/** Input Messages */
@Serializable
sealed interface GenerateUiInputMessage {
    // the 'type' property will be included in the stringified JSON via the SerialName decorator
    val payload: Any?
}

@Serializable
@SerialName("generator")
data class GenerateUiGeneratorSchemaInputMessage(override val payload: GeneratorSchema) :
    GenerateUiInputMessage {}

@Serializable
data class GeneratorSchema(
    val collectionName: String,
    val generatorName: String,
    val description: String,
    val options: List<NxGeneratorOption>,
    val contextValues: NxGeneratorContext?
) {}

@Serializable
@SerialName("config")
data class GenerateUiConfigurationInputMessage(override val payload: GenerateUiConfiguration) :
    GenerateUiInputMessage {}

@Serializable data class GenerateUiConfiguration(val enableTaskExecutionDryRunOnChange: Boolean) {}

@Serializable
@SerialName("styles")
data class GenerateUiStylesInputMessage(override val payload: GenerateUiStyles) :
    GenerateUiInputMessage {}

@Serializable
data class GenerateUiStyles(
    val backgroundColor: String,
    val foregroundColor: String,
    val primaryColor: String,
    val fieldBackgroundColor: String,
    val fieldBorderColor: String,
    val selectFieldBackgroundColor: String
//    val secondaryTextColor: String,
//    val fontFamily: String,
//    val fontSize: String,
)
