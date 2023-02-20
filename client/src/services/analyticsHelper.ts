export enum EventCategory {
	SCORE = 'score',
	PAGE = 'page',
	PIANO = 'piano',
	NOTE = 'note',
	MEASURE = 'measure',
	PLAYER = 'player',
	PARTS = 'parts',
	NA = 'NA',
}

export class AnalyticsHelper {
	static sendEvent(category: EventCategory, action: string, label: string = '', value: number = 0) {
		// @ts-ignore
		gtag('event', action, {
			event_category: category,
			event_label: label,
			value,
		});
	}
}
