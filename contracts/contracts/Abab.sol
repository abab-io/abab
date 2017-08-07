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
		uint	partnerPPM;
		uint	schedulesLength;
		mapping(uint => Schedule) schedules;
	}
	
	mapping (address => Room[]) public rooms;	

	event NewRoom    (address indexed host, uint roomIndex, uint160 _roomDescriptionHash);
	event UpdateRoom (address indexed host, uint roomIndex, uint160 _newRoomDescriptionHash);
	event DeleteRoom (address indexed host, uint roomIndex);	

	function UpsertRoomFromHost(uint _roomIndex, uint160 _roomDescriptionHash, address partner, uint partnerPPM)
	public
	returns (uint roomIndex)
	{
		return UpsertRoom(_roomIndex, _roomDescriptionHash, msg.sender, partner, partnerPPM);
	}

	function UpsertRoomFromPartner(uint _roomIndex, uint160 _roomDescriptionHash, address host, uint partnerPPM)
	public
	returns (uint roomIndex)
	{
		return UpsertRoom(_roomIndex, _roomDescriptionHash, host, msg.sender, partnerPPM);
	}

	function UpsertRoom(uint _roomIndex, uint160 _roomDescriptionHash, address host, address partner, uint partnerPPM)
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
	returns (uint count){
		return rooms[msg.sender].length;
	}

	function GetDescriptionHash(uint _roomIndex)
	public constant
	returns (uint160 DescriptionHash) 
	{
		return rooms[msg.sender][_roomIndex].roomDescriptionHash;
	}

	function RemoveRoom(uint _roomIndex) 
	public
	{
		if (_roomIndex >= rooms[msg.sender].length) return;

		for (uint i = _roomIndex; i<rooms[msg.sender].length-1; i++)
			rooms[msg.sender][i] = rooms[msg.sender][i+1];
		
		rooms[msg.sender].length--;
		
		DeleteRoom(msg.sender, _roomIndex);
	}

	event NewSchedule    (address indexed host, uint roomIndex, uint from);
	event UpdateSchedule (address indexed host, uint roomIndex, uint from);
	event DeleteSchedule (address indexed host, uint roomIndex, uint from);	

	function UpsertSchedule(uint _roomIndex, uint _from, uint _to, uint _dayPrice, uint _weekPrice, uint _monthPrice, uint _currency)
	public
	{
		var schedule = Schedule(_from, _to, _dayPrice, _weekPrice, _monthPrice, _currency);
		
		var room = rooms[msg.sender][_roomIndex];
		var schedulesLength = room.schedulesLength;

		//exist?
		for(uint i=0;i<schedulesLength;++i)
			if(room.schedules[i].from == _from) {
				// update
				room.schedules[i] = schedule;
				UpdateSchedule (msg.sender, _roomIndex, _from);
				return;
			}

		//insert
		room.schedules[schedulesLength] = schedule;
		room.schedulesLength = schedulesLength + 1;
		NewSchedule(msg.sender, _roomIndex, _from);
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

	function RemoveSchedule(uint _roomIndex, uint _from)
	public
	{
		var length = rooms[msg.sender][_roomIndex].schedulesLength;
		uint index = maxUInt;
		for(uint i=0; i<length; ++i)
			if(rooms[msg.sender][_roomIndex].schedules[i].from == _from) 
				index = i;
		
		if (index == maxUInt) return; // not found
		
		length = length-1;
		for (; index<length; index++)
			rooms[msg.sender][_roomIndex].schedules[index] = rooms[msg.sender][_roomIndex].schedules[index+1];
		
		rooms[msg.sender][_roomIndex].schedulesLength = length;
		DeleteSchedule(msg.sender,_roomIndex, _from);
	}
}