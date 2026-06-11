import { collectionStorage } from "./collectionStorage";

export default function getChunkKeys(
	start = 0,
	end = collectionStorage.maxChunkCount
): string[]
{
	if (start < 0 || end < start)
	{
		throw new RangeError(
			`Invalid chunk range: start=${start}, end=${end}`
		);
	}

	const length = end - start;

	return Array.from(
		{ length },
		(_, index) => `c${start + index}`
	);
}
