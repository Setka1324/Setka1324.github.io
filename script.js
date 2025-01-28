const explainBtn = document.getElementById("explain-btn");
const textArea   = document.getElementById("user-text");
const outputDiv  = document.getElementById("explanation-output");
const probsDiv   = document.getElementById("prediction-probabilities");
const weightsDiv = document.getElementById("word-weights"); // New container

// Replace with your actual Hugging Face Space endpoint
const HF_EXPLAIN_URL = "https://setka1324-uni-test.hf.space/explain";

explainBtn.addEventListener("click", async () => {
  // Display loading messages
  outputDiv.innerHTML = "Loading explanation...";
  probsDiv.innerHTML = "Loading prediction probabilities...";
  weightsDiv.innerHTML = "Loading word weights..."; // Initialize loading state

  const text = textArea.value.trim();
  if (!text) {
    outputDiv.innerHTML = "Please enter some text first.";
    probsDiv.innerHTML = "";
    weightsDiv.innerHTML = "";
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

    // Expecting { html: "<HTML from LIME>", word_weights: [ [word, weight], ... ], probabilities: { ... } }
    const data = await response.json();
    
    // Handle potential error responses
    if (data.error) {
      throw new Error(data.error);
    }

    const explanationHtml = data.html;
    const probabilities = data.probabilities;
    const wordWeights = data.word_weights;

    // Insert the LIME HTML into the explanation output div
    outputDiv.innerHTML = explanationHtml;

    // Generate HTML for prediction probabilities
    let probsHtml = "";
    for (const [className, prob] of Object.entries(probabilities)) {
      const percentage = (prob * 100).toFixed(2) + "%";
      probsHtml += `<div class="probability">${className}: ${percentage}</div>`;
    }
    probsDiv.innerHTML = probsHtml;

    // Generate HTML for sorted word weights
    let weightsHtml = "<ul>";
    wordWeights.forEach(([word, weight]) => {
      weightsHtml += `<li><strong>${word}</strong>: ${weight.toFixed(4)}</li>`;
    });
    weightsHtml += "</ul>";
    weightsDiv.innerHTML = weightsHtml;

  } catch (err) {
    console.error(err);
    outputDiv.innerHTML = "Error: " + err.message;
    probsDiv.innerHTML = "Error fetching prediction probabilities.";
    weightsDiv.innerHTML = "Error fetching word weights.";
  }
});
