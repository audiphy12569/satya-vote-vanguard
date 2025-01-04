import axios from 'axios';

export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    // Ensure we're passing a valid File object
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file object');
    }
    
    const formData = new FormData();
    formData.append('file', file);

    const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
    const pinataSecretKey = import.meta.env.VITE_PINATA_SECRET_KEY;

    if (!pinataApiKey || !pinataSecretKey) {
      throw new Error('Pinata API credentials are not configured');
    }

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretKey,
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