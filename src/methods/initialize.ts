import { RequestMessage } from "../server";

type ServerCapabilities = Record<string, unknown>;

interface InitializeResult {
    capabilities: ServerCapabilities;
    serverInfo?: {
        name: string;
        version?: string;
    };
}

export function initialize(message: RequestMessage): InitializeResult {
    console.log(message);
    return {
        capabilities: {
            completionProvider: {},
        },
        serverInfo: {
            name: "css-variables-language-server",
            version: "1.0.0",
        },
    };
}
