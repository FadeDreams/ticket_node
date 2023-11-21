import { CartModel, CartItemModel, ItemDoc } from "@fadedreams7pcplatform/common";
import { CartItem } from "./cart-item.model";
import { Cart } from "./cart.model";
import { AddItemToCartDto, CreateCartItemDto, RemoveItemFromCartDto, UpdateCartItemQuantityDto } from '../dtos/cart.dto'

export class CartService {
  constructor(
    public cartModel: CartModel,
    public cartItemModel: CartItemModel
  ) { }

  async findOneByUserId(userId: string) {
    return await this.cartModel.findOne({ user: userId })
  }

  async createCart(userId: string) {
    const cart = new this.cartModel({
      user: userId
    });

    return await cart.save()
  }

  async getCartItemById(itemId: string, cartId: string) {
    return await this.cartItemModel.findOne({ item: itemId, cart: cartId })
  }

  async createCartItem(createCartItemDto: CreateCartItemDto) {
    const cartItem = new this.cartItemModel({
      cart: createCartItemDto.cartId,
      item: createCartItemDto.itemId,
      quantity: createCartItemDto.quantity,
    })

    return await cartItem.save()
  }

  async isItemInCart(cartId: string, itemId: string) {
    return !!(await this.cartItemModel.findOne({ cartId, item: itemId }))
  }

  async updateItemQuantity(updateCartItemQuantity: UpdateCartItemQuantityDto) {
    const { inc, amount } = updateCartItemQuantity.options;
    const { itemId, cartId } = updateCartItemQuantity;
    const cartItem = await this.cartItemModel.findOne({ item: itemId })
    if (!cartItem) return null;

    if (cartItem.quantity < amount && !inc) {
      return await this.removeItemFromCart({ cartId, itemId })
    }

    //const updatedCartItem = await this.cartItemModel.findOneAndUpdate({ _id: cartItem._id },
    //{ $inc: { quantity: inc ? amount : -amount } }, { new: true }).populate('item')
    let updatedCartItem;
    if (cartItem) {
      updatedCartItem = await this.cartItemModel.findOneAndUpdate(
        { _id: cartItem._id },
        { $inc: { quantity: inc ? amount : -amount } },
        { new: true }
      ).populate('item');
    }
    // Now you can use `updatedCartItem` in the rest of your code.
    //const newPrice = inc ? updatedCartItem!.item.price * amount
    //: -(updatedCartItem!.item.price * amount)
    let newPrice;
    if (inc) {
      newPrice = updatedCartItem!.item.price * amount;
    } else {
      newPrice = -(updatedCartItem!.item.price * amount);
    }

    return await this.cartModel.findOneAndUpdate({ _id: cartId },
      { $inc: { totalPrice: newPrice } }, { new: true })

  }

  async removeItemFromCart(removeItemFromCart: RemoveItemFromCartDto) {
    const { cartId, itemId } = removeItemFromCart;
    const cartItem = await this.cartItemModel.findOne({ item: itemId }).populate('item');
    if (!cartItem) return null;

    const deletedDoc = await this.cartItemModel.findOneAndDelete({ _id: cartItem._id });
    if (!deletedDoc) return null;

    return await this.cartModel.findOneAndUpdate({ _id: cartId },
      {
        $pull: { items: cartItem._id },
        $inc: { totalPrice: -(cartItem.item.price * cartItem.quantity) }
      }, { new: true })
  }

  async addItem(addItemToCart: AddItemToCartDto, item: ItemDoc) {
    const { userId, quantity, itemId } = addItemToCart;
    let cart = await this.findOneByUserId(userId);

    // if the item in cart => quantity += 1
    const isItemInCart = cart && await this.isItemInCart(cart._id, itemId)

    if (isItemInCart && cart) return this.updateItemQuantity({ cartId: cart._id, itemId, options: { inc: true, amount: quantity } })

    if (!cart) cart = await this.createCart(userId);

    const cartItem = await this.createCartItem({ cartId: cart._id, itemId, quantity })

    return await this.cartModel.findOneAndUpdate({ _id: cart._id },
      { $push: { items: cartItem }, $inc: { totalPrice: item.price * quantity } }, { new: true })

  }
}

export const cartService = new CartService(Cart, CartItem)
