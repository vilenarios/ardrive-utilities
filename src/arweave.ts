import Arweave from "arweave";
import * as arfsTypes from './types/arfs_Types';
import * as transactions from './transactions'
import { Utf8ArrayToStr } from './common';
import { deriveFileKey, driveDecrypt, fileEncrypt } from './crypto';
import { JWKInterface } from "./types/arfs_Types";
import { getTransactionData } from "./gateway";
import { ArFSEncryptedData } from "./types/base_Types";

export const arweave = Arweave.init({
	host: "arweave.net", // Arweave Gateway
	//host: 'arweave.dev', // Arweave Dev Gateway
	port: 443,
	protocol: "https",
	timeout: 600000,
});

export async function createArFSRootFolder(
	walletPrivateKey: JWKInterface,
	rootFolder: arfsTypes.ArFSFileFolderEntity,
): Promise<boolean> {
	let secondaryFileMetaDataTags = {};
	try {

		// create secondary metadata specifically for a folder
		secondaryFileMetaDataTags = {
			name: rootFolder.name
		};

		// Convert to JSON string
		const secondaryFileMetaDataJSON = JSON.stringify(secondaryFileMetaDataTags);

		// Public file, do not encrypt
		let transaction = await transactions.createFileFolderMetaDataTransaction(rootFolder, secondaryFileMetaDataJSON, walletPrivateKey);

		// Create the File Uploader object
		const uploader = await transactions.createDataUploader(transaction);

        while (!uploader.isComplete) {
            await uploader.uploadChunk();
        }
        console.log ("SUCCESS! New public root folder created with txId: %s", transaction.id)
        console.log ("Please wait for it to be mined before trying to fix this drive again!")
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
};

// This will prepare and sign a private v2 data transaction using ArFS File Metadata Tags including privacy tags
export async function createArFSPrivateRootFolder(
	rootFolder: arfsTypes.ArFSPrivateFileFolderEntity,
	driveKey: Buffer, // the buffer must already be encrypted
	walletPrivateKey: JWKInterface
): Promise<boolean> {
	try {

		// create secondary metadata specifically for a folder
		let secondaryFileMetaDataTags = {
			name: rootFolder.name
		};

		// Convert to JSON string
		const secondaryFileMetaDataJSON = JSON.stringify(secondaryFileMetaDataTags);

        // Get the file key using the Drive Key for encryption
        const fileKey: Buffer = await deriveFileKey(rootFolder.entityId, driveKey);
		const encryptedData: ArFSEncryptedData = await fileEncrypt(
			fileKey,
			Buffer.from(secondaryFileMetaDataJSON)
		);

		// Create a private transaction
		let transaction = await transactions.createPrivateFileFolderMetaDataTransaction(
			rootFolder,
			encryptedData.data,
			walletPrivateKey
		);

		// Create the File Uploader object
		const uploader = await transactions.createDataUploader(transaction);

        // Upload the transaction
        while (!uploader.isComplete) {
            await uploader.uploadChunk();
        }
        console.log ("SUCCESS! New private root folder created with txId: %s", transaction.id)
        console.log ("Please wait for it to be mined before trying to fix this drive again!")
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
}

export async function getPrivateDriveJSONData(driveKey: Buffer, drive: arfsTypes.ArFSPrivateDriveEntity): Promise<{name: string, rootFolderId: string}> {
    try {
        // Download the File's Metadata using the metadata transaction ID
        const data = await getTransactionData(drive.txId);
        const dataBuffer = Buffer.from(data);

        // Since this is a private drive, we must decrypt the JSON data
        const decryptedDriveBuffer: Buffer = await driveDecrypt(drive.cipherIV, driveKey, dataBuffer);
        const decryptedDriveString: string = await Utf8ArrayToStr(decryptedDriveBuffer);
        const decryptedDriveJSON = await JSON.parse(decryptedDriveString);

        // Get the drive name and root folder id
        let name = decryptedDriveJSON.name;
        let rootFolderId = decryptedDriveJSON.rootFolderId;
        return {name, rootFolderId}
    } catch (err) {
        console.log (err)
        let name = 'error'
        let rootFolderId = 'error'
        return {name, rootFolderId}
    }
};
