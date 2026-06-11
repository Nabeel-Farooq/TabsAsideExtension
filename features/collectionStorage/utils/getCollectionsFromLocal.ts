import { CollectionItem } from "@/models/CollectionModels";
import { collectionStorage } from "./collectionStorage";

export default function getCollectionsFromLocal(): Promise<CollectionItem[]>
{
	return collectionStorage.localCollections.getValue();
}
