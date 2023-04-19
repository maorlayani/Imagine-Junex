export enum EntityKind {
	SCORE = 'SCORE',
	SCORE_INFO = 'SCORE_INFO',
	SCORE_SETTINGS = 'SCORE_SETTINGS',
	MUSIC = 'MUSIC',
	PART_INFO = 'PART_INFO',
	MEASURE = 'MEASURE',
	PART = 'PART',
	NOTE = 'NOTE',
	CHORD = 'CHORD',
	NA = 'NA',
}
export interface ScoreInfoModel {
	kind: EntityKind; //"SCORE_INFO"
	scoreTitle: string; //e.g. "Bohemian Rhapsody"
	scoreCredits: string; //e.g. "Queen - A Night at the Opera - 1975"
	arrangerName: string; //e.g. "Uri Kalish"
	softwareName: string; //e.g. "Figurenotes Composer"
	softwareVersion: string; //e.g. "1.0.0"
}
export interface ScoreSettingsModel {
	kind: EntityKind; //"SCORE_SETTINGS"
	musicWidth: number; //e.g. 718
	rowGap: number; //e.g. 36
	quarterSize: number; //e.g. 36
	measureNumbers: boolean; //e.g. true
}
export interface NoteModel {
	kind: EntityKind; //"NOTE"
	id: string; //internal ID
	measureId: string; //internal ID
	partId: string; //internal ID
	fullName: string; //e.g. "F#4"
	isRest: boolean; //e.g. false
	startDiv: number; //e.g. 0
	durationDivs: number; //e.g. 24
	isTiedToNext: boolean; //e.g. false
	isTiedToPrev: boolean; //e.g. false
	isBoomwhacker: boolean; // a boomwhacker note has a slightly different display
}
export interface ChordModel {
	kind: EntityKind; //"CHORD"
	id: string; //internal ID
	measureId: string; //internal ID
	partId: string; //internal ID
	name: string; //e.g. "Am"
	isRest: boolean; //e.g. false
	startDiv: number; //e.g. 0
	durationDivs: number; //e.g. 96
}
export enum PartType {
	TEXT = 'TEXT',
	FN_LVL_1 = 'FN_LVL_1',
	FN_CHORDS = 'FN_CHORDS',
	RHYTHM = 'RHYTHM',
	NA = 'NA',
}
export interface PartModel {
	kind: EntityKind; //"PART"
	id: string; //internal ID
	partInfoId: string; //internal ID
	measureId: string; //internal ID
	partType: PartType; //e.g. FN_LVL_1
	text: string;
	notes: NoteModel[];
	chords: ChordModel[];
}
export interface MeasureModel {
	kind: EntityKind; //"MEASURE"
	id: string; //internal ID
	number: number; //e.g. 1
	isPickup: boolean; //e.g. false
	timeSignature: string; //e.g. "4/4"
	durationDivs: number; //e.g. 96
	tempoBpm: number; //e.g. 120
	scaleRoot: string; //e.g. "C"
	scaleMode: string; //e.g. "Ionian"
	useSharps: boolean;
	parts: PartModel[];
}
export interface PartInfoModel {
	kind: EntityKind; //"PART_INFO"
	id: string; //internal ID
	partType: PartType; //e.g. FN_LVL_1
	name: string; //e.g. "Melody"
	isVisible: boolean; //e.g. true
	fontSize: number; //e.g. 12
	isBold: boolean; //e.g. false;
	bgColor: string; //e.g. "#f6f6f6"
}
export interface MusicModel {
	kind: EntityKind; //"MUSIC"
	partsInfo: PartInfoModel[];
	measures: MeasureModel[];
}
export interface ScoreModel {
	kind: EntityKind; //"SCORE"
	id: string; //internal ID
	timestamp: number; //timestamp in ms
	scoreInfo: ScoreInfoModel;
	scoreSettings: ScoreSettingsModel;
	music: MusicModel;
}
