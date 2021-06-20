import * as arfsTypes from "./types/arfs_Types";
import * as gqlTypes from "./types/gql_Types";
import * as common from "./common";

export const gatewayURL = 'https://arweave.net/';

export const appName = 'ArDrive-Desktop';
export const webAppName = 'ArDrive-Web';
export const appVersion = '0.1.0';
export const arFSVersion = '0.11';

import Arweave from "arweave";
import { getTransactionData } from "./gateway";

const arweave = Arweave.init({
	host: "arweave.net", // Arweave Gateway
	//host: 'arweave.dev', // Arweave Dev Gateway
	port: 443,
	protocol: "https",
	timeout: 600000,
});

// Our primary GQL url
const graphQLURL = gatewayURL.concat("graphql");
export const primaryGraphQLURL = "https://arweave.net/graphql";
export const backupGraphQLURL = "https://arweave.dev/graphql";

// Gets the latest version of a drive entity
export async function getPublicDriveEntity(
	driveId: string
): Promise<arfsTypes.ArFSDriveEntity | string> {
	const graphQLURL = primaryGraphQLURL;
	const drive: arfsTypes.ArFSDriveEntity = {
		appName: "",
		appVersion: "",
		arFS: "",
		contentType: "",
		driveId,
		drivePrivacy: "",
		entityType: "drive",
		name: "",
		rootFolderId: "",
		txId: "",
		unixTime: 0,
		syncStatus: 0,
	};
	try {
		// GraphQL Query
		const query = {
			query: `query {
      transactions(
        first: 1
        sort: HEIGHT_ASC
        tags: [
          { name: "Drive-Id", values: "${driveId}" }
          { name: "Entity-Type", values: "drive" }
		  { name: "Drive-Privacy", values: "public" }]) 
        ]
      ) {
        edges {
          node {
            id
            tags {
              name
              value
            }
          }
        }
      }
    }`,
		};
		const response = await arweave.api.post(graphQLURL, query);
		const { data } = response.data;
		const { transactions } = data;
		const { edges } = transactions;
		edges.forEach((edge: gqlTypes.GQLEdgeInterface) => {
			// Iterate through each tag and pull out each drive ID as well the drives privacy status
			const { node } = edge;
			const { tags } = node;
			tags.forEach((tag: gqlTypes.GQLTagInterface) => {
				const key = tag.name;
				const { value } = tag;
				switch (key) {
					case "App-Name":
						drive.appName = value;
						break;
					case "App-Version":
						drive.appVersion = value;
						break;
					case "ArFS":
						drive.arFS = value;
						break;
					case "Content-Type":
						drive.contentType = value;
						break;
					case "Drive-Id":
						drive.driveId = value;
						break;
					case "Drive-Privacy":
						drive.drivePrivacy = value;
						break;
					case "Unix-Time":
						drive.unixTime = +value;
						break;
					default:
						break;
				}
			});

			// Get the drives transaction ID
			drive.txId = node.id;
		});
		return drive;
	} catch (err) {
		console.log(err);
		console.log("CORE GQL ERROR: Cannot get Shared Public Drive");
		return "CORE GQL ERROR: Cannot get Shared Public Drive";
	}
}

// Gets the latest version of a drive entity
export async function getPrivateDriveEntity(
	driveId: string
): Promise<arfsTypes.ArFSPrivateDriveEntity | string> {
	const graphQLURL = primaryGraphQLURL;
	const drive: arfsTypes.ArFSPrivateDriveEntity = {
		appName: "",
		appVersion: "",
		arFS: "",
		cipher: "",
		cipherIV: "",
		contentType: "",
		driveId,
		drivePrivacy: "",
		driveAuthMode: "",
		entityType: "",
		name: "",
		rootFolderId: "",
		txId: "",
		unixTime: 0,
		syncStatus: 0,
	};
	try {
		// GraphQL Query
		const query = {
			query: `query {
      transactions(
        first: 1
        sort: HEIGHT_ASC
        tags: [
          { name: "Drive-Id", values: "${driveId}" }
          { name: "Entity-Type", values: "drive" }
		  { name: "Drive-Privacy", values: "private" }]) 
        ]
      ) {
        edges {
          node {
            id
            tags {
              name
              value
            }
          }
        }
      }
    }`,
		};
		const response = await arweave.api.post(graphQLURL, query);
		const { data } = response.data;
		const { transactions } = data;
		const { edges } = transactions;
		edges.forEach((edge: gqlTypes.GQLEdgeInterface) => {
			// Iterate through each tag and pull out each drive ID as well the drives privacy status
			const { node } = edge;
			const { tags } = node;
			tags.forEach((tag: gqlTypes.GQLTagInterface) => {
				const key = tag.name;
				const { value } = tag;
				switch (key) {
					case "App-Name":
						drive.appName = value;
						break;
					case "App-Version":
						drive.appVersion = value;
						break;
					case "ArFS":
						drive.arFS = value;
						break;
					case "Cipher":
						drive.cipher = value;
						break;
					case "Cipher-IV":
						drive.cipherIV = value;
						break;
					case "Content-Type":
						drive.contentType = value;
						break;
					case "Drive-Auth-Mode":
						drive.driveAuthMode = value;
						break;
					case "Drive-Id":
						drive.driveId = value;
						break;
					case "Drive-Privacy":
						drive.drivePrivacy = value;
						break;
					case "Unix-Time":
						drive.unixTime = +value;
						break;
					default:
						break;
				}
			});

			// Get the drives transaction ID
			drive.txId = node.id;
		});
		return drive;
	} catch (err) {
		console.log(err);
		console.log("CORE GQL ERROR: Cannot get Public Drive");
		return "CORE GQL ERROR: Cannot get Public Drive";
	}
}

