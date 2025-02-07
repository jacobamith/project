require("dotenv").config();
const socketIo = require("socket.io");
const documentModel = require("../Models/Document");
const userModel = require("../Models/userModel");
const cookieParser = require("cookie");
const jwt = require("jsonwebtoken");


let io;
const defaultValue = "";

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "https://collaboration-tool-aajt.onrender.com",
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    try {

    
      
      const cookies = socket.request.headers.cookie;
       if (!cookies) {
        socket.emit("error", "no token");
        return;
      }
      const parsedl = cookieParser.parse(cookies);
      const token = parsedl.token;
     
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
          socket.emit("error", "invalid token");

          return;
        }

        // Room creation
        socket.on("get-document", async (userId, documentId) => {
          try {
            if (!userId || !documentId) {
              socket.emit("error", "Invalid userId or documentId");
              return;
            }
            //check permision
            if (String(user.id) != String(userId)) {
              socket.emit("error", "you dont have permision");
              return;
            }

            const document = await findOrCreateDoc(userId, documentId);

            socket.join(documentId);
            socket.emit("load-document", document.data);

            socket.on("send-changes", (delta) => {
              socket.broadcast.to(documentId).emit("received-message", delta);
            });

            socket.on("save-document", async (data) => {
              try {
                await documentModel.findByIdAndUpdate(documentId, { data });
              } catch (err) {
                console.log("Error saving document:", err);
              }
            });
          } catch (err) {
            console.error("Error in 'get-document':", err);
            socket.emit(
              "error",
              "An error occurred while fetching the document"
            );
          }
        });

        // Handle disconnection
       
      });
    } catch (err) { }
     socket.on("disconnect", () => {});
  });

  const findOrCreateDoc = async (uid, id) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) {
        throw new Error("User not found");
      }

      let document = await documentModel.findById(id);
      if (document) {
        if (String(document.userId) !== String(uid)) {
          throw new Error("Unauthorized access to the document");
          return;
          
        }
        return document;
      }

      document = await documentModel.create({
        _id: id,
        data: defaultValue,
        userId: uid,
      });
      return document;
    } catch (err) {
      console.error("Error in 'findOrCreateDoc':", err);
      throw err;
    }
  };

  return io;
};

module.exports = initializeSocket;
