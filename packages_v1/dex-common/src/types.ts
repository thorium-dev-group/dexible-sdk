import { APIClient } from './services/APIClient';
import { ethers } from 'ethers';
import { MarketingProps } from './MarketingUtils';

export type APIExtensionProps = {
    apiClient: APIClient;
    chainId: number;
    gnosisSafe?: string;
    marketing: MarketingProps;
    provider: ethers.providers.Provider;
    signer?: ethers.Signer;
};

export type Tag = {
    name: string;
    value: string;
};
