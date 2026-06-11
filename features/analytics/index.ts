import { analytics } from "./utils/analytics";
import analyticsPermission from "./utils/analyticsPermission";
import { getUserProperties, userId } from "./utils/getUserProperties";

export { analyticsPermission };

type AnalyticsProperties = Record<
	string,
	string | number | boolean | null | undefined
>;

async function executeAnalytics(
	action: () => Promise<void> | void,
	errorMessage: string
): Promise<void>
{
	try
	{
		if (!(await analyticsPermission.getValue()))
			return;

		await action();
	}
	catch (error)
	{
		console.error(errorMessage, error);
	}
}

export async function track(
	eventName: string,
	eventProperties?: AnalyticsProperties
): Promise<void>
{
	await executeAnalytics(
		() => analytics.track(eventName, eventProperties),
		"Failed to send analytics event"
	);
}

export async function trackError(
	eventName: string,
	error: Error
): Promise<void>
{
	await executeAnalytics(
		() =>
			analytics.track(eventName, {
				name: error.name,
				message: error.message,
				stack: error.stack?.slice(0, 5000) ?? "no_stack"
			}),
		"Failed to send error report"
	);
}

export async function trackPage(pageName: string): Promise<void>
{
	await executeAnalytics(async () =>
	{
		const id = await userId.getValue();

		if (!id)
			return;

		analytics.identify(id, await getUserProperties());
		analytics.page(pageName);
	}, "Failed to send page view");
}
