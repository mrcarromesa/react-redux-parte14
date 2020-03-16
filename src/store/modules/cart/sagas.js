import { call, select, put, all, takeLatest } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import api from '../../../services/api';

import { addToCartSuccess, updateAmountSuccess } from './actions';

import { formatPrice } from '../../../util/format';

// recebe como parametro a action que contem o id: action.id, então destruturamos o parametro
// para que receba apenas o id
function* addToCart({ id }) {
  const productExists = yield select(state =>
    state.cart.find(p => p.id === id)
  );

  const stock = yield call(api.get, `/stock/${id}`);
  const stockAmount = stock.data.amount;
  const currentAmount = productExists ? productExists.amount : 0;

  const amount = currentAmount + 1;

  if (amount > stockAmount) {
    console.tron.warn('ERROR stock');
    toast.error('Quantidade solicitada fora de estoque');
    return;
  }

  if (productExists) {
    // Alterar o amount disparar uma action
    yield put(updateAmountSuccess(id, amount));
  } else {
    const response = yield call(api.get, `/products/${id}`);

    const data = {
      ...response.data,
      amount: 1,
      priceFormated: formatPrice(response.data.price)
    };

    yield put(addToCartSuccess(data));
  }
}

function* updateAmount({ id, amount }) {
  // Não permitir diminuir a quantidade para menos ou igual que zero
  if (amount <= 0) {
    return;
  }

  // Realizar chamada a api:

  const stock = yield call(api.get, `stock/${id}`);
  const stockAmount = stock.data.amount;

  if (amount > stockAmount) {
    console.tron.warn('ERROR stock');
    toast.error('Quantidade solicitada fora de estoque');
    return;
  }

  yield put(updateAmountSuccess(id, amount));
}

export default all([
  takeLatest('@cart/ADD_REQUEST', addToCart),
  takeLatest('@cart/UPDATE_AMOUNT_REQUEST', updateAmount)
]);
