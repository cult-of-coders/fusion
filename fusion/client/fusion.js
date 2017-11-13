import { engage, disengage } from './engager';

export default class Fusion {
    constructor() {
        this._keepers = [];
    }

    checkStatusAndUpdate() {
        if (this._keepers.length === 0) {
            engage();
        } else {
            disengage();
        }
    }

    engage(callback) {
        this._keepers.add(callback);
        this.checkStatusAndUpdate();

        callback();

        const self = this;
        return {
            stop() {
                self._keepers = self._keepers.filter(c => {
                    return c !== callback;
                });

                self.checkStatusAndUpdate();
            }
        };
    }
}

