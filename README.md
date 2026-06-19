# README Generator API

A lightweight Express.js server that leverages the NVIDIA-hosted `z-ai/glm-5.1` large language model to automatically generate professional, high-quality README.md files from source code.

## Description

This application provides a simple REST API endpoint where users can submit their source code. The server passes the code to the GLM-5.1 model via the NVIDIA Integrate API, which then generates a well-structured GitHub-style README.md file based on the provided code. This eliminates the hassle of writing documentation from scratch and ensures your projects have a professional, consistent README.

## Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```

2. **Install the dependencies:**
   ```bash
   npm install express cors openai
   ```

3. **Configure the API Key:**
   Open the server file and replace the `"___"` placeholder in the OpenAI configuration with your actual NVIDIA API key:
   ```javascript
   const openai = new OpenAI({
     apiKey: "YOUR_NVIDIA_API_KEY",
     baseURL: "https://integrate.api.nvidia.com/v1"
   });
   ```

## Usage

1. **Start the server:**
   ```bash
   node server.js
   ```
   The server will start on `http://localhost:3000`.

2. **Make a POST request:**
   Send a POST request to the `/generate` endpoint with a JSON payload containing the `code` you want to document.

   **Request Body:**
   ```json
   {
     "code": "const express = require('express');\nconst app = express();\napp.get('/', (req, res) => res.send('Hello World'));\napp.listen(8080);"
   }
   ```

   **Response:**
   The API will return a JSON object containing the generated README markdown in the `readme` field:
   ```json
   {
     "readme": "# My Project\n\nA simple Hello World Express server..."
   }
   ```

## Examples

You can test the API using `curl`:

```bash
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{"code": "def greet(name):\n    return f\"Hello, {name}!\"\n\nprint(greet(\"World\"))"}'
```

Or using JavaScript's `fetch`:

```javascript
const response = await fetch("http://localhost:3000/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    code: "def greet(name):\n    return f'Hello, {name}!'\n\nprint(greet('World'))"
  }),
});

const data = await response.json();
console.log(data.readme);
```
