import React from "react";
import "./../styles/validate.css";
const Validate = () => {
  return (
    <div className="loader-container">
      <div className="success-checkmark">
        <div className="check-icon">
          <span className="icon-line line-tip"></span>
          <span className="icon-line line-long"></span>
          <div className="icon-circle"></div>
          <div className="icon-fix"></div>
        </div>
      </div>
    </div>
  );
};

export default Validate;