// Gets the latest version of a folder entity
export async function getPublicFolderEntity(
	owner: string,
	entityId: string
): Promise<arfsTypes.ArFSFileFolderEntity | string> {
	const graphQLURL = primaryGraphQLURL;
	const folder: arfsTypes.ArFSFileFolderEntity = {
		appName: "",
		appVersion: "",
		arFS: "",
		contentType: "",
		driveId: "",
		entityType: "folder",
		entityId: "",
		name: "",
		parentFolderId: "",
		txId: "",
		unixTime: 0,
		syncStatus: 0,
		lastModifiedDate: 0,
	};
	try {
		const query = {
			query: `query {
      transactions(
        first: 1
        sort: HEIGHT_ASC
		owners: ["${owner}"]
        tags: { name: "Folder-Id", values: "${entityId}"}
      ) {
        edges {
          node {
            id
            tags {
              name
              value
            }
          }
        }
      }
    }`,
		};
		const response = await arweave.api.post(graphQLURL, query);
		const { data } = response.data;
		const { transactions } = data;
		const { edges } = transactions;
		edges.forEach((edge: gqlTypes.GQLEdgeInterface) => {
			const { node } = edge;
			const { tags } = node;
			folder.txId = node.id;
			// Enumerate through each tag to pull the data
			tags.forEach((tag: gqlTypes.GQLTagInterface) => {
				const key = tag.name;
				const { value } = tag;
				switch (key) {
					case "App-Name":
						folder.appName = value;
						break;
					case "App-Version":
						folder.appVersion = value;
						break;
					case "ArFS":
						folder.arFS = value;
						break;
					case "Content-Type":
						folder.contentType = value;
						break;
					case "Drive-Id":
						folder.driveId = value;
						break;
					case "Entity-Type":
						folder.entityType = value;
						break;
					case "Folder-Id":
						folder.entityId = value;
						break;
					case "Parent-Folder-Id":
						folder.parentFolderId = value;
						break;
					case "Unix-Time":
						folder.unixTime = +value; // Convert to number
						break;
					default:
						break;
				}
			});
		});
		return folder;
	} catch (err) {
		console.log(err);
		console.log("CORE GQL ERROR: Cannot get public folder entity");
		return "CORE GQL ERROR: Cannot get public folder entity";
	}
}

// Gets the latest version of a folder entity
export async function getPrivateFolderEntity(
	owner: string,
	entityId: string
): Promise<arfsTypes.ArFSPrivateFileFolderEntity | string> {
	const graphQLURL = primaryGraphQLURL;
	const folder: arfsTypes.ArFSPrivateFileFolderEntity = {
		appName: "",
		appVersion: "",
		arFS: "",
		cipher: "",
		cipherIV: "",
		contentType: "",
		driveId: "",
		entityType: "folder",
		entityId: "",
		name: "",
		parentFolderId: "",
		txId: "",
		unixTime: 0,
		syncStatus: 0,
		lastModifiedDate: 0,
	};
	try {
		const query = {
			query: `query {
      transactions(
        first: 1
        sort: HEIGHT_ASC
		owners: ["${owner}"]
        tags: { name: "Folder-Id", values: "${entityId}"}
      ) {
        edges {
          node {
            id
            tags {
              name
              value
            }
          }
        }
      }
    }`,
		};
		const response = await arweave.api.post(graphQLURL, query);
		const { data } = response.data;
		const { transactions } = data;
		const { edges } = transactions;
		edges.forEach((edge: gqlTypes.GQLEdgeInterface) => {
			const { node } = edge;
			const { tags } = node;
			folder.txId = node.id;
			// Enumerate through each tag to pull the data
			tags.forEach((tag: gqlTypes.GQLTagInterface) => {
				const key = tag.name;
				const { value } = tag;
				switch (key) {
					case "App-Name":
						folder.appName = value;
						break;
					case "App-Version":
						folder.appVersion = value;
						break;
					case "ArFS":
						folder.arFS = value;
						break;
					case "Cipher":
						folder.cipher = value;
						break;
					case "Cipher-IV":
						folder.cipherIV = value;
						break;
					case "Content-Type":
						folder.contentType = value;
						break;
					case "Drive-Id":
						folder.driveId = value;
						break;
					case "Entity-Type":
						folder.entityType = value;
						break;
					case "Folder-Id":
						folder.entityId = value;
						break;
					case "Parent-Folder-Id":
						folder.parentFolderId = value;
						break;
					case "Unix-Time":
						folder.unixTime = +value; // Convert to number
						break;
					default:
						break;
				}
			});
		});
		return folder;
	} catch (err) {
		console.log(err);
		console.log("CORE GQL ERROR: Cannot get private folder entity");
		return "CORE GQL ERROR: Cannot get private folder entity";
	}
}

