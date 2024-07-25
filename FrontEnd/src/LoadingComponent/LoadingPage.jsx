import "./LoadingPage.css"
import { useTheme } from "../UseContext";

function LoadingPage() {
    const { theme } = useTheme();
  return (
    <div className="loadingContent">
      <span className="loader"></span>
    </div>
  );
}

export default LoadingPage
