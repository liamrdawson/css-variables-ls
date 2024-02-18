import { RequestMessage } from "../../server";

interface CompletionItem {
    label: string;
}

export interface CompletionList {
    isIncomplete: boolean;
    items: CompletionItem[];
}

export function completion(message: RequestMessage): CompletionList {
    console.log(message);
    return {
        isIncomplete: false,
        items: [{ label: "TypeScript" }, { label: "LSP" }, { label: "lua" }],
    };
}
