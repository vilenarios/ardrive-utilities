import * as fs from "fs";
import { JWKInterface } from "arweave/node/lib/wallet";
import { arweave } from "./arweave";

// Gets a public key for a given JWK
export async function getAddressForWallet(
	walletPrivateKey: JWKInterface
): Promise<string> {
	return arweave.wallets.jwkToAddress(walletPrivateKey);
}

// Imports an existing wallet as a JWK from a user's local harddrive
export async function getCachedWallet(
	existingWalletPath: string
): Promise<{ walletPrivateKey: JWKInterface; walletPublicKey: string }> {
	const walletPrivateKey: JWKInterface = JSON.parse(
		fs.readFileSync(existingWalletPath).toString()
	);
	const walletPublicKey = await getAddressForWallet(walletPrivateKey);
	return { walletPrivateKey, walletPublicKey };
}

// Get the balance of an Arweave wallet
export async function getWalletBalance(
	walletPublicKey: string
): Promise<number> {
	try {
		let balance = await arweave.wallets.getBalance(walletPublicKey);
		balance = arweave.ar.winstonToAr(balance);
		return +balance;
	} catch (err) {
		console.log(err);
		return 0;
	}
}
