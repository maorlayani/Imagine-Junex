import { ChordModel, EntityKind } from './scoreModel';
import { CommonHelper } from '../services/commonHelper';

export class Chord implements ChordModel {
	kind: EntityKind = EntityKind.CHORD;

	constructor(
		public id: string,
		public measureId: string,
		public partId: string,
		public name: string,
		public isRest: boolean,
		public startDiv: number,
		public durationDivs: number,
	) {}

	static createFromModel(c: ChordModel) {
		return new Chord(c.id, c.measureId, c.partId, c.name, c.isRest, c.startDiv, c.durationDivs);
	}

	static resetIds(c: ChordModel, measureId: string, partId: string) {
		c.id = CommonHelper.getRandomId();
		c.measureId = measureId;
		c.partId = partId;
	}
}
