import { MusicModel } from "../model/scoreModel";
import { NoteModel } from "../model/scoreModel";
import { PartModel } from "../model/scoreModel";
import { Music } from '../model/music'

export class KeyboardHelper {
    static handleArrowRight(
        music: MusicModel,
        measureIdx: number,
        part: PartModel,
        noteIdx: number,
        setSelection: ({ }: any) => void,
        numberOfMeasuresPerRow: number) {
        let newNote: NoteModel
        // is the next step inside the current part
        if (noteIdx + 1 <= part.notes.length - 1) {
            newNote = part.notes[noteIdx + 1]
            setSelection([{ partInfoId: part.partInfoId, measureId: newNote.measureId, partId: newNote.partId, noteId: newNote.id }])
        }
        // is the next step outside the current part
        else if (noteIdx + 1 > part.notes.length - 1) {
            const currentMeasure = music.measures[measureIdx]
            const nextMeasure = music.measures[measureIdx + 1]
            const prevMeasure = music.measures[measureIdx - 1]
            const partIdx = Music.findPartIdx(currentMeasure, part.id)
            // step between measures in the same line and in the same part line (same part index)
            if (partIdx < nextMeasure.parts.length - 1 && (measureIdx + 1) % numberOfMeasuresPerRow !== 0) {
                const newPart = nextMeasure.parts[partIdx]
                setSelection([{ partInfoId: newPart.partInfoId, measureId: newPart.measureId, partId: newPart.id, noteId: newPart.notes[0].id }])
            }
            // step between measures in the same line and in the DIFFERENT part line
            else if (partIdx < currentMeasure.parts.length - 1 && (measureIdx + 1) % numberOfMeasuresPerRow === 0) {
                const newPart = prevMeasure.parts[partIdx + 1]
                newNote = newPart.notes[0]
                setSelection([{ partInfoId: newPart.partInfoId, measureId: newNote.measureId, partId: newNote.partId, noteId: newNote.id }])
            }
            // step in last part line
            else if (partIdx === currentMeasure.parts.length - 1) {
                // step between measures in the DIFFERENT lines
                if ((measureIdx + 1) % numberOfMeasuresPerRow === 0) {
                    const newPart = nextMeasure.parts[0]
                    newNote = newPart.notes[0]
                    setSelection([{ partInfoId: newPart.partInfoId, measureId: newNote.measureId, partId: newNote.partId, noteId: newNote.id }])
                } else {
                    // step between measures in same line
                    const newPart = nextMeasure.parts[partIdx]
                    setSelection([{ partInfoId: newPart.partInfoId, measureId: newPart.measureId, partId: newPart.id, noteId: newPart.notes[0].id }])
                }
            }
        }
    }
    static handleArrowLeft(
        music: MusicModel,
        measureIdx: number,
        part: PartModel,
        noteIdx: number,
        setSelection: ({ }: any) => void,
        numberOfMeasuresPerRow: number) {
        let newNote: NoteModel
        // is the next step inside the current part
        if (noteIdx - 1 >= 0) {
            newNote = part.notes[noteIdx - 1]
            setSelection([{ partInfoId: part.partInfoId, measureId: newNote.measureId, partId: newNote.partId, noteId: newNote.id }])
        }
        // is the next step outside the current part
        else if (noteIdx - 1 < 0) {
            const currentMeasure = music.measures[measureIdx]
            const nextMeasure = music.measures[measureIdx + 1]
            const prevMeasure = music.measures[measureIdx - 1]
            const partIdx = Music.findPartIdx(currentMeasure, part.id)
            // step between measures in the same line and in the same part line (same part index)
            if ((measureIdx + 1) % numberOfMeasuresPerRow !== 0) {
                if (partIdx > 0) {
                    const newPart = nextMeasure.parts[partIdx - 1]
                    setSelection([{ partInfoId: newPart.partInfoId, measureId: newPart.measureId, partId: newPart.id, noteId: newPart.notes[newPart.notes.length - 1].id }])
                } else {
                    const newPart = prevMeasure.parts[prevMeasure.parts.length - 1]
                    setSelection([{ partInfoId: newPart.partInfoId, measureId: newPart.measureId, partId: newPart.id, noteId: newPart.notes[newPart.notes.length - 1].id }])
                }
            }
            // step between measures in the same line and in the DIFFERENT part line
            else if (partIdx < currentMeasure.parts.length - 1 && (measureIdx + 1) % numberOfMeasuresPerRow === 0) {
                const newPart = prevMeasure.parts[partIdx]
                newNote = newPart.notes[newPart.notes.length - 1]
                setSelection([{ partInfoId: newPart.partInfoId, measureId: newNote.measureId, partId: newNote.partId, noteId: newNote.id }])
            }
            // step in last part line
            else if (partIdx === currentMeasure.parts.length - 1) {
                // step between measures in the DIFFERENT lines
                if ((measureIdx + 1) % numberOfMeasuresPerRow !== 0) {
                    const newPart = nextMeasure.parts[partIdx - 1]
                    newNote = newPart.notes[newPart.notes.length - 1]
                    setSelection([{ partInfoId: newPart.partInfoId, measureId: newNote.measureId, partId: newNote.partId, noteId: newNote.id }])
                } else {
                    // step between measures in same line
                    const newPart = prevMeasure.parts[partIdx]
                    setSelection([{ partInfoId: newPart.partInfoId, measureId: newPart.measureId, partId: newPart.id, noteId: newPart.notes[newPart.notes.length - 1].id }])
                }
            }
        }
    }
    static handleArrowUp(
        music: MusicModel,
        measureIdx: number,
        part: PartModel,
        noteIdx: number,
        setSelection: ({ }: any) => void,
        numberOfMeasuresPerRow: number) {
        const currentMeasure = music.measures[measureIdx]
        const partIdx = Music.findPartIdx(currentMeasure, part.id)
        // is the next step outside the current part
        if (partIdx > 0) {
            const newPart = currentMeasure.parts[partIdx - 1]
            setSelection([{ partInfoId: newPart.partInfoId, measureId: newPart.measureId, partId: newPart.id, noteId: newPart.notes[noteIdx].id }])
            // is the next step outside the current measure
        } else {
            const newMeasure = music.measures[measureIdx - numberOfMeasuresPerRow]
            if (newMeasure) {
                const newNote = newMeasure.parts[newMeasure.parts.length - 1].notes[noteIdx]
                setSelection([{ partInfoId: newMeasure.parts[newMeasure.parts.length - 1].partInfoId, measureId: newNote.measureId, partId: newNote.partId, noteId: newNote.id }])
            }
        }
    }
    static handleArrowDown(
        music: MusicModel,
        measureIdx: number,
        part: PartModel,
        noteIdx: number,
        setSelection: ({ }: any) => void,
        numberOfMeasuresPerRow: number) {
        const currentMeasure = music.measures[measureIdx]
        const partIdx = Music.findPartIdx(currentMeasure, part.id)
        // is the next step outside the current part
        if (partIdx < currentMeasure.parts.length - 1) {
            const newPart = currentMeasure.parts[partIdx + 1]
            setSelection([{ partInfoId: newPart.partInfoId, measureId: newPart.measureId, partId: newPart.id, noteId: newPart.notes[noteIdx].id }])
            // is the next step outside the current measure
        } else {
            const newMeasure = music.measures[measureIdx + numberOfMeasuresPerRow]
            if (newMeasure) {
                const newNote = newMeasure.parts[0].notes[noteIdx]
                setSelection([{ partInfoId: newMeasure.parts[0].partInfoId, measureId: newNote.measureId, partId: newNote.partId, noteId: newNote.id }])
            }
            // go to the last note when there is no measure below your current position
            else if (numberOfMeasuresPerRow % 2 !== 0 && measureIdx < (music.measures.length - 1) / 2) {
                const lastMeasure = music.measures[music.measures.length - 1]
                const lastPart = lastMeasure.parts[lastMeasure.parts.length - 1]
                setSelection([{ partInfoId: lastPart.partInfoId, measureId: lastMeasure.id, partId: lastPart.id, noteId: lastPart.notes[lastPart.notes.length - 1].id }])
            }
        }
    }
    static handleKeyA() {

    }
}