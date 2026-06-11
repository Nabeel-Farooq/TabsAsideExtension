import { sendMessage } from "@/utils/messaging";

import { collectionStorage } from "./collectionStorage";
import saveCollectionsToCloud from "./saveCollectionsToCloud";

export default async function setCloudStorage(
	enable: boolean
): Promise<void>
{
	await collectionStorage.disableCloud.setValue(
		!enable
	);

	if (enable)
	{
		const [collections, lastUpdated] =
			await Promise.all([
				collectionStorage.localCollections.getValue(),
				collectionStorage.localLastUpdated.getValue()
			]);

		await saveCollectionsToCloud(
			collections,
			lastUpdated
		);

		return;
	}

	await saveCollectionsToCloud([], 0);

	await sendMessage(
		"refreshCollections",
		undefined
	);
}
