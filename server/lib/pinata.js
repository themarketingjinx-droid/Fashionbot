import PinataSDK from '@pinata/sdk';
import fs from 'fs';

let _client = null;

function getClient() {
  if (!_client) {
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_API_SECRET) {
      throw new Error('PINATA_API_KEY and PINATA_API_SECRET must be set in .env');
    }
    _client = new PinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
  }
  return _client;
}

/**
 * Pin a local file to IPFS via Pinata.
 * Returns the IPFS CID (content identifier).
 */
export async function pinFile(filePath, name) {
  const client = getClient();
  const stream = fs.createReadStream(filePath);
  const result = await client.pinFileToIPFS(stream, {
    pinataMetadata: { name },
    pinataOptions: { cidVersion: 1 },
  });
  return result.IpfsHash; // CID
}

/**
 * Pin a JSON object to IPFS via Pinata (for NFT metadata).
 */
export async function pinJSON(json, name) {
  const client = getClient();
  const result = await client.pinJSONToIPFS(json, {
    pinataMetadata: { name },
    pinataOptions: { cidVersion: 1 },
  });
  return result.IpfsHash;
}

/**
 * Build a public IPFS gateway URL from a CID.
 */
export function gatewayUrl(cid) {
  const gateway = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud';
  return `${gateway}/ipfs/${cid}`;
}

/**
 * Check whether Pinata credentials are configured.
 */
export function isPinataConfigured() {
  return !!(process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET);
}
