import type { MotionManagerOptions } from "@/cubism-common";
import { ExpressionManager } from "@/cubism-common/ExpressionManager";
import type { Cubism4ModelSettings } from "@/cubism4/Cubism4ModelSettings";
import type { CubismSpec } from "@cubism/CubismSpec";
import type { CubismModel } from "@cubism/model/cubismmodel";
import { CubismExpressionMotion } from "@cubism/motion/cubismexpressionmotion";
import { CubismMotionQueueManager } from "@cubism/motion/cubismmotionqueuemanager";

export class Cubism4ExpressionManager extends ExpressionManager<
    CubismExpressionMotion,
    CubismSpec.Expression
> {
    readonly queueManager = new CubismMotionQueueManager();

    readonly definitions: CubismSpec.Expression[];

    /**
     * Maps expression indices to their motion handles for efficient lookup
     */
    private expressionHandles: Map<number, number> = new Map();

    constructor(settings: Cubism4ModelSettings, options?: MotionManagerOptions) {
        super(settings, options);

        this.definitions = settings.expressions ?? [];

        this.init();
    }

    isFinished(): boolean {
        return this.queueManager.isFinished();
    }

    getExpressionIndex(name: string): number {
        return this.definitions.findIndex((def) => def.Name === name);
    }

    getExpressionFile(definition: CubismSpec.Expression): string {
        return definition.File;
    }

    createExpression(data: object, definition: CubismSpec.Expression | undefined) {
        return CubismExpressionMotion.create(data as unknown as CubismSpec.ExpressionJSON);
    }

    protected _setExpression(motion: CubismExpressionMotion): number {
        const handle = this.queueManager.startMotion(motion, false, performance.now());

        // Store the handle mapping for this expression
        // We need to find the index of the expression we're setting, not the current one
        const index = this.expressions.indexOf(motion);
        if (index !== -1) {
            this.expressionHandles.set(index, handle);
        }

        return handle;
    }

    protected stopAllExpressions(): void {
        this.queueManager.stopAllMotions();
        this.expressionHandles.clear();
    }

    protected updateParameters(model: CubismModel, now: DOMHighResTimeStamp): boolean {
        return this.queueManager.doUpdateMotion(model, now);
    }

    protected _fadeOutExpression(): boolean {
        return this.queueManager.fadeOutMotion(this.currentExpressionHandle);
    }

    protected _fadeOutSpecificExpression(index: number): boolean {
        const handle = this.expressionHandles.get(index);
        if (handle !== undefined) {
            const success = this.queueManager.fadeOutMotion(handle);
            if (success) {
                this.expressionHandles.delete(index);

                // Apply the default expression to reset parameters
                this.queueManager.startMotion(this.defaultExpression, false, performance.now());
            }
            return success;
        }
        return false;
    }
}
