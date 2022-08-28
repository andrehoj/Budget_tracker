//variable to hold db connection
let db;

//"open()" creates a connection to the index db database
//creates a "event listner for the database"
let request = indexedDB.open("budget_tracker", 1);

//handles a change event
//any time you connect or the version number changes onpugradeneeded will fire
request.onupgradeneeded = function (event) {
  //reference to the database
  const db = event.target.result;
  // create an object store (table or collection) called `new_transaction`, set it to have an auto incrementing primary key
  db.createObjectStore("new_transaction", { autoIncrement: true });
};

// upon a successful
request.onsuccess = function (event) {
  // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
  db = event.target.result;

  // check if app is online, if yes run uploadTransaction() function to send all local db data to api
  if (navigator.onLine) {
    // we haven't created this yet, but we will soon, so let's comment it out for now
    uploadTransaction();
  }
};

request.onerror = function (event) {
  // log error here
};

// This function will be executed if we attempt to submit a new pizza and there's no internet connection
function saveRecord(record) {
  // open a new transaction with the database with read and write permissions
  const transaction = db.transaction("new_transaction", "readwrite");

  // access the object store for `new_transaction`
  const transactionObjectStore = transaction.objectStore("new_transaction");

  // add record to your store with add method
  transactionObjectStore.add(record);
}

function uploadTransaction() {
  // open a transaction on your pending db
  const transaction = db.transaction(["new_transaction"], "readwrite");

  // access your pending object store
  const transactionObjectStore = transaction.objectStore("new_transaction");

  // get all records from store and set to a variable
  const getAll = transactionObjectStore.getAll();

  getAll.onsuccess = function () {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(["new_transaction"], "readwrite");
          const transactionObjectStore =
            transaction.objectStore("new_transaction");
          // clear all items in your store
          transactionObjectStore.clear();
        })
        .catch((err) => {
          // set reference to redirect back here
        });
    }
  };
}
// listen for app coming back online
window.addEventListener("online", uploadTransaction);