// Gets all of the drive entities for a users wallet
export async function getAllPublicDriveEntities(
	owner: string,
	lastBlockHeight: number
): Promise<arfsTypes.ArFSDriveEntity[] | string> {
	const graphQLURL = primaryGraphQLURL;
	const allDrives: arfsTypes.ArFSDriveEntity[] = [];
	try {
		// Search last 5 blocks minimum
		if (lastBlockHeight > 5) {
			lastBlockHeight -= 5;
		}

		// Create the Graphql Query to search for all drives relating to the User wallet
		const query = {
			query: `query {
      			transactions(
				block: {min: ${lastBlockHeight}}
				first: 100
				owners: ["${owner}"]
				tags: [
					{ name: "Entity-Type", values: "drive" }
					{ name: "Drive-Privacy", values: "public" }]) 
				{
					edges {
						node {
							id
							tags {
								name
								value
							}
						}
					}
      			}
    		}`,
		};

		// Call the Arweave Graphql Endpoint
		const response = await arweave.api.post(graphQLURL, query);
		const { data } = response.data;
		const { transactions } = data;
		const { edges } = transactions;

		// Iterate through each returned transaction and pull out the drive IDs
		edges.forEach((edge: gqlTypes.GQLEdgeInterface) => {
			const { node } = edge;
			const { tags } = node;
			const drive: arfsTypes.ArFSDriveEntity = {
				appName: "",
				appVersion: "",
				arFS: "",
				contentType: "application/json",
				driveId: "",
				drivePrivacy: "public",
				entityType: "drive",
				name: "",
				rootFolderId: "",
				txId: "",
				unixTime: 0,
				syncStatus: 0,
			};
			// Iterate through each tag and pull out each drive ID as well the drives privacy status
			tags.forEach((tag: gqlTypes.GQLTagInterface) => {
				const key = tag.name;
				const { value } = tag;
				switch (key) {
					case "App-Name":
						drive.appName = value;
						break;
					case "App-Version":
						drive.appVersion = value;
						break;
					case "ArFS":
						drive.arFS = value;
						break;
					case "Content-Type":
						drive.contentType = value;
						break;
					case "Drive-Id":
						drive.driveId = value;
						break;
					case "Drive-Privacy":
						drive.drivePrivacy = value;
						break;
					case "Unix-Time":
						drive.unixTime = +value;
						break;
					default:
						break;
				}
			});

			// Capture the TX of the public drive metadata tx
			drive.txId = node.id;
			allDrives.push(drive);
		});
		return allDrives;
	} catch (err) {
		console.log(err);
		console.log("CORE GQL ERROR: Cannot get folder entity");
		return "CORE GQL ERROR: Cannot get drive ids";
	}
}

