import { boot } from 'quasar/wrappers';
import { storeKey } from '../store';

export default boot(({ app, store }) => {
  app.use(store, storeKey);
});
