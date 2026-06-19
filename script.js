const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const codeInput = document.getElementById("codeInput");
const output = document.getElementById("output");
const readmePreview = document.getElementById("readmePreview");


document.getElementById('fetchRepoBtn').addEventListener('click', async () => {
  const repoUrl = document.getElementById('repoUrl').value.trim();
  if (!repoUrl) return alert('Please enter a GitHub URL');

  const fetchBtn = document.getElementById('fetchRepoBtn');
  fetchBtn.textContent = 'Fetching...';
  fetchBtn.disabled = true;

  try {
    const res = await fetch('/fetch-github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    document.getElementById('codeInput').value = data.code;
  } catch (err) {
    alert('Error fetching repo: ' + err.message);
  } finally {
    fetchBtn.textContent = 'Fetch Repo';
    fetchBtn.disabled = false;
  }
});


let rawMarkdown = "";

generateBtn.addEventListener("click", async () => {
  const code = codeInput.value.trim();

  if (!code) {
    alert("Please paste some code first!");
    return;
  }

  generateBtn.textContent = "Generating...";
  generateBtn.disabled = true;
  readmePreview.innerHTML = `<p style="color:#8b949e">Generating your README...</p>`;

  try {
    const response = await fetch("http://localhost:3000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    const data = await response.json();
    rawMarkdown = data.readme;
    readmePreview.innerHTML = marked.parse(rawMarkdown);

  } catch (error) {
    readmePreview.innerHTML = `<p style="color:red">Something went wrong. Check console for details.</p>`;
    console.error(error);
  } finally {
    generateBtn.textContent = "Generate README";
    generateBtn.disabled = false;
  }
});

copyBtn.addEventListener("click", () => {
  if (!rawMarkdown) return;
  navigator.clipboard.writeText(rawMarkdown);
  copyBtn.textContent = "Copied!";
  setTimeout(() => copyBtn.textContent = "Copy Markdown", 2000);
});

downloadBtn.addEventListener("click", () => {
  if (!rawMarkdown) return;
  const blob = new Blob([rawMarkdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "README.md";
  a.click();
  URL.revokeObjectURL(url);
});