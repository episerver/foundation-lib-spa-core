import EpiComponent from './EpiComponent';
import IContent from './Models/IContent';
export declare enum PageType {
    Home = "home",
    Product = "product",
    Category = "category",
    Basket = "basket",
    Other = "other"
}
export default abstract class Page<P extends IContent, S = {}> extends EpiComponent<P, S> {
    /**
     * The page type of the current page being rendered
     */
    protected pageType: PageType;
    /**
     * Make sure page tracking is done when a page is being rendered
     *
     * This method cannot be overridden in sub-classes, use the pageDidMount method, that
     * is invoked by this class as direct replacement.
     */
    readonly componentDidMount: () => void;
    /**
     * This method creates the tracking data as send to the the Episerver tracking service
     */
    protected readonly buildTrackingData: () => any;
    /**
     * Retrieve the path of the current page
     */
    protected readonly getPagePath: () => string;
    /**
     * Build an action URL
     */
    protected readonly buildActionPath: (action: string) => string;
    /**
     * Lifecycle call, implement this method instead of the React standard
     * componentDidMount.
     */
    protected pageDidMount?(): void;
    /**
     * Lifecycle call, invoked just before the page will be tracked. It should
     * return the tracking data for the page. If nothing is returned, the page
     * will not be tracked.
     *
     * @param   data    The initial data for tracking
     */
    protected pageWillTrack?(data: any): any;
}
