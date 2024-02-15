import { Connection } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
export type ExampleSettings = {
    maxNumberOfProblems: number;
};
export declare const defaultSettings: ExampleSettings;
export declare const documentSettings: Map<string, Thenable<ExampleSettings>>;
type GetDocumentSettingsProps = {
    connection: Connection;
    hasConfigurationCapability: boolean;
};
export declare function getDocumentSettings({ connection, hasConfigurationCapability, }: GetDocumentSettingsProps): Thenable<ExampleSettings>;
type ValidateTextDocumentProps = {
    textDocument: TextDocument;
    connection: Connection;
    hasConfigurationCapability: boolean;
    hasDiagnosticRelatedInformationCapability: boolean;
};
export declare function validateTextDocument({ textDocument, connection, hasConfigurationCapability, hasDiagnosticRelatedInformationCapability, }: ValidateTextDocumentProps): Promise<void>;
export {};
