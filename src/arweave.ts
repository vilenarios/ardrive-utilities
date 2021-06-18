import Arweave from "arweave";

export const arweave = Arweave.init({
	host: "arweave.net", // Arweave Gateway
	//host: 'arweave.dev', // Arweave Dev Gateway
	port: 443,
	protocol: "https",
	timeout: 600000,
});
