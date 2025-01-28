const explainBtn = document.getElementById("explain-btn");
const textArea   = document.getElementById("user-text");
const outputDiv  = document.getElementById("explanation-output");

// Replace with your actual Hugging Face Space endpoint
const HF_EXPLAIN_URL = "https://setka1324-uni-test.hf.space/explain";

explainBtn.addEventListener("click", async () => {
  outputDiv.innerHTML = "Loading explanation...";

  const text = textArea.value.trim();
  if (!text) {
    outputDiv.innerHTML = "Please enter some text first.";
    return;
  }

  try {
    const response = await fetch(HF_EXPLAIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // { html: "<HTML from LIME>" }
    const data = await response.json();
    const explanationHtml = data.html;

    // Insert the LIME HTML into the page
    outputDiv.innerHTML = explanationHtml;
  } catch (err) {
    console.error(err);
    outputDiv.innerHTML = "Error: " + err.message;
  }
});
