/**
 * Network Configuration
 * 
 * Configure your IOTA networks and package IDs here
 */

import { getFullnodeUrl } from "@iota/iota-sdk/client"
import { createNetworkConfig } from "@iota/dapp-kit"


// Package IDs - Update these after deployment
export const DEVNET_PACKAGE_ID = "0x5fb580a4361248a85d9048ec0702b563a12af290958857c3e39eaabac4bbb5e2"
export const TESTNET_PACKAGE_ID = "0x5fb580a4361248a85d9048ec0702b563a12af290958857c3e39eaabac4bbb5e2"
export const MAINNET_PACKAGE_ID = ""

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
  devnet: {
    url: getFullnodeUrl('devnet'),
    variables: {
      packageId: DEVNET_PACKAGE_ID,
    },
  },
  testnet: {
    url: getFullnodeUrl('testnet'),
    variables: {
      packageId: TESTNET_PACKAGE_ID,
    },
  },
  mainnet: {
    url: getFullnodeUrl('mainnet'),
    variables: {
      packageId: MAINNET_PACKAGE_ID,
    },
  },
})

export { useNetworkVariable, useNetworkVariables, networkConfig }
