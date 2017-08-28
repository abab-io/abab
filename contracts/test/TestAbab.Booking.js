var Abab = artifacts.require("Abab");

contract('TestAbab.Booking', function(accounts) {
  var abab;

  it("check booking", function() {
    return Abab.deployed().then(function(instance) {
      abab = instance;

      abab.UpsertRoomFromHost(0,0,0,0,1,0);
      abab.UpsertSchedule(0, 0, 8000000010, 8000000100, 10, 5, 1, 0);

      abab.Booking(accounts[0], 0, 8000000010, 8000000100, {from: accounts[1]});

      return abab.GetBookingLength.call(accounts[0], 0);
    }).then(function(result){
      assert.equal(result.toNumber(), 1, "check GetBookingLength");

      return abab.GetBooking.call(accounts[0], 0, 0);
    }).then(function(result){
      assert.equal(result[0],            accounts[1], "check guest");
      assert.equal(result[1].toNumber(), 8000000010,  "check from");
      assert.equal(result[2].toNumber(), 8000000100,  "check to");
      assert.equal(result[3].toNumber(), 90,          "check totalCost");
      assert.equal(result[4].toNumber(), 0,           "check currency");
      assert.equal(result[5].toNumber(), 90,          "check ababCoinTotalCost");
      assert.equal(result[6].toNumber(), 0,           "check status");

      return abab.DateIsFree(accounts[0], 0, 8000000000, 8000000001, (8000000000-1000)*24*60*60);
    }).then(function(result){
      assert.equal(result, true,  "check guest DateIsFree1");

      return abab.DateIsFree(accounts[0], 0, 8000000001, 8000000000, (8000000000-1000)*24*60*60);
    }).then(function(result){
      assert.equal(result, false,  "check guest DateIsFree2");

      return abab.DateIsFree(accounts[0], 0, 8000000100, 8000000101, (8000000000-1000)*24*60*60);
    }).then(function(result){
      assert.equal(result, true,  "check guest DateIsFree3");

//      abab.DateIsFree(accounts[0], 0, 8000000009, 8000000011, (8000000000-1000)*24*60*60);
      return abab.DateIsFree(accounts[0], 0, 8000000009, 8000000011, (8000000000-1000)*24*60*60);
    }).then(function(result){
      assert.equal(result, false,  "check guest DateIsFree4");

      return abab.DateIsFree(accounts[0], 0, 8000000010, 8000000100, (8000000000-1000)*24*60*60);
    }).then(function(result){
      assert.equal(result, false,  "check guest DateIsFree5");

      return abab.DateIsFree(accounts[0], 0, 8000000099, 8000000100, (8000000000-1000)*24*60*60);
    }).then(function(result){
      assert.equal(result, false,  "check guest DateIsFree6");

    });
  });
  
  it("check ApproveBooking CancelBooking", function() {
    return Abab.deployed().then(function(instance) {
      abab = instance;

      abab.UpsertRoomFromHost(1, 0, 0, 0, 1, 0);
      abab.UpsertSchedule(1, 0, 10, 100, 10, 5, 1, 0);
      abab.Booking(accounts[0], 1, 10, 100, {from: accounts[1]});

      return abab.GetBooking.call(accounts[0], 1, 0);
    }).then(function(result){
      assert.equal(result[6].toNumber(), 0,           "check new status");

      return abab.DateIsFree(accounts[0], 0, 10, 100, 0);
    }).then(function(result){
      assert.equal(result, false,  "check agree DateIsFree == false");

      abab.ApproveBooking(accounts[0], 1, 0);

      return abab.GetBooking.call(accounts[0], 1, 0);
    }).then(function(result){
      assert.equal(result[6].toNumber(), 1,           "check approve status");

      return abab.DateIsFree(accounts[0], 0, 10, 100, 0);
    }).then(function(result){
      assert.equal(result, false,  "check agree DateIsFree == false");

      abab.CancelBooking(accounts[0], 1, 0);

      return abab.GetBooking.call(accounts[0], 1, 0);
    }).then(function(result){
      assert.equal(result[6].toNumber(), 2,           "check cancel status");

      return abab.DateIsFree(accounts[0], 0, 10, 100, 0);
    }).then(function(result){
      assert.equal(result, true,  "check canceled free DateIsFree");

    });
  });
});