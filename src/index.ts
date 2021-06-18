// index.ts
import * as cli from "./prompts";
import * as wallet from "./wallet";
import * as gql from "./gql";
import * as common from "./common";
import { ArFSDriveEntity } from "./types/arfs_Types";

async function main() {

	// Get the wallet that owns the broken drives
	const localWallet = await cli.promptForLocalWalletPath();
	const cachedWallet = await wallet.getCachedWallet(localWallet);
	const owner = cachedWallet.walletPublicKey;
	const walletBalance = await wallet.getWalletBalance(owner);
	const walletPrivateKey = JSON.stringify(cachedWallet.walletPrivateKey);

	// Get the drive password for any private drives
	// This should only be called if private drives are found
	const drivePassword = await cli.promptForDrivePassword();

	console.log (walletBalance)
	console.log (walletPrivateKey)
	console.log (drivePassword)

	// Get all of the public drives for the user, starting at block 0
	let publicDrives : ArFSDriveEntity[] | string = await gql.getAllLatestPublicDriveEntities(owner, 0);
	if (typeof publicDrives === 'string') {
		console.log (publicDrives); // Error
	} else {
		await common.asyncForEach(publicDrives, async (publicDrive: ArFSDriveEntity) => {
			// Get the drive's root folder transaction

		})


	}

	// Do any of them have b
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
