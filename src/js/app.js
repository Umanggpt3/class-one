// Upon refresh of page the following happing in order:
//1. initWeb3();
//2. initContract();
//3. getContractProperties();
//4. displayMyAccountInfo();

App = {

  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      App.web3Provider = web3.currentProvider;
      App.setStatus("MetaMask detected");
    } else {
      // set the provider you want from Web3.providers
      alert("Error: Please install MetaMask then refresh the page.")
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      return null;
    }

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your account, please try again later.");
        return;
      }
      account = accs[0];
      if (!account) {
        App.setStatus("Please login to MetaMask");
        alert("Could not fetch your account. Make sure you are logged in to MetaMask, then refresh the page.");
        return;
      }
      return App.initContract();
    });
  },

  initContract: function() {
    $.getJSON('ChatWei.json', function(ChatWeiArtifact) {
      // Get the necessary contract artifact file and use it to instantiate a truffle contract abstraction.
      App.contracts.ChatWei = TruffleContract(ChatWeiArtifact);
      // Set the provider for our contract.
      App.contracts.ChatWei.setProvider(App.web3Provider);
      return App.getContractProperties();
    });
  },

  getContractProperties: function() {
    var self = this;
    var meta;
    App.contracts.ChatWei.deployed().then(function(instance) {
      meta = instance;
      return meta.getContractProperties.call({from: account});
    }).then(function(value) {
      var networkAddress = App.contracts.ChatWei.address;
      document.getElementById("contractAddress").innerHTML = networkAddress;
      var by = value[0];
      var registeredUsersAddress = value[1];
      var numRegisteredUsers = registeredUsersAddress.length;
      var select = '';
      for (i = 0; i < numRegisteredUsers; i++) {
        select += '<option val=' + i + '>' + registeredUsersAddress[i] + '</option>';
      }
      $('#registeredUsersAddressMenu').html(select);
      document.getElementById("contractOwner").innerHTML = by;
    }).catch(function(e) {
      console.log(e);
      self.setStatus("");
    });
    return App.displayMyAccountInfo();
  },

  displayMyAccountInfo: function() {
    web3.eth.getAccounts(function(err, account) {
      if (err === null) {
        App.account = account;
        document.getElementById("myAddress").innerHTML = account;
        web3.eth.getBalance(account[0], function(err, balance) {
          if (err === null) {
            if (balance == 0) {
              alert("Your account has zero balance. You must transfer some Ether to your MetaMask account to be able to send messages with ChatWei. Just come back and refresh this page once you have transferred some funds.");
              App.setStatus("Please buy more Ether");
              return;
            } else {
              document.getElementById("myBalance").innerHTML = web3.fromWei(balance, "ether").toNumber() + " Ether";
              return App.checkUserRegistration();
            }
          } else {
            console.log(err);
          }
        });
      }
    });
    return null;
  },

  setStatus: function(message) {
    document.getElementById("status").innerHTML = message;
  },

  //todo
  checkUserRegistration: function() {},

  //todo
  copyAddressToSend: function() {}
};

$(document).ready(function() {
  App.init();
});
