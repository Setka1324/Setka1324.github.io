const explainBtn = document.getElementById("explain-btn");
const textArea = document.getElementById("user-text");
const outputDiv = document.getElementById("explanation-output");
const weightsDiv = document.getElementById("word-weights");
const probabilityChartCanvas = document.getElementById("probability-chart");
const charCounter = document.getElementById("char-counter");

let probabilityChart = null; // Chart.js instance

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
  outputDiv.innerHTML = "Loading explanation...";
  weightsDiv.innerHTML = "<h3>Word Contributions</h3><p>Loading...</p>";

  const text = textArea.value.trim();
  if (!text) {
    outputDiv.innerHTML = "Please enter some text first.";
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

    // Insert LIME explanation HTML
    outputDiv.innerHTML = explanationHtml;

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

    // Generate probability chart
    updateProbabilityChart(probabilities);

  } catch (err) {
    console.error(err);
    outputDiv.innerHTML = "Error: " + err.message;
    weightsDiv.innerHTML = "<h3>Word Contributions</h3><p>Error fetching contributions.</p>";
  }
});

// Function to update the probability chart
function updateProbabilityChart(probabilities) {
  const labels = Object.keys(probabilities);
  const values = Object.values(probabilities).map(p => p * 100);

  if (probabilityChart) {
    probabilityChart.destroy();
  }

  probabilityChart = new Chart(probabilityChartCanvas, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: ["#FF4C4C", "#4CAF50"], // Red for Negative, Green for Positive
        borderColor: "#ffffff",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom"
        }
      }
    }
  });
}

// Initialize with a random example input
setRandomExample();
