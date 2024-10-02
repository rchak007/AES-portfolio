import express from "express";

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define routes
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Handle incoming requests (you can add more routes here)
// Example route to get Solana token balances
app.get("/balances/:address", async (req, res) => {
  const address = req.params.address;
  // Call your function to get balances
  try {
    const balances = await getSolanaTokenBalances(address);
    res.json(balances);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve balances" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Don't forget to export your functions if they are in separate files
// import { getSolanaTokenBalances } from "./path/to/your/module";
import { getSolanaTokenBalances } from "./index";
