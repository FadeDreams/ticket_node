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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumerService = exports.ConsumerService = void 0;
const cart_service_1 = require("./cart/cart.service");
const item_service_1 = require("../provider/item/item.service");
const common_1 = require("@fadedreams7pcplatform/common");
const order_service_1 = require("./order/order.service");
const stripe_1 = __importDefault(require("stripe"));
class ConsumerService {
    constructor(cartService, itemService, orderService, stripeService) {
        this.cartService = cartService;
        this.itemService = itemService;
        this.orderService = orderService;
        this.stripeService = stripeService;
    }
    addItemToCart(addItemToCart) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.itemService.getOneById(addItemToCart.itemId);
            if (!item)
                return new common_1.BadRequestError('item not found!');
            const cart = yield this.cartService.addItem(addItemToCart, item);
            if (!cart)
                return new Error('could not update the cart');
            return cart;
        });
    }
    updateCartItemQuantity(updateCartItemQuantity) {
        return __awaiter(this, void 0, void 0, function* () {
            const { itemId, cartId } = updateCartItemQuantity;
            const cartItem = yield this.cartService.getCartItemById(itemId, cartId);
            if (!cartItem)
                return new common_1.BadRequestError('item not found in cart');
            const cart = yield this.cartService.updateItemQuantity(updateCartItemQuantity);
            if (!cart)
                return new Error('could not update the cart');
            return cart;
        });
    }
    removeItemFromCart(removeItemFromCart) {
        return __awaiter(this, void 0, void 0, function* () {
            const { itemId, cartId } = removeItemFromCart;
            const cartItem = yield this.cartService.getCartItemById(itemId, cartId);
            if (!cartItem)
                return new common_1.BadRequestError('item not found in cart');
            const cart = yield this.cartService.removeItemFromCart(removeItemFromCart);
            if (!cart)
                return new Error('could not update the cart');
            return cart;
        });
    }
    getCart(cartId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = yield this.cartService.getCart(cartId);
            if (!cart)
                return new common_1.BadRequestError('cart not found');
            if (cart.user.toString() !== userId)
                return new common_1.NotAuthorizedError();
            return cart;
        });
    }
    checkout(userId, cardToken, userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = yield this.cartService.findOneByUserId(userId);
            if (!cart)
                return new common_1.BadRequestError('your cart is empty!');
            if (cart.items.length === 0)
                return new common_1.BadRequestError('your cart is empty!');
            let customer_id;
            if (cart.customer_id) {
                customer_id = cart.customer_id;
            }
            else {
                const { id } = yield this.stripeService.customers.create({
                    email: userEmail,
                    source: cardToken
                });
                customer_id = id;
                yield cart.set({ customer_id }).save();
            }
            if (!customer_id)
                return new common_1.BadRequestError('Invalid data');
            const charge = yield this.stripeService.charges.create({
                amount: cart.totalPrice * 100,
                currency: 'usd',
                customer: customer_id
            });
            if (!charge)
                return new common_1.BadRequestError('Invalid data! could not create the charge!');
            // create new order
            yield this.orderService.createOrder({
                userId,
                totalAmount: cart.totalPrice,
                chargeId: charge.id
            });
            // clear cart
            yield this.cartService.clearCart(userId, cart._id);
            return charge;
        });
    }
    updateCustomerStripeCard(userId, newCardToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = yield this.cartService.findOneByUserId(userId);
            if (!cart)
                return new common_1.BadRequestError('your cart is empty!');
            if (!cart.customer_id)
                return new common_1.BadRequestError('you\'re not a customer!');
            try {
                yield this.stripeService.customers.update(cart.customer_id, {
                    source: newCardToken
                });
            }
            catch (err) {
                return new Error('card update failed!');
            }
            return true;
        });
    }
}
exports.ConsumerService = ConsumerService;
exports.consumerService = new ConsumerService(cart_service_1.cartService, item_service_1.itemService, order_service_1.orderService, new stripe_1.default(process.env.STRIPE_KEY, { apiVersion: '2023-10-16' }));
