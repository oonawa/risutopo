import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import dotenv from "dotenv";

export default defineConfig({
	plugins: [tsconfigPaths(), react()],
	test: {
		environment: "jsdom",
		env: dotenv.config({ path: ".env.test" }).parsed,
		setupFiles: ["./tests/helpers/setup.ts"],
		maxWorkers: 1,
	},
});
