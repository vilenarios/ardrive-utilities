import Arweave from "arweave";
import * as arfsTypes from './types/arfs_Types';
import * as transactions from './transactions'
import { JWKInterface } from "./types/arfs_Types";

export const arweave = Arweave.init({
	host: "arweave.net", // Arweave Gateway
	//host: 'arweave.dev', // Arweave Dev Gateway
	port: 443,
	protocol: "https",
	timeout: 600000,
});

export async function createArFSFolderTransaction(
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
        console.log ("Successfully uploaded new root folder with txId: %s", transaction.id)
        console.log ("Please wait for it to be mined before trying to fix this drive again!")
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
}