import React from "react";
import { Link } from "react-router-dom";

function ResetPass() {
  return (
    <div className="loginsignupcontainer">
      <form action="">
        <h2>Update Password</h2>
        <div className="inputs">
          <img src="/assets/pass.svg" alt="" width="20px" />
          <input type="password" placeholder="new-password" />
        </div>
        <div className="inputs mg">
          <img src="/assets/pass.svg" alt="" width="20px" />
          <input type="password" placeholder="confirm new-password" />
        </div>
        <div className="bottom">
          <input type="button" value="Update Password" className="btn" />
          <p>
            back to
            <span>
              <Link to="/" style={{ textDecoration: "none", color: "black" }}>
                {" "}
                Login
              </Link>
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}

export default ResetPass;
