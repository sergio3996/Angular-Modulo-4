import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FrutasApiClient } from 'src/app/models/fruta-api-client.model';
import { FrutaFavorita } from 'src/app/models/fruta-favorita.model';

@Component({
  selector: 'app-fruta-detalle',
  templateUrl: './fruta-detalle.component.html',
  styleUrls: ['./fruta-detalle.component.css'],
  providers: [FrutasApiClient]
})




export class FrutaDetalleComponent implements OnInit {
  fruta: FrutaFavorita;
  style = {
    sources: {
      world: {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json'
      }
    },
    version: 8,
    layers: [{
      'id': 'countries',
      'type': 'fill',
      'source': 'world',
      'layout': {},
      'paint': {
        'fill-color': '#6F788A'
      }
    }]
  };

  constructor(private route: ActivatedRoute, private frutasApiClient: FrutasApiClient) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.fruta = this.frutasApiClient.getById(id);
  }

}