// Gets all of the drive entities for a users wallet
export async function getAllLatestPublicDriveEntities(
	owner: string,
	lastBlockHeight: number
): Promise<arfsTypes.ArFSDriveEntity[] | string> {
	const graphQLURL = primaryGraphQLURL;
	const allDrives: arfsTypes.ArFSDriveEntity[] = [];
	try {
		// Search last 5 blocks minimum
		if (lastBlockHeight > 5) {
			lastBlockHeight -= 5;
		}

		// Create the Graphql Query to search for all drives relating to the User wallet (newest first)
		const query = {
			query: `query {
      			transactions(
				block: {min: ${lastBlockHeight}}
				first: 100
				owners: ["${owner}"]
				tags: [
					{ name: "Entity-Type", values: "drive" }
					{ name: "Drive-Privacy", values: "public" }]) 
				{
					edges {
						node {
							id
							tags {
								name
								value
							}
						}
					}
      			}
    		}`,
		};

		// Call the Arweave Graphql Endpoint
		const response = await arweave.api.post(graphQLURL, query);
		const { data } = response.data;
		const { transactions } = data;
		const { edges } = transactions;

		// Iterate through each returned transaction and pull out the drive IDs
		await common.asyncForEach(edges, async (edge: gqlTypes.GQLEdgeInterface) => {
			const { node } = edge;
			const { tags } = node;
			const drive: arfsTypes.ArFSDriveEntity = {
				appName: "",
				appVersion: "",
				arFS: "",
				contentType: "application/json",
				driveId: "",
				drivePrivacy: "public",
				entityType: "drive",
				name: "",
				rootFolderId: "",
				txId: "",
				unixTime: 0,
				syncStatus: 0,
			};
			// Iterate through each tag and pull out each drive ID as well the drives privacy status
			tags.forEach((tag: gqlTypes.GQLTagInterface) => {
				const key = tag.name;
				const { value } = tag;
				switch (key) {
					case "App-Name":
						drive.appName = value;
						break;
					case "App-Version":
						drive.appVersion = value;
						break;
					case "ArFS":
						drive.arFS = value;
						break;
					case "Content-Type":
						drive.contentType = value;
						break;
					case "Drive-Id":
						drive.driveId = value;
						break;
					case "Drive-Privacy":
						drive.drivePrivacy = value;
						break;
					case "Unix-Time":
						drive.unixTime = +value;
						break;
					default:
						break;
				}
			});

			// Capture the TX of the public drive metadata tx
			drive.txId = node.id;

            // Download the File's Metadata using the metadata transaction ID
			const data = await getTransactionData(drive.txId);
			const dataString = await common.Utf8ArrayToStr(data);
			const dataJSON = await JSON.parse(dataString);

			// Get the drive name and root folder id
			drive.name = dataJSON.name;
			drive.rootFolderId = dataJSON.rootFolderId;

            // Add to the array only if it doesnt exist
            if (allDrives.some(existing => existing.driveId === drive.driveId)) {
                // This drive already exists in the array so we do not add another version of it
            } else {
                // This drive does not exist, so we add it
                allDrives.push(drive);
            }
		});
        
		return allDrives;
	} catch (err) {
		console.log(err);
		console.log("CORE GQL ERROR: Cannot get folder entity");
		return "CORE GQL ERROR: Cannot get drive ids";
	}
}

// Gets all of the private drive entities for a users wallet
export async function getAllLatestPrivateDriveEntities(
	owner: string,
	lastBlockHeight: number
): Promise<arfsTypes.ArFSPrivateDriveEntity[] | string> {
	const graphQLURL = primaryGraphQLURL;
	const allDrives: arfsTypes.ArFSPrivateDriveEntity[] = [];
	try {
		// Search last 5 blocks minimum
		if (lastBlockHeight > 5) {
			lastBlockHeight -= 5;
		}

		// Create the Graphql Query to search for all drives relating to the User wallet
		const query = {
			query: `query {
      			transactions(
				block: {min: ${lastBlockHeight}}
				first: 100
				owners: ["${owner}"]
				tags: [
					{ name: "Entity-Type", values: "drive" }
					{ name: "Drive-Privacy", values: "private" }]) 
				{
					edges {
						node {
							id
							tags {
								name
								value
							}
						}
					}
      			}
    		}`,
		};

		// Call the Arweave Graphql Endpoint
		const response = await arweave.api.post(graphQLURL, query);
		const { data } = response.data;
		const { transactions } = data;
		const { edges } = transactions;

		// Iterate through each returned transaction and pull out the drive IDs
		await common.asyncForEach(edges, async (edge: gqlTypes.GQLEdgeInterface) => {
			const { node } = edge;
			const { tags } = node;
			const drive: arfsTypes.ArFSPrivateDriveEntity = {
				appName: "",
				appVersion: "",
				arFS: "",
				cipher: "",
				cipherIV: "",
				contentType: "application/json",
				driveId: "",
				drivePrivacy: "private",
				driveAuthMode: "",
				entityType: "drive",
				name: "",
				rootFolderId: "",
				txId: "",
				unixTime: 0,
				syncStatus: 0,
			};

			// Iterate through each tag and pull out each drive ID as well the drives privacy status
			tags.forEach((tag: gqlTypes.GQLTagInterface) => {
				const key = tag.name;
				const { value } = tag;
				switch (key) {
					case "App-Name":
						drive.appName = value;
						break;
					case "App-Version":
						drive.appVersion = value;
						break;
					case "ArFS":
						drive.arFS = value;
						break;
					case "Cipher":
						drive.cipher = value;
						break;
					case "Cipher-IV":
						drive.cipherIV = value;
						break;
					case "Content-Type":
						drive.contentType = value;
						break;
					case "Drive-Auth-Mode":
						drive.driveAuthMode = value;
						break;
					case "Drive-Id":
						drive.driveId = value;
						break;
					case "Drive-Privacy":
						drive.drivePrivacy = value;
						break;
					case "Unix-Time":
						drive.unixTime = +value;
						break;
					default:
						break;
				}
			});

			// Capture the TX of the private drive metadata tx
			drive.txId = node.id;

            // Add to the array only if it doesnt exist
            if (allDrives.some(existing => existing.driveId === drive.driveId)) {
                // This drive already exists in the array so we do not add another version of it
            } else {
                // This drive does not exist, so we add it
                allDrives.push(drive);
            }
		});

		return allDrives;
	} catch (err) {
		console.log(err);
		console.log("CORE GQL ERROR: Cannot get private drive entities");
		return "CORE GQL ERROR: Cannot get private drive entities";
	}
}

