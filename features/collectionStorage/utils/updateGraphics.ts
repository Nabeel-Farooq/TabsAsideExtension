import {
	CollectionItem,
	GraphicsItem,
	GraphicsStorage
} from "@/models/CollectionModels";

import { sendMessage } from "@/utils/messaging";

import { collectionStorage } from "./collectionStorage";

export default async function updateGraphics(
	collections: CollectionItem[],
	graphicsCache?: GraphicsStorage
): Promise<void>
{
	const localGraphics =
		await collectionStorage.graphics.getValue();

	const cache =
		graphicsCache ??
		await sendMessage("getGraphicsCache", undefined);

	const newGraphics: GraphicsStorage = {};

	const getGraphics = (
		url: string
	): GraphicsItem | null =>
	{
		const cached = cache[url];
		const local = localGraphics[url];

		const preview =
			cached?.preview ?? local?.preview;

		const capture =
			cached?.capture ?? local?.capture;

		const icon =
			cached?.icon ?? local?.icon;

		if (!preview && !icon)
		{
			return null;
		}

		return {
			...(preview && { preview }),
			...(capture && { capture }),
			...(icon && { icon })
		};
	};

	for (const collection of collections)
	{
		for (const item of collection.items)
		{
			const urls =
				item.type === "group"
					? item.items.map(tab => tab.url)
					: [item.url];

			for (const url of urls)
			{
				const graphics = getGraphics(url);

				if (graphics)
				{
					newGraphics[url] = graphics;
				}
			}
		}
	}

	await collectionStorage.graphics.setValue(
		newGraphics
	);
}
