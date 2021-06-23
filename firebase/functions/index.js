const functions = require("firebase-functions");
const admin = require('firebase-admin');
const app = admin.initializeApp();

let firestore = app.firestore();

const options = {
    headers: {
        APIKey: 'X-API-Key',
        Farmer: 'X-Farmer-ID',
    },
    debug: false,
};


exports.counter = functions.https.onRequest(async (request, response) => {
    // Check if HTTP method is `POST`
    if (request.method != "POST") {
        response.json({ status: `error - must send POST request` });
        return;
    }

    // Check if they sent the `API-Key` in the header.
    if (!request.header(options.headers.APIKey)) {
        response.status(401).json({ status: `error - must provide '${options.headers.APIKey}' header` });
        return;
    }
    // Check if they sent the `Farmer` ID in the header.
    if (!request.header(options.headers.Farmer)) {
        response.status(404).json({ status: `error - must provide '${options.headers.Farmer}' ID in header` });
        return;
    }

    // Check if they sent the right `Content-Type` header.
    if (!request.header("Content-Type") == "application/json") {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/415
        // 415 Unsupported Media Type
        response.status(415).json({ status: 'error - must send application/json' });
        return;
    }

    // Set the variables from the header.
    //
    // Since header method returns an array of strings, we only want one.
    const APIKey = request.header(options.headers.APIKey);
    const Farmer = request.header(options.headers.Farmer);

    if (options.debug) {
        functions.logger.info("debug", { apikey: APIKey, farmer: Farmer });
    }

    // Check if the API-Key exists.
    var keysRef = firestore.collection("keys");
    var query = keysRef.where("key", "==", APIKey);

    var qs = await query.get();
    if (qs.empty) {
        response.send(JSON.status(401).stringify({ status: "error - key not found" }));
        return;
    }

    // Get user ID
    let uid = "";
    qs.forEach((doc) => {
        uid = doc.data().uid;
    });
    if (uid == "") {
        response.status(404).send(JSON.stringify({ status: "error - uid not found" }));
        return;
    }

    // Check if the farm exists
    var farmsRef = firestore.collection("farms");
    var query = farmsRef.where("key", "==", Farmer).where("uid", "==", uid);

    var qs = await query.get();
    if (qs.empty) {
        response.status(404).send(JSON.stringify({ status: "error - farm not found" }));
        return;
    }

    // Get the farm's document ID so we can write to it.
    let farm_id = "";
    let timestamp = "";
    qs.forEach((doc) => {
        farm_id = doc.id;
        timestamp = doc.data().last_timestamp;
    });

    if (!request.body.timestamp) {
        response.status(400).send(JSON.stringify({ status: "error - no timestamp" }));
        return;
    }

    // If the last timestamp in firestore for this farm is greater than the one
    // we are being sent, then we don't want to process it.
    if (timestamp > request.body.timestamp) {
        response.status(400).send(JSON.stringify({ status: "error - old log" }));
        return;
    }

    // Older clients might not be sending `time_taken`
    let time_taken = 0;
    if (request.body.time_taken) {
        time_taken = request.body.time_taken
    }

    let eligible_time_taken = 0;
    if (request.body.eligible) {
        eligible_time_taken = request.body.time_taken;
    }

    // For keeping track of the last 100 signage points. This data just shows if
    // we had a plot that was eligible, not how many plots were eligible. There
    // is a nice way to show it with little bars and stuff.
    let eligibility_history = [];
    if (request.body.eligibility_history) {
        eligibility_history = request.body.eligibility_history;
    }

    var farm = farmsRef.doc(farm_id);
    await farm.update({
        harvests: admin.firestore.FieldValue.increment(1),
        eligible: admin.firestore.FieldValue.increment(request.body.eligible),
        proofs: admin.firestore.FieldValue.increment(request.body.proofs),
        plots: request.body.plots,
        last_timestamp: request.body.timestamp,
        time_taken: admin.firestore.FieldValue.increment(time_taken),
        eligible_time_taken: admin.firestore.FieldValue.increment(eligible_time_taken),
        eligibility_history: eligibility_history,
    });

    response.json({ status: "ok" });
});
