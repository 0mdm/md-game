
export class Keymap {
    keys: {[index: string]: (x: number, y: number) => void} = {};

    static scan(txt: string) {
        const txtArr: string[] = txt.split("\n");
        const yMax = txtArr.length;
        const height = yMax * 16;
        
    }

    run(txt: string) {
        const txtArr: string[] = txt.split("\n");  
        const yMax = txtArr.length;

        for(let y = 0; y != yMax; y++) {
            let x = 0;
            // It starts from the top to the bottom
            const actualY = yMax-y;

            // Horizontal slice
            const hSlice = txtArr[y];
            for(const char of hSlice) {
                x++;
                this.keys[char]?.(x, y);
            }
        }
    }

    key(char: string, f: (x: number, y: number) => void) {
        this.keys[char] = f;
    }
}