pragma solidity ^0.4.11;

contract Abab {
	// TODO compare gas price for diffrent roomID types	
	struct  Schedule {
		uint from;
		uint to;
		uint dayPrice;
		uint weekPrice;
		uint monthPrice;
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
	
	function UpsertRoom(uint _roomIndex, uint160 _roomDescriptionHash, address partner, uint partnerPPM)
    public
	returns (uint roomIndex)
	{
	    if(_roomIndex>=rooms[msg.sender].length) {
			var newRoomIndex = rooms[msg.sender].push(Room(_roomDescriptionHash, partner, partnerPPM, 0))-1;
			NewRoom(msg.sender, newRoomIndex, _roomDescriptionHash);
			return newRoomIndex;
		}
		
		rooms[msg.sender][_roomIndex].roomDescriptionHash = _roomDescriptionHash;
		UpdateRoom(msg.sender, _roomIndex, _roomDescriptionHash);
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
	
	function UpsertSchedule(uint _roomIndex, uint _from, uint _to, uint _dayPrice, uint _weekPrice, uint _monthPrice) 
	public
	{
	    var schedule = Schedule(_from, _to, _dayPrice, _weekPrice, _monthPrice);
	    
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
	
	uint constant maxUInt = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
	
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
	
	function test() 
	public
	returns(uint from) 
	{
	    UpsertRoom(0,0,0,0);

        uint _roomIndex = 0;
        uint _from = 1;
        uint _to = 1;
        uint _dayPrice = 1;
        uint _weekPrice = 1;
        uint _monthPrice = 1;

	    var schedule = Schedule(_from, _to, _dayPrice, _weekPrice, _monthPrice);
	    
        var room = rooms[msg.sender][_roomIndex];

		room.schedules[0] = schedule;
        room.schedulesLength++;


	   // return rooms[msg.sender][0].schedules[0].from = 1;
	    return rooms[msg.sender][0].schedules[0].from;
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