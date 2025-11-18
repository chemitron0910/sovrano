import * as functions from "firebase-functions/v1";
import * as logger from "firebase-functions/logger";

export {syncRoleClaim} from "./syncRoleClaim";

export {notifyEmployeeOnBooking} from "./notifyEmployeeOnBooking";

export {onBookingCreated} from "./onBookingCreated";

export {setGuestClaim} from "./setGuestClaim";

export {onBookingUpdated} from "./onBookingUpdated";

export {autoExtendAvailability} from "./autoExtendAvailability";

export const helloWorld = functions
  .runWith({maxInstances: 10, memory: "512MB"})
  .https.onRequest((req, res) => {
    logger.info("Hello logs!", {structuredData: true});
    res.send("Hello from Firebase!");
  });
