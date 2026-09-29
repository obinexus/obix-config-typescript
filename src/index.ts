export const baseConfig = {
  compilerOptions: {
    target: "ES2022",
    module: "ESNext",
    moduleResolution: "bundler",
    strict: true,
    declaration: true,
    declarationMap: true,
    sourceMap: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    resolveJsonModule: true,
    isolatedModules: true,
    lib: ["ES2022", "DOM", "DOM.Iterable"],
  },
} as const;

export const developmentConfig = {
  extends: "obix-config-typescript/base",
  compilerOptions: {
    ...baseConfig.compilerOptions,
    sourceMap: true,
    inlineSources: true,
    noEmit: false,
  },
} as const;

export const productionConfig = {
  extends: "obix-config-typescript/base",
  compilerOptions: {
    ...baseConfig.compilerOptions,
    declaration: true,
    declarationMap: true,
    removeComments: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
  },
} as const;

export type ConfigEnv = "base" | "development" | "production";

export function resolveConfig(env: ConfigEnv = "base") {
  const configs = {
    base: baseConfig,
    development: developmentConfig,
    production: productionConfig,
  };
  return configs[env];
}
