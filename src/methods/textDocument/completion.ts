import { RequestMessage } from "../../server";

interface CompletionItem {
    label: string;
}

export interface CompletionList {
    isIncomplete: boolean;
    items: CompletionItem[];
}

export function completion(message: RequestMessage) {
    console.log(message);
    return {
        isComplete: false,
        items: [{ label: "TypeScript" }, { label: "LSP" }, { label: "lua" }],
    };
}
