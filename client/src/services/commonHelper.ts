export class CommonHelper {
	static getRandomId(): string {
		const numberOfDigits = 9;
		const min = 16 ** (numberOfDigits - 1);
		const max = 16 ** numberOfDigits;
		return (Math.floor(Math.random() * (max - min + 1)) + min).toString(16);
	}
	static cmToPx(cm: number) {
		return cm * 37.7952755906;
	}
	static pxToCm(px: number) {
		return px * 0.0264583333;
	}
	static arrayMove(arr: any[], old_index: number, new_index: number) {
		if (new_index >= arr.length) {
			let k = new_index - arr.length + 1;
			while (k--) {
				arr.push(undefined);
			}
		}
		arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
	}
}
