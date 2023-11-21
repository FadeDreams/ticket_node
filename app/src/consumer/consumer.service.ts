import { CartService, cartService } from './cart/cart.service'
import { ItemService, itemService } from '../provider/item/item.service'
import { AddItemToCartDto, UpdateCartItemQuantityDto, RemoveItemFromCartDto } from './dtos/cart.dto'
import { BadRequestError, NotAuthorizedError } from '@fadedreams7pcplatform/common'

export class ConsumerService {
  constructor(
    public cartService: CartService,
    public itemService: ItemService,
  ) { }

  async addItemToCart(addItemToCart: AddItemToCartDto) {
    const item = await this.itemService.getOneById(addItemToCart.itemId);
    if (!item) return new BadRequestError('item not found!');

    const cart = await this.cartService.addItem(addItemToCart, item);
    if (!cart) return new Error('could not update the cart')
    return cart;
  }
}

export const consumerService = new ConsumerService(cartService, itemService)
