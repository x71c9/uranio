/**
 *
 * Generate index module
 *
 * @packageDocumentation
 */
type GenerateParams = {
    root: string;
    tsconfig_path?: string;
};
export declare function generate(params: GenerateParams): Promise<void>;
export {};
