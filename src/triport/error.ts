export default class TriportError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TriportError';
    }
}