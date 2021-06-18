// index.ts
import * as cli from "./prompts";
import * as wallet from "./wallet";
import * as gql from "./gql";
import * as common from "./common";
import { ArFSDriveEntity } from "./types/arfs_Types";
import { checkForBrokenRootFolder } from "./utilities";

async function main() {

	// Get the wallet that owns the broken drives
	//const localWallet = await cli.promptForLocalWalletPath();
	const localWallet = "C:\\stuff\\my_shared_demo_key2.json"
	const cachedWallet = await wallet.getCachedWallet(localWallet);
	const owner = cachedWallet.walletPublicKey;
	const walletBalance = await wallet.getWalletBalance(owner);
	// const walletPrivateKey = JSON.stringify(cachedWallet.walletPrivateKey);

	console.log ("Loaded Wallet: %s", owner)
	console.log ("Your balance is %s", walletBalance)

	// Get all of the public drives for the user, starting at block 0
	console.log ("Getting all your public drives and checking for broken root folders")
	let publicDrives : ArFSDriveEntity[] | string = await gql.getAllLatestPublicDriveEntities(owner, 0);

	if (typeof publicDrives === 'string') {
		console.log (publicDrives); // Error
	} else {
		await common.asyncForEach(publicDrives, async (publicDrive: ArFSDriveEntity) => {
			// Check the root folder for each drive
			console.log ("Drive Name: %s, Root Folder ID %s, Drive ID: %s", publicDrive.name, publicDrive.rootFolderId, publicDrive.driveId);
			const broken = await checkForBrokenRootFolder(owner, publicDrive.rootFolderId)
			if (broken) {
				const answer = await cli.promptForFix(publicDrive.name, "root folder", publicDrive.rootFolderId)
				if (answer) {
					console.log ("Fixing!")
				}
			}
		})
	}

	// Get the drive password for any private drives
	// const drivePassword = await cli.promptForDrivePassword();
}

function displayBanner() {
	console.log ("			The ArDrive Utility Suite Welcomes you!					")
	console.log ("__________________________________________________________________")
	console.log ("")
	console.log ("This utility will scan for broken drives and attempt to fix them")
	console.log ("...dont worry, no changes will be made without your approval!")
	console.log("");
}

displayBanner();
main();
