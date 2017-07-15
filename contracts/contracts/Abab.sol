pragma solidity ^0.4.4;

contract Abab {
	// TODO compare gas price for diffrent roomID types	
	struct Schedule {
		uint from;
		uint to;
		uint dayPrice;
		uint weekPrice;
		uint monthPrice;
    }

    struct Room {
        uint160 roomDescriptionHash;
        mapping(uint => Schedule[]) schedules;  // uint key is from
    }
	
	mapping (address => Room[]) rooms;

	function UpsertRoom(uint _roomIndex, uint160 _roomDescriptionHash)
	returns (uint roomIndex)
	{
	    if(_roomIndex>=rooms[msg.sender].length)
			return rooms[msg.sender].push(Room(_roomDescriptionHash))-1;
		
		rooms[msg.sender][_roomIndex].roomDescriptionHash = _roomDescriptionHash;
		return _roomIndex;
	}

	function GetRoomsCount()returns (uint count){
		return rooms[msg.sender].length;
	}
	
	function GetDescriptionHash(uint _roomIndex)
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

	// function UpsertSchedule(uint _roomID, uint _from, uint _to, uint _dayPrice, uint _weekPrice, uint _monthPrice)
	// returns (bool success) 
	// {
		// rooms[msg.sender][_roomID][_from] = Schedule(_roomID, _from, _to, _dayPrice, _weekPrice, _monthPrice);
		// return true;
	// }
	
	// function RemoveSchedule(uint _roomID, uint _from)
	// returns (bool success) 
	// {
		// rooms[msg.sender][_roomID][_from] = 0;
		// return true;
	// }
}