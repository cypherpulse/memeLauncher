#!/bin/bash

# Load environment variables
source .env

# Deploy BaseMemeLauncher to Base mainnet
forge script script/DeployMemeLauncher.s.sol \
  --rpc-url $BASE_RPC_URL \
  --account defaultKey \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY