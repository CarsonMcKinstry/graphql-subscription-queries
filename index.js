import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";

const typeDefs = gql`
  type Query {
    ok: Boolean
  }

  type Book {
    title: String
    author: String
  }

  type Subscription {
    books: [Book]
  }
`;

function wait(n = 1000) {
  return new Promise((res) => {
    setTimeout(() => {
      res(true);
    }, n);
  });
}

const jsonFetch = (endpoint, options) =>
  fetch(endpoint, options).then((res) => res.json());

async function* booksPoll() {
  const endpoint = "http://localhost:3000/books";
  let pollingFinished = false;
  let requestId;
  let timeToWait = 125;

  while (!pollingFinished) {
    try {
      const response = requestId
        ? await jsonFetch(`${endpoint}?requestId=${requestId}`)
        : await jsonFetch(endpoint);

      if (!requestId && response.requestId) {
        requestId = response.requestId;
      }

      if (response.pollingFinished) {
        pollingFinished = true;
      }

      yield {
        books: response.books,
      };

      await wait(timeToWait);
      timeToWait *= 2;
    } catch (err) {
      err.fail = true;
      throw err;
    }
  }
}

const resolvers = {
  Query: {
    ok: () => true,
  },
  Subscription: {
    books: {
      subscribe: () => {
        return booksPoll();
      },
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Searver ready at ${url}`);
});
