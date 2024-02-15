"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTextDocument = exports.getDocumentSettings = exports.documentSettings = exports.defaultSettings = void 0;
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
exports.defaultSettings = {
    maxNumberOfProblems: 100,
};
// Cache the settings of all open documents
exports.documentSettings = new Map();
function getDocumentSettings({ connection, hasConfigurationCapability, }) {
    const globalSettings = exports.defaultSettings;
    const resource = "all";
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result = exports.documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration("cssVariables");
        exports.documentSettings.set(resource, result);
    }
    return result;
}
exports.getDocumentSettings = getDocumentSettings;
function validateTextDocument({ textDocument, connection, hasConfigurationCapability, hasDiagnosticRelatedInformationCapability, }) {
    return __awaiter(this, void 0, void 0, function* () {
        //  Get settings for every validate run.
        const settings = yield getDocumentSettings({
            connection,
            hasConfigurationCapability,
        });
        //  The validator creates diagnostics for all uppercase words length 2 or more.
        const text = textDocument.getText();
        const pattern = /\b[A-Z]{2,}\b/g;
        let matchArray;
        let problems = 0;
        const diagnostics = [];
        while ((matchArray = pattern.exec(text)) &&
            problems < settings.maxNumberOfProblems) {
            problems++;
            const diagnostic = {
                severity: vscode_languageserver_protocol_1.DiagnosticSeverity.Warning,
                range: {
                    start: textDocument.positionAt(matchArray.index),
                    end: textDocument.positionAt(matchArray.index + matchArray[0].length),
                },
                message: `${matchArray[0]} is all uppercase.`,
                source: "ex",
            };
            if (hasDiagnosticRelatedInformationCapability) {
                diagnostic.relatedInformation = [
                    {
                        location: {
                            uri: textDocument.uri,
                            range: Object.assign({}, diagnostic.range),
                        },
                        message: "Spelling matters",
                    },
                    {
                        location: {
                            uri: textDocument.uri,
                            range: Object.assign({}, diagnostic.range),
                        },
                        message: "Particularly for names",
                    },
                ];
            }
            diagnostics.push(diagnostic);
        }
        //  Send computed diagnostics to the client
        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    });
}
exports.validateTextDocument = validateTextDocument;
