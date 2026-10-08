import './style.css';
import './ui/styles.css';
import { STORES } from './config/stores';
import { loadCatalog } from './data/catalog';
import { bus } from './events';
import { createGame } from './game/createGame';
import { getElement } from './ui/dom';
import { renderFatalError } from './ui/errorScreen';
import { mountShelfPanel } from './ui/ShelfPanel';

const uiRoot = getElement('ui-root');

try {
  // Validate every store's data before anything is drawn, so bad JSON fails loudly.
  const catalog = await loadCatalog(STORES);
  mountShelfPanel(uiRoot, bus);
  createGame(getElement('game'), catalog);
} catch (error) {
  console.error(error);
  renderFatalError(uiRoot, error);
}
