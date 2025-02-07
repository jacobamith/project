import React from "react";
import "./Cards.css";
function Cards({ src, id, onCardClick }) {
  return (
    <div>
      <div className="dynamic-container">
        <div className="imagewrap" onClick={onCardClick}>
          <img src="/assets/document.svg" style={{ width: "100px" }} alt={name} />
        </div>
        <h4>{id}</h4>
      </div>
    </div>
  );
}

export default Cards;
