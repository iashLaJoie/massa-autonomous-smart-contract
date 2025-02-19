# Massa Boilerplate: React + TypeScript + Vite

Welcome to the frontend Massa Boilerplate! This project serves as a starting point for building decentralized applications with Massa.

## Getting Started

1. **Clone the repository**:
  ```sh
  git clone https://github.com/massalabs/react-boilerplate.git
  cd massa-boilerplate
  ```

2. **Install dependencies**:
  ```sh
  npm install
  ```

3. **Start the development server**:
  ```sh
  npm run dev
  ```

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the project for production.
- `npm run lint`: Run linter.

## Contributing

We welcome contributions!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

Happy coding!

----------------------------

import { bytesToStr, JsonRPCClient } from "@massalabs/massa-web3";
import { useEffect, useState } from "react";
import { MassaLogo } from "@massalabs/react-ui-kit";
import './App.css';

const sc_addr = "AS1AfsfKbiYVHtgciDn73U1VdFRFeji1gf4RJKGAomBdjZBjQicN"; // TODO Update with your deployed contract address

/**
 * The key used to store the greeting in the smart contract
 */
const GREETING_KEY = "greeting_key";

/**
 * App component that handles interactions with a Massa smart contract
 * @returns The rendered component
 */
function App() {

  const [greeting, setGreeting] = useState<string | null>(null);

    /**
   * Initialize the web3 client
   */
  const client = JsonRPCClient.buildnet()

  /**
   * Fetch the greeting when the web3 client is initialized
   */
  useEffect(() => {
    getGreeting();
  });

  /**
   * Function to get the current greeting from the smart contract
   */
  async function getGreeting() {
    if (client) {
      const dataStoreVal = await client.getDatastoreEntry(GREETING_KEY, sc_addr, false)
      const greetingDecoded = bytesToStr(dataStoreVal);
      setGreeting(greetingDecoded);
    }
  }

  return (
    <>
    <div>
     <MassaLogo className="logo" size={100}/>
     <h2>Greeting message:</h2>
     <h1>{greeting}</h1>
     </div>
    </>
  );
}

export default App;
