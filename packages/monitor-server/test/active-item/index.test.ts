import addRecordWhenListingItem from "./add-record-when-listing-item";
import deleteRecordWhenCancelingItem from "./delete-record-when-canceling-item";
import deleteRecordWhenItemIsBought from "./delete-record-when-item-is-bought";
import deleteRecordWhenOfferIsAccepted from "./delete-record-when-offer-is-accepted";
import updateRecordWhenUpdatingItem from "./update-record-when-updating-item";

describe("ActiveItem", () => {
  addRecordWhenListingItem();
  updateRecordWhenUpdatingItem();
  deleteRecordWhenCancelingItem();
  deleteRecordWhenItemIsBought();
  deleteRecordWhenOfferIsAccepted();
});
