import { generateEvent, Storage, Context, sendMessage } from '@massalabs/massa-as-sdk';
import { currentPeriod } from '@massalabs/massa-as-sdk/assembly/std/context';



const COUNTER_KEY = "counter_key";
const MAX_COUNTER: u64 = 20;

/**
 * The constructor is only called when the contract is deployed.
 * It no longer initializes the counter automatically.
 */
export function constructor(_: StaticArray<u8>): void {
  assert(Context.isDeployingContract(), "Constructor can only be called during deployment");
  // Removed counter initialization from constructor
}

/**
 * Starts the counter if it hasn't been initialized yet.
 */
export function startCounter(_: StaticArray<u8>): void {
  if (!Storage.has(COUNTER_KEY)) {
    Storage.set(COUNTER_KEY, "1");
    generateEvent("Counter initialized to 1");
    sendFutureOperation();
  } else {
    generateEvent("Counter already started");
  }
}

/**
 * Schedules a call to updateCounter in the next period.
 */
export function sendFutureOperation(): void {
  const currentCounter = u64.parse(Storage.get(COUNTER_KEY));
  if (currentCounter >= MAX_COUNTER) {
    generateEvent("Maximum counter reached, stopping updates");
    return;
  }

  const address = Context.callee();
  const functionName = "updateCounter";
  const validityStartPeriod = currentPeriod() + 1;
  const validityStartThread = 0 as u8;
  const validityEndPeriod = validityStartPeriod;
  const validityEndThread = 31 as u8;
  const maxGas = 500_000_000;
  const rawFee = 1_000_000_000;
  const coins = 0;

  sendMessage(
    address,
    functionName,
    validityStartPeriod,
    validityStartThread,
    validityEndPeriod,
    validityEndThread,
    maxGas,
    rawFee,
    coins,
    []
  );

  generateEvent(`Next update scheduled at period ${validityStartPeriod.toString()}`);
}

/**
 * Increments the counter by 1.
 */
export function updateCounter(_: StaticArray<u8>): void {
  let currentCounter = u64.parse(Storage.get(COUNTER_KEY));

  if (currentCounter < MAX_COUNTER) {
    currentCounter += 1;
    Storage.set(COUNTER_KEY, currentCounter.toString());
    generateEvent(`Counter updated to ${currentCounter.toString()}`);

    if (currentCounter < MAX_COUNTER) {
      sendFutureOperation();
    } else {
      generateEvent("Maximum counter reached, update stops");
    }
  }
}