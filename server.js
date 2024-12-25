import "dotenv/config"; // Automatically load environment variables
import OpenAI from "openai"; // Import OpenAI library
import express from "express"; // Import Express framework
import {
  BMIDescription,
  calculateBMI,
  convertCurrency,
  currencyDescription,
  getWeatherDescription,
} from "./functions.js";

import fs from "fs";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
async function solveTextQuestions(question) {
  // Initialize the OpenAI client

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Use the desired GPT model
      messages: [
        {
          role: "system",
          content: "you will answer general to the question",
        },
        {
          role: "user",
          content: question,
        },
      ],
    });

    console.log(completion.choices[0].message.content.trim());
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating text:", error.message);
  }
}
async function callFunction(prompt, functions, res) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-0613", // Use a model with function calling capability
      messages: [{ role: "user", content: prompt }],
      functions: functions,
      function_call: "auto",
    });
    const message = response?.choices?.[0].message;
    console.log("@callFunction message", message);

    if (message?.function_call) {
      return message.function_call;
    } else {
      console.log("Message content:", message.content);
      res.json("Chat Gpt: " + message.content);
      return "error";
    }
  } catch (error) {
    console.error("Error during OpenAI API call:", error);
  }
}

const app = express();
app.use(express.json());

app.get("/test", (req, res) => {
  // Define a route for the root path
  res.send("Hello from the server!"); // Send a response
});
app.post("/askTextQuestion", async (req, res) => {
  const question = req.body.question;
  const response = await solveTextQuestions(question);
  console.log("response", response);
  res.send(response);
});
app.post("/askImageQuestion", async (req, res) => {
  const question = req.body?.question;
  if (!question) {
    res.status(400).send("question is required");
  }
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: question,
    n: 1,
    size: "1024x1024",
  });
  res.send(response);
  // console.log(response);
});
app.post("/callFunction", async (req, res) => {
  const prompt = req.body.data;
  console.log("prompt", prompt);

  const functions = [
    BMIDescription,
    currencyDescription,
    getWeatherDescription,
  ];
  const data = await callFunction(prompt, functions, res);
  if (data === "error") return;
  const name = data?.name,
    dataArguments = JSON.parse(data.arguments);
  console.log("dataArguments", dataArguments);
  if (name == "calculateBMI") {
    const bmi = calculateBMI(dataArguments.height, dataArguments.weight);
    return res.send(bmi);
  }
  if (name == "convertCurrency") {
    const convertedAmount = await convertCurrency({
      amount: dataArguments.amount,
      fromCurrency: dataArguments.fromCurrency,
      toCurrency: dataArguments.toCurrency,
      exchangeRate: dataArguments.exchangeRate,
    });
    console.log("convertedAmount", convertedAmount);
    return res.send(convertedAmount);
  }
  // const bmi = calculateBMI(data.height, data.weight);
  res.send(data);
});

app.listen(3000, () => {
  // Start the server on port 3000
  console.log("Server is running on port 3000"); // Log a message
});

async function main() {
  const assistant = await openai.beta.assistants.create({
    name: "Financial Analyst Assistant",
    instructions:
      "You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements.",
    model: "gpt-4o",
    tools: [{ type: "file_search" }],
  });
  const fileStreams = ["./files/goog-10k.pdf", "./files/brka-10k.txt"].map(
    (path) => fs.createReadStream(path)
  );

  // Create a vector store including our two files.
  let vectorStore = await openai.beta.vectorStores.create({
    name: "Financial Statement",
  });

  await openai.beta.vectorStores.fileBatches.uploadAndPoll(
    vectorStore.id,
    fileStreams
  );
}
