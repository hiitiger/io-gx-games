export enum KeyState{
    RELEASED= 0,
    PRESSED = 1,
}


export class KeyInput {
    keyStates: Map<string, KeyState>
    keyMap: Map<string, Function>

    constructor() {
        this.keyStates = new Map<string, KeyState>();
        this.keyMap = new Map<string, Function>();
    }
    
    addMapping(code, callback) {
        this.keyMap.set(code, callback);
    }


    handleEvent(event: KeyboardEvent ) {
        const { code } = event;

        if (!this.keyMap.has(code)) {
            return;
        }

        event.preventDefault();

        const keyState = event.type === 'keydown' ? KeyState.PRESSED : KeyState.RELEASED;
        if  (this.keyStates.get(code) === keyState){
            return;
        }

        this.keyStates.set(code, keyState);

        this.keyMap.get(code)(keyState);
    }

    listenTo(window: Window){
        ['keydown', 'keyup'].forEach(e => {
            window.addEventListener(e, event=> {
                this.handleEvent(event as KeyboardEvent);
            });
        })
    }
}