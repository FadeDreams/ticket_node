import { Router, Request, Response, NextFunction } from 'express';
import { Session, SessionData } from 'express-session'; // Correct import
import { currentUser, BadRequestError } from '@fadedreams7org1/common';
import { authService } from '@src/application/auth/auth.service';

interface ExtendedSession extends Session {
    jwt: string;
    cartId?: any; // Add any other additional properties you want to store
}

const router = Router();

router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const result = await authService.signup({ email, password });

    if (result.message) return next(new BadRequestError(result.message));

    req.session = { jwt: result.jwt } as ExtendedSession;

    res.status(201).send(true);
});

router.post('/signin', async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const result = await authService.signin({ email, password });

    if (result.message) return next(new BadRequestError(result.message));

    req.session = { jwt: result.jwt } as ExtendedSession;

    res.status(201).send(true);
});

router.get('/current-user', currentUser(process.env.JWT_KEY!), async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send(req.currentUser);
});

export { router as authRouters };
