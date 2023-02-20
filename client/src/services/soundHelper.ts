import * as Tone from 'tone';
import { PolySynth } from 'tone';

export class SoundHelper {
	static synth: PolySynth = new Tone.PolySynth().toDestination();
	static start() {
		Tone.start().then(() => {});
	}
	static playShortNote(noteFullName: string) {
		SoundHelper.synth.triggerAttackRelease(noteFullName, 0.1);
	}
	static startNote(noteFullName: string) {
		SoundHelper.synth.triggerAttack(noteFullName);
	}
	static stopNote(noteFullName: string) {
		SoundHelper.synth.triggerRelease(noteFullName);
	}
	static playMusic(notesForPlayer: any[], tempoBpm: number) {
		let durationSecs: number = 0;
		let startTimeSecs: number = 0;
		const q = 60 / 24 / tempoBpm;
		const time = Tone.now();
		notesForPlayer.forEach((n) => {
			durationSecs = q * n.durationDivs;
			startTimeSecs = q * n.divsFromFirstMeasureMusicStart;
			SoundHelper.synth.triggerAttackRelease(n.fullName, durationSecs, time + startTimeSecs);
		});
		return startTimeSecs + durationSecs;
	}
	static stopMusic() {
		const time = Tone.now();
		SoundHelper.synth.releaseAll(time);
	}
}
