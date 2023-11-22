
import { Router, Response, Request, NextFunction } from 'express'
import { requireAuth, CustomError, BadRequestError } from '@fadedreams7pcplatform/common'
import { consumerService } from './consumer.service'

const router = Router()

router.post('/cart/add', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  const { itemId, quantity } = req.body;

  const result = await consumerService.addItemToCart({ itemId, quantity, userId: req.currentUser!.userId })

  if (result instanceof CustomError ||
    result instanceof Error) return next(result);

  req.session = { ...req.session, cartId: result._id }

  res.status(200).send(result)
})

router.post('/cart/:cartId/item/:id/update-quantity', async (req: Request, res: Response, next: NextFunction) => {
  const { amount } = req.body;
  const { cartId, id: itemId } = req.params

  const inc = req.body.inc === "true" ? true : req.body.inc === "false" ? false : null;
  if (inc === null) return next(new BadRequestError('inc should be either true or false'))

  const result = await consumerService.updateCartItemQuantity({ cartId, itemId, options: { amount, inc } })

  if (result instanceof CustomError ||
    result instanceof Error) return next(result);

  res.status(200).send(result)
})

router.post('/cart/delete/item', async (req: Request, res: Response, next: NextFunction) => {
  const { cartId, itemId } = req.body;

  const result = await consumerService.removeItemFromCart({
    cartId, itemId
  });

  if (result instanceof CustomError ||
    result instanceof Error) return next(result);

  res.status(200).send(result)
})

router.post('/get/cart/', async (req: Request, res: Response, next: NextFunction) => {
  //const cartId = req.body.cartId
  const cartId = req.session?.cartId
  if (!cartId) return next(new BadRequestError('cartId is required!'))
  console.log(req.currentUser)

  const result = await consumerService.getCart(cartId, req.currentUser!.userId);

  if (result instanceof CustomError ||
    result instanceof Error) return next(result);

  res.status(200).send(result);
});

router.post('/payment/checkout/', async (req: Request, res: Response, next: NextFunction) => {
  const { cardToken } = req.body;

  const result = await consumerService.checkout(req.currentUser!.userId, cardToken, req.currentUser!.email);

  if (result instanceof CustomError) return next(result);

  res.status(200).json({ charge_id: result.id });
})



