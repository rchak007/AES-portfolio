import fetch from "node-fetch";

import dotenv from "dotenv";
dotenv.config();

const SOLSCAN_API_KEY = process.env.SOLSCAN_API_KEY;

if (!SOLSCAN_API_KEY) {
  console.error("API key not found in environment variables");
} else {
  const walletAddress = "3BKU6oCJof358dGF38dc4kanSvqZzMAgpdcux3asdijZ"; // Replace with actual wallet address

  const requestOptions = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${SOLSCAN_API_KEY}`, // Set the Authorization header with your API key
      "Content-Type": "application/json",
    },
  };

  const url = `https://pro-api.solscan.io/v2.0/account/balance_change?address=${walletAddress}&page_size=10&page=1`;

  fetch(url, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("API Response:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
