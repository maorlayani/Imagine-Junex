import { EntityKind, ScoreInfoModel } from './scoreModel';
import { AppDataHelper } from '../services/appDataHelper';

export class ScoreInfo implements ScoreInfoModel {
	kind: EntityKind = EntityKind.SCORE_INFO;

	constructor(public scoreTitle: string, public scoreCredits: string, public arrangerName: string, public softwareName: string, public softwareVersion: string) {}

	static createNew(scoreTitle: string, scoreCredits: string, arrangerName: string) {
		return new ScoreInfo(scoreTitle, scoreCredits, arrangerName, AppDataHelper.appName, AppDataHelper.appVersion);
	}

	static createFromModel(si: ScoreInfoModel) {
		return new ScoreInfo(si.scoreTitle, si.scoreCredits, si.arrangerName, si.softwareName, si.softwareVersion);
	}
}
