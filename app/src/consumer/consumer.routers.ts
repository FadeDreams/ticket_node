
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

