// ESM syntax is supported.
import express from 'express';
import mongoose from 'mongoose';
import { userRoutes, sessionRoutes } from './routes/index';
import { PORT, NODE_ENV, MONGO_URI, SESS_NAME, SESS_SECRET, SESS_LIFETIME} from './config';
import session from "express-session";
import connectStore from "connect-mongo";
import cors from 'cors';


(async () => {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true });
        console.log('MongoDB connected');


        const app = express();

        app.disable('x-powered-by');
        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());
        app.use(
          cors({
            origin: "http://localhost:3000", // <-- location of the react app were connecting to
            credentials: true,
          })
        );


        const MongoStore = new connectStore(session);

       
        app.use(session({
            name: SESS_NAME,
            secret: SESS_SECRET,
            store: new MongoStore({
              mongooseConnection: mongoose.connection,
              collection: 'session',
              ttl: parseInt(SESS_LIFETIME) / 1000,
            }),
            saveUninitialized: false,
            resave: false,
            cookie: {
              sameSite: true,
              secure: NODE_ENV === 'production',
              maxAge: parseInt(SESS_LIFETIME)
            }
        }));

        


        const apiRouter = express.Router();
        app.use('/api', apiRouter);
        apiRouter.use('/users', userRoutes);
        apiRouter.use('/session', sessionRoutes);

        app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
    } catch (err) {
        console.log(err)
    }
  })();