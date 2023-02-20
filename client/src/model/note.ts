import { EntityKind, NoteModel } from './scoreModel';
import { CommonHelper } from '../services/commonHelper';
import { MusicalHelper } from '../services/musicalHelper';

export class Note implements NoteModel {
	kind: EntityKind = EntityKind.NOTE;

	constructor(
		public id: string,
		public measureId: string,
		public partId: string,
		public fullName: string,
		public isRest: boolean,
		public startDiv: number,
		public durationDivs: number,
		public isTiedToNext: boolean,
		public isTiedToPrev: boolean,
	) {}

	static createFromModel(n: NoteModel) {
		return new Note(n.id, n.measureId, n.partId, n.fullName, n.isRest, n.startDiv, n.durationDivs, n.isTiedToNext, n.isTiedToPrev);
	}

	static toggleAlter(n: NoteModel, useSharps: boolean) {
		const noteDetails = MusicalHelper.parseNote(n.fullName);
		if (!noteDetails.alter) {
			return;
		}
		if ((noteDetails.alter === '#' && useSharps) || (noteDetails.alter === 'b' && !useSharps)) {
			return;
		}
		n.fullName = MusicalHelper.toggleSharpAndFlat(n.fullName);
	}

	static resetIds(n: NoteModel, measureId: string, partId: string) {
		n.id = CommonHelper.getRandomId();
		n.measureId = measureId;
		n.partId = partId;
	}
}
