var Abab = artifacts.require("Abab");

contract('Abab', function(accounts) {
  var abab;

  it("check CalcTotalCost", function() {
    return Abab.deployed().then(function(instance) {
      abab = instance;

      abab.UpsertRoomFromHost(0,0,0,0,0,0);
      return abab.CalcTotalCost.call(accounts[0], 0, 1, 2);
    }).then(function(result){
      assert.equal(result.toNumber(), 0, "if not schedules, then not booking");

       abab.UpsertSchedule(0/*_roomIndex*/, 0/*_scheduleIndex*/, 10/*_from*/, 100/*_to*/, 10/*_dayPrice*/, 5/*_weekPrice*/, 1/*_monthPrice*/, 0/*_currency*/);
       
       return abab.CalcTotalCost.call(accounts[0], 0, 10, 11);
     }).then(function(result){
       assert.equal(result.toNumber(), 10, "calc price for one, first schedule day");

       return abab.CalcTotalCost.call(accounts[0], 0, 99, 100);
     }).then(function(result){
       assert.equal(result.toNumber(), 10, "calc price for one, last schedule day");

       return abab.CalcTotalCost.call(accounts[0], 0, 100, 101);
     }).then(function(result){
       assert.equal(result.toNumber(), 0, "first day after schedule range");

       return abab.CalcTotalCost.call(accounts[0], 0, 50, 51);
     }).then(function(result){
       assert.equal(result.toNumber(), 10, "calc price for one, central schedule day");

       return abab.CalcTotalCost.call(accounts[0], 0, 0, 1);
     }).then(function(result){
       assert.equal(result.toNumber(), 0, "out of schedule range (before)");

      return abab.CalcTotalCost.call(accounts[0], 0, 1000, 1001);
    }).then(function(result){
      assert.equal(result.toNumber(), 0, "out of schedule range (after)");

      return abab.CalcTotalCost.call(accounts[0], 0, 10, 17);
    }).then(function(result){
      assert.equal(result.toNumber(), 5*7, "week price");

      return abab.CalcTotalCost.call(accounts[0], 0, 10, 40);
    }).then(function(result){
      assert.equal(result.toNumber(), 1*30, "month price");

      abab.UpsertSchedule(0/*_roomIndex*/, 1/*_scheduleIndex*/, 20/*_from*/, 40/*_to*/, 100/*_dayPrice*/, 90/*_weekPrice*/, 80/*_monthPrice*/, 0/*_currency*/);

      return abab.CalcTotalCost.call(accounts[0], 0, 25, 26);
    }).then(function(result){
      assert.equal(result.toNumber(), 100, "use last shedule, one day");

      return abab.CalcTotalCost.call(accounts[0], 0, 20, 40);
    }).then(function(result){
      assert.equal(result.toNumber(), (40-20)*90, "use all last shedule, week price");

      return abab.CalcTotalCost.call(accounts[0], 0, 39, 41);
    }).then(function(result){
      assert.equal(result.toNumber(), 100+10, "use both shedules, day price");

      return abab.CalcTotalCost.call(accounts[0], 0, 30, 50);
    }).then(function(result){
      assert.equal(result.toNumber(), (40-30)*90 + (50-40)*5, "use both shedules, week price");

      abab.UpsertSchedule(0/*_roomIndex*/, 2/*_scheduleIndex*/, 60/*_from*/, 90/*_to*/, 1000/*_dayPrice*/, 900/*_weekPrice*/, 800/*_monthPrice*/, 0/*_currency*/);

      return abab.CalcTotalCost.call(accounts[0], 0, 10, 100);
    }).then(function(result){
      assert.equal(result.toNumber(), (100-10 - (40-20) - (90-60))*1 + (40-20)*80 + (90-60)*800, "use both shedules, week price");

    });
  });
});