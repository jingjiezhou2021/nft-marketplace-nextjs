import {
  TypedContractEvent,
  TypedEventLog,
  TypedListener,
} from "smart-contract/dist/typechain-types/common";

export default function logListener<TCEvent extends TypedContractEvent>(
  listener: TypedListener<TCEvent>
): TypedListener<TCEvent> {
  return async (...args: Parameters<typeof listener>) => {
    const log = args[args.length - 1] as TypedEventLog<TCEvent>;
    console.log(
      "event captured:",
      log.eventName
    );
    console.log(
      "event args:",
      log.args
    );
    return await listener(...args);
  };
}
