"use strict";
var __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function(resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerRouters = void 0;
const express_1 = require("express");
const common_1 = require("@fadedreams7org1/common");
const provider_service_1 = require("./provider.service");
const uploader = new common_1.Uploader(common_1.uploadDir);
const middlewareOptions = {
    types: ['image/png', 'image/jpeg'],
    fieldName: 'image'
};
const multipeFilesMiddleware = uploader.uploadMultipleFiles(middlewareOptions);
const router = (0, express_1.Router)();
exports.providerRouters = router;
router.post('/item/new', common_1.requireAuth, multipeFilesMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function*() {
    const { title, price } = req.body;
    if (!req.files)
        return next(new common_1.BadRequestError('images are required'));
    if (req.uploaderError)
        return next(new common_1.BadRequestError(req.uploaderError.message));
    const item = yield provider_service_1.providerService.addItem({
        title,
        price,
        userId: req.currentUser.userId,
        files: req.files
    });
    res.status(201).send(item);
}));
router.post('/item/:id/update', common_1.requireAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function*() {
    const { id } = req.params;
    const { title, price } = req.body;
    const result = yield provider_service_1.providerService.updateItem({ title, price, userId: req.currentUser.userId, itemId: id });
    if (result instanceof common_1.CustomError)
        return next(result);
    res.status(200).send(result);
}));
router.delete("/item/:id/delete", common_1.requireAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function*() {
    const { id } = req.params;
    const result = yield provider_service_1.providerService.deleteItem({ itemId: id, userId: req.currentUser.userId });
    if (result instanceof common_1.CustomError)
        return next(result);
    res.status(200).send(true);
}));
router.post("/item/:id/add-images", common_1.requireAuth, multipeFilesMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function*() {
    const { id } = req.params;
    if (!req.files)
        return next(new common_1.BadRequestError('images are required'));
    if (req.uploaderError)
        return next(new common_1.BadRequestError(req.uploaderError.message));
    const result = yield provider_service_1.providerService.addItemImages({ itemId: id, userId: req.currentUser.userId, files: req.files });
    if (result instanceof common_1.CustomError)
        return next(result);
    res.status(200).send(result);
}));
router.post('/item/:id/delete-images', common_1.requireAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function*() {
    const { id } = req.params;
    const { imagesIds } = req.body;
    const result = yield provider_service_1.providerService.deleteItemImages({ itemId: id, userId: req.currentUser.userId, imagesIds });
    if (result instanceof common_1.CustomError)
        return next(result);
    res.status(200).send(result);
}));
