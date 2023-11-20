"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = require("body-parser");
const cookie_session_1 = __importDefault(require("cookie-session"));
const common_1 = require("@fadedreams7pcplatform/common");
class AppModule {
    constructor(app = (0, express_1.default)()) {
        this.app = app;
        app.set('trust-proxy', true);
        app.use((0, cors_1.default)({
            credentials: true,
            optionsSuccessStatus: 200
        }));
        app.use((0, body_parser_1.urlencoded)({ extended: false }));
        app.use((0, body_parser_1.json)());
        app.use((0, cookie_session_1.default)({
            signed: false,
            secure: false
        }));
        Object.setPrototypeOf(this, AppModule.prototype);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!process.env.MONGO_URI) {
                throw new Error('mongo_uri must be defined');
            }
            if (!process.env.JWT_KEY) {
                throw new Error('mongo_uri must be defined');
            }
            if (!process.env.STRIPE_KEY) {
                throw new Error('STRIPE_KEY must be defined');
            }
            try {
                yield mongoose_1.default.connect(process.env.MONGO_URI);
            }
            catch (err) {
                throw new Error('database connection error');
            }
            this.app.use((0, common_1.currentUser)(process.env.JWT_KEY));
            this.app.use(common_1.errorHandler);
            const PORT = process.env.PORT || 8080;
            this.app.listen(PORT, () => console.log('OK! port: ' + PORT));
        });
    }
}
exports.AppModule = AppModule;
