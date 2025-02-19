//import { generateEvent, Storage, Context } from "@massalabs/massa-as-sdk";

//const GREETING_KEY = "greeting_key";

/**
 * This function is meant to be called only one time: when the contract is deployed.
 */
//export function constructor(_: StaticArray<u8>): void {
  // This line is important. It ensures that this function can't be called in the future.
  // If you remove this check, someone could call your constructor function and reset your smart contract.
  //assert(Context.isDeployingContract());

  // Set the greeting message in the contract storage
  //Storage.set(GREETING_KEY, "Hello, World!");

  // Emit an event to notify that the greeting message has been set
  //generateEvent(`Greeting has been set`);
//}

import { generateEvent, Storage, Context, sendMessage } from '@massalabs/massa-as-sdk';
import { currentPeriod } from '@massalabs/massa-as-sdk/assembly/std/context';

const COUNTER_KEY = "counter_key";
const MAX_COUNTER: u64 = 20;

/**
 * The constructor is only called when the contract is deployed.
 * It initializes the counter with 1 and schedules the first update.
 */
export function constructor(_: StaticArray<u8>): void {
  // Ensure that only deployment can call this function.
  assert(Context.isDeployingContract(), "Constructor can only be called during deployment");

  // Initialize counter with 1
  Storage.set(COUNTER_KEY, "1");
  generateEvent("Counter initialized to 1");

  // Schedule the first autonomous update
  sendFutureOperation();
}

/**
 * Schedules a call to updateCounter in the next period.
 * On Massa, a period is 16 seconds.
 */
export function sendFutureOperation(): void {
  const currentCounter = u64.parse(Storage.get(COUNTER_KEY));
  if (currentCounter >= MAX_COUNTER) {
    generateEvent("Maximum counter reached, stopping updates");
    return;
  }

  const address = Context.callee();
  const functionName = "updateCounter";
  const validityStartPeriod = currentPeriod() + 1; // schedule for next period (16 seconds later)
  const validityStartThread = 0 as u8;
  const validityEndPeriod = validityStartPeriod;
  const validityEndThread = 31 as u8;
  const maxGas = 500_000_000; // Gas for execution

  // Setting rawFee to 200_000 to ensure priority execution on congested networks.
  const rawFee = 200_000;
  const coins = 0; // if you need to send coins (like token transfer from a user to another) obviously we don't need this 

  // Schedule the autonomous call
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

  generateEvent(`Next update scheduled at period ${validityStartPeriod.toString()}, thread ${validityStartThread.toString()}`);
}

/**
 * Increments the counter by 1.
 * If the new value is less than MAX_COUNTER, schedules another update.
 */
export function updateCounter(_: StaticArray<u8>): void {
  let currentCounter = u64.parse(Storage.get(COUNTER_KEY));

  if (currentCounter < MAX_COUNTER) {
    currentCounter += 1;
    Storage.set(COUNTER_KEY, currentCounter.toString());
    generateEvent(`Counter updated to ${currentCounter.toString()}`);

    // If we haven't reached the maximum, schedule the next update
    if (currentCounter < MAX_COUNTER) {
      sendFutureOperation();
    } else {
      generateEvent("Maximum counter reached, update stops");
    }
  }
}
