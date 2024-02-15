#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { createServerConnection } from "./server";
const log_1 = __importDefault(require("./log"));
// const args = process.argv;
process.stdin.on("data", chunk => {
    log_1.default.write(chunk.toString());
});
// if (args.includes("--version") || args.includes("-v")) {
//     process.stdout.write(`${require("../package.json").version}`);
//     process.exit(0);
// }
//
// createServerConnection().listen();
