import { db } from "./client";
import { streamingServicesTable } from "./schema";

const streamingServicesSeed = [
	{ name: "U-NEXT", slug: "unext" },
	{ name: "Netflix", slug: "netflix" },
	{ name: "Hulu", slug: "hulu" },
	{ name: "Disney+", slug: "disney-plus" },
	{ name: "Prime Video", slug: "prime-video" },
];

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
