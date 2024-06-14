import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();

console.log(process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(cors());
app.use(express.json());

let fullConversationHistory = [];
let truncatedConversationHistory = [];
const MAX_HISTORY_LENGTH = 10; // Limit to the last 10 messages

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from Ifran",
  });
});

app.post("/", async (req, res) => {
  try {
    const userMessage = req.body.prompt;

    // Add user message to both full and truncated conversation histories
    fullConversationHistory.push({ role: "user", content: userMessage });
    truncatedConversationHistory.push({ role: "user", content: userMessage });

    // Limit truncated conversation history to the last MAX_HISTORY_LENGTH messages
    if (truncatedConversationHistory.length > MAX_HISTORY_LENGTH) {
      truncatedConversationHistory = truncatedConversationHistory.slice(
        -MAX_HISTORY_LENGTH
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: truncatedConversationHistory,
      temperature: 0,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });

    const botMessage = response.choices[0].message.content;

    // Add bot response to both full and truncated conversation histories
    fullConversationHistory.push({ role: "assistant", content: botMessage });
    truncatedConversationHistory.push({
      role: "assistant",
      content: botMessage,
    });

    // Again limit truncated conversation history to the last MAX_HISTORY_LENGTH messages
    if (truncatedConversationHistory.length > MAX_HISTORY_LENGTH) {
      truncatedConversationHistory = truncatedConversationHistory.slice(
        -MAX_HISTORY_LENGTH
      );
    }

    res.status(200).send({
      bot: botMessage,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err });
  }
});

app.listen(5000, () => console.log("Listening on port http://localhost:5000"));
