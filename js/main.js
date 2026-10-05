import { renderList } from "./views/list.js"
import { renderDetail } from "./views/detail.js"

const root = document.getElementById("app")
const DETAIL_ROUTE = /^\/produtos\/([^/]+)$/

// Guarda a URL da lista (com filtros) para o link "Voltar ao catálogo".
let listHash = "#/"

function route(event) {
	const [path, query = ""] = (location.hash.slice(1) || "/").split("?")
	const detail = path.match(DETAIL_ROUTE)

	if (detail) {
		const previous = event ? new URL(event.oldURL).hash : ""
		if (previous && !previous.startsWith("#/produtos/")) listHash = previous
		root.dataset.view = ""
		renderDetail(root, decodeURIComponent(detail[1]), listHash)
	} else {
		listHash = location.hash || "#/"
		document.title = "Catálogo de produtos"
		root.dataset.view = "list"
		renderList(root, new URLSearchParams(query))
		if (event) root.querySelector("h1").focus({ preventScroll: true })
	}

	if (event) window.scrollTo(0, 0)
}

window.addEventListener("hashchange", route)
route()
