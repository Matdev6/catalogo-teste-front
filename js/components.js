import { toElement, esc } from "./dom.js"
import { formatPrice, formatRating, formatCategory } from "./format.js"

export function statusBox({ kind, title, text = "", actionLabel, onAction }) {
	const spinner = kind === "loading" ? `<span class="spinner" aria-hidden="true"></span>` : ""
	const action = actionLabel ? `<button type="button" class="btn">${esc(actionLabel)}</button>` : ""
	const box = toElement(`
		<div class="status status--${kind}" role="${kind === "error" ? "alert" : "status"}">
			${spinner}
			<p class="status__title">${esc(title)}</p>
			${text ? `<p>${esc(text)}</p>` : ""}
			${action}
		</div>
	`)
	box.querySelector("button")?.addEventListener("click", onAction)
	return box
}

// Se a imagem falhar, troca por um bloco com o mesmo tamanho.
export function withImageFallback(img) {
	img.addEventListener("error", () => {
		img.replaceWith(toElement(
			`<span class="${esc(img.className)} img-fallback" role="img" aria-label="Imagem indisponível">Sem imagem</span>`
		))
	}, { once: true })
	return img
}

export function productRow({ thumbnail, title, category, price, stock, rating, id }) {
	const row = toElement(`
		<tr>
			<td data-label="Imagem">
				<img class="thumb" src="${esc(thumbnail)}" alt="${esc(title)}" width="64" height="64" loading="lazy">
			</td>
			<th scope="row" data-label="Produto">${esc(title)}</th>
			<td data-label="Categoria">${esc(formatCategory(category))}</td>
			<td data-label="Preço" class="num">${formatPrice(price)}</td>
			<td data-label="Estoque" class="num">${stock}</td>
			<td data-label="Avaliação" class="num">
				<span aria-hidden="true">★</span> ${formatRating(rating)}<span class="sr-only"> de 5</span>
			</td>
			<td data-label="Ações">
				<a class="btn" href="#/produtos/${id}">Ver detalhes<span class="sr-only"> de ${esc(title)}</span></a>
			</td>
		</tr>
	`)
	withImageFallback(row.querySelector("img"))
	return row
}

export function productTable(products, total) {
	const wrap = toElement(`
		<div class="table-wrap">
			<table class="products">
				<caption class="sr-only">Lista de produtos (${total} no total)</caption>
				<thead>
					<tr>
						<th scope="col">Imagem</th>
						<th scope="col">Produto</th>
						<th scope="col">Categoria</th>
						<th scope="col">Preço</th>
						<th scope="col">Estoque</th>
						<th scope="col">Avaliação</th>
						<th scope="col">Ações</th>
					</tr>
				</thead>
				<tbody></tbody>
			</table>
		</div>
	`)
	wrap.querySelector("tbody").append(...products.map(productRow))
	return wrap
}

export function pagination({ page, totalPages, total, onChange }) {
	const nav = toElement(`
		<nav class="pagination" aria-label="Paginação">
			<button type="button" class="btn btn--ghost" data-step="-1" ${page <= 1 ? "disabled" : ""}>Anterior</button>
			<p>Página ${page} de ${totalPages} (${total} produtos)</p>
			<button type="button" class="btn btn--ghost" data-step="1" ${page >= totalPages ? "disabled" : ""}>Próxima</button>
		</nav>
	`)
	nav.addEventListener("click", (event) => {
		const button = event.target.closest("button[data-step]")
		if (button) onChange(page + Number(button.dataset.step))
	})
	return nav
}
