import { cloudDisabled, collectionCount } from "@/features/collectionStorage";
import { settings } from "@/utils/settings";

const BYTES_PER_100KB = 102_400;

export async function getUserProperties(): Promise<UserProperties>
{
	const [isCloudDisabled, collections] = await Promise.all([
		cloudDisabled.getValue(),
		collectionCount.getValue()
	]);

	const properties: UserProperties = {
		cloud_used: "-1",
		collection_count: String(collections)
	};

	if (!isCloudDisabled)
	{
		const bytesUsed =
			await browser.storage.sync.getBytesInUse();

		properties.cloud_used = String(
			bytesUsed / BYTES_PER_100KB
		);
	}

	const settingEntries = await Promise.all(
		(Object.entries(settings) as [
			keyof typeof settings,
			(typeof settings)[keyof typeof settings]
		][]).map(async ([key, setting]) => [
			key,
			await setting.getValue()
		])
	);

	for (const [key, value] of settingEntries)
	{
		properties[`option_${String(key)}`] =
			String(value);
	}

	return properties;
}

export const userId = storage.defineItem<string>(
	"local:userId",
	{
		init: () => crypto.randomUUID()
	}
);

export type UserProperties = {
	collection_count: string;
	cloud_used: string;
	[key: `option_${string}`]: string;
};
