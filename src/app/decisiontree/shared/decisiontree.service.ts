import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { AngularFirestore } from 'angularfire2/firestore';
import 'rxjs/add/operator/switchMap';
// Class decisiontree
import { Decisiontree } from './decisiontree';

@Injectable()
export class DecisiontreeService {
  authState: any = null;
  training_data: any;
  class_name: any;
  features: any;
  DecisionTree = require('decision-tree');
  userRef: AngularFireObject<any>;
  conditionList: any;

  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;
  constructor(private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private router: Router,
    private afs: AngularFirestore) {
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth;
      console.log(this.authState);
    });

    this.itemsRef = db.list('decisions');


    this.items = this.itemsRef.snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
    console.log(this.items);
  }

  createDecisionTree(decisiontree: Decisiontree) {
    firebase.database().ref('/decisions').push(decisiontree);
    this.router.navigate(['/conditions']);
  }

  testData(data1: string, data2: string, data3: string, data4: string, data5: string, data6: string) {
    this.class_name = 'result';
    this.features = ['AntiA', 'AntiB', 'AntiAB', 'Acell', 'Bcell', 'Ocell'];
    const dt = new this.DecisionTree(this.training_data, this.class_name, this.features);
    // console.log(dt)
    const predicted_class = dt.predict({
      AntiA: data1,
      AntiB: data2,
      AntiAB: data3,
      Acell: data4,
      Bcell: data5,
      Ocell: data6
    });
    // var predicted_class = dt.predict({
    //   color: "blue",
    //   shape: "hexagon"
    // });
    // var accuracy = dt.evaluate(this.test_data);
    const treeModel = dt.toJSON();
    console.log(predicted_class);
  }

  trainModel() {
    console.log('decisionokok');
    this.db.list('/decisions').valueChanges().subscribe(data => {
      this.training_data = data;
      this.testData('1', '2', '3', '4', '0', '0');
    });
  }

  private addCondition(decisiontree: Decisiontree): void {
    console.log(firebase.database());
    firebase.database().ref('/decision').push(decisiontree);
  }

  createCondition(decisiontree: Decisiontree) {
    this.addCondition(decisiontree);
    this.router.navigate(['/conditions']);
  }

  queryAllCondition(): Observable<any[]> { // first edit callback 8/2/18
    // return this.db.list('/decisions').valueChanges().subscribe(data => {
    //   callback(data);
    // });
    return this.db.list('/decisions').snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    }

    );

  }
  queryCondition(condition, callback) {
    // this.conditionList = db.list('/decision').valueChanges();
    if (condition === 'all') {
      // this.queryAllCondition(callback);
      // var ref = firebase.database().ref();

      // ref.on("decision", function (snapshot) {
      //   console.log(snapshot.val());
      // }, function (error) {
      //   console.log("Error: " + error.code);
      // });

    }

  }


  // test
  // getAllData(): Observable<Decisiontree[]> {
  //   return this.db.list('/decisions').valueChanges().subscribe(data => {

  //   })


  removeCondition(id: string) {

    // if (confirm('Do you want to remove ' + ' sure!')) {
    //   this.db.object('/decisions/id').remove().then(() => {
    //     alert('remove ' + 'success!');
    //   });
    // }
    // this.db.object('/decisions' + id).remove();

    console.log(id);
    this.itemsRef.remove(id);
  }
}
