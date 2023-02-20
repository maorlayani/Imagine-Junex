import { EntityKind, MeasureModel, MusicModel, NoteModel, PartModel, PartType } from './scoreModel';
import { CommonHelper } from '../services/commonHelper';
import { MusicalHelper } from '../services/musicalHelper';
import { PartInfo } from './partInfo';
import { Measure } from './measure';

export class Music implements MusicModel {
	kind: EntityKind = EntityKind.MUSIC;

	constructor(public partsInfo: PartInfo[], public measures: Measure[]) {}

	static createNew(timeSignature: string, tempoBpm: number, hasPickupMeasure: boolean, numberOfMeasures: number, scaleRoot: string, scaleMode: string) {
		const partsInfo: PartInfo[] = [PartInfo.createNew(PartType.FN_LVL_1, 'Melody', true)];
		const useSharps: boolean = MusicalHelper.isScaleUsesSharps(scaleRoot, scaleMode);
		const measures: Measure[] = [];
		if (hasPickupMeasure) {
			const pickupMeasure = Measure.createNew(true, 0, partsInfo, timeSignature, tempoBpm, scaleRoot, scaleMode, useSharps);
			measures.push(pickupMeasure);
		}
		for (let i = 1; i <= numberOfMeasures; i++) {
			const measure = Measure.createNew(false, i, partsInfo, timeSignature, tempoBpm, scaleRoot, scaleMode, useSharps);
			measures.push(measure);
		}
		return new Music(partsInfo, measures);
	}

	static createFromModel(u: MusicModel) {
		const partsInfo: PartInfo[] = [];
		u.partsInfo.forEach((pi) => {
			const partInfo = PartInfo.createFromModel(pi);
			partsInfo.push(partInfo);
		});
		const measures: Measure[] = [];
		u.measures.forEach((m) => {
			const measure = Measure.createFromModel(m);
			measures.push(measure);
		});
		return new Music(partsInfo, measures);
	}

	static findPartInfo(u: MusicModel, partInfoId: string): PartInfo | null {
		return u.partsInfo.find((pi) => pi.id === partInfoId) || null;
	}

	static isPartVisible(u: MusicModel, partInfoId: string) {
		const pi = Music.findPartInfo(u, partInfoId);
		return pi && pi.isVisible;
	}

	static findMeasure(u: MusicModel, measureId: string): MeasureModel | null {
		return u.measures.find((m) => m.id === measureId) || null;
	}

	static findPart(u: MusicModel, partId: string): PartModel | null {
		let result: PartModel | null = null;
		u.measures.forEach((m) => {
			if (!result) {
				result = Measure.findPart(m, partId);
			}
		});
		return result;
	}

	static findNote(u: MusicModel, noteId: string): NoteModel | null {
		let result: NoteModel | null = null;
		u.measures.forEach((m) => {
			if (!result) {
				result = Measure.findNote(m, noteId);
			}
		});
		return result;
	}

	static doesPartHasSharpsOrFlats(u: MusicModel, partInfoId: string) {
		let found = false;
		let m;
		for (let i = 0; i < u.measures.length && !found; i++) {
			m = u.measures[i];
			const part = Measure.findPartByPartInfoId(m, partInfoId);
			if (part) {
				found = part.notes.some((n) => MusicalHelper.parseNote(n.fullName).alter !== '');
			}
		}
		return found;
	}

	static movePart(u: MusicModel, partInfoId: string, isUp: boolean) {
		const partInfoIndex = u.partsInfo.findIndex((pi) => pi.id === partInfoId);
		if (partInfoIndex === -1) {
			return;
		}
		CommonHelper.arrayMove(u.partsInfo, partInfoIndex, partInfoIndex + (isUp ? -1 : 1));
		u.measures.forEach((m) => {
			Measure.movePart(m, partInfoId, isUp);
		});
	}

	static addPart(u: MusicModel, partType: PartType, partName: string, isVisible: boolean) {
		const pi = PartInfo.createNew(partType, partName, isVisible);
		u.partsInfo.push(pi);
		u.measures.forEach((m) => {
			Measure.addPart(m, pi);
		});
	}

