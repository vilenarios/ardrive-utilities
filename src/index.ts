// index.ts
import * as cli from "./prompts";
import * as wallet from "./wallet";
import * as gql from "./gql";
import * as common from "./common";
import { ArFSDriveEntity, ArFSPrivateDriveEntity } from "./types/arfs_Types";
import * as utilities from "./utilities";
import { getPrivateDriveJSONData } from "./arweave";
import { deriveDriveKey } from "./crypto";

async function main() {

	// Get the wallet that owns the broken drives
	const localWallet = await cli.promptForLocalWalletPath();

	const cachedWallet = await wallet.getCachedWallet(localWallet);
	const owner = cachedWallet.walletPublicKey;
	const walletBalance = await wallet.getWalletBalance(owner);

	console.log ("Loaded Wallet: %s", owner)
	console.log ("Your balance is %s AR", walletBalance)

	if (walletBalance <= 0.000001) {
		console.log ("Not enough AR to operate.  Please deposit at least 0.000001 AR to continue.")
		return false;
	}

	console.log ("")
	console.log ("Getting all your Public drives and checking for broken root folders")

	// Get all of the public drives for the user, starting at block 0
	let publicDrives : ArFSDriveEntity[] | string = await gql.getAllLatestPublicDriveEntities(owner, 0);

	if (typeof publicDrives === 'string') {
		console.log (publicDrives); // Error
	} else {
		await common.asyncForEach(publicDrives, async (publicDrive: ArFSDriveEntity) => {
			// Check if the drive has a correct root folder id
			if (publicDrive.rootFolderId === undefined) {
				console.log ("The drive %s with ID %s is missing a root folder!", publicDrive.name, publicDrive.driveId);
				console.log ("......This cannot be fixed... yet!")
				return;
			}
			console.log ("Public Drive Name: %s, Root Folder ID %s, Drive ID: %s", publicDrive.name, publicDrive.rootFolderId, publicDrive.driveId);
			const broken = await utilities.checkForBrokenRootFolder(owner, publicDrive.rootFolderId)
			if (broken) {
				const answer = await cli.promptForFix(publicDrive.name, "root folder", publicDrive.rootFolderId)
				if (answer) {
					console.log ("......fixing!")
					await utilities.fixBrokenPublicRootFolder(cachedWallet.walletPrivateKey, publicDrive);
				}
			} else {
				console.log ("      ......this root folder looks just fine!")
			}
		})
	}


	console.log ("")
	console.log ("Getting all your Private drives and checking for broken root folders")

	// Get all of the public drives for the user, starting at block 0
	let privateDrives : ArFSPrivateDriveEntity[] | string = await gql.getAllLatestPrivateDriveEntities(owner, 0);
	if (typeof privateDrives === 'string') {
		console.log (privateDrives); // Error
	} else {

		// Get the drive password for any private drives
		console.log ("Private drives found!")
		const drivePassword = await cli.promptForDrivePassword();

		await common.asyncForEach(privateDrives, async (privateDrive: ArFSPrivateDriveEntity) => {
			// Derive the drive key using the drive ID and the wallet private key
			const driveKey: Buffer = await deriveDriveKey(drivePassword, privateDrive.driveId, JSON.stringify(cachedWallet.walletPrivateKey));

			// Get the JSON file for this private drive and try to decrypt it
			// This will fail if the drive password is incorrect, or if the original encryption was done incorrectly
			const dataJSON = await getPrivateDriveJSONData(driveKey, privateDrive);
			privateDrive.name = dataJSON.name;
			privateDrive.rootFolderId = dataJSON.rootFolderId;

			if (dataJSON.name === 'error') {
				console.log ("The drive password you have entered does not work for Drive ID: %s", privateDrive.driveId)
				console.log (".......This cannot be fixed!");
				return;
			}

			// Check if the drive has a correct root folder id
			if (privateDrive.rootFolderId === undefined) {
				console.log ("The drive %s with ID %s is has a root folder with a missing Folder-ID!", privateDrive.name, privateDrive.driveId);
				console.log ("......This cannot be fixed... yet!")
				return;
			}

			console.log ("Private Drive Name: %s, Root Folder ID %s, Drive ID: %s", privateDrive.name, privateDrive.rootFolderId, privateDrive.driveId);
			const broken = await utilities.checkForBrokenPrivateRootFolder(owner, privateDrive.rootFolderId)

			if (broken) {
				const answer = await cli.promptForFix(privateDrive.name, "root folder", privateDrive.rootFolderId)
				if (answer) {
					console.log ("......fixing!")
					await utilities.fixBrokenPrivateRootFolder(cachedWallet.walletPrivateKey, privateDrive, driveKey);
				}
			} else {
				console.log ("      ......this root folder looks just fine!")
			}
			return;
		})
	}
	return true;
}

function displayBanner() {
	console.log ("		The ArDrive Utility Suite Welcomes you!						")
	console.log ("__________________________________________________________________")
	console.log ("")
	console.log ("This utility will scan for broken drives and attempt to fix them")
	console.log ("...dont worry, no changes will be made without your approval!")
	console.log("");
}

displayBanner();
main();
