import { bytesToStr, JsonRPCClient } from "@massalabs/massa-web3";
import { useEffect, useState } from "react";
import { MassaLogo } from "@massalabs/react-ui-kit";
import './App.css';

const sc_addr = "AS12rnGvYCFo2cE25XodFp6gqh8xdc5DWY62t1fLy2gtfjSSm7xV5"; // Update with your deployed contract address
const COUNTER_KEY = "counter_key";

function App() {
  const [counter, setCounter] = useState<string | null>(null);
  const client = JsonRPCClient.buildnet();

  // Poll for the counter value every 8 seconds for a timely update
  useEffect(() => {
    async function getCounter() {
      try {
        const dataStoreVal = await client.getDatastoreEntry(COUNTER_KEY, sc_addr, false);
        const counterDecoded = bytesToStr(dataStoreVal);
        setCounter(counterDecoded);
      } catch (error) {
        console.error("Error fetching counter:", error);
      }
    }

    // Initial fetch
    getCounter();
    // Set polling interval
    const interval = setInterval(getCounter, 1000);

    return () => clearInterval(interval);
  }, [client]);

  return (
    <div className="App">
      <MassaLogo className="logo" size={100} />
      <h2>Autonomous Counter</h2>
      <h1>{counter ?? "Loading counter..."}</h1>
      <p>The counter increases by 1 every 16 seconds until it reaches 20.</p>
    </div>
  );
}

export default App;
