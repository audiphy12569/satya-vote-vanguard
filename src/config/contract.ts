export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";
export const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || "";
export const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || "";
export const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || "";

// Import ABI from the new location
export const CONTRACT_ABI = (await import('../contracts/abi.json')).default as const;