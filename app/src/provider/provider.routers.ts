
import { Router, Response, Request, NextFunction } from "express";
import { BadRequestError, uploadDir, Uploader, UploaderMiddlewareOptions, requireAuth, CustomError } from "@fadedreams7pcplatform/common";

const router = Router()

const uploader = new Uploader(uploadDir)
const middlewareOptions: UploaderMiddlewareOptions = {
  types: ['image/png', 'image/jpeg'],
  fieldName: 'image'
}


router.post('/product/new', async (req: Request, res: Response, next: NextFunction) => {
  const { title, price } = req.body;

  if (!req.files) return next(new BadRequestError('images are required'))

  if (req.uploaderError) return next(new BadRequestError(req.uploaderError.message));

  //...
})
