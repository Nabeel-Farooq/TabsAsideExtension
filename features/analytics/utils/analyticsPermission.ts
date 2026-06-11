import { Unwatch, WatchCallback } from "wxt/utils/storage";
import { analytics } from "./analytics";

const FIREFOX_ANALYTICS_PERMISSION = {
	data_collection: ["technicalAndInteraction"]
} as Browser.permissions.Permissions;

const allowAnalytics = storage.defineItem<boolean>(
	"local:analytics",
	{
		fallback: true
	}
);

async function hasFirefoxPermission(): Promise<boolean>
{
	return browser.permissions.contains(
		FIREFOX_ANALYTICS_PERMISSION
	);
}

const analyticsPermission: Pick<
	WxtStorageItem<boolean, Record<string, unknown>>,
	"getValue" | "setValue" | "watch"
> = {
	async getValue(): Promise<boolean>
	{
		const isGranted = import.meta.env.FIREFOX
			? await hasFirefoxPermission()
			: await allowAnalytics.getValue();

		analytics.setEnabled(isGranted);

		return isGranted;
	},

	async setValue(value: boolean): Promise<void>
	{
		if (!import.meta.env.FIREFOX)
		{
			await allowAnalytics.setValue(value);
			return;
		}

		const success = value
			? await browser.permissions.request(
				FIREFOX_ANALYTICS_PERMISSION
			)
			: await browser.permissions.remove(
				FIREFOX_ANALYTICS_PERMISSION
			);

		if (!success)
		{
			throw new Error(
				`Analytics permission ${
					value ? "request" : "removal"
				} failed`
			);
		}
	},

	watch(cb: WatchCallback<boolean>): Unwatch
	{
		if (!import.meta.env.FIREFOX)
		{
			return allowAnalytics.watch(cb);
		}

		let previousState: boolean | undefined;

		const listener = async (): Promise<void> =>
		{
			const currentState =
				await hasFirefoxPermission();

			if (currentState !== previousState)
			{
				cb(currentState, previousState);
				previousState = currentState;
			}
		};

		void listener();

		browser.permissions.onAdded.addListener(listener);
		browser.permissions.onRemoved.addListener(listener);

		return (): void =>
		{
			browser.permissions.onAdded.removeListener(
				listener
			);
			browser.permissions.onRemoved.removeListener(
				listener
			);
		};
	}
};

export default analyticsPermission;
