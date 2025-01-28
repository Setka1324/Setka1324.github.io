const explainBtn = document.getElementById("explain-btn");
const textArea   = document.getElementById("user-text");
const outputDiv  = document.getElementById("explanation-output");
const probsDiv   = document.getElementById("prediction-probabilities");

// Replace with your actual Hugging Face Space endpoint
const HF_EXPLAIN_URL = "https://setka1324-uni-test.hf.space/explain";

explainBtn.addEventListener("click", async () => {
  outputDiv.innerHTML = "Loading explanation...";
  probsDiv.innerHTML = "Loading prediction probabilities...";

  const text = textArea.value.trim();
  if (!text) {
    outputDiv.innerHTML = "Please enter some text first.";
    probsDiv.innerHTML = "";
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

    // { html: "<HTML from LIME>", probabilities: { ... } }
    const data = await response.json();
    const explanationHtml = data.html;
    const probabilities = data.probabilities;

    // Insert the LIME HTML into the page
    outputDiv.innerHTML = explanationHtml;

    // Display prediction probabilities
    let probsHtml = "";
    for (const [className, prob] of Object.entries(probabilities)) {
      const percentage = (prob * 100).toFixed(2) + "%";
      probsHtml += `<div class="probability">${className}: ${percentage}</div>`;
    }
    probsDiv.innerHTML = probsHtml;

  } catch (err) {
    console.error(err);
    outputDiv.innerHTML = "Error: " + err.message;
    probsDiv.innerHTML = "Error fetching prediction probabilities.";
  }
});
