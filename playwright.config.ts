import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test", override: true });

export default defineConfig({
	testDir: "./tests/e2e",
	timeout: 30_000,
	fullyParallel: false,
	workers: 1,
	reporter: [["html", { open: "never" }]],
	globalSetup: "./tests/e2e/globalSetup.ts",

	use: {
		baseURL: "http://localhost:3000",
	},

	webServer: {
		command: process.env.CI
			? "npm run build && dotenv-cli -e .env.test -- npm run start"
			: "dotenv-cli -e .env.test -- npm run start",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},

	projects: [
		{
			name: "mobile-chromium",
			use: {
				...devices["Pixel 7"],
			},
		},
		{
			name: "mobile-webkit",
			use: {
				...devices["iPhone 14"],
			},
		},
		{
			name: "desktop-chromium",
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 1280, height: 720 },
			},
		},
		{
			name: "desktop-firefox",
			use: {
				...devices["Desktop Firefox"],
				viewport: { width: 1280, height: 720 },
			},
		},
		{
			name: "desktop-webkit",
			use: {
				...devices["Desktop Safari"],
				viewport: { width: 1280, height: 720 },
			},
		},
	],
});
