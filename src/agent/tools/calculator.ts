import { Tool } from '../tool';

export class CalculatorTool implements Tool {
    name = "Calculator";
    description = "Useful for evaluating mathematical expressions. Input should be a valid math expression string like '50 * 3' or '10 + 5'.";

    async execute(input: string): Promise<string> {
        try {
            // WARNING: eval is dangerous in production, but fine for this controlled demo
            // In a real app, use a math parser library like 'mathjs'
            const sanitizedInput = input.replace(/[^0-9+\-*/(). ]/g, '');
            const result = eval(sanitizedInput);
            return String(result);
        } catch (error: any) {
            return `Error calculating: ${error.message}`;
        }
    }
}
