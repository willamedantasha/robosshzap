import router from './routes/index';
import express from 'express';
import morgan from 'morgan';

const server = async () => {
    const app = express();
    app.use(morgan('dev'));
    app.use(router)
    app.listen(3000);
    console.log('Server: ', 3000);
}

server();
