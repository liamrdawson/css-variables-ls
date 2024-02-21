import { RequestMessage } from "../server";

type ServerCapabilities = Record<string, unknown>;

interface InitializeResult {
    capabilities: ServerCapabilities;
    serverInfo?: {
        name: string;
        version?: string;
    };
}

interface WorkspaceFolder {
    uri: string;
    name: string;
}

interface InitializeRequestParams {
    capabilities: {
        workspace?: {
            configuration?: boolean;
            workspaceFolders?: boolean;
        };
    };
    workspaceFolders: WorkspaceFolder[] | null;
}

export interface InitializeRequestMessage extends RequestMessage {
    params?: InitializeRequestParams;
}

export function initialize(
    message: InitializeRequestMessage,
): InitializeResult {
    const hasWorkspaceFolderCapability = !!(
        message.params &&
        message.params.capabilities &&
        message.params.capabilities.workspace &&
        message.params.capabilities.workspace.workspaceFolders
    );

    const result: InitializeResult = {
        capabilities: {
            completionProvider: {
                resolveProvider: true,
            },
            serverInfo: {
                name: "css-variables-language-server",
                version: "1.0.0",
            },
        },
    };

    if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true,
                changeNotifications: true,
            },
        };
    }

    return result;
}
