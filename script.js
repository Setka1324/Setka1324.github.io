const explainBtn = document.getElementById("explain-btn");
const textArea = document.getElementById("user-text");
const outputDiv = document.getElementById("explanation-output");
const probsDiv = document.getElementById("prediction-probabilities");
const weightsDiv = document.getElementById("word-weights");

// Replace with your actual Hugging Face Space endpoint
const HF_EXPLAIN_URL = "https://setka1324-uni-test.hf.space/explain";

explainBtn.addEventListener("click", async () => {
  // Display loading messages
  outputDiv.innerHTML = "Loading explanation...";
  probsDiv.innerHTML = "Loading prediction probabilities...";
  weightsDiv.innerHTML = "<h3>Word Contributions</h3><p>Loading...</p>";

  const text = textArea.value.trim();
  if (!text) {
    outputDiv.innerHTML = "Please enter some text first.";
    probsDiv.innerHTML = "";
    weightsDiv.innerHTML = "<h3>Word Contributions</h3><p>No input provided.</p>";
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

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    const explanationHtml = data.html;
    const probabilities = data.probabilities;
    const wordWeights = data.word_weights;

    // Insert the LIME explanation HTML
    outputDiv.innerHTML = explanationHtml;

    // Generate HTML for prediction probabilities
    let probsHtml = "<h3>Prediction Probabilities</h3>";
    for (const [className, prob] of Object.entries(probabilities)) {
      const percentage = (prob * 100).toFixed(2) + "%";
      probsHtml += `<div class="probability">${className}: ${percentage}</div>`;
    }
    probsDiv.innerHTML = probsHtml;

    // Generate HTML for sorted word weights
    let weightsHtml = "<h3>Word Contributions</h3><ul>";
    if (wordWeights.length > 0) {
      wordWeights.forEach(([word, weight]) => {
        weightsHtml += `<li><strong>${word}</strong>: ${weight.toFixed(4)}</li>`;
      });
    } else {
      weightsHtml += "<li>No significant contributions to display.</li>";
    }
    weightsHtml += "</ul>";
    weightsDiv.innerHTML = weightsHtml;

  } catch (err) {
    console.error(err);
    outputDiv.innerHTML = "Error: " + err.message;
    probsDiv.innerHTML = "<h3>Prediction Probabilities</h3><p>Error fetching probabilities.</p>";
    weightsDiv.innerHTML = "<h3>Word Contributions</h3><p>Error fetching contributions.</p>";
  }
});
