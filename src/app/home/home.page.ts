import { Component, OnInit } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { SQLitePorter } from '@awesome-cordova-plugins/sqlite-porter/ngx';
import { HttpClient } from '@angular/common/http';
import { ProductModel } from '../interfaces/product-model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  response: any = 'msg Response';
  inputSQL: string = ''; //eslint-disable-line
  db: any;
  products: any[] = [];
  constructor(
    private sqlite: SQLite,
    private platform: Platform,
    private sqlitePorter: SQLitePorter,
    private readonly http: HttpClient
  ) {}
  ngOnInit() {}
  onEjecutar(): void {
    this.db
      .executeSql(this.inputSQL, [])
      .then((res) => {
        this.response = res;
        for (let i = 0; i < res.rows.length; i++) {
          this.products.push(res.rows.item(i));
        }
      })
      .catch((e) => (this.response = e));
  }
  createDataBase(): void {
    this.platform.ready().then((ready) => {
      if (ready) {
        this.sqlite
          .create({
            name: 'koreDataDB.db',
            location: 'default',
          })
          .then((db: SQLiteObject) => {
            this.response = '- DB OK -';
            this.db = db;
            this.createTableProducts();
          })
          .catch((e) => console.log(e));
      }
    });
  }
  createTableProducts(): void {
    const sql = `create table products (id INTEGER(11) PRIMARY KEY, nombre VARCHAR(100), codigo_agrupador VARCHAR(20),codigo VARCHAR(20),codigo_secundario VARCHAR(20),codigo_barra VARCHAR(15),descripcion VARCHAR(50),estatus boolean , fecha_hora VARCHAR(25),relacion_sat VARCHAR(10),requiere_serie boolean,tipo VARCHAR(25),venta_fraccionaria boolean, ancho float(10),alto FLOAT(11),largo float(10),peso VARCHAR(20), unidad_principal_id VARCHAR(20),numero_ventas INTEGER(11),estatus_id INTEGER(11),url_amigable VARCHAR(200),marca VARCHAR(30))`; //eslint-disable-line
    this.db
      .executeSql(sql, [])
      .then(() => {
        this.response += '- Create Table -';
      })
      .catch((e) => console.log(e));
  }

  insertProducts(): void {
    this.getDataJson();
  }

  getDataJson(): void {
    this.http
      .get('assets/json-products-db.json')
      .subscribe((products: ProductModel[]) => {
        products.forEach((element) => {
          const sql = this.getSqlStatement(element);
          this.db
            .executeSql(sql, [])
            .then((response) => {
              console.log({insercion:response});
            })
            .catch((e) => console.log(e));
        });
      });
  }

  getSqlStatement(p: ProductModel) {
    let sql = `insert into products (id, nombre, codigo_agrupador, codigo,codigo_secundario, codigo_barra, descripcion, estatus, fecha_hora, relacion_sat, requiere_serie, tipo, venta_fraccionaria, ancho, alto, largo, peso, unidad_principal_id, numero_ventas, estatus_id, url_amigable, marca) VALUES ('${p.id}', '${p.nombre}', '${p.codigo_agrupador}', '${p.codigo}', '${p.codigo_secundario}', '${p.codigo_barra}', '${p.descripcion}', '${p.estatus}', '${p.fecha_hora}', '${p.relacion_sat}', '${p.requiere_serie}', '${p.tipo}', '${p.venta_fraccionaria}', '${p.ancho}', '${p.alto}', '${p.largo}', '${p.peso}', '${p.unidad_principal_id}', '${p.numero_ventas}', '${p.estatus_id}', '${p.url_amigable}','${p.marca}')`; //eslint-disable-line
    return sql;
  }
}
