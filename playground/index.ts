// run this to tell git not to track this file
// git update-index --skip-worktree test/playground/index.ts

import { Application, Ticker } from "pixi.js";
import { Live2DModel } from "../src";

Live2DModel.registerTicker(Ticker);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const modelURL =
    "https://raw.githubusercontent.com/zennomi/Ami-model/refs/heads/master/ptit_sdk.model3.json";

async function main() {
    const app = new Application({
        resizeTo: window,
        view: canvas,
    });
    (window as any).app = app;

    const model = await Live2DModel.from(modelURL);

    model.scale.set(0.5);

    app.stage.addChild(model);

    // Add expression buttons after model is loaded
    addExpressionButtons(model);
}

main().then();

function checkbox(name: string, onChange: (checked: boolean) => void) {
    const id = name.replace(/\W/g, "").toLowerCase();

    document.getElementById("control")!.innerHTML += `
<p>
  <input type="checkbox" id="${id}">
  <label for="${id}">${name}</label>
</p>`;

    const checkbox = document.getElementById(id) as HTMLInputElement;

    checkbox.addEventListener("change", (ev) => {
        onChange(checkbox.checked);
    });

    onChange(checkbox.checked);
}

function addExpressionButtons(model: Live2DModel) {
    const controlDiv = document.getElementById("control")!;

    // Add a separator
    const separator = document.createElement("hr");
    separator.style.margin = "20px 0";
    separator.style.border = "1px solid #666";
    controlDiv.appendChild(separator);

    // Add expression section header
    const header = document.createElement("h3");
    header.style.margin = "10px 0";
    header.style.color = "#fff";
    header.textContent = "Expressions";
    controlDiv.appendChild(header);

    // Add status display
    const statusDisplay = document.createElement("p");
    statusDisplay.id = "expr-status";
    statusDisplay.style.color = "#ccc";
    statusDisplay.style.margin = "10px 0";
    statusDisplay.style.fontSize = "14px";
    statusDisplay.textContent = "Current: Default";
    controlDiv.appendChild(statusDisplay);

    // Get available expressions from the model
    const expressionManager = model.internalModel.motionManager.expressionManager;

    if (expressionManager && expressionManager.definitions) {
        // Add "Play All Expressions" button
        const playAllButton = document.createElement("button");
        playAllButton.id = "expr-play-all";
        playAllButton.style.margin = "5px";
        playAllButton.style.padding = "10px 20px";
        playAllButton.style.background = "#9C27B0";
        playAllButton.style.color = "white";
        playAllButton.style.border = "none";
        playAllButton.style.borderRadius = "4px";
        playAllButton.style.cursor = "pointer";
        playAllButton.style.fontSize = "14px";
        playAllButton.style.fontWeight = "bold";
        playAllButton.textContent = "🎭 Play All Expressions";
        controlDiv.appendChild(playAllButton);

        let isPlayingAll = false;
        let currentExpressionIndex = 0;

        playAllButton.addEventListener("click", () => {
            if (!isPlayingAll) {
                isPlayingAll = true;
                playAllButton.style.background = "#FF9800";
                playAllButton.textContent = "⏸️ Stop Sequence";

                const playNextExpression = () => {
                    if (!isPlayingAll) return;

                    model.expression(currentExpressionIndex);
                    updateExpressionStatus(
                        expressionManager.definitions[currentExpressionIndex].Name,
                    );

                    currentExpressionIndex =
                        (currentExpressionIndex + 1) % expressionManager.definitions.length;

                    setTimeout(playNextExpression, 2000); // Change expression every 2 seconds
                };

                playNextExpression();
            } else {
                isPlayingAll = false;
                playAllButton.style.background = "#9C27B0";
                playAllButton.textContent = "🎭 Play All Expressions";

                // Reset to default expression
                if (expressionManager) {
                    (expressionManager as any).queueManager.stopAllMotions();
                }
                updateExpressionStatus("Default");
            }
        });

        expressionManager.definitions.forEach((expression, index) => {
            console.log(expression);
            const button = document.createElement("button");
            button.id = `expr-${index}`;
            button.style.margin = "5px";
            button.style.padding = "8px 16px";
            button.style.background = "#4CAF50";
            button.style.color = "white";
            button.style.border = "none";
            button.style.borderRadius = "4px";
            button.style.cursor = "pointer";
            button.style.fontSize = "14px";
            button.textContent = expression.Name || `Expression ${index}`;
            controlDiv.appendChild(button);

            button.addEventListener("click", () => {
                // Stop the play all sequence if it's running
                if (isPlayingAll) {
                    isPlayingAll = false;
                    playAllButton.style.background = "#9C27B0";
                    playAllButton.textContent = "🎭 Play All Expressions";
                }

                // Apply the expression
                model.expression(index);
                updateExpressionStatus(expression.Name);

                // Visual feedback - change button color temporarily
                button.style.background = "#FF9800";
                setTimeout(() => {
                    button.style.background = "#4CAF50";
                }, 500);
            });
        });

        // Add a "Random Expression" button
        const randomButton = document.createElement("button");
        randomButton.id = "expr-random";
        randomButton.style.margin = "5px";
        randomButton.style.padding = "8px 16px";
        randomButton.style.background = "#2196F3";
        randomButton.style.color = "white";
        randomButton.style.border = "none";
        randomButton.style.borderRadius = "4px";
        randomButton.style.cursor = "pointer";
        randomButton.style.fontSize = "14px";
        randomButton.textContent = "🎲 Random Expression";
        controlDiv.appendChild(randomButton);

        randomButton.addEventListener("click", () => {
            // Stop the play all sequence if it's running
            if (isPlayingAll) {
                isPlayingAll = false;
                playAllButton.style.background = "#9C27B0";
                playAllButton.textContent = "🎭 Play All Expressions";
            }

            model.expression();
            updateExpressionStatus("Random");

            // Visual feedback
            randomButton.style.background = "#FF9800";
            setTimeout(() => {
                randomButton.style.background = "#2196F3";
            }, 500);
        });

        // Add a "Reset Expression" button
        const resetButton = document.createElement("button");
        resetButton.id = "expr-reset";
        resetButton.style.margin = "5px";
        resetButton.style.padding = "8px 16px";
        resetButton.style.background = "#f44336";
        resetButton.style.color = "white";
        resetButton.style.border = "none";
        resetButton.style.borderRadius = "4px";
        resetButton.style.cursor = "pointer";
        resetButton.style.fontSize = "14px";
        resetButton.textContent = "🔄 Reset Expression";
        controlDiv.appendChild(resetButton);

        resetButton.addEventListener("click", () => {
            // Stop the play all sequence if it's running
            if (isPlayingAll) {
                isPlayingAll = false;
                playAllButton.style.background = "#9C27B0";
                playAllButton.textContent = "🎭 Play All Expressions";
            }

            // Stop all expressions to reset to default
            if (expressionManager) {
                // Access the queueManager directly to stop all motions
                (expressionManager as any).queueManager.stopAllMotions();
            }
            updateExpressionStatus("Default");

            // Visual feedback
            resetButton.style.background = "#FF9800";
            setTimeout(() => {
                resetButton.style.background = "#f44336";
            }, 500);
        });
    } else {
        const noExpressionsMsg = document.createElement("p");
        noExpressionsMsg.style.color = "#ccc";
        noExpressionsMsg.textContent = "No expressions available for this model.";
        controlDiv.appendChild(noExpressionsMsg);
    }
}

function updateExpressionStatus(expressionName: string) {
    const statusElement = document.getElementById("expr-status");
    if (statusElement) {
        statusElement.textContent = `Current: ${expressionName}`;
        statusElement.style.color = "#4CAF50";

        // Reset color after a delay
        setTimeout(() => {
            statusElement.style.color = "#ccc";
        }, 1000);
    }
}
