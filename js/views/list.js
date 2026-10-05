import { fetchProducts, fetchCategories } from "../api.js"
import { toElement, esc } from "../dom.js"
import { statusBox, productTable, pagination } from "../components.js"

const SORTS = [
	["", "Padrão"],
	["price:asc", "Menor preço"],
	["price:desc", "Maior preço"],
	["rating:desc", "Melhor avaliação"],
]
const PAGE_SIZES = [10, 20, 30]
const DEFAULT_LIMIT = 10
const DEBOUNCE_MS = 350

const debounce = (fn, ms) => {
	let timer
	return (...args) => {
		clearTimeout(timer)
		timer = setTimeout(() => fn(...args), ms)
	}
}

const options = (items, selected) => items
	.map(([value, label]) => `<option value="${esc(value)}"${String(value) === String(selected) ? " selected" : ""}>${esc(label)}</option>`)
	.join("")

export function renderList(root, params) {
	const state = {
		q: params.get("q") ?? "",
		category: params.get("category") ?? "",
		sort: params.get("sort") ?? "",
		limit: Number(params.get("limit")) || DEFAULT_LIMIT,
		page: Number(params.get("page")) || 1,
	}

	const view = toElement(`
		<section aria-labelledby="list-title">
			<h1 id="list-title" tabindex="-1">Produtos</h1>
			<form class="filters" role="search" aria-label="Filtrar produtos">
				<div class="field">
					<label for="f-q">Buscar produto</label>
					<input id="f-q" name="q" type="search" value="${esc(state.q)}" placeholder="Ex.: notebook, perfume">
				</div>
				<div class="field">
					<label for="f-category">Categoria</label>
					<select id="f-category" name="category"><option value="">Todas</option></select>
				</div>
				<div class="field">
					<label for="f-sort">Ordenar por</label>
					<select id="f-sort" name="sort">${options(SORTS, state.sort)}</select>
				</div>
				<div class="field">
					<label for="f-limit">Itens por página</label>
					<select id="f-limit" name="limit">${options(PAGE_SIZES.map((n) => [n, n]), state.limit)}</select>
				</div>
			</form>
			<div class="results" tabindex="-1" aria-live="polite"></div>
		</section>
	`)
	const form = view.querySelector("form")
	const results = view.querySelector(".results")
	root.replaceChildren(view)

	let requestId = 0

	function syncUrl() {
		const query = new URLSearchParams()
		if (state.q) query.set("q", state.q)
		if (state.category) query.set("category", state.category)
		if (state.sort) query.set("sort", state.sort)
		if (state.limit !== DEFAULT_LIMIT) query.set("limit", state.limit)
		if (state.page > 1) query.set("page", state.page)
		const text = query.toString()
		history.replaceState(null, "", text ? `#/?${text}` : "#/")
	}

	async function load({ focusResults = false } = {}) {
		const currentRequest = ++requestId
		results.setAttribute("aria-busy", "true")
		results.replaceChildren(statusBox({ kind: "loading", title: "Carregando produtos…" }))

		try {
			const [sortBy, order] = state.sort ? state.sort.split(":") : []
			const data = await fetchProducts({
				q: state.q, category: state.category, sortBy, order,
				limit: state.limit, skip: (state.page - 1) * state.limit,
			})
			if (currentRequest !== requestId || !view.isConnected) return

			if (data.products.length === 0 && data.total > 0 && state.page > 1) {
				state.page = 1
				return load()
			}

			syncUrl()
			if (data.products.length === 0) {
				results.replaceChildren(statusBox({
					kind: "empty",
					title: "Nenhum produto encontrado",
					text: "Tente outro termo de busca ou escolha outra categoria.",
				}))
			} else {
				results.replaceChildren(
					productTable(data.products, data.total),
					pagination({
						page: state.page,
						totalPages: Math.ceil(data.total / state.limit),
						total: data.total,
						onChange: (page) => {
							state.page = page
							load({ focusResults: true })
						},
					}),
				)
			}
		} catch (error) {
			if (currentRequest !== requestId) return
			results.replaceChildren(statusBox({
				kind: "error",
				title: "Não foi possível carregar os produtos",
				text: "Verifique sua conexão e tente novamente.",
				actionLabel: "Tentar novamente",
				onAction: () => load(),
			}))
		} finally {
			if (currentRequest === requestId) {
				results.removeAttribute("aria-busy")
				if (focusResults) results.focus()
			}
		}
	}

	// Busca e categoria são excludentes: a API não combina os dois filtros.
	const onSearch = debounce(() => {
		state.q = form.elements.q.value.trim()
		state.category = ""
		form.elements.category.value = ""
		state.page = 1
		load()
	}, DEBOUNCE_MS)
	form.elements.q.addEventListener("input", onSearch)

	form.addEventListener("submit", (event) => event.preventDefault())
	form.addEventListener("change", ({ target }) => {
		if (target.name === "q") return
		if (target.name === "category") {
			state.q = ""
			form.elements.q.value = ""
		}
		state[target.name] = target.name === "limit" ? Number(target.value) : target.value
		state.page = 1
		load()
	})

	fetchCategories()
		.then((categories) => {
			form.elements.category.insertAdjacentHTML(
				"beforeend",
				options(categories.map(({ slug, name }) => [slug, name]), state.category),
			)
		})
		.catch(() => {}) // sem categorias, o filtro continua em "Todas"

	load()
}
