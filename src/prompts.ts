import promptSync from "prompt-sync";
import * as fs from 'fs';
const prompt = promptSync({ sigint: true });

import passwordPrompt from "prompts";

// Get path to local wallet and return that wallet public and private key
export async function promptForLocalWalletPath(): Promise<string> {
	console.log(
		"Please enter the path of your existing Arweave Wallet JSON file eg. C:\\Source\\ardrive_test_key.json"
	);
	const existingWalletPath: string = prompt("   Wallet Path: ");

	// This should be updated to check if valid .json file
	const validPath = checkFileExistsSync(existingWalletPath);
	if (validPath) {
		return existingWalletPath;
	} else {
		console.log("File path is invalid!");
		return promptForLocalWalletPath();
	}
}

// Gets the password for a private Drive
export async function promptForDrivePassword(): Promise<string> {
	// Collect the password twice to ensure it is valid
	const drivePasswordResponse = await passwordPrompt({
		type: "text",
		name: "password",
		style: "password",
		message: "  Please enter your Drive password:",
	});

	const checkDrivePasswordResponse = await passwordPrompt({
		type: "text",
		name: "password",
		style: "password",
		message: "  Please re-enter your Drive password: ",
	});

	// Lets check to ensure the passwords match
	if (
		drivePasswordResponse.password !== checkDrivePasswordResponse.password
	) {
		console.log("The passwords you have entered do not match!");
		return await promptForDrivePassword();
	} else {
		return drivePasswordResponse.password;
	}
}

// Asks the user to fix the broken entity
export async function promptForFix(
	name: string,
	type: string,
	entityId: string
): Promise<boolean> {
	console.log("Found an issue with %s", name);
	console.log(" - Type: %s", type);
	console.log(" - Id: %s", entityId);
	const answer: string = prompt(
		"Do you want to fix it? (default is Yes) Y/N "
	);
	if (answer === "Y") {
		return true;
	} else {
		return false;
	}
}

export function checkFileExistsSync(filePath: string): boolean {
	try {
		fs.accessSync(filePath, fs.constants.F_OK);
	} catch (e) {
		return false;
	}
	return true;
}