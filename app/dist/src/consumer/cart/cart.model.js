"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cart = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "CartItem"
        }
    ],
    totalPrice: { type: Number, default: 0, required: true },
    customer_id: { type: String }
});
exports.Cart = mongoose_1.default.model('Cart', schema);
