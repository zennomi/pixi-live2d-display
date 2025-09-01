import { config } from "@/config";
import { Cubism4ModelSettings } from "@/cubism4/Cubism4ModelSettings";
import "@/factory";
import { expect, vi } from "vitest";
import { Cubism4ExpressionManager } from "../../src";
import expJson from "../assets/haru/expressions/F01.exp3.json";
import { TEST_MODEL4, test } from "../env";

test("updates parameters", async ({ timer }) => {
    const epsilon = 1e-5;
    const coreModel = await TEST_MODEL4.coreModel();
    const expManager = new Cubism4ExpressionManager(
        new Cubism4ModelSettings(TEST_MODEL4.modelJsonWithUrl),
    );
    const expParamId = expJson.Parameters[0]!.Id;
    const expParamValue = expJson.Parameters[0]!.Value;

    await expManager.setExpression("f00");
    expManager.update(coreModel, performance.now());
    expect(coreModel.getParameterValueById(expParamId)).to.not.closeTo(expParamValue, epsilon);

    vi.advanceTimersByTime(config.expressionFadingDuration);

    const updated = expManager.update(coreModel, performance.now());
    expect(updated).to.be.true;
    expect(coreModel.getParameterValueById(expParamId)).to.closeTo(expParamValue, epsilon);
});

test("unsetExpression fades out current expression", async ({ timer }) => {
    const epsilon = 1e-5;
    const coreModel = await TEST_MODEL4.coreModel();
    const expManager = new Cubism4ExpressionManager(
        new Cubism4ModelSettings(TEST_MODEL4.modelJsonWithUrl),
    );
    const expParamId = expJson.Parameters[0]!.Id;
    const expParamValue = expJson.Parameters[0]!.Value;

    // Set an expression first
    await expManager.setExpression("f00");
    expManager.update(coreModel, performance.now());

    // Advance time to let the expression take effect
    vi.advanceTimersByTime(config.expressionFadingDuration);
    expManager.update(coreModel, performance.now());

    // Verify expression is applied
    expect(coreModel.getParameterValueById(expParamId)).to.closeTo(expParamValue, epsilon);

    // Unset the expression
    const unsetResult = expManager.unsetExpression();
    expect(unsetResult).to.be.true;

    // Advance time to let the fade out take effect
    vi.advanceTimersByTime(config.expressionFadingDuration);
    expManager.update(coreModel, performance.now());

    // Verify expression is reset to default (should be different from the expression value)
    expect(coreModel.getParameterValueById(expParamId)).to.not.closeTo(expParamValue, epsilon);
});

test("can set expression again after unsetting it", async ({ timer }) => {
    const epsilon = 1e-5;
    const coreModel = await TEST_MODEL4.coreModel();
    const expManager = new Cubism4ExpressionManager(
        new Cubism4ModelSettings(TEST_MODEL4.modelJsonWithUrl),
    );
    const expParamId = expJson.Parameters[0]!.Id;
    const expParamValue = expJson.Parameters[0]!.Value;

    // Set an expression first
    await expManager.setExpression("f00");
    expManager.update(coreModel, performance.now());

    // Advance time to let the expression take effect
    vi.advanceTimersByTime(config.expressionFadingDuration);
    expManager.update(coreModel, performance.now());

    // Verify expression is applied
    expect(coreModel.getParameterValueById(expParamId)).to.closeTo(expParamValue, epsilon);

    // Unset the expression
    const unsetResult = await expManager.unsetSpecificExpression("f00");
    expect(unsetResult).to.be.true;

    // Wait for the motion to finish completely
    while (!expManager.isFinished()) {
        vi.advanceTimersByTime(100);
        expManager.update(coreModel, performance.now());
    }

    // Verify expression is reset to default
    expect(coreModel.getParameterValueById(expParamId)).to.not.closeTo(expParamValue, epsilon);

    // Now try to set the same expression again
    const setResult = await expManager.setExpression("f00");
    expect(setResult).to.be.true;

    // Advance time to let the expression take effect again
    vi.advanceTimersByTime(config.expressionFadingDuration);
    expManager.update(coreModel, performance.now());

    // Verify expression is applied again
    expect(coreModel.getParameterValueById(expParamId)).to.closeTo(expParamValue, epsilon);
});

test("unsetSpecificExpression fades out specific expression by index", async ({ timer }) => {
    const epsilon = 1e-5;
    const coreModel = await TEST_MODEL4.coreModel();
    const expManager = new Cubism4ExpressionManager(
        new Cubism4ModelSettings(TEST_MODEL4.modelJsonWithUrl),
    );
    const expParamId = expJson.Parameters[0]!.Id;
    const expParamValue = expJson.Parameters[0]!.Value;

    // Set an expression first
    await expManager.setExpression("f00");
    expManager.update(coreModel, performance.now());

    // Advance time to let the expression take effect
    vi.advanceTimersByTime(config.expressionFadingDuration);
    expManager.update(coreModel, performance.now());

    // Verify expression is applied
    expect(coreModel.getParameterValueById(expParamId)).to.closeTo(expParamValue, epsilon);

    // Unset the specific expression by index
    const unsetResult = await expManager.unsetSpecificExpression(0);
    expect(unsetResult).to.be.true;

    // Advance time to let the fade out take effect
    vi.advanceTimersByTime(config.expressionFadingDuration);
    expManager.update(coreModel, performance.now());

    // Verify expression is reset to default
    expect(coreModel.getParameterValueById(expParamId)).to.not.closeTo(expParamValue, epsilon);
});

test("unsetSpecificExpression fades out specific expression by name", async ({ timer }) => {
    const epsilon = 1e-5;
    const coreModel = await TEST_MODEL4.coreModel();
    const expManager = new Cubism4ExpressionManager(
        new Cubism4ModelSettings(TEST_MODEL4.modelJsonWithUrl),
    );
    const expParamId = expJson.Parameters[0]!.Id;
    const expParamValue = expJson.Parameters[0]!.Value;

    // Set an expression first
    await expManager.setExpression("f00");
    expManager.update(coreModel, performance.now());

    // Advance time to let the expression take effect
    vi.advanceTimersByTime(config.expressionFadingDuration);
    expManager.update(coreModel, performance.now());

    // Verify expression is applied
    expect(coreModel.getParameterValueById(expParamId)).to.closeTo(expParamValue, epsilon);

    // Unset the specific expression by name
    const unsetResult = await expManager.unsetSpecificExpression("f00");
    expect(unsetResult).to.be.true;

    // Advance time to let the fade out take effect
    vi.advanceTimersByTime(config.expressionFadingDuration);
    expManager.update(coreModel, performance.now());

    // Verify expression is reset to default
    expect(coreModel.getParameterValueById(expParamId)).to.not.closeTo(expParamValue, epsilon);
});
