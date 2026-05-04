
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

// Binary search algorithm implementation
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  const steps = [];

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = arr[mid];

    steps.push({
      left,
      right,
      mid,
      midValue,
      target,
      comparison: midValue === target ? "found" : midValue < target ? "go right" : "go left",
    });

    if (midValue === target) {
      return { found: true, index: mid, steps };
    }

    if (midValue < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return { found: false, index: -1, steps };
}

// Visualize binary search steps
function visualizeStep(arr, step) {
  const visualization = [];
  visualization.push("\n" + "=".repeat(60));
  visualization.push(`Step Details:`);
  visualization.push(`  Searching range: [${step.left}...${step.right}]`);
  visualization.push(`  Middle index: ${step.mid}, Value: ${step.midValue}`);
  visualization.push(`  Target: ${step.target}`);
  visualization.push(`  Comparison result: ${step.comparison}`);

  // Visual representation
  let visual = "  Array: ";
  for (let i = 0; i < arr.length; i++) {
    if (i === step.mid) {
      visual += `[${arr[i]}*]`;
    } else if (i >= step.left && i <= step.right) {
      visual += ` ${arr[i]} `;
    } else {
      visual += ` ${arr[i]} `;
    }
  }
  visualization.push(visual);
  visualization.push(`  Legend: * = current middle element`);

  return visualization.join("\n");
}

// Main interactive function
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) =>
    new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });

  // Display welcome message
  console.log("╔════════════════════════════════════════════╗");
  console.log("║    Binary Search Algorithm Visualizer      ║");
  console.log("║         with Claude AI Analysis            ║");
  console.log("╚════════════════════════════════════════════╝\n");

  // Example array for demonstration
  const arr = [2, 5, 8, 12, 16, 23, 38, 45, 56, 67, 78];

  console.log("Demo Array (sorted): ", arr);
  console.log("Array size: " + arr.length);
  console.log("\nExample search targets: 23, 45, 100, 5\n");

  let continueSearching = true;

  while (continueSearching) {
    const targetInput = await question("\nEnter a number to search (or 'quit' to exit): ");

    if (targetInput.toLowerCase() === "quit") {
      continueSearching = false;
      console.log("\nThank you for using Binary Search Visualizer!");
      rl.close();
      break;
    }

    const target = parseInt(targetInput);

    if (isNaN(target)) {
      console.log("Invalid input. Please enter a number.");
      continue;
    }

    // Perform binary search
    const result = binarySearch(arr, target);

    // Display visualization of each step
    console.log("\n" + "=".repeat(60));
    console.log(`Binary Search for: ${target}`);
    console.log("=".repeat(60));

    result.steps.forEach((step, index) => {
      console.log(visualizeStep(arr, step));
      console.log(`\nStep ${index + 1} completed`);
    });

    // Display final result
    console.log("\n" + "=".repeat(60));
    if (result.found) {
      console.log(`✓ Found! Target ${target} is at index ${result.index}`);
      console.log(`  Total steps: ${result.steps.length}`);
    } else {
      console.log(`✗ Not found! Target ${target} is not in the array`);
      console.log(`  Total steps: ${result.steps.length}`);
    }
    console.log("=".repeat(60));

    // Use Claude to analyze the search
    console.log("\nAnalyzing with Claude AI...");

    const analysisPrompt = `
I just performed a binary search on the sorted array [${arr.join(", ")}] looking for the target value ${target}.

The search took ${result.steps.length} steps and the result was: ${result.found ? `Found at index ${result.index}` : "Not found"}.

Please provide:
1. A brief explanation of how this binary search worked
2. Why binary search is efficient (time complexity analysis)
3. Any interesting observations about this particular search
4. When would binary search NOT be suitable

Keep the analysis concise and practical.`;

    const stream = client.messages.stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
    });

    console.log("\nClaude's Analysis:\n");

    let fullResponse = "";

    stream.on("text", (text) => {
      process.stdout.write(text);
      fullResponse += text;
    });

    stream.on("error", (error