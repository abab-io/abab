pragma solidity ^0.4.11;

import "./zeppelin-solidity/Ownable.sol";

contract Abab is Ownable {
  uint constant maxUInt = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
  uint constant error   = maxUInt;

  // TODO compare gas price for diffrent roomID types  
  struct  Schedule {
    uint from;
    uint to;
    uint dayPrice;
    uint weekPrice;
    uint monthPrice;
    uint currency;  // see Currencies array
  }

  string[] Currencies = ["AbabCoin", "ETH", "BTC", "USD", "RUR"];

  function GetCurrencyByIndex(uint i)
  public constant
  returns(string currencyName)
  {
    return Currencies[i]; 
  }

  function GetCurrencyIndexByName(string name)
  public constant
  returns(uint index)
  {
    for(uint i = 0;i<Currencies.length;++i)
      if (sha3(Currencies[i]) == sha3(name))  // https://ethereum.stackexchange.com/questions/4559/operator-not-compatible-with-type-string-storage-ref-and-literal-string
        return i;
    return error;
  }

  event NewCurrency(string name, uint index);

  function AddCurrency(string name)
  public onlyOwner
  returns(uint index)
  {
    index = GetCurrencyIndexByName(name);
    if (index == error) {
      index = Currencies.push(name) - 1;
      NewCurrency(name, index);
    }
    return index;
  }

  struct Room {
    uint160 roomDescriptionHash;
    address partner;
    uint    partnerPPM;
    uint    schedulesLength;
    mapping(uint => Schedule) schedules;
  }

  mapping (address => Room[]) public rooms;  

  event NewRoom    (address indexed host, uint roomIndex, uint160 _roomDescriptionHash);
  event UpdateRoom (address indexed host, uint roomIndex, uint160 _newRoomDescriptionHash);
  event DeleteRoom (address indexed host, uint roomIndex);  

  function UpsertRoomFromHost(
    uint _roomIndex, 
    uint160 _roomDescriptionHash, 
    address partner, 
    uint partnerPPM, 
    uint minNightCount,
    uint TimeForBooking)
  public
  returns (uint roomIndex)
  {
      return UpsertRoom(_roomIndex, _roomDescriptionHash, msg.sender, partner, partnerPPM, minNightCount, TimeForBooking);
  }

  function UpsertRoomFromPartner(
    uint _roomIndex, 
    uint160 _roomDescriptionHash, 
    address host, 
    uint partnerPPM,
    uint minNightCount,
    uint TimeForBooking)
  public
  returns (uint roomIndex)
  {
    return UpsertRoom(_roomIndex, _roomDescriptionHash, host, msg.sender, partnerPPM, minNightCount, TimeForBooking);
  }

  function UpsertRoom(
    uint _roomIndex, 
    uint160 _roomDescriptionHash,
    address host,
    address partner,
    uint partnerPPM,
    uint minNightCount,
    uint TimeForBooking)
  public
  returns (uint roomIndex)
  {
      if(_roomIndex>=rooms[host].length) {
      var newRoomIndex = rooms[host].push(Room(_roomDescriptionHash, partner, partnerPPM, 0))-1;
      NewRoom(msg.sender, newRoomIndex, _roomDescriptionHash);
      return newRoomIndex;
    }
    
    rooms[host][_roomIndex].roomDescriptionHash = _roomDescriptionHash;
    UpdateRoom(host, _roomIndex, _roomDescriptionHash);
    return _roomIndex;
  }

  function GetRoomsCount()
  public constant
  returns (uint count)
  {
    return rooms[msg.sender].length;
  }

  function GetDescriptionHash(uint _roomIndex)
    public constant
  returns (uint160 DescriptionHash) 
  {
    return rooms[msg.sender][_roomIndex].roomDescriptionHash;
  }
  
  function RemoveRoomFromPartner(address _host, uint _roomIndex)
  public
  {
    if (_roomIndex >= rooms[_host].length)
      return;
    if((rooms[_host][_roomIndex].partner != msg.sender) && (_host != msg.sender) )
      return;
      
    for (uint i = _roomIndex; i<rooms[_host].length-1; ++i)
      rooms[_host][i] = rooms[_host][i+1];

    --rooms[_host].length;

    DeleteRoom(_host, _roomIndex);
  }

  function RemoveRoom(uint _roomIndex)
  public
  {
    RemoveRoomFromPartner(msg.sender, _roomIndex);
  }

  event NewSchedule    (address indexed host, uint roomIndex, uint scheduleIndex);
  event UpdateSchedule (address indexed host, uint roomIndex, uint scheduleIndex);
  event DeleteSchedule (address indexed host, uint roomIndex, uint scheduleIndex);  

  function UpsertScheduleFromPartner(address _host, uint _roomIndex, uint _scheduleIndex, uint _from, uint _to, uint _dayPrice, uint _weekPrice, uint _monthPrice, uint _currency)
  public
  {
    if (_roomIndex >= rooms[_host].length)
      return;
    if((rooms[_host][_roomIndex].partner != msg.sender) && (_host != msg.sender) )
      return;

    var schedule = Schedule(_from, _to, _dayPrice, _weekPrice, _monthPrice, _currency);

    var room = rooms[_host][_roomIndex];
    var schedulesLength = room.schedulesLength;

    if(_scheduleIndex<schedulesLength) {
      // update
      room.schedules[_scheduleIndex] = schedule;
      UpdateSchedule (_host, _roomIndex, _scheduleIndex);
    } else {
      //insert
      room.schedules[schedulesLength] = schedule;
      NewSchedule(_host, _roomIndex, schedulesLength);
      room.schedulesLength = schedulesLength + 1;
    }
  }

  function UpsertSchedule(uint _roomIndex, uint _scheduleIndex, uint _from, uint _to, uint _dayPrice, uint _weekPrice, uint _monthPrice, uint _currency)
  public
  {
    UpsertScheduleFromPartner(msg.sender, _roomIndex, _scheduleIndex, _from, _to, _dayPrice, _weekPrice, _monthPrice, _currency);
  }

  function GetScheduleIndex(uint _roomIndex, uint _from)
    public constant 
    returns (uint index) 
  {
    for(uint i=0; i<rooms[msg.sender][_roomIndex].schedulesLength; ++i)
      if(rooms[msg.sender][_roomIndex].schedules[i].from == _from) 
        return i;
    return maxUInt;
  }

  function GetSchedulesLength(uint _roomIndex) 
  public constant 
  returns(uint length) 
  {
      var addressRooms = rooms[msg.sender];
      if (addressRooms.length <= _roomIndex) 
          return 0;
      return rooms[msg.sender][_roomIndex].schedulesLength;
    }

  function GetScheduleByIndex(uint _roomIndex, uint _index) 
  public constant 
  returns(uint from, uint to, uint dayPrice, uint weekPrice, uint monthPrice) 
  {
      var s = rooms[msg.sender][_roomIndex].schedules[_index];
      return (s.from, s.to, s.dayPrice, s.weekPrice, s.monthPrice);
  }

  function RemoveSchedule(uint _roomIndex, uint _scheduleIndex)
  public
  {
    if(_scheduleIndex>=rooms[msg.sender][_roomIndex].schedulesLength)
      return;

    var length = rooms[msg.sender][_roomIndex].schedulesLength - 1;

    for (uint i = _scheduleIndex; i<length; ++i)
      rooms[msg.sender][_roomIndex].schedules[i] = rooms[msg.sender][_roomIndex].schedules[i+1];

    rooms[msg.sender][_roomIndex].schedulesLength = length;
    DeleteSchedule(msg.sender,_roomIndex, _scheduleIndex);
  }
}