import React from 'react';
export type CmsCommunicatorProps = {
    /**
     * Override the script path for the communicator script
     *
     * @default episerver/cms/latest/
     */
    scriptPath?: string;
    /**
     * Override the script file for the communicator script
     *
     * @default clientresources/epi-cms/communicationinjector.js
     */
    scriptFile?: string;
};
export declare const CmsCommunicator: React.FunctionComponent<CmsCommunicatorProps>;
export default CmsCommunicator;
