pragma solidity ^0.4.11;




/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  function Ownable() {
    owner = msg.sender;
  }


  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }


  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) onlyOwner {
    require(newOwner != address(0));      
    owner = newOwner;
  }

}






/**
 * @title Claimable
 * @dev Extension for the Ownable contract, where the ownership needs to be claimed.
 * This allows the new owner to accept the transfer.
 */
contract Claimable is Ownable {
  address public pendingOwner;

  /**
   * @dev Modifier throws if called by any account other than the pendingOwner.
   */
  modifier onlyPendingOwner() {
    require(msg.sender == pendingOwner);
    _;
  }

  /**
   * @dev Allows the current owner to set the pendingOwner address.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) onlyOwner {
    pendingOwner = newOwner;
  }

  /**
   * @dev Allows the pendingOwner address to finalize the transfer.
   */
  function claimOwnership() onlyPendingOwner {
    owner = pendingOwner;
    pendingOwner = 0x0;
  }
}











/**
 * @title ERC20Basic
 * @dev Simpler version of ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/179
 */
contract ERC20Basic {
  uint256 public totalSupply;
  function balanceOf(address who) constant returns (uint256);
  function transfer(address to, uint256 value) returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
}





/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
  function mul(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal constant returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal constant returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}




/**
 * @title Basic token
 * @dev Basic version of StandardToken, with no allowances. 
 */
contract BasicToken is ERC20Basic {
  using SafeMath for uint256;

  mapping(address => uint256) balances;

  /**
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) returns (bool) {
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    Transfer(msg.sender, _to, _value);
    return true;
  }

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of. 
  * @return An uint256 representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) constant returns (uint256 balance) {
    return balances[_owner];
  }

}








/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 is ERC20Basic {
  function allowance(address owner, address spender) constant returns (uint256);
  function transferFrom(address from, address to, uint256 value) returns (bool);
  function approve(address spender, uint256 value) returns (bool);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}




/**
 * @title Standard ERC20 token
 *
 * @dev Implementation of the basic standard token.
 * @dev https://github.com/ethereum/EIPs/issues/20
 * @dev Based on code by FirstBlood: https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 */
contract StandardToken is ERC20, BasicToken {

  mapping (address => mapping (address => uint256)) allowed;


  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amout of tokens to be transfered
   */
  function transferFrom(address _from, address _to, uint256 _value) returns (bool) {
    var _allowance = allowed[_from][msg.sender];

    // Check is not needed because sub(_allowance, _value) will already throw if this condition is not met
    // require (_value <= _allowance);

    balances[_to] = balances[_to].add(_value);
    balances[_from] = balances[_from].sub(_value);
    allowed[_from][msg.sender] = _allowance.sub(_value);
    Transfer(_from, _to, _value);
    return true;
  }

  /**
   * @dev Aprove the passed address to spend the specified amount of tokens on behalf of msg.sender.
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(address _spender, uint256 _value) returns (bool) {

    // To change the approve amount you first have to reduce the addresses`
    //  allowance to zero by calling `approve(_spender, 0)` if it is not
    //  already 0 to mitigate the race condition described here:
    //  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    require((_value == 0) || (allowed[msg.sender][_spender] == 0));

    allowed[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifing the amount of tokens still available for the spender.
   */
  function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
    return allowed[_owner][_spender];
  }

}



