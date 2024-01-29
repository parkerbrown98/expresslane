import express from "express";
import * as expresslane from "../index";

const app = express();
expresslane.initialize({ express: app });

app.listen(3000, () => {
  console.log(`Server is running at http://localhost:3000`);
});
