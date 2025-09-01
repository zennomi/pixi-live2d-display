# Expression Management

The ExpressionManager provides functionality to control Live2D model expressions.

## Setting Expressions

You can set expressions by index or name:

```typescript
// Set expression by index
await expressionManager.setExpression(0);

// Set expression by name
await expressionManager.setExpression("happy");
```

## Unsetting Expressions

You can unset (fade out) expressions in two ways:

### Unset Current Expression

Unset the currently active expression:

```typescript
// Unset the current expression
const success = expressionManager.unsetExpression();
if (success) {
    console.log("Expression was successfully unset");
} else {
    console.log("No expression was currently active");
}
```

### Unset Specific Expression

Unset a specific expression by index or name:

```typescript
// Unset expression by index
const success = await expressionManager.unsetSpecificExpression(0);

// Unset expression by name
const success = await expressionManager.unsetSpecificExpression("happy");

if (success) {
    console.log("Specific expression was successfully unset");
} else {
    console.log("Expression not found or already inactive");
}
```

The unset methods:

-   Find the target expression motion in the motion queue
-   Fade it out smoothly using the expression's fade out time
-   Return `true` if the expression was successfully unset, `false` otherwise
-   Automatically reset to the default expression after fade out
-   Support both Cubism2 and Cubism4 models

## Resetting Expressions

You can also reset expressions to their default state:

```typescript
// Reset to default expression
expressionManager.resetExpression();

// Restore to the previously set expression
expressionManager.restoreExpression();
```

## Checking Expression Status

```typescript
// Check if expression playback has finished
if (expressionManager.isFinished()) {
    console.log("Expression playback completed");
}

// Get expression index by name
const index = expressionManager.getExpressionIndex("sad");
if (index !== -1) {
    console.log(`Found expression "sad" at index ${index}`);
}
```

## Playground Demo

The playground includes interactive buttons for testing all expression functionality:

-   **🎭 Play All Expressions**: Cycles through all expressions automatically
-   **🎲 Random Expression**: Sets a random expression
-   **❌ Unset Current**: Fades out the currently active expression
-   **❌ [Expression Name]**: Individual unset buttons for each specific expression
-   **🔄 Reset Expression**: Resets to the default expression

Each unset button targets a specific expression by its index, allowing precise control over which expressions to fade out.
