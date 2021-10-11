import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ApolloServer } from 'apollo-server-express';
import jwt from 'jsonwebtoken';

dotenv.config();

// // import db = require('./db');
import { models } from './models/index.js';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers/index.js';

// Run our server on a port specified in our .env file or port 4000
const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const app = express();

// db.connect(DB_HOST);
mongoose.connect(
  DB_HOST,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  err => {
    if (!err) {
      console.log('Mongodb Connected');
    } else {
      console.log('Error Connection');
    }
  }
);

// get the user info from a JWT
const getUser = token => {
  if (token) {
    try {
      // return the user information from the token
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // if there's a problem with the token, throw an error
      throw new Error('Session invalid');
    }
  }
};

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // get the user token from the headers
    const token = req.headers.authorization;
    // try to retrieve a user with the token
    const user = getUser(token);
    // for now, let's log the user to the console:
    console.log('User', user);
    // add the db models and the user to the context
    return { models, user };
  }
});

// Apply the Apollo GraphQL middleware and set the path to /api
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () =>
  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  )
);
