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
exports.consumerRouters = void 0;
const express_1 = require("express");
const common_1 = require("@fadedreams7pcplatform/common");
const consumer_service_1 = require("./consumer.service");
const router = (0, express_1.Router)();
exports.consumerRouters = router;
router.post('/cart/add', common_1.requireAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemId, quantity } = req.body;
    const result = yield consumer_service_1.consumerService.addItemToCart({ itemId, quantity, userId: req.currentUser.userId });
    if (result instanceof common_1.CustomError || result instanceof Error)
        return next(result);
    req.session.cartId = result._id;
    res.status(200).send(result);
}));
router.post('/cart/:cartId/item/:id/update-quantity', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount } = req.body;
    const { cartId, id: itemId } = req.params;
    const inc = req.body.inc === 'true' ? true : req.body.inc === 'false' ? false : null;
    if (inc === null)
        return next(new common_1.BadRequestError('inc should be either true or false'));
    const result = yield consumer_service_1.consumerService.updateCartItemQuantity({ cartId, itemId, options: { amount, inc } });
    if (result instanceof common_1.CustomError || result instanceof Error)
        return next(result);
    res.status(200).send(result);
}));
router.post('/cart/delete/item', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { cartId, itemId } = req.body;
    const result = yield consumer_service_1.consumerService.removeItemFromCart({
        cartId, itemId
    });
    if (result instanceof common_1.CustomError || result instanceof Error)
        return next(result);
    res.status(200).send(result);
}));
router.post('/get/cart/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const cartId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.cartId;
    if (!cartId)
        return next(new common_1.BadRequestError('cartId is required!'));
    console.log(req.currentUser);
    const result = yield consumer_service_1.consumerService.getCart(cartId, req.currentUser.userId);
    if (result instanceof common_1.CustomError || result instanceof Error)
        return next(result);
    res.status(200).send(result);
}));
router.post('/payment/checkout/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { cardToken } = req.body;
    const result = yield consumer_service_1.consumerService.checkout(req.currentUser.userId, cardToken, req.currentUser.email);
    if (result instanceof common_1.CustomError)
        return next(result);
    res.status(200).json({ charge_id: result.id });
}));
router.post('/payment/card/update', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { cardToken } = req.body;
    const result = yield consumer_service_1.consumerService.updateCustomerStripeCard(req.currentUser.userId, cardToken);
    if (result instanceof common_1.CustomError || result instanceof Error)
        return next(result);
    res.status(200).send(result);
}));
