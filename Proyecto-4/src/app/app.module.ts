import { APP_INITIALIZER, Injectable, InjectionToken, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RouterModule, Routes } from '@angular/router'

import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import Dexie from 'dexie';

import { StoreModule as NgRxStoreModule, ActionReducerMap, Store } from '@ngrx/store'
import { EffectsModule } from '@ngrx/effects';

import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations'

import { NgxMapboxGLModule } from 'ngx-mapbox-gl'

import { HttpClientModule, HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http'

import { AppComponent } from './app.component';
import { FrutaFavoritaComponent } from './components/fruta-favorita/fruta-favorita.component';
import { ListaFrutasComponent } from './components/lista-frutas/lista-frutas.component';
import { FrutaDetalleComponent } from './components/fruta-detalle/fruta-detalle.component';
import { FormFrutaFavoritaComponent } from './components/form-fruta-favorita/form-fruta-favorita.component';
import { FrutasApiClient } from './models/fruta-api-client.model';
import { FrutaFavoritaState, reducerFrutasFavoritas, initializeFrutasFavoritasState, FrutaFavoritaEffects, InitMyDataAction } from './models/fruta-favorita-state.model';
import { LoginComponent } from './components/login/login.component';
import { ProtectedComponent } from './components/protected/protected.component';
import { AuthService } from './services/auth.service';
import { UsuarioLogueadoGuard } from './guards/usuario-logueado/usuario-logueado.guard';
import { VentasComponent } from './components/ventas/ventas/ventas.component';
import { VentasMainComponent } from './components/ventas/ventas-main/ventas-main.component';
import { VentasMasInfoComponent } from './components/ventas/ventas-mas-info/ventas-mas-info.component';
import { VentasDetalleComponent } from './components/ventas/ventas-detalle/ventas-detalle.component';
import { PedidosModule } from './pedidos/pedidos.module';
import { FrutaFavorita } from './models/fruta-favorita.model';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';
import { flatMap, concatMap } from 'rxjs/operators';



// app config
export interface AppConfig {
  apiEndpoint: String;
}
const APP_CONFIG_VALUE: AppConfig = {
  apiEndpoint: 'http://localhost:3000'
};
export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');
// fin app config

export const childrenRoutesVentas: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'main', component: VentasMainComponent },
  { path: 'mas-info', component: VentasMainComponent },
  { path: ':id', component: VentasDetalleComponent },
];



const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: ListaFrutasComponent },
  { path: 'fruta-detalle', component: FrutaDetalleComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [UsuarioLogueadoGuard]
  },
  {
    path: 'ventas',
    component: VentasComponent,
    canActivate: [UsuarioLogueadoGuard],
    children: childrenRoutesVentas
  }
]



// app init
export function init_app(appLoadService: AppLoadService): () => Promise<any> {
  return () => appLoadService.initializeFrutasFavoritasState();
}

@Injectable()
class AppLoadService {
  constructor(private store: Store<AppState>, private http: HttpClient) { }
  async initializeFrutasFavoritasState(): Promise<any> {
    const headers: HttpHeaders = new HttpHeaders({ 'X-API-TOKEN': 'token-seguridad' });
    const req = new HttpRequest('GET', APP_CONFIG_VALUE.apiEndpoint + '/my', { headers: headers });
    const response: any = await this.http.request(req).toPromise();
    this.store.dispatch(new InitMyDataAction(response.body));
  }
}

// fin app init


//redux init
export interface AppState {
  frutas: FrutaFavoritaState;
};

const reducers: ActionReducerMap<AppState> = {
  frutas: reducerFrutasFavoritas
};

let reducersInitialState = {
  frutas: initializeFrutasFavoritasState()
};
//fin redux init

// dexie db
export class Translation {
  constructor(public id: number, public lang: string, public key: string, public value: string) { }
}

@Injectable({
  providedIn: 'root'
})
export class MyDatabase extends Dexie {
  frutas: Dexie.Table<FrutaFavorita, number>;
  translations: Dexie.Table<Translation, number>;
  constructor() {
    super('MyDatabase');
    this.version(1).stores({
      frutas: '++id, nombre, imagenUrl'
    });
    this.version(2).stores({
      frutas: '++id, nombre, imagenUrl',
      translations: '++id, lang, key, value'
    });
  }
}

export const db = new MyDatabase();
// fin dexie db

// i18n ini
class TranslationLoader implements TranslateLoader {
  constructor(private http: HttpClient) { }

  getTranslation(lang: string): Observable<any> {
    const promise = db.translations
      .where('lang')
      .equals(lang)
      .toArray()
      .then(results => {
        if (results.length === 0) {
          return this.http
            .get<Translation[]>(APP_CONFIG_VALUE.apiEndpoint + '/api/translation?lang=' + lang)
            .toPromise()
            .then(apiResults => {
              db.translations.bulkAdd(apiResults);
              return apiResults;
            });
        }
        return results;
      }).then((traducciones) => {
        console.log('traducciones cargadas:');
        console.log(traducciones);
        return traducciones;
      }).then((traducciones) => {
        return traducciones.map((t) => ({ [t.key]: t.value }));
      });
    /*
    return from(promise).pipe(
      map((traducciones) => traducciones.map((t) => { [t.key]: t.value}))
    );
    */
    return from(promise).pipe(concatMap((elems) => from(elems)));
  }
}

function HttpLoaderFactory(http: HttpClient) {
  return new TranslationLoader(http);
}
// i18n fin



@NgModule({
  declarations: [
    AppComponent,
    FrutaFavoritaComponent,
    ListaFrutasComponent,
    FrutaDetalleComponent,
    FormFrutaFavoritaComponent,
    LoginComponent,
    ProtectedComponent,
    VentasComponent,
    VentasMainComponent,
    VentasMasInfoComponent,
    VentasDetalleComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule,
    NgRxStoreModule.forRoot(reducers, {
      initialState: reducersInitialState,
      runtimeChecks: {
        strictStateImmutability: false,
        strictActionImmutability: false,
      }
    }),
    PedidosModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (HttpLoaderFactory),
          deps: [HttpClient]
      }
    }),
    NgxMapboxGLModule.withConfig({
      accessToken: 'pk.eyJ1Ijoic2VyZ2lvMzk5NiIsImEiOiJja3F0bmdvYngwZTRtMm5zYjI4dnh6MTU3In0.47qENvCQO-NF60-BbZ2V4A', // Optional, can also be set per map (accessToken input of mgl-map)
      geocoderAccessToken: 'pk.eyJ1Ijoic2VyZ2lvMzk5NiIsImEiOiJja3F0bmdvYngwZTRtMm5zYjI4dnh6MTU3In0.47qENvCQO-NF60-BbZ2V4A' // Optional, specify if different from the map access token, can also be set per mgl-geocoder (accessToken input of mgl-geocoder)
    }),
    BrowserAnimationsModule,NoopAnimationsModule
  ],
  providers: [FrutasApiClient, AuthService, UsuarioLogueadoGuard,
    { provide: APP_CONFIG, useValue: APP_CONFIG_VALUE },
    AppLoadService,
    { provide: APP_INITIALIZER, useFactory: init_app, deps: [AppLoadService], multi: true },
    MyDatabase],
  bootstrap: [AppComponent]
})

export class AppModule { }
