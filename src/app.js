App = {
  loading: false,
  contracts: {},
  accountsList: [],
  totalUsers: 0,

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.getTotalUser()

  },

  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */ })
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */ })
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0];

    //Set account value to modal
    $($('.account')[0]).html(App.account)
    $($('.account')[1]).html(App.account)

    //Event for Account change in metamask
    window.ethereum.on('accountsChanged', function (accounts) {
      App.account = web3.eth.accounts[0];

      //Set account value to modal
      $($('.account')[0]).html(App.account)
      $($('.account')[1]).html(App.account)

      console.log("Account changed");
    })
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const users = await $.getJSON('Users.json')
    App.contracts.Users = TruffleContract(users)
    App.contracts.Users.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.users = await App.contracts.Users.deployed()
  },

  createUser: async (firstName, lastName, age, gender, line1, line2, city, state, pincode) => {
    await App.users.createUser(firstName, lastName, age, gender, line1, line2, city, state, pincode);
    window.location.reload()
  },

  modifyUser: async (firstName, lastName, age, gender, line1, line2, city, state, pincode) => {
    await App.users.modifyUser(firstName, lastName, age, gender, line1, line2, city, state, pincode);
    window.location.reload()
  },

  depositSelf: async (value) => {

    await App.users.depositSelf(value, { value: value })
      .then(x => {
        console.log(x);
        alert("Ether Added to Smart Contract");
        $('#depositModal').modal('toggle');
      })
      .catch(err => {
        console.log(err);
        alert("Transaction falied !!");
        $('#depositModal').modal('toggle');
      });
  },

  depositToOther: async (destination, value) => {
    console.log(value);

    App.users.depositToOther(destination, value, { value: value })
      .then(x => {
        console.log(x);
        alert("Transfer Successfully");
        $('#depositModal').modal('toggle');
      })
      .catch(err => {
        console.log(err);
        alert("Transfer falied !!");
        $('#depositModal').modal('toggle');
      });
  },

  getTotalUser: async () => {
    await App.users.totalUsers().then((num) => {
      App.totalUsers = num.c[0]
      console.log(num.c[0]);
      $('#totalUsers').html(num.c[0]);
    }).then(async () => {
      await App.getAllUserData()
    })
  },

  getAllUserData: async () => {
    for (let i = 1; i <= App.totalUsers; i++) {
      let myUser = {
        firstName: '',
        lastName: '',
        age: 0,
        gender: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: ''
      }
      await App.users.getUserById_BasicDetails(i).then((x) => {
        myUser.firstName = x[0]
        myUser.lastName = x[1]
        myUser.age = x[2].toNumber()
        myUser.gender = x[3].toNumber() == 0 ? 'Male' : 'Female';
        //console.log(myUser);
      })

      await App.users.getUserById_Address(i).then((x) => {
        console.log(x);

        myUser.line1 = x[0]
        myUser.line2 = x[1]
        myUser.city = x[2]
        myUser.state = x[3]
        myUser.pincode = x[4]
        //  console.log(myUser);
      })

      App.accountsList.push(myUser);
      App.addDataToTable();
    }
  },

  addDataToTable: () => {
    var table = new Tabulator("#example", {
      data: App.accountsList,           //load row data from array
      layout: "fitColumns",      //fit columns to width of table
      movableColumns: true,      //allow column order to be changed
      resizableRows: true,       //allow row order to be changed
      columns: [                 //define the table columns
        { title: "FirstName", field: "firstName" },
        { title: "Last Name", field: "lastName" },
        { title: "Age", field: "age" },
        { title: "Gender", field: "gender" },
        { title: "Line 1", field: "line1" },
        { title: "Line 2", field: "line2" },
        { title: "City", field: "city" },
        { title: "State", field: "state" },
        { title: "Pincode", field: "pincode" }
      ],
    });
  },

  validation: (firstName, lastName, age, gender, line1, line2, city, state, pincode) => {
    if (firstName.length === 0 || lastName.length === 0 || age <= 0 || line1.length === 0, line2.length === 0 || city.length === 0 || state.length === 0 || pincode <= 0)
      return false;
    return true;
  },

  getBalance: async () => {
    await App.users.getBalance().then((val) => {
      $('#bal').html(window.web3.fromWei(val.toNumber(), "ether"));
    })
  },

  witdraw: async (val) => {
    await App.users.withdraw(window.web3.toWei(val, "ether"))
      .then(x => {
        console.log(x);
        alert("Successfuly withdraw")
      })
      .catch(err => {
        console.log(err);
        alert("Some Error occured");
      })
  }

}

//We start from here
$(() => {
  $(window).load(() => {
    App.load();
    $('form#reg').submit((event) => {
      event.preventDefault();

      console.log("Form was clicked");
      let firstName = $('#firstName').val();
      let lastName = $('#lastName').val();
      let age = parseInt($('#age').val());
      let gender = $('#gender').val() === 'Male' ? 0 : 1;
      let line1 = $('#line1').val();
      let line2 = $('#line2').val();
      let city = $('#city').val();
      let state = $('#state').val();
      let pincode = $('#pincode').val();

      //Validate input
      if (!App.validation(firstName, lastName, age, gender, line1, line2, city, state, pincode)) {
        alert("Some Values are incorrect. Please Check!!");
        return;
      }

      //send data to createUser
      App.createUser(firstName, lastName, age, gender, line1, line2, city, state, pincode);
      console.log(firstName, lastName, age, gender, line1, line2, city, state, pincode);

      //close modal manually
      $('#regModal').modal('toggle');

    })


    //Modification Modal Submit Handler
    $('form#mod').submit((event) => {
      event.preventDefault();

      console.log("Form was clicked");
      let firstName = $('#firstName_m').val();
      let lastName = $('#lastName_m').val();
      let age = parseInt($('#age_m').val());
      let gender = $('#gender_m').val() === 'Male' ? 0 : 1;
      let line1 = $('#line1_m').val();
      let line2 = $('#line2_m').val();
      let city = $('#city_m').val();
      let state = $('#state_m').val();
      let pincode = $('#pincode_m').val();

      //Validate input
      if (!App.validation(firstName, lastName, age, gender, line1, line2, city, state, pincode)) {
        alert("Some Values are incorrect. Please Check!!");
        return;
      }

      //send data to createUser
      App.modifyUser(firstName, lastName, age, gender, line1, line2, city, state, pincode);
      console.log(firstName, lastName, age, gender, line1, line2, city, state, pincode);

      //close modal manually
      $('#modModal').modal('toggle');

    })

    //Deposit to another account handler
    $('#depOth').click(() => {
      let destination = $('#destAdr').val();
      let value = window.web3.toWei(parseInt($('#valToTra').val(), "ether"));
      App.depositToOther(destination, value);

    })

    //Deposit to smart contract 
    $('#depSelf').click(() => {
      let value = window.web3.toWei(parseInt($('#valToTra').val(), "ether"));
      App.depositSelf(value);
    })

    //fetch balance
    $('#chBal').click(() => {
      App.getBalance();
    })

    //Withdraw Button
    $('#btnWithdraw').click(() => {
      let amt = $('#amtToWit').val();
      App.witdraw(amt);
    })

  })
})
