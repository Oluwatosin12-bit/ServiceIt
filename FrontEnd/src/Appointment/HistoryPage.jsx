import { useState, useEffect } from "react";
import { useTheme } from "../UseContext";
function HistoryPage({ userData }) {
  const userID = userData?.userID;
  const [userHistoryData, setUserHistoryData] = useState([]);
  const { theme } = useTheme();

  if (userHistoryData.length === 0) {
    return (
      <div className={`appointmentPage ${theme}`}>
        <div className="appointments">
          <h2>No past appointments.</h2>
        </div>
      </div>
    );
  }
}

export default HistoryPage;
