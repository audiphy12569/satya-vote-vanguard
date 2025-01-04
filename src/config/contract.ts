export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";
export const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || "";
export const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || "";
export const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || "";

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // ... paste the full ABI here
];
