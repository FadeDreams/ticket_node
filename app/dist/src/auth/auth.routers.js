"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouters = void 0;
const express_1 = require("express");
const common_1 = require("@fadedreams7pcplatform/common");
const auth_service_1 = require("./auth.service");
const router = (0, express_1.Router)();
exports.authRouters = router;
router.post('/signup', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const result = yield auth_service_1.authService.signup({ email, password });
    if (result.message)
        return next(new common_1.BadRequestError(result.message));
    req.session = { jwt: result.jwt };
    res.status(201).send(true);
}));
router.post('/signin', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const result = yield auth_service_1.authService.signin({ email, password });
    if (result.message)
        return next(new common_1.BadRequestError(result.message));
    req.session = { jwt: result.jwt };
    res.status(201).send(true);
}));
router.get('/current-user', (0, common_1.currentUser)(process.env.JWT_KEY), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send(req.currentUser);
}));
