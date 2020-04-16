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
      return res.send({
        requestId,
        pollingFinished: true,
        value: books,
      });
    } else {
      return res.send({
        requestId,
        pollingFinished: false,
        value: null,
      });
    }
  } else {
    const id = uuid();

    requests.set(id, null);

    reqTimer = setTimeout(() => {
      requests.set(id, "finished...");
    }, 5000);

    return res.json({
      requestId: id,
      pollingFinished: false,
      value: null,
    });
  }
});

app.listen(3000, () => {
  console.log(`Listening on localhost:${3000}`);
});
