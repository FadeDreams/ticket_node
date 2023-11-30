"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartItem = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    cart: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true
    },
    item: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    quantity: { type: Number, required: true }
});
exports.CartItem = mongoose_1.default.model('CartItem', schema);
