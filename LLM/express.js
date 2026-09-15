import express from "express";
import  llmFunction  from "./llmProvider.js";
const app = express();
app.use(express.json());

app.post("/api/agent", async (req, res) => {
  const { message } = req.body;
  try {
    // do i even need a try catch here ?
    const response = await llmFunction(message);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});
app.listen(3000, () => {
  console.log("listening on port 3000");
});
