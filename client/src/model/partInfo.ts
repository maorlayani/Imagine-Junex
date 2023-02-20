import { EntityKind, PartInfoModel, PartType } from './scoreModel';
import { CommonHelper } from '../services/commonHelper';

export class PartInfo implements PartInfoModel {
	kind: EntityKind = EntityKind.PART_INFO;

	constructor(
		public id: string,
		public partType: PartType,
		public name: string,
		public isVisible: boolean,
		public fontSize: number,
		public isBold: boolean,
		public bgColor: string,
	) {}

	static createNew(partType: PartType, name: string, isVisible: boolean) {
		const id = CommonHelper.getRandomId();
		const fontSize = partType === PartType.TEXT ? 12 : 0;
		const isBold = false;
		const bgColor = partType === PartType.TEXT ? '#f6f6f6' : '#fff';
		return new PartInfo(id, partType, name, isVisible, fontSize, isBold, bgColor);
	}

	static createFromModel(pi: PartInfoModel) {
		return new PartInfo(pi.id, pi.partType, pi.name, pi.isVisible, pi.fontSize, pi.isBold, pi.bgColor);
	}
}