contract Abab is Ownable,Claimable,StandardToken {
  uint constant maxUInt = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
  uint constant error   = maxUInt;

  event log(string s);
  event logUint(string s, uint i);

  struct  Schedule {
    uint from;
    uint to;          // last day, when can I stay overnight
    uint dayPrice;
    uint weekPrice;
    uint monthPrice;
    uint currency;    // see Currencies array
  }

  enum BookingStatus { New, Agreed, Cancel, Complete } // TODO Complete? 

  struct  BookingRecord {
    address guest;
    uint from;
    uint to;
    uint totalCost;
    uint currency;
    uint ababCoinTotalCost;
    BookingStatus status;
  }

  struct Room {
    uint160 roomDescriptionHash;
    address partner;
    uint    partnerPPM;
    uint    minNightCount;
    uint    timeForBooking;    
    uint    schedulesLength;
    uint    bookingLength;
    mapping(uint => Schedule) schedules;
    mapping(uint => BookingRecord) booking;
  }

  mapping (address => Room[]) public rooms;

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

  event NewRoom    (address indexed host, uint roomIndex, uint160 _roomDescriptionHash);
  event UpdateRoom (address indexed host, uint roomIndex, uint160 _newRoomDescriptionHash);
  event DeleteRoom (address indexed host, uint roomIndex);  

  function UpsertRoomFromHost(
    uint    _roomIndex, 
    uint160 _roomDescriptionHash, 
    address _partner, 
    uint    _partnerPPM, 
    uint    _minNightCount,
    uint    _timeForBooking)
  public
  returns (uint roomIndex)
  {
    return UpsertRoom(_roomIndex, _roomDescriptionHash, msg.sender, _partner, _partnerPPM, _minNightCount, _timeForBooking);
  }

  function UpsertRoomFromPartner(
    uint    _roomIndex, 
    uint160 _roomDescriptionHash, 
    address _host, 
    uint    _partnerPPM,
    uint    _minNightCount,
    uint    _timeForBooking)
  public
  returns (uint roomIndex)
  {
    return UpsertRoom(_roomIndex, _roomDescriptionHash, _host, msg.sender, _partnerPPM, _minNightCount, _timeForBooking);
  }

  function UpsertRoom(
    uint    _roomIndex, 
    uint160 _roomDescriptionHash,
    address _host,
    address _partner,
    uint    _partnerPPM,
    uint    _minNightCount,
    uint    _timeForBooking)
  public
  returns (uint roomIndex)
  {
    if(_roomIndex>=rooms[_host].length) {
      var newRoomIndex = rooms[_host].push(  Room(_roomDescriptionHash, _partner, _partnerPPM, _minNightCount, _timeForBooking, 0, 0) )-1;
      NewRoom(msg.sender, newRoomIndex, _roomDescriptionHash);
      return newRoomIndex;
    }

    if((rooms[_host][_roomIndex].partner != msg.sender) && (_host != msg.sender) )
      return;

    rooms[_host][_roomIndex].roomDescriptionHash = _roomDescriptionHash;
    rooms[_host][_roomIndex].partner             = _partner;
    rooms[_host][_roomIndex].partnerPPM          = _partnerPPM;
    rooms[_host][_roomIndex].minNightCount       = _minNightCount;
    rooms[_host][_roomIndex].timeForBooking      = _timeForBooking;

    UpdateRoom(_host, _roomIndex, _roomDescriptionHash);
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

  function UpsertScheduleFromPartner(
    address _host, 
    uint _roomIndex, 
    uint _scheduleIndex, 
    uint _from, 
    uint _to,               // last day, when can I stay overnight
    uint _dayPrice, 
    uint _weekPrice, 
    uint _monthPrice, 
    uint _currency)
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

  function UpsertSchedule(
    uint _roomIndex, 
    uint _scheduleIndex, 
    uint _from, 
    uint _to,               // last day, when can I stay overnight
    uint _dayPrice, 
    uint _weekPrice, 
    uint _monthPrice, 
    uint _currency)
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

  function GetScheduleByIndex(address _host, uint _roomIndex, uint _index)
  public constant 
  returns(uint from, uint to, uint dayPrice, uint weekPrice, uint monthPrice) 
  {
      var s = rooms[_host][_roomIndex].schedules[_index];
      return (s.from, s.to, s.dayPrice, s.weekPrice, s.monthPrice);
  }

  function GetMyScheduleByIndex(uint _roomIndex, uint _index) 
  public constant 
  returns(uint from, uint to, uint dayPrice, uint weekPrice, uint monthPrice) 
  {
      return GetScheduleByIndex(msg.sender, _roomIndex, _index);
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

  event NewBooking    (address indexed host, uint roomIndex, uint bookingIndex);
  event UpdateBooking (address indexed host, uint roomIndex, uint bookingIndex);

  function GetDate(uint timestamp)
  public constant
  returns(uint result)
  {
    return timestamp/1 days;
  }

  function GetTime(uint datetime)
  public constant
  returns(uint result)
  {
    uint dayCount = datetime / 1 days;
    return datetime - 1 days * dayCount;
  }

  function DateIsFree(address _host, uint _roomIndex, uint _from, uint _to, uint nowDateTime)
  public constant
  returns(bool result)
  {
    var room = rooms[_host][_roomIndex];
    var nowDate = GetDate(nowDateTime);

    if ((_from + room.minNightCount) > _to) return false;
    if (_from < nowDate) return false;
    if ((_from == nowDate) && (nowDate >= room.timeForBooking)) return false;

    //check, that this date don't booking
    uint i = room.bookingLength;
    while(i>0) {
      --i;
      var booking_i = room.booking[i];
      if (booking_i.status > BookingStatus.Agreed)  continue;
      if (booking_i.to < nowDate) continue; 
      if (!((booking_i.from > _to)||(booking_i.to <= _from))) return false;
    }
    return true; 
  }

  function min(uint arg1, uint arg2, uint arg3)
  public 
  constant
  returns(uint result)
  {
    if((arg1<arg2)&&(arg1<arg3)) return arg1;
    if((arg2<arg1)&&(arg2<arg3)) return arg2;
    return arg3;
  }

  function CalcTotalCost(address _host, uint _roomIndex, uint _from, uint _to, uint _nowDateTime)
  public constant
  returns(uint totalCost)
  {
    totalCost = 0;

    //check, that this date don't booking
    if(!DateIsFree(_host, _roomIndex, _from, _to, _nowDateTime)) return 0;

    var room = rooms[_host][_roomIndex];

    var schedulesLength = rooms[_host][_roomIndex].schedulesLength;

    uint needFrom  = _from;
    uint nextFrom  = maxUInt;
    uint daysCount = _to-_from;

    // log2('needFrom=' ,needFrom);
    // log2('nextFrom=' ,nextFrom);
    // log2('daysCount=',daysCount);
    // log2('totalCost=',totalCost);

    uint i = schedulesLength;
    while(i>0){
      --i;
      var schedules_i = room.schedules[i];
      if ((schedules_i.from<=needFrom) && (schedules_i.to>needFrom)) {
        // log('==================');
        // log2('iiiiiiii= ', i);
        // log2('needFrom= ', needFrom);
        // log2('nextFrom= ', nextFrom);

        uint price = daysCount>=30 ? schedules_i.monthPrice : daysCount>=7 ? schedules_i.weekPrice : schedules_i.dayPrice;
        totalCost += price*(min( schedules_i.to, nextFrom, _to) - needFrom);
        needFrom = schedules_i.to<nextFrom ? schedules_i.to : nextFrom;

        // log('-----------------');
        // log2('price='   ,price);
        // log2('needFrom=' ,needFrom);
        // log2('totalCost=',totalCost);
        
        if(needFrom>=_to) return totalCost;
 
        //needFrom = nextFrom;
        nextFrom = _to;
        // log2('nextFrom set _to=' ,nextFrom);
        i = schedulesLength;
      } else {
        if ((schedules_i.from>needFrom)&&(schedules_i.from<nextFrom)){
          nextFrom = schedules_i.from;
          // log2('nextFrom set schedules_i.from =' ,nextFrom);
        }
      }
    }
    return 0;
  }

  function Booking(address _host, uint _roomIndex, uint _from, uint _to)
  public
  {
    if (_from < GetDate(now)) return;
    var room = rooms[_host][_roomIndex];

    uint totalCost = CalcTotalCost(_host, _roomIndex, _from, _to, now);
    if(totalCost>0) {
      NewBooking(_host, _roomIndex, room.bookingLength);
      room.booking[ room.bookingLength ] = BookingRecord(msg.sender, _from, _to, totalCost, 0, totalCost, BookingStatus.New);
      room.bookingLength = room.bookingLength + 1;
    }
  }

  function GetBookingLength(address _host, uint _roomIndex)
  public constant
  returns(uint result)
  {
    return rooms[_host][_roomIndex].bookingLength;
  }

  function GetBooking(address _host, uint _roomIndex, uint _bookingIndex)
  public constant
  returns(address guest, uint from, uint to, uint totalCost, uint currency, uint ababCoinTotalCost, BookingStatus status)
  {
    var b = rooms[_host][_roomIndex].booking[_bookingIndex];
    return (b.guest, b.from, b.to, b.totalCost, b.currency, b.ababCoinTotalCost, b.status);
  }

  function AgreeBooking(address _host, uint _roomIndex, uint _bookingIndex)
  public
  {
    if (_roomIndex >= rooms[_host].length)
      return;
    var room = rooms[_host][_roomIndex];
    if((room.partner != msg.sender) && (_host != msg.sender) )
      return;
    
    if (room.booking[_bookingIndex].status == BookingStatus.New){
      room.booking[_bookingIndex].status = BookingStatus.Agreed;
      UpdateBooking(_host, _roomIndex, _bookingIndex);
    }
  }

  function CancelBooking(address _host, uint _roomIndex, uint _bookingIndex)
  public
  {
    if (_roomIndex >= rooms[_host].length)
      return;
    var room = rooms[_host][_roomIndex];
    if((room.partner != msg.sender) && (_host != msg.sender) && (room.booking[_bookingIndex].guest != msg.sender) )
      return;
    
    if ((room.booking[_bookingIndex].status == BookingStatus.New) || (room.booking[_bookingIndex].status == BookingStatus.Agreed)){
      room.booking[_bookingIndex].status = BookingStatus.Cancel;
      UpdateBooking(_host, _roomIndex, _bookingIndex);
    }
  }
}
