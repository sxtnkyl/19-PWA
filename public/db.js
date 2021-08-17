//initialize indexedDB
const indexedDB = window.indexedDB;
const request = indexedDB.open("tempBudget", 1);
let db;

//create object store
request.onupgradeneeded = ({ target }) => {
  db = target.result;
  db.createObjectStore("tempBudget", { autoIncrement: true });
};

//after create store, check if offline
request.onsuccess = ({ target }) => {
  db = target.result;

  if (navigator.onLine) {
    console.log("Backend online! 🗄️");
    checkDatabase();
  }
};

request.onerror = function (e) {
  console.log(`Woops! ${e.target.errorCode}`);
};

const saveRecord = (record) => {
  // Create a transaction on the BudgetStore db with readwrite access
  const transaction = db.transaction(["tempBudget"], "readwrite");
  // Access your BudgetStore object store
  const store = transaction.objectStore("tempBudget");

  // Add record to your store with add method.
  store.add(record);
};

const checkDatabase = () => {
  const transaction = db.transaction(["tempBudget"], "readwrite");
  const store = transaction.objectStore("tempBudget");
  const getAll = store.getAll();

  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((res) => {
          // delete records
          const transaction = db.transaction(["tempBudget"], "readwrite");
          const store = transaction.objectStore("tempBudget");
          store.clear();
        });
    }
  };
};

window.addEventListener("online", checkDatabase);
