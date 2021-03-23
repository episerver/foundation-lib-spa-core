import { ContentReference } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
export declare type IServerContextAccessor = new () => ServerContextAccessor;
/**
 * Simple accessor to quickly and conveniently access the context created by the
 * server side rendering.
 */
export declare class ServerContextAccessor {
    private _context?;
    constructor();
    get IsAvailable(): boolean;
    get IContent(): IContent | null;
    get Website(): Website | null;
    get StartPage(): IContent | null;
    get Path(): string | null;
    hasContext(): boolean;
    getIContent<T extends IContent = IContent>(ref: ContentReference): T | null;
}
export default ServerContextAccessor;
