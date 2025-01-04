import axios from 'axios';
import { PINATA_API_KEY, PINATA_SECRET_KEY } from '@/config/contract';

export const uploadToIPFS = async (file: File): Promise<string> => {
  const formData = new FormData();
  
  // Add the file with a specific field name that Pinata expects
  formData.append('file', file, file.name);

  const options = {
    maxBodyLength: Infinity,
    headers: {
      'Content-Type': `multipart/form-data; boundary=${(formData as any)._boundary}`,
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
    },
  };

  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      options
    );

    if (response.status !== 200) {
      throw new Error(`Failed to upload to IPFS. Status: ${response.status}`);
    }

    return `ipfs://${response.data.IpfsHash}`;
  } catch (error: any) {
    console.error('Error uploading to IPFS:', error.response?.data || error.message);
    throw new Error('Failed to upload file to IPFS');
  }
};