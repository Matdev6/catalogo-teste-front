import { fetchProduct } from "../api.js"
import { toElement, esc } from "../dom.js"
import { statusBox, withImageFallback } from "../components.js"
import { formatPrice, formatRating, formatCategory, discountedPrice } from "../format.js"

const fact = (label, value) => `<div><dt>${label}</dt><dd>${value}</dd></div>`

function productDetail(product, backHref) {
	const tags = product.tags?.length
		? `<ul class="tags" aria-label="Tags">${product.tags.map((tag) => `<li>${esc(tag)}</li>`).join("")}</ul>`
		: ""
	const brand = product.brand ? fact("Marca", esc(product.brand)) : ""

	const article = toElement(`
		<article class="detail">
			<a class="back" href="${esc(backHref)}">Voltar ao catálogo</a>
			<div class="detail__grid">
				<img class="detail__image" src="${esc(product.images?.[0] ?? product.thumbnail)}" alt="${esc(product.title)}" width="480" height="480">
				<div>
					<h1 tabindex="-1">${esc(product.title)}</h1>
					<p class="detail__desc">${esc(product.description)}</p>
					<dl class="facts">
						${fact("Categoria", esc(formatCategory(product.category)))}
						${brand}
						${fact("Preço", formatPrice(product.price))}
						${fact("Desconto", `${product.discountPercentage.toFixed(0)}%`)}
						${fact("Preço com desconto", formatPrice(discountedPrice(product.price, product.discountPercentage)))}
						${fact("Avaliação", `${formatRating(product.rating)} de 5`)}
						${fact("Estoque", `${product.stock} unidades`)}
					</dl>
					${tags}
				</div>
			</div>
		</article>
	`)
	withImageFallback(article.querySelector(".detail__image"))
	return article
}

export async function renderDetail(root, id, backHref) {
	const view = `detail-${id}`
	root.dataset.view = view
	document.title = "Carregando produto…"
	root.replaceChildren(statusBox({ kind: "loading", title: "Carregando produto…" }))

	try {
		const product = await fetchProduct(id)
		if (root.dataset.view !== view) return

		document.title = `${product.title} | Catálogo de produtos`
		root.replaceChildren(productDetail(product, backHref))
		root.querySelector("h1").focus({ preventScroll: true })
	} catch (error) {
		if (root.dataset.view !== view) return

		const notFound = error.status === 404
		document.title = notFound ? "Produto não encontrado" : "Erro ao carregar produto"
		root.replaceChildren(
			toElement(`<a class="back" href="${esc(backHref)}">Voltar ao catálogo</a>`),
			statusBox({
				kind: "error",
				title: notFound ? "Produto não encontrado" : "Não foi possível carregar o produto",
				text: notFound ? `Não existe um produto com o código ${id}.` : "Verifique sua conexão e tente novamente.",
				actionLabel: notFound ? undefined : "Tentar novamente",
				onAction: () => renderDetail(root, id, backHref),
			}),
		)
	}
}
