/**
 * ============================================================
 * MT-Taybii Portfolio - Persistent View Counter Server
 * ============================================================
 *
 * Database:
 *   MongoDB Atlas
 *
 * API:
 *
 *   GET
 *   /api/views
 *
 *   POST
 *   /api/views/increment
 *
 *   GET
 *   /api/health
 *
 * The view count is stored permanently in MongoDB.
 *
 * It does NOT depend on:
 *   - localStorage
 *   - sessionStorage
 *   - browser
 *   - PC memory
 *   - server memory
 *
 * So restarting the PC or restarting Node will NOT reset
 * the portfolio view count.
 *
 * ============================================================
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");


// ============================================================
// CONFIG
// ============================================================

const app = express();

const PORT = process.env.PORT || 3000;

const MONGODB_URI = process.env.MONGODB_URI;

const DB_NAME =
  process.env.DB_NAME || "portfolio";

const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN || "*";


// ============================================================
// CHECK MONGODB URI
// ============================================================

if (!MONGODB_URI) {
  console.error("");
  console.error("==============================================");
  console.error("ERROR: MONGODB_URI is missing.");
  console.error("==============================================");
  console.error("");
  console.error("Create a .env file inside the server folder.");
  console.error("");
  console.error("Example:");
  console.error("");
  console.error(
    "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/"
  );
  console.error("DB_NAME=portfolio");
  console.error("ALLOWED_ORIGIN=*");
  console.error("");

  process.exit(1);
}


// ============================================================
// EXPRESS SETTINGS
// ============================================================

app.disable("x-powered-by");

app.use(
  express.json()
);


// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin:
      ALLOWED_ORIGIN === "*"
        ? true
        : ALLOWED_ORIGIN,

    methods: [
      "GET",
      "POST",
      "OPTIONS"
    ],

    allowedHeaders: [
      "Content-Type"
    ]
  })
);


// ============================================================
// BASIC SECURITY HEADERS
// ============================================================

app.use(
  (req, res, next) => {

    res.setHeader(
      "X-Content-Type-Options",
      "nosniff"
    );

    res.setHeader(
      "Referrer-Policy",
      "strict-origin-when-cross-origin"
    );

    next();
  }
);


// ============================================================
// MONGODB VARIABLES
// ============================================================

let mongoClient;

let db;

let statsCollection;


// ============================================================
// SINGLE VIEW COUNTER DOCUMENT
// ============================================================
//
// We deliberately use ONE fixed document.
//
// MongoDB:
//
// stats
//   └── portfolio_views
//          ├── views
//          ├── createdAt
//          └── updatedAt
//
// ============================================================

const VIEW_COUNTER_ID =
  "portfolio_views";


// ============================================================
// CONNECT DATABASE
// ============================================================

async function connectDatabase() {

  console.log(
    "Connecting to MongoDB..."
  );


  mongoClient =
    new MongoClient(
      MONGODB_URI,
      {
        maxPoolSize: 10,

        serverSelectionTimeoutMS: 10000,

        connectTimeoutMS: 10000
      }
    );


  await mongoClient.connect();


  db =
    mongoClient.db(DB_NAME);


  statsCollection =
    db.collection("stats");


  // ----------------------------------------------------------
  // Create counter ONLY if it doesn't exist.
  //
  // IMPORTANT:
  //
  // $setOnInsert means an existing counter is NEVER reset.
  //
  // ----------------------------------------------------------

  await statsCollection.updateOne(

    {
      _id:
        VIEW_COUNTER_ID
    },

    {
      $setOnInsert: {

        views: 0,

        createdAt:
          new Date(),

        updatedAt:
          new Date()

      }
    },

    {
      upsert: true
    }

  );


  console.log(
    "MongoDB connected successfully."
  );

  console.log(
    `Database: ${DB_NAME}`
  );

  console.log(
    "Collection: stats"
  );

  console.log(
    `Counter: ${VIEW_COUNTER_ID}`
  );

}


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
  "/api/health",
  async (req, res) => {

    try {

      if (!db) {

        return res.status(503).json({

          success: false,

          database:
            "not connected"

        });

      }


      await db.command({
        ping: 1
      });


      return res.json({

        success: true,

        database:
          "connected",

        timestamp:
          new Date().toISOString()

      });


    } catch (error) {

      console.error(
        "Health check error:",
        error
      );


      return res.status(503).json({

        success: false,

        database:
          "unavailable"

      });

    }

  }
);


// ============================================================
// GET CURRENT VIEWS
// ============================================================

app.get(
  "/api/views",
  async (req, res) => {

    try {

      if (!statsCollection) {

        return res.status(503).json({

          success: false,

          error:
            "Database is not ready."

        });

      }


      const document =
        await statsCollection.findOne({

          _id:
            VIEW_COUNTER_ID

        });


      const views =
        document &&
        typeof document.views === "number"

          ? document.views

          : 0;


      return res.json({

        success: true,

        views: views

      });


    } catch (error) {

      console.error(
        "GET /api/views error:",
        error
      );


      return res.status(500).json({

        success: false,

        error:
          "Unable to read view count."

      });

    }

  }
);


// ============================================================
// INCREMENT VIEWS
// ============================================================
//
// THIS IS THE MAIN DATABASE OPERATION.
//
// MongoDB $inc is ATOMIC.
//
// Example:
//
// Current:
//   100
//
// Visitor A:
//   101
//
// Visitor B:
//   102
//
// Visitor C:
//   103
//
// Even if visitors arrive at exactly the same time,
// MongoDB handles the increments safely.
//
// ============================================================

app.post(
  "/api/views/increment",
  async (req, res) => {

    try {

      if (!statsCollection) {

        return res.status(503).json({

          success: false,

          error:
            "Database is not ready."

        });

      }


      const document =
        await statsCollection.findOneAndUpdate(

          {
            _id:
              VIEW_COUNTER_ID
          },

          {

            $inc: {
              views: 1
            },

            $set: {

              updatedAt:
                new Date()

            },

            $setOnInsert: {

              createdAt:
                new Date()

            }

          },

          {

            upsert: true,

            returnDocument:
              "after"

          }

        );


      const views =
        document &&
        typeof document.views === "number"

          ? document.views

          : 0;


      return res.json({

        success: true,

        views: views

      });


    } catch (error) {

      console.error(
        "POST /api/views/increment error:",
        error
      );


      return res.status(500).json({

        success: false,

        error:
          "Unable to increment view count."

      });

    }

  }
);


// ============================================================
// 404
// ============================================================

app.use(
  (req, res) => {

    return res.status(404).json({

      success: false,

      error:
        "Route not found."

    });

  }
);


// ============================================================
// ERROR HANDLER
// ============================================================

app.use(
  (error, req, res, next) => {

    console.error(
      "Server error:",
      error
    );


    if (res.headersSent) {

      return next(error);

    }


    return res.status(500).json({

      success: false,

      error:
        "Internal server error."

    });

  }
);


// ============================================================
// START SERVER
// ============================================================

async function start() {

  try {

    await connectDatabase();


    app.listen(
      PORT,
      () => {

        console.log("");
        console.log(
          "=============================================="
        );

        console.log(
          " MT-Taybii Portfolio View Counter"
        );

        console.log(
          "=============================================="
        );

        console.log(
          `Server running on port ${PORT}`
        );

        console.log(
          ""
        );

        console.log(
          "GET  /api/views"
        );

        console.log(
          "POST /api/views/increment"
        );

        console.log(
          "GET  /api/health"
        );

        console.log(
          "=============================================="
        );

      }
    );


  } catch (error) {

    console.error("");

    console.error(
      "=============================================="
    );

    console.error(
      "DATABASE CONNECTION FAILED"
    );

    console.error(
      "=============================================="
    );

    console.error(error);

    console.error("");

    process.exit(1);

  }

}


// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

async function shutdown(signal) {

  console.log(
    `${signal} received.`
  );

  console.log(
    "Closing MongoDB connection..."
  );


  try {

    if (mongoClient) {

      await mongoClient.close();

    }


    console.log(
      "MongoDB connection closed."
    );


    process.exit(0);


  } catch (error) {

    console.error(
      "Shutdown error:",
      error
    );


    process.exit(1);

  }

}


process.on(
  "SIGINT",
  () => shutdown("SIGINT")
);


process.on(
  "SIGTERM",
  () => shutdown("SIGTERM")
);


// ============================================================
// START
// ============================================================

start();