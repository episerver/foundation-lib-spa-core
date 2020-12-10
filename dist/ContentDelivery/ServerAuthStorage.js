/**
 * Authentication storage for usage during server side rendering,
 * for now it acts as a black-hole, refusing to store any form of
 * token.
 */
export class ServerAuthStorage {
    clearToken() {
        return true;
    }
    storeToken(token) {
        return false;
    }
    hasToken() {
        return false;
    }
    getToken() {
        return null;
    }
}
export default ServerAuthStorage;
