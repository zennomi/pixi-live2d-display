import type { MotionManagerOptions } from "@/cubism-common";
import { ExpressionManager } from "@/cubism-common/ExpressionManager";
import type { Cubism4ModelSettings } from "@/cubism4/Cubism4ModelSettings";
import type { CubismSpec } from "@cubism/CubismSpec";
import type { CubismModel } from "@cubism/model/cubismmodel";
import { CubismExpressionMotion } from "@cubism/motion/cubismexpressionmotion";
import { CubismExpressionMotionManager } from "@cubism/motion/cubismexpressionmotionmanager";

export class Cubism4ExpressionManager extends ExpressionManager<
    CubismExpressionMotion,
    CubismSpec.Expression
> {
    readonly queueManager = new CubismExpressionMotionManager();

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

    protected _setExpression(motion: CubismExpressionMotion, overlapping?: boolean): number {
        const index = this.expressions.indexOf(motion);
        if (this.expressionHandles.has(index)) {
            return index;
        }
        const handle = this.queueManager.startExpression(motion, overlapping ?? false);

        // Store the handle mapping for this expression
        // We need to find the index of the expression we're setting, not the current one
        if (index !== -1) {
            this.expressionHandles.set(index, handle);
        }

        return index;
    }

    protected stopAllExpressions(): void {
        this.queueManager.stopAllMotions();
        this.expressionHandles.clear();
    }

    protected updateParameters(model: CubismModel, now: DOMHighResTimeStamp): boolean {
        return this.queueManager.doUpdateMotion(model, now);
    }

    protected _unsetExpression(index: number): boolean {
        const handle = this.expressionHandles.get(index);
        if (handle !== undefined) {
            const success = this.queueManager.fadeOutMotion(handle);
            if (success) {
                this.expressionHandles.delete(index);
            }
            return success;
        }
        return false;
    }
}
