import { collectionStorage } from "./collectionStorage";

export default function clearGraphicsStorage(): Promise<void>
{
	return collectionStorage.graphics.removeValue();
}