	static deletePart(u: MusicModel, partInfoId: string) {
		const partInfoIndex = u.partsInfo.findIndex((pi) => pi.id === partInfoId);
		if (partInfoIndex === -1) {
			return;
		}
		u.partsInfo.splice(partInfoIndex, 1);
		u.measures.forEach((m) => {
			Measure.deletePart(m, partInfoId);
		});
	}

	static renumberAllMeasures(u: MusicModel) {
		let num = u.measures.length > 0 && u.measures[0].isPickup ? 0 : 1;
		u.measures.forEach((m) => {
			m.number = num;
			num++;
		});
	}

	static addMeasure(u: MusicModel, curMeasureId: string) {
		const curMeasureIndex = u.measures.findIndex((m) => m.id === curMeasureId);
		if (curMeasureIndex === -1) {
			return;
		}
		const curMeasure = u.measures[curMeasureIndex];
		const m = Measure.createNew(
			false,
			curMeasure.number + 1,
			u.partsInfo,
			curMeasure.timeSignature,
			curMeasure.tempoBpm,
			curMeasure.scaleRoot,
			curMeasure.scaleMode,
			curMeasure.useSharps,
		);
		u.measures.splice(curMeasureIndex + 1, 0, m);
		Music.renumberAllMeasures(u);
	}

	// static duplicateMeasure(u: MusicModel, curMeasureId: string) {
	// 	const curMeasureIndex = u.measures.findIndex((m) => m.id === curMeasureId);
	// 	if (curMeasureIndex === -1) {
	// 		return;
	// 	}
	// 	const curMeasure = u.measures[curMeasureIndex];
	// 	const m = Measure.createFromModel(curMeasure);
	// 	Measure.resetIds(m);
	// 	u.measures.splice(curMeasureIndex + 1, 0, m);
	// 	Music.renumberAllMeasures(u);
	// }

	static pasteMeasure(u: MusicModel, srcMeasureId: string, trgMeasureId: string) {
		const srcMeasureIndex = u.measures.findIndex((m) => m.id === srcMeasureId);
		const trgMeasureIndex = u.measures.findIndex((m) => m.id === trgMeasureId);
		if (srcMeasureIndex === -1 || trgMeasureIndex === -1) {
			return;
		}
		const srcMeasure = u.measures[srcMeasureIndex];
		const trgMeasure = u.measures[trgMeasureIndex];
		const m = Measure.createFromModel(srcMeasure);
		m.isPickup = trgMeasure.isPickup;
		Measure.resetIds(m);
		u.measures[trgMeasureIndex] = m;
		Music.renumberAllMeasures(u);
	}

	static deleteMeasure(u: MusicModel, measureId: string) {
		const measureIndex = u.measures.findIndex((m) => m.id === measureId);
		if (measureIndex === -1) {
			return;
		}
		u.measures.splice(measureIndex, 1);
		Music.renumberAllMeasures(u);
	}

	static getExampleMeasure(u: MusicModel) {
		return u.measures[0].isPickup && u.measures.length > 1 ? u.measures[1] : u.measures[0];
	}

	static getNotesForPlayer(u: MusicModel, startMeasureId: string, stopMeasureId: string | null): any[] {
		if (u.measures.length === 0) {
			return [];
		}
		const notes: any[] = [];
		let ok = !startMeasureId;
		let measureStartTime = 0;
		u.measures.forEach((m) => {
			ok = ok || m.id === startMeasureId;
			if (ok) {
				m.parts.forEach((p) => {
					if (p.partType === PartType.FN_LVL_1 && Music.isPartVisible(u, p.partInfoId)) {
						p.notes.forEach((n) => {
							if (!n.isRest) {
								notes.push({
									fullName: n.fullName,
									durationDivs: n.durationDivs,
									divsFromFirstMeasureMusicStart: measureStartTime + n.startDiv,
								});
							}
						});
					}
				});
				measureStartTime += m.durationDivs;
			}
			if (stopMeasureId === startMeasureId) {
				ok = false;
			}
		});
		return notes;
	}
}
