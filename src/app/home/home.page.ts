import { Component, OnInit } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { SQLitePorter } from '@awesome-cordova-plugins/sqlite-porter/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  response: any = 'msg Response';
  constructor(
    private sqlite: SQLite,
    private platform: Platform,
    private sqlitePorter: SQLitePorter
  ) {}
  ngOnInit() {
    const sql =
      'CREATE TABLE Artist ([Id] PRIMARY KEY, [Title]);' +
      'INSERT INTO Artist(Id,Title) VALUES ("1","Fred");';
    this.platform.ready().then((ready) => {
      if (ready) {
        this.sqlite
          .create({
            name: 'data.db',
            location: 'default',
          })
          .then((db: SQLiteObject) => {
            db.executeSql('create table danceMoves(name VARCHAR(32))', [])
              .then(() => {
                this.response = 'Executed SQL yupiiii';
                this.sqlitePorter
                  .importSqlToDb(db, sql)
                  .then(() => {
                    this.response += 'Create table';
                  })
                  .catch((e) => this.response += e);
              })
              .catch((e) => (this.response = e));
          })
          .catch((e) => console.log(e));
      }
    });
  }
}
