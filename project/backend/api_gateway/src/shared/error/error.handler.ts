// 👉 Ye global error handler hai jo saare backend errors ko catch karta hai
// 👉 Isse hum ensure karte hain ki API hamesha JSON hi return kare, HTML nahi

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled Error', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