// Gets all of the private drive entities for a users wallet
export async function getAllPrivateDriveEntities(
	owner: string,
	lastBlockHeight: number
): Promise<arfsTypes.ArFSPrivateDriveEntity[] | string> {
	const graphQLURL = primaryGraphQLURL;
	const allDrives: arfsTypes.ArFSPrivateDriveEntity[] = [];
	try {
		// Search last 5 blocks minimum
		if (lastBlockHeight > 5) {
			lastBlockHeight -= 5;
		}

		// Create the Graphql Query to search for all drives relating to the User wallet
		const query = {
			query: `query {
      			transactions(
				block: {min: ${lastBlockHeight}}
				first: 100
				owners: ["${owner}"]
				tags: [
					{ name: "Entity-Type", values: "drive" }
					{ name: "Drive-Privacy", values: "private" }]) 
				{
					edges {
						node {
							id
							tags {
								name
								value
							}
						}
					}
      			}
    		}`,
		};

		// Call the Arweave Graphql Endpoint
		const response = await arweave.api.post(graphQLURL, query);
		const { data } = response.data;
		const { transactions } = data;
		const { edges } = transactions;

		// Iterate through each returned transaction and pull out the drive IDs
		edges.forEach((edge: gqlTypes.GQLEdgeInterface) => {
			const { node } = edge;
			const { tags } = node;
			const drive: arfsTypes.ArFSPrivateDriveEntity = {
				appName: "",
				appVersion: "",
				arFS: "",
				cipher: "",
				cipherIV: "",
				contentType: "application/json",
				driveId: "",
				drivePrivacy: "private",
				driveAuthMode: "",
				entityType: "drive",
				name: "",
				rootFolderId: "",
				txId: "",
				unixTime: 0,
				syncStatus: 0,
			};
			// Iterate through each tag and pull out each drive ID as well the drives privacy status
			tags.forEach((tag: gqlTypes.GQLTagInterface) => {
				const key = tag.name;
				const { value } = tag;
				switch (key) {
					case "App-Name":
						drive.appName = value;
						break;
					case "App-Version":
						drive.appVersion = value;
						break;
					case "ArFS":
						drive.arFS = value;
						break;
					case "Cipher":
						drive.cipher = value;
						break;
					case "Cipher-IV":
						drive.cipherIV = value;
						break;
					case "Content-Type":
						drive.contentType = value;
						break;
					case "Drive-Auth-Mode":
						drive.driveAuthMode = value;
						break;
					case "Drive-Id":
						drive.driveId = value;
						break;
					case "Drive-Privacy":
						drive.drivePrivacy = value;
						break;
					case "Unix-Time":
						drive.unixTime = +value;
						break;
					default:
						break;
				}
			});

			// Capture the TX of the public drive metadata tx
			drive.txId = node.id;
			allDrives.push(drive);
		});
		return allDrives;
	} catch (err) {
		console.log(err);
		console.log("CORE GQL ERROR: Cannot get private drive entities");
		return "CORE GQL ERROR: Cannot get private drive entities";
	}
}

