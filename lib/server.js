"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServerConnection = void 0;
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const validateTextDocument_1 = require("./validateTextDocument");
function createServerConnection() {
    // Create a connection for the server, using Node's IPC as a transport.
    // Also include all preview / proposed LSP features.
    const connection = (0, node_1.createConnection)(process.stdin, process.stdout);
    const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
    const hasConfigurationCapability = false;
    const hasWorkspaceFolderCapability = false;
    const hasDiagnosticRelatedInformationCapability = false;
    connection.onInitialize((params) => {
        const capabilities = params.capabilities;
        const hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);
        const result = {
            capabilities: {
                textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
                hoverProvider: true,
                definitionProvider: true,
                implementationProvider: true,
                completionProvider: {
                    /**
                     * only invoke completion once `-- is pressed
                     */
                    triggerCharacters: ["--"],
                    resolveProvider: true,
                },
            },
        };
        if (hasWorkspaceFolderCapability) {
            result.capabilities.workspace = {
                workspaceFolders: {
                    supported: true,
                },
            };
        }
        return result;
    });
    connection.onInitialized(() => {
        if (hasConfigurationCapability) {
            // Register for all configuration changes.
            connection.client.register(node_1.DidChangeConfigurationNotification.type, undefined);
        }
        if (hasWorkspaceFolderCapability) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            connection.workspace.onDidChangeWorkspaceFolders(_event => {
                connection.console.log("Workspace folder change event received.");
            });
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let globalSettings = validateTextDocument_1.defaultSettings;
    connection.onDidChangeConfiguration(change => {
        if (hasConfigurationCapability) {
            // Reset all cached document settings
            validateTextDocument_1.documentSettings.clear();
        }
        else {
            globalSettings = ((change.settings.languageServerExample || validateTextDocument_1.defaultSettings));
        }
        documents.all().forEach(document => (0, validateTextDocument_1.validateTextDocument)({
            textDocument: document,
            connection,
            hasDiagnosticRelatedInformationCapability,
            hasConfigurationCapability,
        }));
    });
    // Only keep settings for open documents
    documents.onDidClose(e => {
        validateTextDocument_1.documentSettings.delete(e.document.uri);
    });
    // The content of a text document has changed. This event is emitted
    // when the text document first opened or when its content has changed.
    documents.onDidChangeContent(change => {
        (0, validateTextDocument_1.validateTextDocument)({
            textDocument: change.document,
            connection,
            hasDiagnosticRelatedInformationCapability,
            hasConfigurationCapability,
        });
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    connection.onDidChangeWatchedFiles(_change => {
        // Monitored files have changed
        connection.console.log("We received a file change event");
    });
    // This handler provides the initial list of the completion items.
    connection.onCompletion((
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _textDocumentPosition) => {
        // The pass parameter contains the position of the text document in
        // which code complete got requested. For the example we ignore this
        // info and always provide the same completion items.
        return [
            {
                label: "TypeScript",
                kind: node_1.CompletionItemKind.Text,
                data: 1,
            },
            {
                label: "JavaScript",
                kind: node_1.CompletionItemKind.Text,
                data: 2,
            },
        ];
    });
    // This handler resolves additional information for the item selected in
    // the completion list.
    connection.onCompletionResolve((item) => {
        if (item.data === 1) {
            item.detail = "TypeScript details";
            item.documentation = "TypeScript documentation";
        }
        else if (item.data === 2) {
            item.detail = "JavaScript details";
            item.documentation = "JavaScript documentation";
        }
        return item;
    });
    // Make the text document manager listen on the connection
    // for open, change and close text document events
    documents.listen(connection);
    //  Extract everything out so that our connection handlers work like so:
    // connection.onCompletion(completionProvider.completion);
    // connection.onDefinition(definitionProvider.definition);
    // connection.onImplementation(definitionProvider.definition);
    // connection.onHover(definitionProvider.hover);
    return connection;
}
exports.createServerConnection = createServerConnection;
