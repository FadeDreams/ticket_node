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
exports.orderService = exports.OrderService = void 0;
const order_model_1 = require("./order.model");
class OrderService {
    constructor(orderModel) {
        this.orderModel = orderModel;
    }
    createOrder(createOrder) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = new this.orderModel({
                user: createOrder.userId,
                totalAmount: createOrder.totalAmount,
                chargeId: createOrder.chargeId
            });
            return yield order.save();
        });
    }
}
exports.OrderService = OrderService;
exports.orderService = new OrderService(order_model_1.Order);
