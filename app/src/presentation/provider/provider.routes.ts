
import { Router, Response, Request, NextFunction } from "express";
import { BadRequestError, uploadDir, Uploader, UploaderMiddlewareOptions, requireAuth, CustomError } from "@fadedreams7org1/common";
import { providerService } from '@src/application/provider/provider.service';


const uploader = new Uploader(uploadDir)
const middlewareOptions: UploaderMiddlewareOptions = {
    types: ['image/png', 'image/jpeg'],
    fieldName: 'image'
}

const multipeFilesMiddleware = uploader.uploadMultipleFiles(middlewareOptions);

const router = Router()

router.post('/item/new', requireAuth, multipeFilesMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { title, price } = req.body;

    if (!req.files) return next(new BadRequestError('images are required'))

    if (req.uploaderError) return next(new BadRequestError(req.uploaderError.message));

    const item = await providerService.addItem({
        title,
        price,
        userId: req.currentUser!.userId,
        files: req.files
    })

    res.status(201).send(item)
})

router.post('/item/:id/update', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, price } = req.body;

    const result = await providerService.updateItem({ title, price, userId: req.currentUser!.userId, itemId: id })

    if (result instanceof CustomError) return next(result);

    res.status(200).send(result)
})


router.delete("/item/:id/delete", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await providerService.deleteItem({ itemId: id, userId: req.currentUser!.userId })
    if (result instanceof CustomError) return next(result);

    res.status(200).send(true)
})

router.post("/item/:id/add-images", requireAuth, multipeFilesMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!req.files) return next(new BadRequestError('images are required'))

    if (req.uploaderError) return next(new BadRequestError(req.uploaderError.message));

    const result = await providerService.addItemImages({ itemId: id, userId: req.currentUser!.userId, files: req.files })
    if (result instanceof CustomError) return next(result);

    res.status(200).send(result)
})

router.post('/item/:id/delete-images', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { imagesIds } = req.body
    const result = await providerService.deleteItemImages({ itemId: id, userId: req.currentUser!.userId, imagesIds })

    if (result instanceof CustomError) return next(result);

    res.status(200).send(result)
})

export { router as providerRouters }
