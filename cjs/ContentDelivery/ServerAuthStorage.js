"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerAuthStorage = void 0;
/**
 * Authentication storage for usage during server side rendering,
 * for now it acts as a black-hole, refusing to store any form of
 * token.
 */
class ServerAuthStorage {
    constructor() {
        this.clearToken = () => true;
        this.storeToken = () => false;
        this.hasToken = () => false;
        this.getToken = () => null;
    }
}
exports.ServerAuthStorage = ServerAuthStorage;
exports.default = ServerAuthStorage;
//# sourceMappingURL=ServerAuthStorage.js.map