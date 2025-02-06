import React, { useCallback, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import "./NewDocument.css";
import axios from "axios";

const toolbarOptions = [
  [{ size: ["small", "medium", "large", "huge"] }],
  [{ header: ["1", "2"] }, { font: [] }],
  [{ align: [] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ script: "sub" }, { script: "super" }],
  ["link", "image"],
  ["blockquote", "code-block"],
  [{ direction: "rtl" }],
  [{ color: [] }, { background: [] }],
  ["clean"],
];

function NewDocument() {
  const [title, setTitle] = useState("");
  const [docn, setDocn] = useState("");
  const [error, setError] = useState("");
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);
  const { id: documentId, uid: userId } = useParams();
  const navigate = useNavigate();
  //getting name
  useEffect(() => {
    const fetchname = async () => {
      const url = ` https://slatebackend-wrwi.onrender.com/api/document/${documentId}`;
      const res = await axios.get(url, { withCredentials: true });
      if (res == null) return;
      localStorage.setItem(documentId.toString(), res.data);
      setDocn(res.data);
    };
    fetchname();
    return () => {};
  }, [documentId, docn]);

  //server connection

  useEffect(() => {
    const sock = io("https://slatebackend-wrwi.onrender.com", {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 7,
      reconnectionDelay: 1000,
      timeout: 5000,
    });
    setSocket(sock);

    return () => {
      sock.disconnect();
    };
  }, []);

  // Load document
  useEffect(() => {
    if (socket == null || quill == null) return;
    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });
    socket.emit("get-document", userId, documentId);
    return () => {
      socket.off("load-document");
    };
  }, [socket, quill, userId, documentId]);

  // Save document periodically
  useEffect(() => {
    if (!socket || !quill) return;
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  // Text change detection
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  // Update text
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("received-message", handler);

    return () => {
      socket.off("received-message", handler);
    };
  }, [socket, quill]);

  // Error handling
  useEffect(() => {
    if (!socket) return;

    const errorHandler = (error) => {
      setError(error);
      alert(error);

      navigate("/dashboard");
    };

    socket.on("error", errorHandler);

    return () => {
      setError("");
      socket.off("error");
    };
  }, [error]);

  // Creating the editor
  const wrapperRef = useCallback(
    (wrap) => {
      if (wrap == null) return;
      wrap.innerHTML = "";
      const editor = document.createElement("div");
      wrap.append(editor);

      const q = new Quill(editor, {
        theme: "snow",
        modules: { toolbar: toolbarOptions },
      });

      const toolbar = q.getModule("toolbar");

      // Add Home button
      const homeButton = document.createElement("button");
      homeButton.className = "custom";
      homeButton.innerHTML = `<img src="/assets/letter-s.png" alt="Slate" />`;
      homeButton.querySelector("img").style.minWidth = "20px";
      homeButton.querySelector("img").style.width = "25px";
      homeButton.querySelector("img").style.height = "20px";
      homeButton.querySelector("img").style.maxWidth = "30px";
      toolbar.container.insertBefore(homeButton, toolbar.container.firstChild);
      //docname
      const tile = localStorage.getItem(documentId.toString());
      setTitle(tile);

      // Add Textfield input
      const textfieldButton = document.createElement("input");
      textfieldButton.type = "text";
      textfieldButton.className = "custom";
      textfieldButton.value = title;
      textfieldButton.placeholder = "Untitled";
      toolbar.container.insertBefore(textfieldButton, homeButton.nextSibling);

      //ADD SHARE button

      const shareButton = document.createElement("button");
      shareButton.className = "sharedropdown";
      shareButton.innerHTML = `<img src="/assets/share.svg" alt="Slate" />`;

      toolbar.container.appendChild(shareButton);

      //managig share area

      shareButton.addEventListener("click", () => {
        wrappcontain.classList.toggle("hidden");
      });

      //text area

      const custotext = document.createElement("input");
      custotext.type = "text";
      custotext.className = "text";
      toolbar.container.appendChild(custotext);

      //button
      const custButton = document.createElement("button");
      custButton.innerHTML = `<img src="/assets/send.svg" alt="Slate" />`;
      custButton.className = "btn";
      toolbar.container.appendChild(custButton);

      //wrapcontainer
      const wrappcontain = document.createElement("div");
      wrappcontain.className = "droparea hidden";
      wrappcontain.appendChild(custButton);
      wrappcontain.appendChild(custotext);

      toolbar.container.appendChild(wrappcontain);

      //WRAP share option

      const customShare = document.createElement("div");
      customShare.className = "custom pos";
      const customShareelement =
        toolbar.container.querySelectorAll(".sharedropdown");
      customShareelement.forEach((elemnt) => {
        customShare.appendChild(elemnt);
      });
      customShare.appendChild(wrappcontain);

      toolbar.container.appendChild(customShare);

      //wrapcustom toolbar

      const customInputwrapper = document.createElement("div");
      customInputwrapper.className = "customMade";
      const customElements = toolbar.container.querySelectorAll(".custom");
      customElements.forEach((element) => {
        customInputwrapper.appendChild(element);
      });

      toolbar.container.appendChild(customInputwrapper);

      //WRAPP toolbar
      const formatWrapper = document.createElement("div");
      formatWrapper.className = "formatWrapper";
      const getElements = toolbar.container.querySelectorAll(".ql-formats");
      getElements.forEach((element) => {
        formatWrapper.appendChild(element);
      });

      toolbar.container.appendChild(formatWrapper);

      // Define handlers
      homeButton.addEventListener("click", () => {
        navigate("/dashboard");
      });

      textfieldButton.addEventListener("blur", async (e) => {
        const tesxt = e.target.value;
        const url = ` https://slatebackend-wrwi.onrender.com/api/document/${documentId}`;
        const res = await axios.post(url, { tesxt }, { withCredentials: true });
      });

      q.disable();
      q.setText("Loading ...");
      setQuill(q);
    },
    [title, docn]
  );

  return <div className="container" ref={wrapperRef}></div>;
}

export default NewDocument;
