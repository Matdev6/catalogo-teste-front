// Transforma uma string HTML em um elemento do DOM.
export function toElement(stringHTML) {
	const template = document.createElement("template")
	template.innerHTML = stringHTML.trim() // o trim evita que um espaço em branco vire o primeiro nó
	const node = template.content.childNodes[0]

	return node ? document.adoptNode(node) : null
}

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }

// Escapa dados vindos da API antes de interpolar em templates HTML.
export const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ESCAPES[char])
