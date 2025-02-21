import { bytesToStr, JsonRPCClient, SmartContract, Args } from "@massalabs/massa-web3";
import { getWallets } from "@massalabs/wallet-provider";
import { useEffect, useState } from "react";
import { MassaLogo } from "@massalabs/react-ui-kit";
import './App.css';

const sc_addr = "AS12Rd2iMMENY17PAZFQ3bQev8htv83jMiQ6hQVtUWN6FffY62kAT"; // Your contract address
const COUNTER_KEY = "counter_key";

function App() {
  const [counter, setCounter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [wallet, setWallet] = useState<any>(null); // Wallet instance
  const [accounts, setAccounts] = useState<string[]>([]); // Wallet accounts
  const client = JsonRPCClient.buildnet();

  // Fetch counter value periodically
  useEffect(() => {
    async function getCounter() {
      try {
        // Correct parameter order: (key, address, isFinal)
        const dataStoreVal = await client.getDatastoreEntry(COUNTER_KEY, sc_addr, false);
        if (dataStoreVal && dataStoreVal.length > 0) {
          const counterValue = bytesToStr(dataStoreVal);
          setCounter(counterValue);
        } else {
          setCounter(null); // Counter not initialized
        }
      } catch (error) {
        console.error("Error fetching counter:", error);
        setCounter(null);
      }
    }

    getCounter();
    const interval = setInterval(getCounter, 1000);
    return () => clearInterval(interval);
  }, []);

  // Connect wallet
  async function connectWallet() {
    try {
      const wallets = await getWallets();
      if (wallets.length === 0) {
        alert("No wallets found. Please install Massa Station or Bearby.");
        return;
      }

      // Use the first available wallet
      const wallet = wallets[0];
      const connected = await wallet.connect();
      if (!connected) {
        alert("Failed to connect to wallet");
        return;
      }

      // Get accounts
      const accounts = await wallet.accounts();
      setAccounts(accounts);
      setWallet(wallet);

      console.log("Connected to wallet:", wallet.name());
      console.log("Accounts:", accounts);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  }

  // Function to start the counter
  async function handleStartCounter() {
    if (!wallet || accounts.length === 0) {
      alert("Please connect wallet first");
      return;
    }

    setIsLoading(true);
    try {
      const provider = accounts[0]; // Use the first account as the provider
      const contract = new SmartContract(provider, sc_addr);
      const operation = await contract.call('startCounter', new Args());
      await operation.waitFinalExecution();
      console.log("Counter started!");
    } catch (error) {
      console.error("Error starting counter:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="App">
      <MassaLogo className="logo" size={100} />
      <h2>Autonomous Counter</h2>
      <h1>{counter !== null ? `Counter: ${counter}` : "Counter not started"}</h1>
      <p>The counter increases by 1 every 16 seconds until it reaches 20.</p>

      {!wallet && (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}

      {wallet && (
        <button 
          onClick={handleStartCounter}
          disabled={counter !== null || isLoading}
        >
          {isLoading ? "Starting..." : (counter !== null ? "Counter Running" : "Start Counter")}
        </button>
      )}
    </div>
  );
}

export default App;