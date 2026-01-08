import express from 'express';
import 'dotenv/config'; 
const app = express();
console.log("This is my Kingdom");

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
