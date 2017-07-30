import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import {search as searchCities} from './controller/city';

const app = express();
const port = process.env.port || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(port);

app.get('/search', searchCities);

mongoose.Promise = global.Promise; // mongoose promise library is deprecated
mongoose.connect('mongodb://127.0.0.1/city-finder', { useMongoClient: true })
  .then(() => {
    console.log(`Server running at http://127.0.0.1:${port}/`);
  });

