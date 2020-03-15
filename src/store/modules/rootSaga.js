import { all } from 'redux-saga/effects';

import cart from './cart/sagas';

// Exportamos um generator utilizando o function*
export default function* rootSaga() {
  // Podemos adicionar mais caso for necessario: all([cart, outro, ...])
  return yield all([cart]);
}
