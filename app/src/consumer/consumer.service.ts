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

  async updateCartItemQuantity(updateCartItemQuantity: UpdateCartItemQuantityDto) {
    const { itemId, cartId } = updateCartItemQuantity
    const cartItem = await this.cartService.getCartItemById(itemId, cartId)
    if (!cartItem) return new BadRequestError('item not found in cart');

    const cart = await this.cartService.updateItemQuantity(updateCartItemQuantity)
    if (!cart) return new Error('could not update the cart')
    return cart;
  }

}

router.post('/cart/:cartId/item/:id/update-quantity', async (req: Request, res: Response, next: NextFunction) => {
  const { amount } = req.body;
  const { cartId, id: itemId } = req.params

  const inc = req.body.inc === "true" ? true : req.body.inc === "false" ? false : null;
  if (inc === null) return next(new BadRequestError('inc should be either true or false'))

  const result = await buyerService.updateCartItemQuantity({ cartId, itemId, options: { amount, inc } })

  if (result instanceof CustomError ||
    result instanceof Error) return next(result);

  res.status(200).send(result)
})

export const consumerService = new ConsumerService(cartService, itemService)
