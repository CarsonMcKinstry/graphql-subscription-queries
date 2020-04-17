import uuid from "uuid/v4";
import express from "express";

const app = express();

const requests = new Map();

let reqTimer;

const books = [
  {
    title: "Harry Pottare and the Chamber of Secrets",
    author: "J.K. Rowling",
  },
  {
    title: "Jurassic Park",
    author: "Michael Crichton",
  },
];

app.get("/books", (req, res) => {
  const { requestId } = req.query;
  if (requestId != null) {
    const value = requests.get(requestId);

    if (value) {
      clearTimeout(reqTimer);
      console.log(value);
      return res.send({
        requestId,
        pollingFinished: true,
        books: books,
      });
    } else {
      return res.send({
        requestId,
        pollingFinished: false,
        books: [],
      });
    }
  } else {
    const id = uuid();

    requests.set(id, null);

    reqTimer = setTimeout(() => {
      requests.set(id, "finished...");
    }, 4000);

    return res.json({
      requestId: id,
      pollingFinished: false,
      books: [],
    });
  }
});

app.listen(3000, () => {
  console.log(`Listening on localhost:${3000}`);
});
