import { trackError } from "@/features/analytics";
import { CollectionItem } from "@/models/CollectionModels";
import getLogger from "@/utils/getLogger";

import { collectionStorage } from "./collectionStorage";
import getCollectionsFromCloud from "./getCollectionsFromCloud";
import getCollectionsFromLocal from "./getCollectionsFromLocal";
import saveCollectionsToLocal from "./saveCollectionsToLocal";

const logger = getLogger("getCollections");

export type CloudStorageIssueType =
	| "parse_error"
	| "merge_conflict";

export default async function getCollections(): Promise<
	[CollectionItem[], CloudStorageIssueType | null]
>
{
	const cloudDisabled =
		await collectionStorage.disableCloud.getValue();

	if (cloudDisabled)
	{
		return [await getCollectionsFromLocal(), null];
	}

	const [lastUpdatedLocal, lastUpdatedSync] =
		await Promise.all([
			collectionStorage.localLastUpdated.getValue(),
			collectionStorage.syncLastUpdated.getValue()
		]);

	if (lastUpdatedLocal === lastUpdatedSync)
	{
		return [await getCollectionsFromLocal(), null];
	}

	if (lastUpdatedLocal > lastUpdatedSync)
	{
		return [await getCollectionsFromLocal(), "merge_conflict"];
	}

	try
	{
		const collections =
			await getCollectionsFromCloud();

		await saveCollectionsToLocal(
			collections,
			lastUpdatedSync
		);

		return [collections, null];
	}
	catch (error)
	{
		logger("Failed to get cloud storage");
		console.error(error);

		if (error instanceof Error)
		{
			void trackError(
				"cloud_get_error",
				error
			);
		}

		return [
			await getCollectionsFromLocal(),
			"parse_error"
		];
	}
}
