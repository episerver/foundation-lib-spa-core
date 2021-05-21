/**
 * Authentication storage for usage during server side rendering,
 * for now it acts as a black-hole, refusing to store any form of
 * token.
 */
export class ServerAuthStorage {
    constructor() {
        this.clearToken = () => true;
        this.storeToken = () => false;
        this.hasToken = () => false;
        this.getToken = () => null;
    }
}
export default ServerAuthStorage;
//# sourceMappingURL=ServerAuthStorage.js.map