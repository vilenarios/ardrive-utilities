# ardrive-utilities
In cases where Drives were not properly accepted by the network, they could be resubmitted using the same ArFS metadata for the Drive Entity ID and Root Folder Entity ID.  ArDrive can then load the Drive properly, and show and files stored within it.

This is a simple ArDrive Drive Fixer script that can be used to fix broken drivs. The Drive Fixer Utility can perform GQL queries to search for broken drives and fix them by submitting the correct ArFS Drive and Root Folder transactions using the metadata taken from other files/folders that were uploaded to that drive.

## How to Build
Run 'yarn build' to build the project

## How to Run 
Run 'yarn start' to build and run the app

It will prompt you before submitting and transactions to Arweave.
## Background
When a user creates a drive, two ArFS transactions are submitted.

Drive Entity Transaction - contains the metadata about a drive and a pointer to the root folder entity id of the drive.

Root Folder Entity Transaction - contains the metadata about the root folder of a drive.
Background
When a user creates a drive, two ArFS transactions are submitted.

Drive Entity Transaction - contains the metadata about a drive and a pointer to the root folder entity id of the drive.

Root Folder Entity Transaction - contains the metadata about the root folder of a drive.

## Problem
Sometimes, these entities are not submitted properly due to network issues/congestion.  This can sometimes result in orphaned files and folders.  Consider the following.  

Joe logs into ArDrive for the first time, and creates a private drive and uploads a photo into it.  The Drive Transaction was accepted, but the Root Folder Entity transaction was not accepted on the Arweave network.  The photo he uploaded was also accepted by the network.  Joe closes ArDrive and logs in the next day.  ArDrive tries to load the private drive, but the root folder is missing. The photo Joe uploaded is now an orphan.

## Proposed Solution

### Fixing a Root Folder Transaction
If a Drive Entity was submitted with no Root Folder Entity, then it will fail to load in ArFS clients.

To fix this, the following steps should be performed:

Query for all Drives created by the user (using their public key), and take each Drive ID, Name and Root Folder ID (name and root folder ID are contained in the transaction data JSON)

Query for each Root Folder ID found for each Drive.

If a Root Folder ID was not found, create a new Folder Entity transaction, using the Name, Drive ID and Root Folder ID that was captured from the broken drive.

Prompt the user to "fix" the drive and submit the Root Folder Transaction.

Once mined, the Drive will now have a matching Root Folder.

### Fixing a Drive Transaction
If a Root Folder Entity was submitted without a Drive Entity, then it will fail to load in ArFS clients.

To fix this, the following steps should be performed:

Query for all Root Folders created by the user and get the Name, Folder ID and corresponding Drive ID.  A Root Folder is a regular Folder Entity but without a Parent-Folder-Id

Query for each Drive ID found with each Root Folder

If a Drive was not found for a given Root Folder, create a new Drive Entity transaction, using the same Root Folder Name, Folder ID and Drive ID.

Prompt the user to "Fix" the drive and submit the Drive Entity transaction.

Once mined, the Root Folder will now have a matching Drive.

### Fixing a Drive and Root Folder Transaction
For circumstances where both the Drive and Root Folder Transaction were not mined, additional querying must be done.

To fix this, the following steps should be performed:

Query for all files and folders created by the user and create an array of all unique Drive IDs found and unique Folder IDs.

Determine what the root folder ID is by checking what the "Parent-Folder-ID" is of any file stored at the root of a drive.

Create a new Drive Entity transaction, prompting the user to add a Drive Name, and use the found Folder ID, and Drive ID that were captured from the file query.

Create a new Folder Entity transaction, using the new Name, Drive ID and Root Folder ID that was captured from the file query.

Prompt the user to "Fix" the drive and submit both the Drive/Root Folder Entity transactions.

Once mined, the orphaned files should have a Drive and Root Folder.

## Private Drive Considerations
If a Private Drive needs fixing, it can still be encrypted with the information taken from existing files/folders.  However, this utility must also collect the Drive Password from the user in order to derive the Drive Keys.  The Drive Key can be derived from the Drive ID + Drive Password + User’s Wallet Signature.  This way, as long as the Drive ID is found from any content within the drive, the master Drive Key can be derived.


