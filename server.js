require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1"
});

app.post("/generate", async (req, res) => {
  const { code } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "z-ai/glm-5.1",
      messages: [
        {
          role: "system",
          content: "You are an expert README generator. Given code, produce a professional, high-quality README.md that follows GitHub best practices used by top open source projects.\n\nStructure the README with these sections in order:\n1. Project Title - with a one-liner description of what it does\n2. Badges - include placeholder badges for build status, version, and license using shields.io markdown format\n3. Demo - a short description of what the user will see/experience\n4. Features - a concise bullet list of key features\n5. Prerequisites - what the user needs installed before they can run this\n6. Installation - step by step commands to get it running\n7. Usage - how to actually use it with a code example\n8. Contributing - one liner inviting contributions\n9. License - assume MIT\n\nRules:\n- Be specific to the actual code provided, not generic\n- Keep each section concise and scannable\n- Use proper Markdown: headers, code blocks with language tags, bullet points\n- Make the tone professional but approachable\n- Only respond with the README content, no extra commentary\n- Stay consistent, for example if the same code was being pasted again, then output should be the same as the first time"
        },
        {
          role: "user",
          content: `Generate a README for this code:\n\n${code}`
        }
      ],
      temperature: 1,
      top_p: 1,
      max_tokens: 1024,
      stream: false
    });

    const readme = completion.choices[0].message.content;
    res.json({ readme });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

app.post("/fetch-github", async (req, res) => {
  const { repoUrl } = req.body;
  try {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return res.status(400).json({ error: "Invalid GitHub URL" });
    const [, owner, repo] = match;

    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, {
      headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    });
    const treeData = await treeRes.json();

    const allowed = ['.js', '.ts', '.py', '.html', '.css', '.json', '.md'];
    const ignored = ['node_modules', 'package-lock.json', '.min.js'];
    const files = treeData.tree.filter(f =>
      f.type === 'blob' &&
      allowed.some(ext => f.path.endsWith(ext)) &&
      !ignored.some(ig => f.path.includes(ig))
    );

    const contents = await Promise.all(files.map(async (f) => {
      const r = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${f.path}`, {
        headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      });
      const text = await r.text();
      return `// FILE: ${f.path}\n${text}`;
    }));

    res.json({ code: contents.join('\n\n') });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch repo" });
  }
});


app.listen(3000, () => console.log("Server running on http://localhost:3000"));

