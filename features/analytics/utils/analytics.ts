import { createAnalytics } from "@wxt-dev/analytics";
import { googleAnalytics4 } from "@wxt-dev/analytics/providers/google-analytics-4";

const measurementId = import.meta.env.WXT_GA4_MEASUREMENT_ID;
const apiSecret = import.meta.env.WXT_GA4_API_SECRET;

if (!measurementId)
{
	throw new Error("Missing WXT_GA4_MEASUREMENT_ID environment variable.");
}

if (!apiSecret)
{
	throw new Error("Missing WXT_GA4_API_SECRET environment variable.");
}

export const analytics = createAnalytics({
	providers: [
		googleAnalytics4({
			measurementId,
			apiSecret
		})
	]
});
