import { EntityKind, ScoreSettingsModel } from './scoreModel';

export class ScoreSettings implements ScoreSettingsModel {
	kind: EntityKind = EntityKind.SCORE_SETTINGS;

	constructor(public musicWidth: number, public rowGap: number, public quarterSize: number, public measureNumbers: boolean) {}

	static ranges = {
		musicWidth: { min: 400, max: 718, default: 718 },
		rowGap: { min: 16, max: 160, default: 36 },
		quarterSize: { min: 20, max: 86, default: 75 },
	};

	static createNew() {
		return new ScoreSettings(ScoreSettings.ranges.musicWidth.default, ScoreSettings.ranges.rowGap.default, ScoreSettings.ranges.quarterSize.default, true);
	}

	static createFromModel(ss: ScoreSettingsModel) {
		return new ScoreSettings(
			ss.musicWidth || ScoreSettings.ranges.musicWidth.default,
			ss.rowGap || ScoreSettings.ranges.rowGap.default,
			ss.quarterSize || ScoreSettings.ranges.quarterSize.default,
			ss.measureNumbers === undefined ? true : ss.measureNumbers,
		);
	}
}
