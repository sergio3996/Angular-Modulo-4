import {
    reducerFrutasFavoritas,
    FrutaFavoritaState,
    initializeFrutasFavoritasState,
    InitMyDataAction,
    NuevaFrutaAction
  } from './fruta-favorita-state.model';
  import { FrutaFavorita } from './fruta-favorita.model';
  
  describe('reducerFrutasFavoritas', () => {
    it('should reduce init data', () => {
      const prevState: FrutaFavoritaState = initializeFrutasFavoritasState();
      const action: InitMyDataAction = new InitMyDataAction(['fruta 1', 'fruta 2']);
      const newState: FrutaFavoritaState = reducerFrutasFavoritas(prevState, action);
      expect(newState.items.length).toEqual(2);
      expect(newState.items[0].nombre).toEqual('fruta 1');
    });
  
    it('should reduce new item added', () => {
      const prevState: FrutaFavoritaState = initializeFrutasFavoritasState();
      const action: NuevaFrutaAction = new NuevaFrutaAction(new FrutaFavorita('banana', 'url', 'amarillo'));
      const newState: FrutaFavoritaState = reducerFrutasFavoritas(prevState, action);
      expect(newState.items.length).toEqual(1);
      expect(newState.items[0].nombre).toEqual('banana');
    });
  });