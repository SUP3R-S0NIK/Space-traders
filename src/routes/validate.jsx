import React from "react";
import "./../styles/validate.css";
const Validate = () => {
  return (
    <div className="loader-container">
      <div class="success-checkmark">
        <div class="check-icon">
          <span class="icon-line line-tip"></span>
          <span class="icon-line line-long"></span>
          <div class="icon-circle"></div>
          <div class="icon-fix"></div>
        </div>
      </div>
    </div>
  );
};

export default Validate;
