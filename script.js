const explainBtn = document.getElementById("explain-btn");
const textArea = document.getElementById("user-text");
const outputDiv = document.getElementById("explanation-output");
const weightsDiv = document.getElementById("word-weights");
const probabilityChartCanvas = document.getElementById("probability-chart");

let probabilityChart = null; // Chart.js instance

// Replace with your actual Hugging Face Space endpoint
const HF_EXPLAIN_URL = "https://setka1324-uni-test.hf.space/explain";

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