// Gets all of the folder entity metadata transactions from a user's wallet, filtered by owner and drive ID
export async function getAllPublicFolderEntities(
	owner: string,
	driveId: string,
	lastBlockHeight: number
): Promise<arfsTypes.ArFSFileFolderEntity[] | string> {
	let hasNextPage = true;
	let cursor = "";
	let graphQLURL = primaryGraphQLURL;
	const allFolders: arfsTypes.ArFSFileFolderEntity[] = [];
	let tries = 0;

	// Search last 5 blocks minimum
	if (lastBlockHeight > 5) {
		lastBlockHeight -= 5;
	}
	while (hasNextPage) {
		const query = {
			query: `query {
      transactions(
        block: {min: ${lastBlockHeight}}
        owners: ["${owner}"]
		first: 100
        after: "${cursor}"
        tags: [
          { name: "Drive-Id", values: "${driveId}" }
          { name: "Entity-Type", values: "folder"}
		  { name: "Content-Type", values: "application/json"}
        ]
      ) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            id
            block {
              timestamp
              height
            }
            tags {
              name
              value
            }
          }
        }
      }
    }`,
		};
		// Call the Arweave gateway
		try {
			const response = await arweave.api.post(graphQLURL, query);
			const { data } = response.data;
			const { transactions } = data;
			const { edges } = transactions;
			hasNextPage = transactions.pageInfo.hasNextPage;
			edges.forEach((edge: gqlTypes.GQLEdgeInterface) => {
				const folder: arfsTypes.ArFSFileFolderEntity = {
					appName: "",
					appVersion: "",
					arFS: "",
					contentType: "",
					driveId: "",
					entityType: "folder",
					entityId: "",
					name: "",
					parentFolderId: "",
					unixTime: 0,
					txId: "",
					syncStatus: 0,
					lastModifiedDate: 0,
				};
				cursor = edge.cursor;
				const { node } = edge;
				const { tags } = node;
				// Enumerate through each tag to pull the data
				tags.forEach((tag: gqlTypes.GQLTagInterface) => {
					const key = tag.name;
					const { value } = tag;
					switch (key) {
						case "App-Name":
							folder.appName = value;
							break;
						case "App-Version":
							folder.appVersion = value;
							break;
						case "ArFS":
							folder.arFS = value;
							break;
						case "Content-Type":
							folder.contentType = value;
							break;
						case "Drive-Id":
							folder.driveId = value;
							break;
						case "Folder-Id":
							folder.entityId = value;
							break;
						case "Parent-Folder-Id":
							folder.parentFolderId = value;
							break;
						case "Unix-Time":
							folder.unixTime = +value; // Convert to number
							break;
						default:
							break;
					}
				});
				// Capture the TX of the file metadata tx
				folder.txId = node.id;
				allFolders.push(folder);
			});
		} catch (err) {
			console.log(err);
			if (tries < 5) {
				tries += 1;
				console.log(
					"Error querying GQL for folder entity transactions for %s starting at block height %s, trying again.",
					driveId,
					lastBlockHeight
				);
			} else {
				if (graphQLURL === backupGraphQLURL) {
					console.log(
						"Backup gateway is having issues, stopping the query."
					);
					hasNextPage = false;
				} else {
					console.log(
						"Primary gateway is having issues, switching to backup."
					);
					graphQLURL = backupGraphQLURL; // Change to the backup URL and try 5 times
					tries = 0;
				}
			}
		}
	}
	if (tries === 0) {
		return "CORE GQL ERROR: Cannot get public folder entities";
	} else {
		return allFolders;
	}
}

// Gets all of the private folder entity metadata transactions from a user's wallet, filtered by owner and drive ID
export async function getAllPrivateFolderEntities(
	owner: string,
	driveId: string,
	lastBlockHeight: number
): Promise<arfsTypes.ArFSPrivateFileFolderEntity[] | string> {
	let hasNextPage = true;
	let cursor = "";
	let graphQLURL = primaryGraphQLURL;
	const allFolders: arfsTypes.ArFSPrivateFileFolderEntity[] = [];
	let tries = 0;

	// Search last 5 blocks minimum
	if (lastBlockHeight > 5) {
		lastBlockHeight -= 5;
	}
	while (hasNextPage) {
		const query = {
			query: `query {
      transactions(
        block: {min: ${lastBlockHeight}}
        owners: ["${owner}"]
		first: 100
        after: "${cursor}"
        tags: [
          { name: "Drive-Id", values: "${driveId}" }
          { name: "Entity-Type", values: "folder"}
		  { name: "Content-Type", values: "application/octet-stream"}
        ]
      ) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            id
            block {
              timestamp
              height
            }
            tags {
              name
              value
            }
          }
        }
      }
    }`,
		};
		// Call the Arweave gateway
		try {
			const response = await arweave.api.post(graphQLURL, query);
			const { data } = response.data;
			const { transactions } = data;
			const { edges } = transactions;
			hasNextPage = transactions.pageInfo.hasNextPage;
			edges.forEach((edge: gqlTypes.GQLEdgeInterface) => {
				const folder: arfsTypes.ArFSPrivateFileFolderEntity = {
					appName: "",
					appVersion: "",
					arFS: "",
					cipher: "",
					cipherIV: "",
					contentType: "",
					driveId: "",
					entityType: "folder",
					entityId: "",
					name: "",
					parentFolderId: "",
					unixTime: 0,
					txId: "",
					syncStatus: 0,
					lastModifiedDate: 0,
				};
				cursor = edge.cursor;
				const { node } = edge;
				const { tags } = node;
				// Enumerate through each tag to pull the data
				tags.forEach((tag: gqlTypes.GQLTagInterface) => {
					const key = tag.name;
					const { value } = tag;
					switch (key) {
						case "App-Name":
							folder.appName = value;
							break;
						case "App-Version":
							folder.appVersion = value;
							break;
						case "ArFS":
							folder.arFS = value;
							break;
						case "Cipher":
							folder.cipher = value;
							break;
						case "Cipher-IV":
							folder.cipherIV = value;
							break;
						case "Content-Type":
							folder.contentType = value;
							break;
						case "Drive-Id":
							folder.driveId = value;
							break;
						case "Folder-Id":
							folder.entityId = value;
							break;
						case "Parent-Folder-Id":
							folder.parentFolderId = value;
							break;
						case "Unix-Time":
							folder.unixTime = +value; // Convert to number
							break;
						default:
							break;
					}
				});
				// Capture the TX of the file metadata tx
				folder.txId = node.id;
				allFolders.push(folder);
			});
		} catch (err) {
			console.log(err);
			if (tries < 5) {
				tries += 1;
				console.log(
					"Error querying GQL for folder entity transactions for %s starting at block height %s, trying again.",
					driveId,
					lastBlockHeight
				);
			} else {
				if (graphQLURL === backupGraphQLURL) {
					console.log(
						"Backup gateway is having issues, stopping the query."
					);
					hasNextPage = false;
				} else {
					console.log(
						"Primary gateway is having issues, switching to backup."
					);
					graphQLURL = backupGraphQLURL; // Change to the backup URL and try 5 times
					tries = 0;
				}
			}
		}
	}
	if (tries === 0) {
		return "CORE GQL ERROR: Cannot get private folder entities";
	} else {
		return allFolders;
	}
}

