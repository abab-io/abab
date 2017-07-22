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
        uint schedulesLength;
        mapping(uint => Schedule) schedules;
        //uint[] schedulesFrom;  // storage! -don't worry  https://github.com/ethereum/solidity/issues/2549
    }
	
	mapping (address => Room[]) public rooms;

	function UpsertRoom(uint _roomIndex, uint160 _roomDescriptionHash)
	returns (uint roomIndex)
	{
	    if(_roomIndex>=rooms[msg.sender].length)
			return rooms[msg.sender].push(Room(_roomDescriptionHash, 0))-1;
		
		rooms[msg.sender][_roomIndex].roomDescriptionHash = _roomDescriptionHash;
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

	function RemoveRoom(uint _roomIndex) {
		if (_roomIndex >= rooms[msg.sender].length) return;

        for (uint i = _roomIndex; i<rooms[msg.sender].length-1; i++)
            rooms[msg.sender][i] = rooms[msg.sender][i+1];
        
        rooms[msg.sender].length--;
	}

	function UpsertSchedule(uint _roomIndex, uint _from, uint _to, uint _dayPrice, uint _weekPrice, uint _monthPrice) {
	    var schedule = Schedule(_from, _to, _dayPrice, _weekPrice, _monthPrice);
	    
	    //exist?
	    for(uint i=0;i<rooms[msg.sender][_roomIndex].schedulesLength;++i)
	        if(rooms[msg.sender][_roomIndex].schedules[i].from == _from) {
	            // update
	            rooms[msg.sender][_roomIndex].schedules[i] = schedule;
	            return;
	        }

        //insert
		rooms[msg.sender][_roomIndex].schedules[_from] = schedule;
        rooms[msg.sender][_roomIndex].schedulesLength++;
	}
	
	uint constant error = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
	
	function GetScheduleIndex(uint _roomIndex, uint _from)
    public constant 
    returns (uint index) 
	{
        for(uint i=0; i<rooms[msg.sender][_roomIndex].schedulesLength; ++i)
            if(rooms[msg.sender][_roomIndex].schedules[i].from == _from) 
                return i;
        return error;
	}
	
	function GetSchedulesLength(uint _roomIndex) 
	public constant 
	returns(uint length) 
	{
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
	{
	    uint index = error;
	    for(uint i=0; i<rooms[msg.sender][_roomIndex].schedulesLength; ++i)
	        if(rooms[msg.sender][_roomIndex].schedules[i].from == _from) 
	            index = i;
	    
	    if (index == error) return;
	    
        for (; index<rooms[msg.sender][_roomIndex].schedulesLength-1; index++)
            rooms[msg.sender][_roomIndex].schedules[index] = rooms[msg.sender][_roomIndex].schedules[index+1];
        
        rooms[msg.sender][_roomIndex].schedulesLength--;
	}
}