import axios from 'axios';
import { PINATA_API_KEY, PINATA_SECRET_KEY } from '@/config/contract';

export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    // Ensure we're passing a valid File object
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file object');
    }
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        }
      }
    );

    if (response.status !== 200) {
      console.error('Pinata response:', response.data);
      throw new Error(`Failed to upload to IPFS. Status: ${response.status}`);
    }

    return `ipfs://${response.data.IpfsHash}`;
  } catch (error: any) {
    console.error('Error uploading to IPFS:', error.response?.data || error.message);
    throw new Error('Failed to upload file to IPFS');
  }
};