// Gets the CipherIV tag of a private data transaction
export async function getPrivateTransactionCipherIV(
	txid: string
): Promise<string> {
	let graphQLURL = primaryGraphQLURL;
	let tries = 0;
	let dataCipherIV = "";
	const query = {
		query: `query {
      transactions(ids: ["${txid}"]) {
      edges {
        node {
          id
          tags {
            name
            value
          }
        }
      }
    }
  }`,
	};
	// We will only attempt this 10 times
	while (tries < 10) {
		try {
			// Call the Arweave Graphql Endpoint
			const response = await arweave.api
				.request()
				.post(graphQLURL, query);
			const { data } = response.data;
			const { transactions } = data;
			const { edges } = transactions;
			const { node } = edges[0];
			const { tags } = node;
			tags.forEach((tag: gqlTypes.GQLTagInterface) => {
				const key = tag.name;
				const { value } = tag;
				switch (key) {
					case "Cipher-IV":
						dataCipherIV = value;
						break;
					default:
						break;
				}
			});
			return dataCipherIV;
		} catch (err) {
			console.log(err);
			console.log(
				"Error getting private transaction cipherIV for txid %s, trying again",
				txid
			);
			if (tries < 5) {
				tries += 1;
			} else {
				tries += 1;
				console.log(
					"Primary gateway is having issues, switching to backup and trying again"
				);
				graphQLURL = backupGraphQLURL; // Change to the backup URL and try 5 times
			}
		}
	}
	return "CORE GQL ERROR: Cannot get file data Cipher IV";
}

// Gets the root folder ID for a Public Drive
export async function getPublicDriveRootFolderTxId(
	driveId: string,
	folderId: string
): Promise<string> {
	let metaDataTxId = "0";
	try {
		const query = {
			query: `query {
      transactions(
        first: 1
        sort: HEIGHT_ASC
        tags: [
          { name: "ArFS", values: "${arFSVersion}" }
          { name: "Drive-Id", values: "${driveId}" }
          { name: "Folder-Id", values: "${folderId}"}
        ]
      ) {
        edges {
          node {
            id
          }
        }
      }
    }`,
		};
		const response = await arweave.api.request().post(graphQLURL, query);
		const { data } = response.data;
		const { transactions } = data;
		const { edges } = transactions;
		await common.asyncForEach(
			edges,
			async (edge: gqlTypes.GQLEdgeInterface) => {
				const { node } = edge;
				metaDataTxId = node.id;
			}
		);
		return metaDataTxId;
	} catch (err) {
		console.log(err);
		console.log(
			"Error querying GQL for personal public drive root folder id, trying again."
		);
		metaDataTxId = await getPublicDriveRootFolderTxId(driveId, folderId);
		return metaDataTxId;
	}
}

function tagToAttributeMap(tag: string): string {
	// tag to camel case
	const words = tag.split("-");
	const attribute = words.join("");
	return `${attribute.charAt(0).toLowerCase()}${attribute.slice(1)}`;
}

const QUERY_ARGUMENTS_WHITELIST = [
	"edges",
	"edges.node",
	"edges.node.id",
	"edges.node.tags",
	"edges.node.tags.name",
	"edges.node.tags.value",
	"edges.node.block",
	"edges.node.block.timestamp",
	"edges.node.block.height",
	"pageInfo",
	"pageInfo.hasNextPage",
];

