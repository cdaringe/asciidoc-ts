const globl = globalThis as any;
export const getEnvVar = (name: string): string | undefined =>
  typeof globl.Deno !== "undefined"
    ? globl.Deno.env.get(name)
    : typeof globl.process !== "undefined"
    ? globl.process.env[name]
    : undefined;
