import {Server} from 'http';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import hpp from 'hpp';
import helmet from 'helmet';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import csurf from "csurf";
import DBConnection from './config/database';
import mountRoutes from './routes';

const app: express.Application = express();

app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['X-CSRF-Token', 'Authorization', 'Content-Type'],
    credentials: true,
}));
app.use(cookieParser());
app.use(
    csurf({
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'product',
            sameSite: 'none',
        },
    }),
);
app.use(express.json({limit: '1kb'}));
app.use(compression());
app.use(ExpressMongoSanitize());
app.use(helmet());
app.use(hpp({whitelist: []}));
app.use(express.static('uploads'));
dotenv.config();

const port = process.env.PORT;
let server: Server;
DBConnection().then(() => {
    server = app.listen(port, () => {
        console.log(`app is listen on port ${port}`);
    });
});
mountRoutes(app);

process.on('unhandledRejection', (err: Error) => {
    console.error(`unhandledRejection ${err.name} | ${err.message}`);
    server.close(() => {
        console.error('shutting the application down');
        process.exit(1);
    });
});
