import { ApolloClient, InMemoryCache, ApolloLink, gql } from "@apollo/client";
import { split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import ws from "ws";
import fetch from "node-fetch";
import { fromStream } from "mobx-utils";
import { autorun } from "mobx";

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
  fetch,
});

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true,
  },
  webSocketImpl: ws,
});

const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([link]),
});

function scan(reducer, initial) {
  let output = initial;
  return (value) => {
    {
      output = reducer(output, value);

      return output;
    }
  };
}

const o = fromStream(
  client
    .subscribe({
      query: gql`
        subscription {
          books {
            title
            author
          }
        }
      `,
    })
    .map(
      scan((acc, val) => {
        acc = acc.concat(val.data.books);

        return acc;
      }, [])
    ),
  []
);

autorun(() => {
  console.log(o.current);
});
