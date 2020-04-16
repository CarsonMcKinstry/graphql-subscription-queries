import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";
import { from, timer } from "rxjs";
import { tap, map, mergeMap, switchMap, filter, take } from "rxjs/operators";

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

const poll = () => {
  return new Promise((res, rej) => {
    let requestId;

    const t = timer(0, 1000).pipe(
      switchMap(() => {
        let requestUrl = `http://localhost:3000/books`;
        if (requestId) {
          requestUrl += `?requestId=${requestId}`;
        }
        return from(fetch(requestUrl)).pipe(map((res) => res));
      }),
      mergeMap((res) => from(res.json())),
      tap((res) => {
        requestId = res.requestId;
      }),
      filter((res) => res.pollingFinished === true),
      take(1)
    );

    t.subscribe(
      (info) => {
        res(info);
      },
      (err) => {
        rej(err);
      }
    );
  });
};

const resolvers = {
  Query: {
    ok: () => true,
  },
  Subscription: {
    books: {
      subscribe: () => {
        const polling = async function* () {
          const { value } = await poll();

          yield {
            books: value,
          };
        };

        return polling();
      },
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Searver ready at ${url}`);
});
