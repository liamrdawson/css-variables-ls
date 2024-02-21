#!/usr/bin/env node
import { InitializeRequestMessage, initialize } from "./methods/initialize";
import { completion } from "./methods/textDocument/completion";
import { URL } from "url";

import log from "./log";
import { parseVariables } from "./utils/parseVariables";
import path from "path";

interface Message {
    jsonrpc: string;
}

export interface RequestMessage extends Message {
    id: number | string;
    method: string;
    params?: unknown[] | object;
}

type RequestMethod = (
    message: InitializeRequestMessage,
) => ReturnType<typeof initialize> | ReturnType<typeof completion>;

const methodLookup: Record<string, RequestMethod> = {
    initialize,
    "textDocument/completion": completion,
};

function respond(id: RequestMessage["id"], result: unknown) {
    const message = JSON.stringify({ id, result });
    const messageLength = Buffer.byteLength(message, "utf-8");
    const header = `Content-Length: ${messageLength}\r\n\r\n`;

    log.write(header + message);
    process.stdout.write(header + message);
}

// TODO: Find a way to manage the workspace across requests.
// You can either use clases to create an insstance which can then be referenced elsewhere
// Or you can structure your code so that you continue to return immutable data on each request.

let buffer = "";

type ProcessedMessage = {
    contentLength: number;
    messageStart: number;
    message: InitializeRequestMessage;
};

function processMessage(buffer: string): ProcessedMessage | null {
    // Check for the Content-Length line
    const lengthMatch = buffer.match(/Content-Length: (\d+)\r\n/);
    // If the Content-Length header isn't there, we know that there's on message body either.
    if (!lengthMatch) {
        return null;
    }

    const contentLength = parseInt(lengthMatch[1], 10);
    const messageStart = buffer.indexOf("\r\n\r\n") + 4;

    // Continue unless the full message is in the buffer
    if (buffer.length < messageStart + contentLength) {
        return null;
    }

    const rawMessage = buffer.slice(messageStart, messageStart + contentLength);
    const message: InitializeRequestMessage = JSON.parse(rawMessage);

    return { contentLength, messageStart, message };
}

function getValidPathFromUri(uri: string): string | undefined {
    const url = new URL(uri);
    const scheme = url.protocol ? url.protocol.replace(":", "") : null;
    if (scheme !== "file") {
        return undefined;
    }
    const pathComponent = url.pathname;
    const fsPath = path.join("/", pathComponent);
    return fsPath;
}

process.stdin.on("data", async chunk => {
    buffer += chunk;
    let workspaceFolders: string[];

    while (true) {
        const processedMessage = processMessage(buffer);
        if (processedMessage === null) {
            break;
        }
        const { contentLength, messageStart, message } = processedMessage;

        const method = methodLookup[message.method];

        if (message.params && message.params.workspaceFolders) {
            const validWorkspaceFolders = message.params.workspaceFolders
                .map(wsf => getValidPathFromUri(wsf.uri) || "")
                .filter(path => !!path);

            workspaceFolders = validWorkspaceFolders;
            log.write({ workspaceFolders });
            const lookupFiles = await parseVariables({ workspaceFolders });
            log.write("---------------");
            log.write(lookupFiles);
            log.write("---------------");
        }

        if (method) {
            respond(message.id, method(message));
        }

        // Remove the processed message from the buffer
        buffer = buffer.slice(messageStart + contentLength);
    }
});
