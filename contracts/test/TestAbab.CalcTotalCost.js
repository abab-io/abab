var Abab = artifacts.require("Abab");

contract('Abab.CalcTotalCost', function(accounts) {
  var abab;

  it("check CalcTotalCost", function() {
    return Abab.deployed().then(function(instance) {
      abab = instance;

      abab.UpsertRoomFromHost(0,0,0,0,1,0);
      return abab.CalcTotalCost.call(accounts[0], 0, 1, 2, 0);
    }).then(function(result){
      assert.equal(result.toNumber(), 0, "if not schedules, then not booking");

      // 10 - 100   10,5,1
      abab.UpsertSchedule(0/*_roomIndex*/, 0/*_scheduleIndex*/, 10/*_from*/, 100/*_to*/, 10/*_dayPrice*/, 5/*_weekPrice*/, 1/*_monthPrice*/, 0/*_currency*/);

      return abab.CalcTotalCost.call(accounts[0], 0, 10, 11, 0);
     }).then(function(result){
       assert.equal(result.toNumber(), 10, "calc price for one, first schedule day");

       return abab.CalcTotalCost.call(accounts[0], 0, 99, 100, 0);
     }).then(function(result){
       assert.equal(result.toNumber(), 10, "calc price for one, last schedule day");

       return abab.CalcTotalCost.call(accounts[0], 0, 100, 101, 0);
     }).then(function(result){
       assert.equal(result.toNumber(), 0, "first day after schedule range");

       return abab.CalcTotalCost.call(accounts[0], 0, 50, 51, 0);
     }).then(function(result){
       assert.equal(result.toNumber(), 10, "calc price for one, central schedule day");

       return abab.CalcTotalCost.call(accounts[0], 0, 0, 1, 0);
     }).then(function(result){
       assert.equal(result.toNumber(), 0, "out of schedule range (before)");

      return abab.CalcTotalCost.call(accounts[0], 0, 1000, 1001, 0);
    }).then(function(result){
      assert.equal(result.toNumber(), 0, "out of schedule range (after)");

      return abab.CalcTotalCost.call(accounts[0], 0, 10, 17, 0);
    }).then(function(result){
      assert.equal(result.toNumber(), 5*7, "week price");

      return abab.CalcTotalCost.call(accounts[0], 0, 10, 40, 0);
    }).then(function(result){
      assert.equal(result.toNumber(), 1*30, "month price");

      // 10 - 100   10,5,1
      // 20 - 40    100,90,80
      abab.UpsertSchedule(0/*_roomIndex*/, 1/*_scheduleIndex*/, 20/*_from*/, 40/*_to*/, 100/*_dayPrice*/, 90/*_weekPrice*/, 80/*_monthPrice*/, 0/*_currency*/);

      return abab.CalcTotalCost.call(accounts[0], 0, 25, 26, 0);
    }).then(function(result){
      assert.equal(result.toNumber(), 100, "use last shedule, one day");

      return abab.CalcTotalCost.call(accounts[0], 0, 20, 40, 0);
    }).then(function(result){
      assert.equal(result.toNumber(), (40-20)*90, "use all last shedule, week price");

      return abab.CalcTotalCost.call(accounts[0], 0, 39, 41, 0);
    }).then(function(result){
      assert.equal(result.toNumber(), 100+10, "use both shedules, day price");

      return abab.CalcTotalCost.call(accounts[0], 0, 30, 50, 0);
    }).then(function(result){
      assert.equal(result.toNumber(), (40-30)*90 + (50-40)*5, "use both shedules, week price");

      // 10 - 100   10,5,1
      // 20 - 40    100,90,80
      // 60 - 90    1000,900,800
      abab.UpsertSchedule(0/*_roomIndex*/, 2/*_scheduleIndex*/, 60/*_from*/, 90/*_to*/, 1000/*_dayPrice*/, 900/*_weekPrice*/, 800/*_monthPrice*/, 0/*_currency*/);

      return abab.CalcTotalCost.call(accounts[0], 0, 10, 100, 0);
    }).then(function(result){
      assert.equal(result.toNumber(), (100-10 - (40-20) - (90-60))*1 + (40-20)*80 + (90-60)*800, "use 3 shedules, month price");

    });
  });
  
  it("check CalcTotalCost (bug 'over end range' 20170821)", function() {
    return Abab.deployed().then(function(instance) {
      abab = instance;
      
      abab.UpsertSchedule(0/*_roomIndex*/, 9999999999/*_scheduleIndex*/, 200/*_from*/, 300/*_to*/, 1/*_dayPrice*/, 1/*_weekPrice*/, 1/*_monthPrice*/, 0/*_currency*/);
      return abab.CalcTotalCost.call(accounts[0], 0, 250, 350, 0);
    }).then(function(result){
      assert.equal(result.toNumber(), 0, "over end range");
    });  
  });
  
  it("check CalcTotalCost - zero in middele", function() {
    return Abab.deployed().then(function(instance) {
      abab = instance;
      
      abab.UpsertSchedule(0/*_roomIndex*/, 9999999999/*_scheduleIndex*/, 400/*_from*/, 440/*_to*/, 1/*_dayPrice*/, 1/*_weekPrice*/, 1/*_monthPrice*/, 0/*_currency*/);
      abab.UpsertSchedule(0/*_roomIndex*/, 9999999999/*_scheduleIndex*/, 460/*_from*/, 500/*_to*/, 1/*_dayPrice*/, 1/*_weekPrice*/, 1/*_monthPrice*/, 0/*_currency*/);
      return abab.CalcTotalCost.call(accounts[0], 0, 430, 470, 0);
    }).then(function(result){
      assert.equal(result.toNumber(), 0, "over end range");
    });  
  });
  
  it("check CalcTotalCost - minNightCount", function() {
    return Abab.deployed().then(function(instance) {
      abab = instance;
      
      abab.UpsertRoomFromHost(0,0,0,0,1,0);
      abab.UpsertSchedule(0/*_roomIndex*/, 9999999999/*_scheduleIndex*/, 600/*_from*/, 700/*_to*/, 1/*_dayPrice*/, 1/*_weekPrice*/, 1/*_monthPrice*/, 0/*_currency*/);
      return abab.CalcTotalCost.call(accounts[0], 0, 600, 610, 0);
    }).then(function(result){
      assert.equal(result.toNumber(), 10, "min nigth - ok");
      
      abab.UpsertRoomFromHost(0,0,0,0,20,0);
      abab.UpsertSchedule(0/*_roomIndex*/, 9999999999/*_scheduleIndex*/, 600/*_from*/, 700/*_to*/, 1/*_dayPrice*/, 1/*_weekPrice*/, 1/*_monthPrice*/, 0/*_currency*/);
      return abab.CalcTotalCost.call(accounts[0], 0, 600, 610, 0);
    }).then(function(result){
      assert.equal(result.toNumber(), 0, "min nigth - error");

      abab.UpsertRoomFromHost(0,0,0,0,1,0); // return normale value
    });
  });

  it("check CalcTotalCost - reverse from and to", function() {
    return Abab.deployed().then(function(instance) {
      abab = instance;
      
      abab.UpsertRoomFromHost(0,0,0,0,1,0); // return minNightCount to normale value
      abab.UpsertSchedule(0/*_roomIndex*/, 9999999999/*_scheduleIndex*/, 700/*_from*/, 710/*_to*/, 1/*_dayPrice*/, 1/*_weekPrice*/, 1/*_monthPrice*/, 0/*_currency*/);
      return abab.CalcTotalCost.call(accounts[0], 0, 701, 707, 0);
    }).then(function(result){
      assert.equal(result.toNumber(), 707 - 701, "from < to");
      
      abab.UpsertSchedule(0/*_roomIndex*/, 9999999999/*_scheduleIndex*/, 700/*_from*/, 710/*_to*/, 1/*_dayPrice*/, 1/*_weekPrice*/, 1/*_monthPrice*/, 0/*_currency*/);
      return abab.CalcTotalCost.call(accounts[0], 0, 709, 701, 0);
    }).then(function(result){
      assert.equal(result.toNumber(), 0, "from > to"); 
    });
  });
});