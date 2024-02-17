#!/usr/bin/env node
import { initialize } from "./methods/initialize";
import { completion } from "./methods/textDocument/completion";

import log from "./log";

interface Message {
    jsonrpc: string;
}

export interface RequestMessage extends Message {
    id: number | string;
    method: string;
    params?: unknown[] | object;
}

type RequestMethod = (message: RequestMessage) => unknown;

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

let buffer = "";

// Read stdin and accumulate our chunks into a buffer.
// Check if we have a full message and convert it to JSON.
// If the message has a method on it, and it's one that we know how to respond to it
// then invoke it. Send out the response over stdout.
// Remove the message from the buffer.
process.stdin.on("data", chunk => {
    buffer += chunk;

    while (true) {
        // Check for the Content-Length line
        const lengthMatch = buffer.match(/Content-Length: (\d+)\r\n/);
        // If the Content-Length header isn't there, we know that there's on message body either.
        if (!lengthMatch) break;

        const contentLength = parseInt(lengthMatch[1], 10);
        const messageStart = buffer.indexOf("\r\n\r\n") + 4;

        // Continue unless the full message is in the buffer
        if (buffer.length < messageStart + contentLength) break;

        const rawMessage = buffer.slice(
            messageStart,
            messageStart + contentLength,
        );

        const message = JSON.parse(rawMessage);

        log.write({
            id: message.id,
            method: message.method,
        });

        const method = methodLookup[message.method];

        if (method) {
            respond(message.id, method(message));
        }

        // Remove the processed message from the buffer
        buffer = buffer.slice(messageStart + contentLength);
    }
});
