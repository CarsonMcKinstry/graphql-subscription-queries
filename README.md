# Subscription based requests with Apollo

Super SUPER basic, quick and dirty way of creating "polling" requests with Apollo Subscriptions

## What is this?

If the API backing up your graphql server requires that you poll, you normally need to poll using the Apollo Client on the front end. Here, we are offloading that polling to the apollo server itself.

## To try it out

Start by cloning the repo and naviagating to the directory.

1. Run `yarn install` or `npm init`
2. Run `yarn dev`. This spins up a basic express server on port `3000` and an apollo server on port `4000`
3. Navigate to `http://localhost:4000` in your browser
4. Use the following subscription:

```
subscription {
  books [
    author
    title
  ]
}
```

After about 5 seconds, you should receive your data.
