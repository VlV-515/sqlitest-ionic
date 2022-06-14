import { Component, OnInit } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { SQLitePorter } from '@awesome-cordova-plugins/sqlite-porter/ngx';
import { HttpClient } from '@angular/common/http';
import { ProductModel } from '../interfaces/product-model';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  productsDB = new BehaviorSubject<ProductModel[]>([]);
  msgResponse = '-OK-';
  msgResponse2 = '-OK-';
  msgError = '-OK-';
  msgError2 = '-OK-';

  querySQL = '';

  searchProduct = '';
  products: ProductModel[] = [];

  db: SQLiteObject;
  constructor(
    private sqlite: SQLite,
    private platform: Platform,
    private sqlitePorter: SQLitePorter,
    private readonly http: HttpClient
  ) {}

  ngOnInit(): void {
    this.createDataBase();
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
            this.msgResponse = '- DB READY -';
            this.db = db;
          })
          .catch((e) => (this.msgError = e));
      }
    });
  }

  createTableProducts(): void {
    const sql = `create table products (id INTEGER(11) PRIMARY KEY, nombre VARCHAR(100), codigo_agrupador VARCHAR(20),codigo VARCHAR(20),codigo_secundario VARCHAR(20),codigo_barra VARCHAR(15),descripcion VARCHAR(50),estatus boolean , fecha_hora VARCHAR(25),relacion_sat VARCHAR(10),requiere_serie boolean,tipo VARCHAR(25),venta_fraccionaria boolean, ancho float(10),alto FLOAT(11),largo float(10),peso VARCHAR(20), unidad_principal_id VARCHAR(20),numero_ventas INTEGER(11),estatus_id INTEGER(11),url_amigable VARCHAR(200),marca VARCHAR(30))`; //eslint-disable-line
    this.db
      .executeSql(sql, [])
      .then((res) => {
        this.msgResponse = `- Table created -`;
        this.msgResponse2 = res;
      })
      .catch((e) => {
        this.msgError = `- Table not created -`;
        this.msgError2 = e;
      });
  }

  insertProducts(): void {
    this.getDataJson();
  }

  getDataJson(): void {
    //TODO
    //const urlFile = 'assets/json-products-db.json';
    const urlFile = 'assets/json-products-db-test.json';
    this.http.get(urlFile).subscribe((products: ProductModel[]) => {
      this.msgResponse = `- Inserting ${products.length} products-`;
      products.forEach((element) => {
        const sql = this.getSqlSentence(element);
        this.db
          .executeSql(sql, [])
          .then((res) => {
            this.msgResponse2 = res;
          })
          .catch((e) => {
            this.msgError = `- Products not inserted -`;
            this.msgError2 = e;
          });
      });
    });
  }

  getSqlSentence(p: ProductModel) {
    let sql = `insert into products (id, nombre, codigo_agrupador, codigo,codigo_secundario, codigo_barra, descripcion, estatus, fecha_hora, relacion_sat, requiere_serie, tipo, venta_fraccionaria, ancho, alto, largo, peso, unidad_principal_id, numero_ventas, estatus_id, url_amigable, marca) VALUES ('${p.id}', '${p.nombre}', '${p.codigo_agrupador}', '${p.codigo}', '${p.codigo_secundario}', '${p.codigo_barra}', '${p.descripcion}', '${p.estatus}', '${p.fecha_hora}', '${p.relacion_sat}', '${p.requiere_serie}', '${p.tipo}', '${p.venta_fraccionaria}', '${p.ancho}', '${p.alto}', '${p.largo}', '${p.peso}', '${p.unidad_principal_id}', '${p.numero_ventas}', '${p.estatus_id}', '${p.url_amigable}','${p.marca}')`; //eslint-disable-line
    return sql;
  }

  ejecutarSql(): void {
    this.db
      .executeSql(this.querySQL, [])
      .then((res) => {
        this.msgResponse = `- SQL executed -`;
        this.msgResponse2 = res;
      })
      .catch((e) => {
        this.msgError = `- SQL not executed -`;
        this.msgError2 = e;
      });
  }

  consultProductsInDB(): void {
    const sql = `select * from products where nombre like '%${this.searchProduct}%'`;
    this.db
      .executeSql(sql, [])
      .then((res) => {
        this.products = [];
        for (let i = 0; i < res.rows.length; i++) {
          this.products.push(res.rows.item(i));
        }
      })
      .catch((e) => (this.msgError = `- Error Consult products-> ${e} -`));
  }
}
