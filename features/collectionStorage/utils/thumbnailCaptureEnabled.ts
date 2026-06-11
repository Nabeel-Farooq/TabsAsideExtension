import { Unwatch, WatchCallback } from "wxt/utils/storage";

const THUMBNAIL_PERMISSIONS: Browser.permissions.Permissions = {
	permissions: ["scripting"],
	origins: ["<all_urls>"]
};

async function hasPermission(): Promise<boolean>
{
	return browser.permissions.contains(
		THUMBNAIL_PERMISSIONS
	);
}

const thumbnailCaptureEnabled: Pick<
	WxtStorageItem<boolean, Record<string, unknown>>,
	"getValue" | "watch" | "setValue"
> = {
	getValue(): Promise<boolean>
	{
		return hasPermission();
	},

	watch(cb: WatchCallback<boolean>): Unwatch
	{
		let previousState: boolean | undefined;

		const listener = async (): Promise<void> =>
		{
			const currentState =
				await hasPermission();

			if (currentState !== previousState)
			{
				cb(currentState, previousState);
				previousState = currentState;
			}
		};

		void listener();

		browser.permissions.onAdded.addListener(
			listener
		);
		browser.permissions.onRemoved.addListener(
			listener
		);

		return (): void =>
		{
			browser.permissions.onAdded.removeListener(
				listener
			);
			browser.permissions.onRemoved.removeListener(
				listener
			);
		};
	},

	async setValue(value: boolean): Promise<void>
	{
		const success = value
			? await browser.permissions.request(
				THUMBNAIL_PERMISSIONS
			)
			: await browser.permissions.remove(
				THUMBNAIL_PERMISSIONS
			);

		if (!success)
		{
			throw new Error(
				`Thumbnail permission ${
					value ? "request" : "removal"
				} failed`
			);
		}

		if (
			!value &&
			import.meta.env.DEV
		)
		{
			await browser.permissions.request({
				origins: ["http://localhost/*"]
			});
		}
	}
};

export default thumbnailCaptureEnabled;
