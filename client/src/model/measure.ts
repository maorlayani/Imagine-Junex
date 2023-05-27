import { EntityKind, MeasureModel, MusicModel, NoteModel, PartModel } from './scoreModel';
import { CommonHelper } from '../services/commonHelper';
import { MusicalHelper } from '../services/musicalHelper';
import { PartInfo } from './partInfo';
import { Part } from './part';

export class Measure implements MeasureModel {
	kind: EntityKind = EntityKind.MEASURE;

	constructor(
		public id: string,
		public number: number,
		public isPickup: boolean,
		public timeSignature: string,
		public durationDivs: number,
		public tempoBpm: number,
		public scaleRoot: string,
		public scaleMode: string,
		public useSharps: boolean,
		public parts: Part[],
	) {}

	static createNew(
		isPickupMeasure: boolean,
		measureNumber: number,
		partsInfo: PartInfo[],
		timeSignature: string,
		tempoBpm: number,
		scaleRoot: string,
		scaleMode: string,
		useSharps: boolean,
	) {
		const id = CommonHelper.getRandomId();
		const durationDivs = MusicalHelper.parseTimeSignature(timeSignature).measureDurationDivs;
		const parts: Part[] = [];
		partsInfo.forEach((pi) => {
			const part = Part.createNew(id, pi, timeSignature);
			parts.push(part);
		});
		return new Measure(id, measureNumber, isPickupMeasure, timeSignature, durationDivs, tempoBpm, scaleRoot, scaleMode, useSharps, parts);
	}

	static createFromModel(m: MeasureModel) {
		const parts: Part[] = [];
		let scaleRoot;
		let scaleMode;
		// @ts-ignore
		const oldScale = m.musicalScale;
		if (oldScale) {
			if (oldScale[oldScale.length - 1] === 'm') {
				scaleRoot = oldScale.length === 2 ? oldScale[0] : oldScale[0] + oldScale[1];
				scaleMode = 'Aeolian';
			} else {
				scaleRoot = oldScale;
				scaleMode = 'Ionian';
			}
		} else {
			scaleRoot = m.scaleRoot || 'C';
			scaleMode = m.scaleMode || 'Ionian';
		}
		const useSharps: boolean = m.useSharps ?? MusicalHelper.isScaleUsesSharps(scaleRoot, scaleMode);
		m.parts.forEach((p) => {
			const part = Part.createFromModel(p);
			parts.push(part);
		});
		return new Measure(m.id, m.number, m.isPickup, m.timeSignature, m.durationDivs, m.tempoBpm, scaleRoot, scaleMode, useSharps, parts);
	}

	static findPart(m: MeasureModel, partId: string): PartModel | null {
		return m.parts.find((p) => p.id === partId) || null;
	}

	static findPartByPartInfoId(m: MeasureModel, partInfoId: string): PartModel | null {
		return m.parts.find((p) => p.partInfoId === partInfoId) || null;
	}

	static findNote(m: MeasureModel, noteId: string): NoteModel | null {
		let result: NoteModel | null = null;
		m.parts.forEach((p) => {
			if (!result) {
				result = Part.findNote(p, noteId);
			}
		});
		return result;
	}

	static canChangeNoteDuration(m: MeasureModel, partId: string, noteId: string, newDurationDivs: number, isLastMeasure: boolean): boolean {
		const p = Measure.findPart(m, partId);
		if (!p) {
			return false;
		}
		return Part.canChangeNoteDuration(p, noteId, newDurationDivs, m.durationDivs, isLastMeasure);
	}

	static toggleSharps(m: MeasureModel) {
		m.useSharps = !m.useSharps;
		m.parts.forEach((p) => {
			Part.toggleNotesAlter(p, m.useSharps);
		});
	}

	static movePart(m: MeasureModel, partInfoId: string, isUp: boolean) {
		const partIndex = m.parts.findIndex((p) => p.partInfoId === partInfoId);
		if (partIndex === -1) {
			return;
		}
		CommonHelper.arrayMove(m.parts, partIndex, partIndex + (isUp ? -1 : 1));
	}

	static addPart(m: MeasureModel, partInfo: PartInfo) {
		const p = Part.createNew(m.id, partInfo, m.timeSignature);
		m.parts.push(p);
	}

	static deletePart(m: MeasureModel, partInfoId: string) {
		const partInfoIndex = m.parts.findIndex((pi) => pi.id === partInfoId);
		if (partInfoIndex === -1) {
			return;
		}
		m.parts.splice(partInfoIndex, 1);
	}

	static resetIds(m: MeasureModel) {
		m.id = CommonHelper.getRandomId();
		m.parts.forEach((p) => {
			Part.resetIds(p, m.id);
		});
	}
}
