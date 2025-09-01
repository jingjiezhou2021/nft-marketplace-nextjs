import itemBought from "./item-bought";
import itemCanceled from "./item-canceled";
import itemListed from "./item-listed";
import itemOfferAccepted from "./item-offer-accepted";
import itemOfferCanceled from "./item-offer-canceled";
import itemOfferMade from "./item-offer-made";

describe("Event Logging", () => {
  itemListed();
  itemCanceled();
  itemBought();
  itemOfferMade();
  itemOfferAccepted();
  itemOfferCanceled();
});
