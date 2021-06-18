import { ArFSDriveEntity, ArFSFileFolderEntity, JWKInterface } from "./types/arfs_Types";
import * as gql from "./gql";
import * as gateway from "./gateway";
import * as common from "./common";
import { createArFSFolderTransaction } from "./arweave";

// Checks if a root folder is properly mined on Arweave
// Returns true if it is broken and needs to be recreated
// Returns false if GQL and the data can be retrieved
export async function checkForBrokenRootFolder(owner: string, rootFolderId: string): Promise<boolean> {
    const rootFolder: ArFSFileFolderEntity | string = await gql.getPublicFolderEntity(owner, rootFolderId)
    if (typeof rootFolder === 'string') {
        console.log (rootFolder)
        return false;
    } else {
        if (rootFolder.unixTime === 0) {
            return true;
        } else {
            // Download the File's Metadata using the metadata transaction ID
            const data = await gateway.getTransactionData(rootFolder.txId);
            const dataString = await common.Utf8ArrayToStr(data);
            const dataJSON = await JSON.parse(dataString);

            // Get the drive name and root folder id
            rootFolder.name = dataJSON.name;
            rootFolder.lastModifiedDate = dataJSON.lastModifiedDate;
            return false;
        }
    }
}

// Fixes a drives root folder by creating a new one using the drive's arfs metadata
export async function fixBrokenPublicRootFolder(walletPrivateKey: JWKInterface, publicDrive: ArFSDriveEntity) {
    const newRootFolder: ArFSFileFolderEntity = {
        appName: publicDrive.appName,
        appVersion: publicDrive.appVersion,
        arFS: publicDrive.arFS,
        contentType: "application/json",
        driveId: publicDrive.driveId,
        entityType: "folder",
        name: publicDrive.name, 
        parentFolderId: "0",
        entityId: publicDrive.rootFolderId,
        lastModifiedDate: publicDrive.unixTime,
        unixTime: publicDrive.unixTime,
        txId: "",
        syncStatus: 2 // Set to 2 for sync in progress
    };
    await createArFSFolderTransaction(walletPrivateKey, newRootFolder)
}
