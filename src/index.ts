// index.ts
import * as cli from "./prompts";
import * as wallet from "./wallet";
import * as gql from "./gql";
import * as common from "./common";
import { ArFSDriveEntity } from "./types/arfs_Types";
import * as utilities from "./utilities";

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

	// Get all of the public drives for the user, starting at block 0
	console.log ("Getting all your public drives and checking for broken root folders")
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
			console.log ("Drive Name: %s, Root Folder ID %s, Drive ID: %s", publicDrive.name, publicDrive.rootFolderId, publicDrive.driveId);
			const broken = await utilities.checkForBrokenRootFolder(owner, publicDrive.rootFolderId)
			if (broken) {
				const answer = await cli.promptForFix(publicDrive.name, "root folder", publicDrive.rootFolderId)
				if (answer) {
					console.log ("......fixing!")
					await utilities.fixBrokenPublicRootFolder(cachedWallet.walletPrivateKey, publicDrive);
				}
			} else {
				console.log ("......this root folder looks just fine!")
			}
		})
	}

	// Get the drive password for any private drives
	// const drivePassword = await cli.promptForDrivePassword();
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
