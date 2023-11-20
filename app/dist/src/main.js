"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_module_1 = require("./app.module");
const express_1 = __importDefault(require("express"));
const bootstrap = () => {
    const app = new app_module_1.AppModule((0, express_1.default)());
    app.start();
};
bootstrap();
