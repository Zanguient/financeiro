import http from './http'

function getCarteira(id, callback) {
	http.fetch('financeiro/carteira/' + id, callback);
}

function listCarteiras(callback) {
	http.fetch('financeiro/carteira/', callback);
}

export default {
	get: getCarteira,
	list: listCarteiras
}