class Query<T extends arfsTypes.ArFSEntity> {
	private _parameters: string[] = ["edges.node.id", "hasNextPage"];
	private edges: gqlTypes.GQLEdgeInterface[] = [];
	private hasNextPage = true;
	private cursor = "";
	owners?: string[];
	tags?: { name: string; values: string | string[] }[];
	block?: { min: number };
	first?: number;

	set parameters(parameters: string[]) {
		if (!this._validateArguments(parameters)) {
			throw new Error("Invalid parameters.");
		}
		this._parameters = parameters;
	}

	private _validateArguments(argument: string[]) {
		const isValid = argument.reduce(
			(valid: boolean, arg: string): boolean => {
				return valid && QUERY_ARGUMENTS_WHITELIST.includes(arg);
			},
			true
		);
		return isValid;
	}

	public getAll = async (): Promise<T[]> => {
		await this._run();
		const entities: T[] = [];
		this.edges.forEach((edge: gqlTypes.GQLEdgeInterface) => {
			const { node } = edge;
			const { tags } = node;
			const entity: any = {};
			entity.txId = node.id;
			tags.forEach((tag: gqlTypes.GQLTagInterface) => {
				const { name, value } = tag;
				const attributeName = tagToAttributeMap(name);
				entity[attributeName] = value;
			});
			entities.push(entity);
		});
		return entities;
	};

	public getRaw = async (): Promise<gqlTypes.GQLEdgeInterface[]> => {
		await this._run();
		return this.edges;
	};

	private _run = async (): Promise<void> => {
		const queryString = this._toString();
		while (this.hasNextPage) {
			const response = await arweave.api.post(
				primaryGraphQLURL,
				queryString
			);
			const { data } = response.data;
			const { transactions } = data;
			if (transactions.edges && transactions.edges.length) {
				this.edges = this.edges.concat(transactions.edges);
				this.cursor =
					transactions.edges[transactions.edges.length - 1].cursor;
			}
			this.hasNextPage =
				this._parameters.includes("pageInfo.hasNextPage") &&
				transactions.pageInfo.hasNextPage;
		}
	};

	private _toString = () => {
		const serializedTransactionData = this._getSerializedTransactionData();
		const serializedQueryParameters = this._getSerializedParameters();
		return JSON.stringify(
			`query {\ntransactions(\n${serializedTransactionData}) ${serializedQueryParameters}\n}`
		);
	};

	private _getSerializedTransactionData = (): string => {
		const data: any = {};
		if (this.owners) {
			data.owners = serializedArray(this.owners, serializedString);
		}
		if (this.tags) {
			if (typeof this.tags === "string") {
				data.tags = serializedString(this.tags);
			} else {
				data.tags = serializedArray(this.tags, serializedObject);
			}
		}
		if (this.block) {
			data.block = serializedObject(this.block);
		}
		if (this.first) {
			data.first = serializedNumber(this.first);
		}
		if (this.cursor) {
			data.after = serializedString(this.cursor);
		}
		const dataKeys = Object.keys(data);
		const serializedData = dataKeys
			.map((key) => `${key}: ${data[key]}`)
			.join("\n");
		return serializedData;
	};

	private _getSerializedParameters = (
		params: any = this._getParametersObject(),
		depht = 0
	): string => {
		const paramKeys = Object.keys(params);
		let serializedParameters = "";
		if (paramKeys.length > 0) {
			serializedParameters = paramKeys
				.map((key): string => {
					const value = params[key];
					const valueChildrenKeys = Object.keys(value);
					if (valueChildrenKeys.length > 0) {
						return `${key} {${this._getSerializedParameters(
							value,
							depht + 1
						)}}`;
					} else {
						return `${key}`;
					}
				})
				.join("\n");
		}
		if (depht === 0 && serializedParameters) {
			serializedParameters = `{\n${serializedParameters}\n}`;
		}
		return serializedParameters;
	};

	private _getParametersObject = (): { [key: string]: any } => {
		const normalizedParameters = this._parameters.reduce(
			(params: any, p: string): any => {
				const object: any = {};
				const nodes = p.split(".");
				let o = object;
				nodes.forEach((n) => {
					if (!o[n]) {
						o[n] = {};
						o = o[n];
					}
				});
				return Object.apply(params, object);
			},
			{} as any
		);
		return normalizedParameters;
	};
}

function serializedNumber(n: number): string {
	return `${n}`;
}

function serializedString(s: string): string {
	return `"${s}"`;
}

function serializedObject(o: any): string {
	return JSON.stringify(o);
}

function serializedArray<T>(a: T[], serializeItem: (i: T) => string) {
	const serialized = a.map(serializeItem).join("\n");
	return `[\n${serialized}\n]`;
}

new Query<arfsTypes.ArFSDriveEntity>();