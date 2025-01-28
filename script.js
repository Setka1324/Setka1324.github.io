const explainBtn = document.getElementById("explain-btn");
const textArea = document.getElementById("user-text");
const outputDiv = document.getElementById("explanation-output");
const probsDiv = document.getElementById("prediction-probabilities");
const weightsDiv = document.getElementById("word-weights");
const charCounter = document.getElementById("char-counter");

// Replace with your actual Hugging Face Space endpoint
const HF_EXPLAIN_URL = "https://setka1324-uni-test.hf.space/explain";

// Example inputs
const exampleInputs = [
  "I feel amazing today! Everything is going my way, and I'm so excited for the future.",
  "Today I woke up anxious about work, but my cat cuddled with me, and it helped a lot.",
  "The economy seems unpredictable, but I feel confident that I can handle what comes my way.",
  "Sometimes I struggle with staying positive. On the bright side, my cat is always there to comfort me.",
  "Understanding machine learning models like transformers can be challenging, but it’s rewarding!",
  "The weather today is sunny, which is great. However, my emotions are still a bit of a rollercoaster."
];

// Set a random example input in the text area
function setRandomExample() {
  const randomIndex = Math.floor(Math.random() * exampleInputs.length);
  textArea.value = exampleInputs[randomIndex];
  updateCharCounter();
}

// Limit input to 200 characters and update the counter
function updateCharCounter() {
  const textLength = textArea.value.length;
  charCounter.textContent = `${textLength}/200`;
  if (textLength > 200) {
    textArea.value = textArea.value.slice(0, 200); // Trim extra characters
  }
}

textArea.addEventListener("input", updateCharCounter);

explainBtn.addEventListener("click", async () => {
  // Display loading messages
  outputDiv.innerHTML = "Loading explanation...";
  probsDiv.innerHTML = "Loading prediction probabilities...";
  weightsDiv.innerHTML = "Loading word contributions...";

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
    if (wordWeights.length > 0) {
      let weightsHtml = "<ul>";
      wordWeights.forEach(([word, weight]) => {
        weightsHtml += `<li><strong>${word}</strong>: ${weight.toFixed(4)}</li>`;
      });
      weightsHtml += "</ul>";
      weightsDiv.innerHTML = weightsHtml;
    } else {
      weightsDiv.innerHTML = "No significant word contributions to display.";
    }
  } catch (err) {
    console.error(err);
    outputDiv.innerHTML = "Error: " + err.message;
    probsDiv.innerHTML = "Error fetching prediction probabilities.";
    weightsDiv.innerHTML = "Error fetching word contributions.";
  }
});

// Initialize with a random example input
setRandomExample();
