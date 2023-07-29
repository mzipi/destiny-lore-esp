export default async function getData() {

    interface booksInterface {
		hash: number;
        subtitle: string;
		displayProperties: {
			name: string;
			description: string;
            hasIcon: boolean;
			icon?: string;
		}
	}

	const response = await fetch("https://www.bungie.net/common/destiny2_content/json/es-mx/DestinyLoreDefinition-7881b91d-c6d2-4921-9fd0-c9bdfa4f38ca.json")
	const data: booksInterface = await response.json()
	const books = Object.values(data)
	return books.slice(0, 1)
}