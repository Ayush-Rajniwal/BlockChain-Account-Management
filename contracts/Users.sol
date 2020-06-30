pragma solidity ^0.5.0;

contract Users {
    uint256 public totalUsers = 0;

    mapping(address => User) user;
    mapping(uint256 => address) indexToUser;

    enum Gender {Male, Female}

    struct Address {
        string line1;
        string line2;
        string city;
        string state;
        string pincode;
    }

    struct User {
        address id;
        string firstName;
        string lastName;
        uint256 age;
        uint256 amount;
        Gender gender;
        Address adr;
    }

    //"Ayush","Rajniwal",18,0,"x","y","z","a","b"

    function createUser(
        string memory _firstName,
        string memory _lastName,
        uint256 _age,
        Gender _gender,
        string memory _line1,
        string memory _line2,
        string memory _city,
        string memory _state,
        string memory _pincode
    ) public {
        if (user[msg.sender].age != 0) return; //if user already exist then return
        totalUsers++;

        indexToUser[totalUsers] = msg.sender;

        Address memory temp = Users.Address(
            _line1,
            _line2,
            _city,
            _state,
            _pincode
        );
        user[msg.sender] = User(
            msg.sender,
            _firstName,
            _lastName,
            _age,
            0, //Inital Amount in a User's Account
            _gender,
            temp
        );
    }

    function getUserById_BasicDetails(uint256 id)
        public
        view
        returns (
            string memory,
            string memory,
            uint256,
            Gender
        )
    {
        return (
            user[indexToUser[id]].firstName,
            user[indexToUser[id]].lastName,
            user[indexToUser[id]].age,
            user[indexToUser[id]].gender
        );
    }

    function getUserById_Address(uint256 id)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            string memory
        )
    {
        return (
            user[indexToUser[id]].adr.line1,
            user[indexToUser[id]].adr.line2,
            user[indexToUser[id]].adr.city,
            user[indexToUser[id]].adr.state,
            user[indexToUser[id]].adr.pincode
        );
    }

    function getUser(address index)
        public
        view
        returns (
            string memory,
            string memory,
            uint256,
            address
        )
    {
        return (
            user[index].firstName,
            user[index].lastName,
            user[index].amount,
            user[index].id
        );
    }

    function modifyUser(
        string memory _firstName,
        string memory _lastName,
        uint256 _age,
        Gender _gender,
        string memory _line1,
        string memory _line2,
        string memory _city,
        string memory _state,
        string memory _pincode
    ) public {
        //Update data
        user[msg.sender].firstName = _firstName;
        user[msg.sender].lastName = _lastName;
        user[msg.sender].age = _age;
        user[msg.sender].gender = _gender;
        user[msg.sender].adr.line1 = _line1;
        user[msg.sender].adr.line2 = _line2;
        user[msg.sender].adr.city = _city;
        user[msg.sender].adr.state = _state;
        user[msg.sender].adr.pincode = _pincode;
    }

    function withdraw(uint256 amount) public {
        require(amount <= user[msg.sender].amount, "Insufficent Balance Bro!!");
        user[msg.sender].amount -= amount;
        msg.sender.transfer(amount);
    }

    function depositSelf(uint256 amount) public payable {
        require(msg.value == amount, "Invalid Request");
        user[msg.sender].amount += amount;
    }

    function depositToOther(address payable to, uint256 amount) public payable {
        require(msg.value == amount, "Invalid Request");
        to.transfer(msg.value);
    }

    function getBalance() public view returns (uint256) {
        return user[msg.sender].amount;
    }
}
