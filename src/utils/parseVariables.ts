// import fs from "fs";
import fg from "fast-glob";
// import log from "../log";

type ParseVariablesParams = {
    workspaceFolders: string[];
    settings?: ParseVariablesSettings;
};

type ParseVariablesSettings = {
    include: string[];
    ignore: string[];
};

const defaultSettings = {
    include: ["**/*.css", "**/*.scss", "**/*.sass", "**/*.less"],
    ignore: [
        "**/.cache",
        "**/.DS_Store",
        "**/.git",
        "**/.hg",
        "**/.next",
        "**/.svn",
        "**/bower_components",
        "**/CVS",
        "**/dist",
        "**/node_modules",
        "**/tests",
        "**/tmp",
    ],
};

export async function parseVariables({
    workspaceFolders,
    settings = defaultSettings,
}: ParseVariablesParams) {
    const lookupFiles = Promise.all(
        workspaceFolders.map(async pathToWorkspaceFolder => {
            const fileContent = await fg.glob(settings.include, {
                cwd: pathToWorkspaceFolder,
                onlyFiles: true,
                ignore: settings.ignore,
                absolute: true,
            });

            return fileContent;
        }),
    );

    return lookupFiles;
}
