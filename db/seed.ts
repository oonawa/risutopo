import { db } from "./client";
import { streamingServicesTable } from "./schema";
import { SUPPORTED_SERVICES } from "@/app/consts";

const streamingServicesSeed = Object.values(SUPPORTED_SERVICES).map(
	({ name, slug }) => ({
		name,
		slug,
	}),
);

export const seedStreamingServices = async () => {
	await db.transaction(async (tx) => {
		await tx
			.insert(streamingServicesTable)
			.values(streamingServicesSeed)
			.onConflictDoNothing();
	});
};

seedStreamingServices()
	.then(() => {
		console.log("✅ streaming_services_table seed finished");
	})
	.catch((err) => {
		console.error("❌ seed failed", err);
		process.exit(1);
	});
