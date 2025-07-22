import { Application } from 'express';
import authRouter from '../api/routes/authRouter';
import userRouter from '../api/routes/userRouter';
import adminRouter from '../api/routes/adminRouter';

export default (app: Application) => {
    app.use("/api/v1/auth/users", userRouter);
    app.use("/api/v1/auth/admins", adminRouter);
    app.use("/api/v1/auth", authRouter);
};
