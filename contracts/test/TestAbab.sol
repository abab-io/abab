pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Abab.sol";

contract TestAbab {
	function testUpsertRoom_InsertUpdateLogic() {		
		Abab abab = Abab(DeployedAddresses.Abab());
		
		// rooms hash: clear array
		Assert.equal( abab.UpsertRoom(0,0), 0, "first execute - insert record number 0");
		// rooms hash: 0
		Assert.isTrue(abab.GetDescriptionHash(0)==0, "check DescriptionHash after insert");
		
		Assert.equal( abab.UpsertRoom(0,1), 0, "update record number 0");
		// rooms hash: 1
		Assert.isTrue( abab.GetDescriptionHash(0)==1, "check DescriptionHash after update");

		Assert.equal( abab.UpsertRoom(777,2), 1, "add record number 1");
		// rooms hash: 1, 2
		Assert.isTrue( abab.GetDescriptionHash(0)==1, "check DescriptionHash after update");
		Assert.isTrue( abab.GetDescriptionHash(1)==2, "check DescriptionHash after update");

		Assert.equal( abab.UpsertRoom(0,3), 0, "update zero record");
		// rooms hash: 3, 2
		Assert.isTrue( abab.GetDescriptionHash(0)==3, "check DescriptionHash after update");
		Assert.isTrue( abab.GetDescriptionHash(1)==2, "check DescriptionHash after update");

		Assert.equal( abab.UpsertRoom(777,4), 2, "add record 2");
		// rooms hash: 3, 2, 4
		Assert.isTrue( abab.GetDescriptionHash(0)==3, "check DescriptionHash after update");
		Assert.isTrue( abab.GetDescriptionHash(1)==2, "check DescriptionHash after update");
		Assert.isTrue( abab.GetDescriptionHash(2)==4, "check DescriptionHash after update");
		
		Assert.equal( abab.UpsertRoom(1,5), 1, "update central value");
		// rooms hash: 3, 5, 4
		Assert.isTrue( abab.GetDescriptionHash(0)==3, "check DescriptionHash after update");
		Assert.isTrue( abab.GetDescriptionHash(1)==5, "check DescriptionHash after update");
		Assert.isTrue( abab.GetDescriptionHash(2)==4, "check DescriptionHash after update");

		// rooms hash: 3, 5, 4, 0xffffffffffffffffffff
		Assert.equal( abab.UpsertRoom(3, 0xffffffffffffffffffff), 3, "insert full uint20");
		Assert.isTrue( abab.GetDescriptionHash(3)==0xffffffffffffffffffff, "check insert for 0xffffffffffffffffffff");
		
		Assert.equal( abab.GetRoomsCount(), 4, "check RoomsCount");
	}	
	
	function testRemoveRoom() {
		Abab abab = Abab(DeployedAddresses.Abab());

		// prepare test data - Remove unnecessary elements
		while(abab.GetRoomsCount()>10)
			abab.RemoveRoom(10);
		// prepare test data - set DescriptionHash = index
		for(var i = 0; i<10;++i)
			abab.UpsertRoom(i, i);

		// rooms hash: 0,1,2,3,4,5,6,7,8,9
		abab.RemoveRoom(0);
		// rooms hash: 1,2,3,4,5,6,7,8,9
		Assert.isTrue(abab.GetDescriptionHash(0)==1, "check remove zero element");
			
		// rooms hash: 1,2,3,4,5,6,7,8,9
		abab.RemoveRoom(4);
		// rooms hash: 1,2,3,4,6,7,8,9
		Assert.isTrue(abab.GetDescriptionHash(3)==4, "check remove central element");
		Assert.isTrue(abab.GetDescriptionHash(4)==6, "check remove central element");

		// rooms hash: 1,2,3,4,6,7,8,9
		abab.RemoveRoom(7);
		// rooms hash: 1,2,3,4,6,7,8
		Assert.isTrue(abab.GetDescriptionHash(6)==8, "check remove last element");
		Assert.equal(abab.GetRoomsCount(),7, "check remove last element");
	}
}