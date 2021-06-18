import { ArFSFileFolderEntity } from "./types/arfs_Types";
import * as gql from "./gql";
import * as gateway from "./gateway";
import * as common from "./common";

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
            console.log ("Broken root folder found with ID: %s", rootFolderId)
            return true;
        } else {
            // Download the File's Metadata using the metadata transaction ID
            const data = await gateway.getTransactionData(rootFolder.txId);
            const dataString = await common.Utf8ArrayToStr(data);
            const dataJSON = await JSON.parse(dataString);

            // Get the drive name and root folder id
            rootFolder.name = dataJSON.name;
            rootFolder.lastModifiedDate = dataJSON.lastModifiedDate;

            console.log ("......this root folder looks just fine!")
            return false;
        }
    }
}
