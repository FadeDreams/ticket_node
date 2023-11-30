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
exports.cartService = exports.CartService = void 0;
const cart_item_model_1 = require("./cart-item.model");
const cart_model_1 = require("./cart.model");
class CartService {
    constructor(cartModel, cartItemModel) {
        this.cartModel = cartModel;
        this.cartItemModel = cartItemModel;
    }
    findOneByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.cartModel.findOne({ user: userId });
        });
    }
    createCart(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = new this.cartModel({
                user: userId
            });
            return yield cart.save();
        });
    }
    getCartItemById(itemId, cartId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.cartItemModel.findOne({ item: itemId, cart: cartId });
        });
    }
    createCartItem(createCartItemDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const cartItem = new this.cartItemModel({
                cart: createCartItemDto.cartId,
                item: createCartItemDto.itemId,
                quantity: createCartItemDto.quantity,
            });
            return yield cartItem.save();
        });
    }
    isItemInCart(cartId, itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            return !!(yield this.cartItemModel.findOne({ cartId, item: itemId }));
        });
    }
    getCart(cartId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.cartModel.findOne({ _id: cartId });
        });
    }
    clearCart(userId, cartId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.cartModel.findOneAndUpdate({ _id: cartId, user: userId }, { $set: { items: [], totalPrice: 0 } }, { new: true });
        });
    }
    updateItemQuantity(updateCartItemQuantity) {
        return __awaiter(this, void 0, void 0, function* () {
            const { inc, amount } = updateCartItemQuantity.options;
            const { itemId, cartId } = updateCartItemQuantity;
            const cartItem = yield this.cartItemModel.findOne({ item: itemId });
            if (!cartItem)
                return null;
            if (cartItem.quantity < amount && !inc) {
                return yield this.removeItemFromCart({ cartId, itemId });
            }
            //const updatedCartItem = await this.cartItemModel.findOneAndUpdate({ _id: cartItem._id },
            //{ $inc: { quantity: inc ? amount : -amount } }, { new: true }).populate('item')
            let updatedCartItem;
            if (cartItem) {
                updatedCartItem = yield this.cartItemModel.findOneAndUpdate({ _id: cartItem._id }, { $inc: { quantity: inc ? amount : -amount } }, { new: true }).populate('item');
            }
            // Now you can use `updatedCartItem` in the rest of your code.
            //const newPrice = inc ? updatedCartItem!.item.price * amount
            //: -(updatedCartItem!.item.price * amount)
            let newPrice;
            if (inc) {
                newPrice = updatedCartItem.item.price * amount;
            }
            else {
                newPrice = -(updatedCartItem.item.price * amount);
            }
            return yield this.cartModel.findOneAndUpdate({ _id: cartId }, { $inc: { totalPrice: newPrice } }, { new: true });
        });
    }
    removeItemFromCart(removeItemFromCart) {
        return __awaiter(this, void 0, void 0, function* () {
            const { cartId, itemId } = removeItemFromCart;
            const cartItem = yield this.cartItemModel.findOne({ item: itemId }).populate('item');
            if (!cartItem)
                return null;
            const deletedDoc = yield this.cartItemModel.findOneAndDelete({ _id: cartItem._id });
            if (!deletedDoc)
                return null;
            return yield this.cartModel.findOneAndUpdate({ _id: cartId }, {
                $pull: { items: cartItem._id },
                $inc: { totalPrice: -(cartItem.item.price * cartItem.quantity) }
            }, { new: true });
        });
    }
    addItem(addItemToCart, item) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, quantity, itemId } = addItemToCart;
            let cart = yield this.findOneByUserId(userId);
            // if the item in cart => quantity += 1
            const isItemInCart = cart && (yield this.isItemInCart(cart._id, itemId));
            if (isItemInCart && cart)
                return this.updateItemQuantity({ cartId: cart._id, itemId, options: { inc: true, amount: quantity } });
            if (!cart)
                cart = yield this.createCart(userId);
            const cartItem = yield this.createCartItem({ cartId: cart._id, itemId, quantity });
            return yield this.cartModel.findOneAndUpdate({ _id: cart._id }, { $push: { items: cartItem }, $inc: { totalPrice: item.price * quantity } }, { new: true });
        });
    }
}
exports.CartService = CartService;
exports.cartService = new CartService(cart_model_1.Cart, cart_item_model_1.CartItem);
