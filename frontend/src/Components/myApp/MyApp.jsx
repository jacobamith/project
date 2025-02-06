import React, { useState } from "react";

import Login_Signup from "../../Pages/Auth/Login_Signup";
import "./MyApp.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import ResetPass from "../../Pages/Auth/ResetPass";
import Dashboard from "../../Pages/Dashboard/Dashboard";
import NewDocument from "../../Pages/NewDocument/NewDocument";
import { v4 as uuidv4 } from "uuid";

function MyApp() {
  const [user, setUser] = useState(null);
  const userHandle = (value) => {
    setUser(value);
  };
  return (
    <>
      <Router>
        <Routes>
          <Route exact path="/" element={<Login_Signup />} />
          <Route path="/resetpass" element={<ResetPass />} />
          <Route
            path="/dashboard"
            element={<Dashboard onUserLogin={userHandle} />}
          />
          {user ? (
            <Route
              path="/document"
              element={<Navigate to={`/document/${user}/${uuidv4()}`} />}
            />
          ) : (
            <Route path="/document" element={<Navigate to={"/"} />} />
          )}

          <Route path="/document/:uid/:id" element={<NewDocument />} />
        </Routes>
      </Router>
    </>
  );
}

export default MyApp;
