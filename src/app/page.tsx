import getData from "@/app/lib/getData"
import { Pagination } from "@/app/components/Pagination"

export default async function Home() {

	const baseUri = "https://www.bungie.net"
    const books = await getData()

	return (
		<div>
            {books.map(book => {
                return(
                    <div key={book.hash}>
                        <h1>{book.subtitle}</h1>
                        <h2>{book.displayProperties.name}</h2>
                        {book.displayProperties.hasIcon === true ? <img src={baseUri.concat(book.displayProperties.icon)} alt={book.displayProperties.name}></img> : null}
                        <p>{book.displayProperties.description}</p>
                        <small><b>hash:</b> {book.hash}</small>
                    </div>
                )
            })}
            <Pagination></Pagination>
		</div>
	)
}