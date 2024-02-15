import { RequestMessage } from "../server.ts";

type ServerCapabilities = Record<string, unknown>;

interface InitializeResult {
    capabilities: ServerCapabilities;
    serverInfo?: {
        name: string;
        version?: string;
    };
}

export function initialize(message: RequestMessage): InitializeResult {
    return {
        capabilities: {},
        serverInfo: {
            name: "css-variables-language-server",
            version: "1.0.0",
        },
    };
}
